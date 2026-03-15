package com.team_ecommerce.backend.service;

import com.team_ecommerce.backend.enums.NotifType;
import com.team_ecommerce.backend.enums.OrderStatus;
import com.team_ecommerce.backend.entity.*;
import com.team_ecommerce.backend.repository.*;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Event;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepo;
    private final OrderRepository orderRepo;
    private final SellerWalletRepository walletRepo;
    private final WalletTransactionRepository walletTxRepo;
    private final NotificationService notifService;
    private final OrderService orderService;
    private final AuditLogService auditLog;

    @Value("${app.stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${app.stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${app.platform.fee-percent}")
    private double platformFeePercent;

    @Value("${app.platform.shipping-fee}")
    private double shippingFee;

    public Map<String, String> createPaymentIntent(String orderId, String userId) throws Exception {
        Stripe.apiKey = stripeSecretKey;

        Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUserId().equals(userId))
            throw new RuntimeException("Not your order");

        long amountCents = (long) (order.getTotalAmount() * 100);

        PaymentIntent intent = PaymentIntent.create(
            PaymentIntentCreateParams.builder()
                .setAmount(amountCents)
                .setCurrency("usd")
                .putMetadata("orderId", orderId)
                .putMetadata("userId", userId)
                .build()
        );

        Payment payment = Payment.builder()
            .orderId(orderId)
            .userId(userId)
            .stripePaymentIntentId(intent.getId())
            .stripeClientSecret(intent.getClientSecret())
            .amount(order.getTotalAmount())
            .currency("usd")
            .status("PENDING")
            .build();

        paymentRepo.save(payment);

        return Map.of(
            "clientSecret", intent.getClientSecret(),
            "paymentIntentId", intent.getId()
        );
    }

    public void handleStripeWebhook(String payload, String sigHeader) throws Exception {
        Stripe.apiKey = stripeSecretKey;
        Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

        if ("payment_intent.succeeded".equals(event.getType())) {
            StripeObject stripeObject = event.getDataObjectDeserializer()
                .getObject().orElseThrow();
            PaymentIntent intent = (PaymentIntent) stripeObject;

            String orderId = intent.getMetadata().get("orderId");
            String userId  = intent.getMetadata().get("userId");

            // Mark payment succeeded
            paymentRepo.findByStripePaymentIntentId(intent.getId()).ifPresent(p -> {
                p.setStatus("SUCCEEDED");
                paymentRepo.save(p);
            });

            // Confirm the order
            orderService.updateStatus(orderId, OrderStatus.CONFIRMED, "SYSTEM");

            // Credit sellers
            Order order = orderRepo.findById(orderId).orElseThrow();
            creditSellers(order);

            auditLog.log("PAYMENT_SUCCEEDED", orderId, userId,
                "Payment confirmed via Stripe: $" + (intent.getAmount() / 100.0));
        }
    }

    private void creditSellers(Order order) {
        // Group items by seller
        Map<String, Double> sellerRevenue = order.getItems().stream()
            .collect(Collectors.groupingBy(
                Order.OrderItem::getSellerId,
                Collectors.summingDouble(Order.OrderItem::getSubtotal)
            ));

        sellerRevenue.forEach((sellerId, gross) -> {
            double platformFee = gross * (platformFeePercent / 100);
            double net = gross - shippingFee - platformFee;

            // Upsert wallet
            SellerWallet wallet = walletRepo.findBySellerId(sellerId)
                .orElseGet(() -> SellerWallet.builder().sellerId(sellerId).build());
            wallet.setBalance(wallet.getBalance() + net);
            wallet.setTotalEarned(wallet.getTotalEarned() + net);
            wallet.setUpdatedAt(LocalDateTime.now());
            walletRepo.save(wallet);

            // Transaction record
            WalletTransaction tx = WalletTransaction.builder()
                .sellerId(sellerId)
                .orderId(order.getId())
                .grossAmount(gross)
                .shippingDeduction(shippingFee)
                .platformFeeDeduction(platformFee)
                .netCredited(net)
                .description("Order #" + order.getId() + " payment credited")
                .build();
            walletTxRepo.save(tx);

            notifService.create(sellerId,
                "💰 $" + String.format("%.2f", net) + " credited to your wallet for order #"
                + order.getId(),
                NotifType.PAYMENT_CREDITED);
        });
    }

    public SellerWallet getWallet(String sellerId) {
        return walletRepo.findBySellerId(sellerId)
            .orElseGet(() -> SellerWallet.builder().sellerId(sellerId).balance(0).build());
    }

    public List<WalletTransaction> getTransactions(String sellerId) {
        return walletTxRepo.findBySellerIdOrderByCreatedAtDesc(sellerId);
    }
}