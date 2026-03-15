package com.team_ecommerce.backend.enums;

import java.util.Set;
import java.util.Map;
 
public enum OrderStatus {
    CREATED,
    CONFIRMED,
    SHIPPED,
    DELIVERED,
    CANCELLED;
 
    private static final Map<OrderStatus, Set<OrderStatus>> VALID_TRANSITIONS = Map.of(
        CREATED,   Set.of(CONFIRMED, CANCELLED),
        CONFIRMED, Set.of(SHIPPED),
        SHIPPED,   Set.of(DELIVERED),
        DELIVERED, Set.of(),
        CANCELLED, Set.of()
    );
 
    public boolean canTransitionTo(OrderStatus next) {
        return VALID_TRANSITIONS.getOrDefault(this, Set.of()).contains(next);
    }
}