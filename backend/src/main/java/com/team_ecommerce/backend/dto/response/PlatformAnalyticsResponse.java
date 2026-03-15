package com.team_ecommerce.backend.dto.response;

import lombok.*;
import java.util.*;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class PlatformAnalyticsResponse {
    private double totalGmv;
    private long totalOrders;
    private long totalUsers;
    private long totalSellers;
    private long totalProducts;
    private List<ProductResponse> topProducts;
}
