'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLatestBuyLeads, useLatestEnquiries } from "@/hooks/useDashboardQueries";
import { format } from "date-fns";
import { ArrowUpRight, Briefcase, User } from "lucide-react";
import Link from "next/link";

type StatusVariant = 'default' | 'secondary' | 'outline' | 'destructive';

export function LatestActivity() {
  const { 
    data: enquiries = [], 
    isLoading: isLoadingEnquiries, 
    isError: isErrorEnquiries,
    refetch: refetchEnquiries 
  } = useLatestEnquiries();

  const { 
    data: buyLeads = [], 
    isLoading: isLoadingLeads, 
    isError: isErrorLeads,
    refetch: refetchLeads 
  } = useLatestBuyLeads();

  const getStatusVariant = (status: string): StatusVariant => {
    const statusLower = status.toLowerCase();
    
    if (['new', 'open'].includes(statusLower)) return 'default';
    if (['contacted', 'in_negotiation'].includes(statusLower)) return 'secondary';
    if (statusLower === 'quoted') return 'outline';
    if (statusLower === 'closed') return 'destructive';
    
    return 'outline';
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const renderLoadingSkeletons = (count: number) => (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full max-w-[200px]" />
            <Skeleton className="h-3 w-3/4 max-w-[150px]" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderErrorState = (message: string, onRetry: () => void) => (
    <div className="text-center py-6 space-y-2">
      <Briefcase className="h-8 w-8 mx-auto text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRetry}
        className="mt-2"
      >
        Retry
      </Button>
    </div>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Enquiries Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg font-medium">Recent Enquiries</CardTitle>
            <CardDescription>Latest customer enquiries for your products</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/enquiries" className="flex items-center">
              View all
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingEnquiries ? (
            renderLoadingSkeletons(3)
          ) : isErrorEnquiries ? (
            renderErrorState('Failed to load enquiries', refetchEnquiries)
          ) : enquiries.length > 0 ? (
            <div className="space-y-4">
              {enquiries.map((enquiry) => (
                <div key={enquiry.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 bg-muted rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm font-medium truncate">{enquiry.name}</p>
                      <Badge 
                        variant={getStatusVariant(enquiry.status)} 
                        className="flex-shrink-0 ml-2"
                      >
                        {enquiry.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {enquiry.product?.name || 'General Enquiry'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {enquiry.phone || enquiry.email || 'No contact info'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(enquiry.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 space-y-2">
              <Briefcase className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No recent enquiries found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Buy Leads Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg font-medium">Latest Buy Leads</CardTitle>
            <CardDescription>Recent buy leads matching your business</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/buy-leads" className="flex items-center">
              View all
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingLeads ? (
            renderLoadingSkeletons(3)
          ) : isErrorLeads ? (
            renderErrorState('Failed to load buy leads', refetchLeads)
          ) : buyLeads.length > 0 ? (
            <div className="space-y-4">
              {buyLeads.map((lead) => (
                <div key={lead.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 bg-muted rounded-full">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm font-medium truncate">{lead.title}</p>
                      <Badge 
                        variant={getStatusVariant(lead.status)} 
                        className="flex-shrink-0 ml-2"
                      >
                        {lead.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {lead.category && (
                      <p className="text-xs text-muted-foreground">
                        {lead.category.name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(lead.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 space-y-2">
              <Briefcase className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No recent buy leads found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
