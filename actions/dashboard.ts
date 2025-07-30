"use server";

import { createClient } from "@/utils/supabase/server";

export type DashboardMetrics = {
  total_products: number;
  active_enquiries: number;
  open_buy_leads: number;
  conversion_rate: number;
};

export async function getDashboardMetrics(businessId: string): Promise<{
  data: DashboardMetrics | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    
    // Get user's business ID if not provided
    let business_id = businessId;
    if (!business_id) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Get user's businesses
      const { data: userBusiness, error: userBusinessError } = await supabase
        .from('user_businesses')
        .select('business_id')
        .eq('user_id', user.id)
        .single();
        
      if (userBusinessError || !userBusiness) {
        throw new Error('No business found for user');
      }
      
      business_id = userBusiness.business_id;
    }

    // Use the database function to get all metrics in a single query
    const { data: metrics, error: metricsError } = await supabase
      .rpc('get_business_metrics', { p_business_id: business_id });

    if (metricsError) throw metricsError;
    if (!metrics) throw new Error('No metrics data returned');

    return {
      data: {
        total_products: Number(metrics.total_products) || 0,
        active_enquiries: Number(metrics.active_enquiries) || 0,
        open_buy_leads: Number(metrics.open_buy_leads) || 0,
        conversion_rate: Number(metrics.conversion_rate) || 0,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch dashboard metrics',
    };
  }
}
