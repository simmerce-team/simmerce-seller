'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardMetrics } from '@/actions/dashboard';

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const { data, error } = await getDashboardMetrics('');
      
      if (error) {
        throw new Error(error);
      }
      
      if (!data) {
        throw new Error('No data returned from server');
      }
      
      return {
        totalProducts: data.total_products || 0,
        activeEnquiries: data.active_enquiries || 0,
        openBuyLeads: data.open_buy_leads || 0,
        conversionRate: data.conversion_rate || 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: true,
  });
}
