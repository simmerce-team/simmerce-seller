"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowUpRight, Box, Clock, DollarSign, MessageSquare, Plus, Search, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DateRange } from "react-day-picker";

type Enquiry = {
  id: string;
  product: string;
  company: string;
  date: string;
  status: "new" | "contacted" | "quoted" | "converted";
  message: string;
};

type BuyLead = {
  id: string;
  title: string;
  category: string;
  quantity: string;
  budget: string;
  posted: string;
  status: "open" | "in_progress" | "closed";
};

type Product = {
  id: string;
  name: string;
  category: string;
  views: number;
  enquiries: number;
  status: "draft" | "published" | "out_of_stock";
  lastUpdated: string;
};

const statusVariant = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-purple-100 text-purple-800",
  quoted: "bg-yellow-100 text-yellow-800",
  converted: "bg-green-100 text-green-800",
  draft: "bg-gray-100 text-gray-800",
  published: "bg-green-100 text-green-800",
  out_of_stock: "bg-red-100 text-red-800",
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  closed: "bg-gray-100 text-gray-800",
};

export default function DashboardPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  // Mock data - replace with actual API calls
  const metrics = [
    {
      title: "Total Products",
      value: "156",
      change: "+5 this month",
      icon: Box,
      trend: "up",
    },
    {
      title: "Active Enquiries",
      value: "24",
      change: "+3 from last week",
      icon: MessageSquare,
      trend: "up",
    },
    {
      title: "Buy Leads",
      value: "18",
      change: "+5 from last month",
      icon: Search,
      trend: "up",
    },
    {
      title: "Conversion Rate",
      value: "12.5%",
      change: "+2.1% from last month",
      icon: TrendingUp,
      trend: "up",
    },
  ];

  const recentEnquiries: Enquiry[] = [
    {
      id: "#ENQ-001",
      product: "Industrial Steel Pipes",
      company: "ABC Constructions",
      date: "2025-07-26",
      status: "new",
      message: "Looking for bulk order of 1000m of 4-inch steel pipes..."
    },
    {
      id: "#ENQ-002",
      product: "HVAC Systems",
      company: "XYZ Infra Ltd.",
      date: "2025-07-25",
      status: "contacted",
      message: "Need quotation for commercial HVAC system..."
    },
    {
      id: "#ENQ-003",
      product: "Concrete Mixers",
      company: "PQR Builders",
      date: "2025-07-24",
      status: "quoted",
      message: "Requested quote for 5 units of XYZ model..."
    },
  ];

  const activeBuyLeads: BuyLead[] = [
    {
      id: "#BL-001",
      title: "Need 5000m of GI Pipes",
      category: "Construction Materials",
      quantity: "5000 meters",
      budget: "₹2,50,000",
      posted: "2 hours ago",
      status: "open"
    },
    {
      id: "#BL-002",
      title: "Heavy Duty Excavators",
      category: "Construction Equipment",
      quantity: "3 units",
      budget: "₹1,20,00,000",
      posted: "1 day ago",
      status: "open"
    },
    {
      id: "#BL-003",
      title: "Industrial Pumps - Monthly Supply",
      category: "Industrial Equipment",
      quantity: "50 units/month",
      budget: "Negotiable",
      posted: "3 days ago",
      status: "in_progress"
    },
  ];

  const recentProducts: Product[] = [
    {
      id: "#PROD-001",
      name: "Industrial Steel Pipes (4-inch)",
      category: "Construction Materials",
      views: 245,
      enquiries: 12,
      status: "published",
      lastUpdated: "2025-07-26"
    },
    {
      id: "#PROD-002",
      name: "Heavy Duty Concrete Mixer",
      category: "Construction Equipment",
      views: 189,
      enquiries: 8,
      status: "published",
      lastUpdated: "2025-07-25"
    },
    {
      id: "#PROD-003",
      name: "Industrial Water Pumps (5HP)",
      category: "Industrial Equipment",
      views: 132,
      enquiries: 5,
      status: "out_of_stock",
      lastUpdated: "2025-07-24"
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Seller Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <Button asChild>
          <Link href="/products/add">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className="rounded-lg p-2 bg-primary/10">
                <metric.icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                {metric.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowUpRight className="h-3 w-3 text-red-500 mr-1 rotate-180" />
                )}
                {metric.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Enquiries */}
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Enquiries</CardTitle>
              <CardDescription>Latest product enquiries from potential buyers</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEnquiries.map((enquiry) => (
                <div key={enquiry.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{enquiry.company}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusVariant[enquiry.status]}`}>
                        {enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{enquiry.product}</p>
                    <p className="text-sm line-clamp-1">{enquiry.message}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground flex items-center justify-end">
                      <Clock className="h-3 w-3 mr-1" />
                      {enquiry.date}
                    </p>
                    <Button variant="outline" size="sm">
                      Respond
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks at your fingertips</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Add New Product
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="mr-2 h-4 w-4" />
              Respond to Enquiries
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Search className="mr-2 h-4 w-4" />
              Browse Buy Leads
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="mr-2 h-4 w-4" />
              View Pricing Plans
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Activity className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Active Buy Leads */}
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Buy Leads</CardTitle>
              <CardDescription>Recent buying requirements matching your products</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeBuyLeads.map((lead) => (
                <div key={lead.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{lead.title}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                      <span>{lead.category}</span>
                      <span>•</span>
                      <span>{lead.quantity}</span>
                      <span>•</span>
                      <span className="font-medium text-foreground">{lead.budget}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusVariant[lead.status]}`}>
                      {lead.status.replace('_', ' ').charAt(0).toUpperCase() + lead.status.replace('_', ' ').slice(1)}
                    </span>
                    <p className="text-xs text-muted-foreground">Posted {lead.posted}</p>
                    <Button variant="outline" size="sm">
                      Submit Quote
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Products */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
            <CardDescription>Recently added or updated products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProducts.map((product) => (
                <div key={product.id} className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                      <Box className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-muted-foreground">{product.category}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusVariant[product.status]}`}>
                          {product.status.replace('_', ' ').charAt(0).toUpperCase() + product.status.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                        <span>{product.views} views</span>
                        <span>•</span>
                        <span>{product.enquiries} enquiries</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-more-horizontal"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="19" cy="12" r="1" />
                      <circle cx="5" cy="12" r="1" />
                    </svg>
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-2 text-primary">
                View All Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}