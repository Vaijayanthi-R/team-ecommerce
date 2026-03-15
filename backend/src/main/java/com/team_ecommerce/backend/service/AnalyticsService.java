package com.team_ecommerce.backend.service;

import com.team_ecommerce.backend.dto.response.PlatformAnalyticsResponse;
import com.team_ecommerce.backend.dto.response.ProductResponse;
import com.team_ecommerce.backend.dto.response.SellerAnalyticsResponse;
import com.team_ecommerce.backend.enums.NotifType;
import com.team_ecommerce.backend.enums.OrderStatus;
import com.team_ecommerce.backend.entity.Order;
import com.team_ecommerce.backend.entity.Product;
import com.team_ecommerce.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    private final SellerRepository sellerRepo;
    private final NotificationService notifService;

    /**
     * Runs every hour. Aggregates delivered orders → updates best-seller
     * flags on products → notifies sellers whose products newly enter top 10.
     */
    @Scheduled(fixedRate = 3_600_000)
    public void refreshBestSellers() {
        log.info("Refreshing best-seller rankings...");

        List<Order> delivered = orderRepo.findByStatus(OrderStatus.DELIVERED);

        // Aggregate units sold per product
        Map<String, Long> unitsSold = new HashMap<>();
        Map<String, Double> revenue  = new HashMap<>();

        for (Order order : delivered) {
            for (Order.OrderItem item : order.getItems()) {
                unitsSold.merge(item.getProductId(), (long) item.getQuantity(), Long::sum);
                revenue.merge(item.getProductId(), item.getSubtotal(), Double::sum);
            }
        }

        // Sort by units sold desc, take top 10
        List<String> topProductIds = unitsSold.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(10)
            .map(Map.Entry::getKey)
            .toList();

        // Clear old best-seller flags on products that dropped out
        productRepo.findByBestSellerTrueOrderByBestSellerRankAsc().forEach(p -> {
            if (!topProductIds.contains(p.getId())) {
                p.setBestSeller(false);
                p.setBestSellerRank(0);
                productRepo.save(p);
            }
        });

        // Assign new ranks and notify sellers on new entries
        for (int i = 0; i < topProductIds.size(); i++) {
            String productId = topProductIds.get(i);
            int newRank = i + 1;

            productRepo.findById(productId).ifPresent(p -> {
                boolean wasAlreadyBestSeller = p.isBestSeller();
                int oldRank = p.getBestSellerRank();

                p.setBestSeller(true);
                p.setBestSellerRank(newRank);
                p.setTotalUnitsSold(unitsSold.getOrDefault(productId, 0L));
                p.setUpdatedAt(LocalDateTime.now());
                productRepo.save(p);

                // Notify seller only on new entry OR rank improvement
                if (!wasAlreadyBestSeller || oldRank != newRank) {
                    String msg = wasAlreadyBestSeller
                        ? "📈 Your product \"" + p.getName() + "\" moved to rank #" + newRank + " in Best Sellers!"
                        : "🏆 Your product \"" + p.getName() + "\" entered the Top 10 Best Sellers at rank #" + newRank + "!";

                    notifService.create(p.getSellerId(), msg, NotifType.BEST_SELLER);
                }
            });
        }

        log.info("Best-seller refresh complete. Top {}: {}", topProductIds.size(), topProductIds);
    }

    public List<ProductResponse> getBestSellers(int limit) {
        return productRepo.findByBestSellerTrueOrderByBestSellerRankAsc()
            .stream().limit(limit).map(ProductResponse::from).toList();
    }

    public SellerAnalyticsResponse getSellerAnalytics(String sellerId) {
        List<Order> sellerOrders = orderRepo.findBySellerIdInItems(sellerId)
            .stream()
            .filter(o -> o.getStatus() == OrderStatus.DELIVERED
                      || o.getStatus() == OrderStatus.SHIPPED
                      || o.getStatus() == OrderStatus.CONFIRMED)
            .toList();

        double totalRevenue = 0;
        long totalUnits = 0;
        Map<String, Long> productUnits = new HashMap<>();
        Map<String, String> productNames = new HashMap<>();
        Map<String, SellerAnalyticsResponse.MonthlyStatResponse> monthly = new LinkedHashMap<>();

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yyyy");

        for (Order order : sellerOrders) {
            String monthKey = order.getCreatedAt().format(fmt);
            double orderRevenue = 0;

            for (Order.OrderItem item : order.getItems()) {
                if (!item.getSellerId().equals(sellerId)) continue;
                totalRevenue += item.getSubtotal();
                totalUnits   += item.getQuantity();
                orderRevenue += item.getSubtotal();
                productUnits.merge(item.getProductId(), (long) item.getQuantity(), Long::sum);
                productNames.put(item.getProductId(), item.getProductName());
            }

            double finalOrderRevenue = orderRevenue;
            monthly.merge(monthKey,
                SellerAnalyticsResponse.MonthlyStatResponse.builder()
                    .month(monthKey).revenue(finalOrderRevenue).orders(1L).build(),
                (a, b) -> SellerAnalyticsResponse.MonthlyStatResponse.builder()
                    .month(a.getMonth())
                    .revenue(a.getRevenue() + b.getRevenue())
                    .orders(a.getOrders() + b.getOrders())
                    .build()
            );
        }

        // Top product
        String topProductId = productUnits.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey).orElse(null);

        return SellerAnalyticsResponse.builder()
            .sellerId(sellerId)
            .totalRevenue(totalRevenue)
            .totalOrders(sellerOrders.size())
            .totalUnitsSold(totalUnits)
            .topProductName(topProductId != null ? productNames.get(topProductId) : "N/A")
            .topProductUnitsSold(topProductId != null
                ? productUnits.getOrDefault(topProductId, 0L) : 0)
            .monthlyBreakdown(new ArrayList<>(monthly.values()))
            .build();
    }

    public PlatformAnalyticsResponse getPlatformOverview() {
        long totalOrders  = orderRepo.count();
        long totalUsers   = userRepo.count();
        long totalSellers = sellerRepo.count();
        long totalProducts= productRepo.count();

        double totalGmv = orderRepo.findByStatus(OrderStatus.DELIVERED).stream()
            .mapToDouble(Order::getTotalAmount).sum();

        List<ProductResponse> topProducts = getBestSellers(10);

        return PlatformAnalyticsResponse.builder()
            .totalGmv(totalGmv)
            .totalOrders(totalOrders)
            .totalUsers(totalUsers)
            .totalSellers(totalSellers)
            .totalProducts(totalProducts)
            .topProducts(topProducts)
            .build();
    }
}
