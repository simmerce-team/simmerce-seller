"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardMetrics } from "@/hooks/useDashboardQueries";
import {
  Box,
  MessageSquare,
  RefreshCw,
  Search,
  TrendingUp,
} from "lucide-react";

type MetricCardProps = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  isLoading: boolean;
};

const MetricCard = ({
  title,
  value,
  icon: Icon,
  isLoading,
}: MetricCardProps) => (
  <Card className="flex-1 min-w-[200px]">
    <CardContent className="px-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mt-2" />
          ) : (
            <p className="text-2xl font-bold">{value}</p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export function DashboardStats() {
  const {
    data: metricsData,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useDashboardMetrics();


  if (isError) {
    return (
      <div className="text-sm text-destructive">
        Failed to load metrics.
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="ml-2"
        >
          {isRefetching ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Products"
        value={isLoading ? "--" : metricsData?.totalProducts || 0}
        icon={Box}
        isLoading={isLoading}
      />
      <MetricCard
        title="Active Enquiries"
        value={isLoading ? "--" : metricsData?.activeEnquiries || 0}
        icon={MessageSquare}
        isLoading={isLoading}
      />
      <MetricCard
        title="Buy Leads"
        value={isLoading ? "--" : metricsData?.openBuyLeads || 0}
        icon={Search}
        isLoading={isLoading}
      />
      <MetricCard
        title="Conversion Rate"
        value={
          isLoading
            ? "--%"
            : `${(metricsData?.conversionRate || 0).toFixed(1)}%`
        }
        icon={TrendingUp}
        isLoading={isLoading}
      />
    </div>
  );
}
