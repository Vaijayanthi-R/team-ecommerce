package com.team_ecommerce.backend.service;

import com.team_ecommerce.backend.dto.OrderRequestDTO;
import com.team_ecommerce.backend.dto.OrderResponseDTO;
import com.team_ecommerce.backend.entity.Order;
import com.team_ecommerce.backend.entity.OrderItem;
import com.team_ecommerce.backend.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository){
        this.orderRepository = orderRepository;
    }

    public OrderResponseDTO createOrder(OrderRequestDTO request){

        Order order = new Order();
        order.setOrderDate(LocalDateTime.now());

        List<OrderItem> items = new ArrayList<>();
        double total = 0;

        for(OrderRequestDTO.OrderItemDTO dto : request.getItems()){

            OrderItem item = new OrderItem();
            item.setProductId(dto.productId);
            item.setQuantity(dto.quantity);
            item.setPrice(dto.price);
            item.setOrder(order);

            total += dto.price * dto.quantity;
            items.add(item);
        }

        order.setItems(items);
        order.setTotalAmount(total);

        Order saved = orderRepository.save(order);

        return new OrderResponseDTO(
                saved.getId(),
                saved.getTotalAmount(),
                saved.getOrderDate()
        );
    }
}