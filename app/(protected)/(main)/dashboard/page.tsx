"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Box, MessageSquare, Plus, Search, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect as useClientEffect } from 'react';

type Metric = {
  title: string;
  value: string | number;
  icon: any;
  isLoading?: boolean;
};

function DashboardContent() {
  const [metrics, setMetrics] = useState<Metric[]>([
    {
      title: "Total Products",
      value: "--",
      icon: Box,
      isLoading: true,
    },
    {
      title: "Active Enquiries",
      value: "--",
      icon: MessageSquare,
      isLoading: true,
    },
    {
      title: "Buy Leads",
      value: "--",
      icon: Search,
      isLoading: true,
    },
    {
      title: "Conversion Rate",
      value: "--%",
      icon: TrendingUp,
      isLoading: true,
    },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Import the server action dynamically
      const { getDashboardMetrics } = await import('@/actions/dashboard');
      
      // Call the server action directly
      const { data, error } = await getDashboardMetrics('');
      
      if (error) {
        throw new Error(error);
      }
      
      if (!data) {
        throw new Error('No data returned from server');
      }
      
      setMetrics([
        {
          title: "Total Products",
          value: data.total_products || 0,
          icon: Box,
          isLoading: false,
        },
        {
          title: "Active Enquiries",
          value: data.active_enquiries || 0,
          icon: MessageSquare,
          isLoading: false,
        },
        {
          title: "Buy Leads",
          value: data.open_buy_leads || 0,
          icon: Search,
          isLoading: false,
        },
        {
          title: "Conversion Rate",
          value: `${(data.conversion_rate || 0).toFixed(1)}%`,
          icon: TrendingUp,
          isLoading: false,
        },
      ]);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard metrics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const { user } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useClientEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  if (!user) {
    return null; // or a loading spinner
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={fetchMetrics}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                'Try Again'
              )}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchMetrics}
            disabled={isLoading}
            className="hidden sm:flex"
          >
            {isLoading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/products/add">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => (
          <Card key={i} className="group transition-all hover:shadow-lg hover:border-primary/30">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  {metric.isLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-2xl font-bold tracking-tight">
                      {metric.value}
                    </div>
                  )}
                </div>
                <div className="rounded-lg p-3 bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <metric.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardContent />
  );
}