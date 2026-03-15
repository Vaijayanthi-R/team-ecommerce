package com.team_ecommerce.backend.dto.response;

import lombok.*;
import java.util.*;

@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Builder
public class SellerAnalyticsResponse {
    private String sellerId;
    private double totalRevenue;
    private long totalOrders;
    private long totalUnitsSold;
    private String topProductName;
    private long topProductUnitsSold;
    private List<MonthlyStatResponse> monthlyBreakdown;
 
    @Data @AllArgsConstructor @NoArgsConstructor @Builder
    public static class MonthlyStatResponse {
        private String month;
        private double revenue;
        private long orders;
    }
}
 