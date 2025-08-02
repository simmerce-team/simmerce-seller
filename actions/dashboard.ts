"use server";

import { createClient } from "@/utils/supabase/server";

type DashboardMetrics = {
  total_products: number;
  active_enquiries: number;
  open_buy_leads: number;
  conversion_rate: number;
};

export async function getDashboardMetrics(businessId?: string): Promise<{
  data: DashboardMetrics | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    
    // Get user and business ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // If businessId is not provided, try to get it from user_businesses
    let finalBusinessId = businessId;
    if (!finalBusinessId) {
      const { data: userBusiness, error: businessError } = await supabase
        .from('user_businesses')
        .select('business_id')
        .eq('user_id', user.id)
        .single();
        
      if (businessError || !userBusiness) {
        throw new Error('No business found for user');
      }
      finalBusinessId = userBusiness.business_id;
    }

    // Get dashboard metrics
    const { data: metrics, error: metricsError } = await supabase
      .rpc('get_business_metrics', { p_business_id: finalBusinessId });

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