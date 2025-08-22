import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Box, MessageSquare, Plus, User } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6">
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold tracking-tight">
          Business Dashboard
        </h1>
        <p className="text-muted-foreground">
          Your B2B insights and analytics will be available soon.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Button
          asChild
          variant="outline"
          className="group h-auto flex-col items-center gap-3 rounded-lg py-6 transition-all hover:border-primary/50 hover:bg-primary/5"
        >
          <Link href="/products/add" className="space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20">
              <Plus className="h-6 w-6" />
            </div>
            <span className="font-medium">Add Product</span>
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="group h-auto flex-col items-center gap-3 rounded-lg py-6 transition-all hover:border-blue-500/50 hover:bg-blue-500/5"
        >
          <Link href="/products" className="space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20">
              <Box className="h-6 w-6" />
            </div>
            <span className="font-medium">My Products</span>
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="group h-auto flex-col items-center gap-3 rounded-lg py-6 transition-all hover:border-amber-500/50 hover:bg-amber-500/5"
        >
          <Link href="/enquiries" className="space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20">
              <MessageSquare className="h-6 w-6" />
            </div>
            <span className="font-medium">Enquiries</span>
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="group h-auto flex-col items-center gap-3 rounded-lg py-6 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5"
        >
          <Link href="/profile" className="space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20">
              <User className="h-6 w-6" />
            </div>
            <span className="font-medium">Account</span>
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Business Analytics Dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                We're preparing valuable insights about your B2B activities
                including:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                <li>Lead generation metrics</li>
                <li>Catalog performance</li>
                <li>RFQ (Request for Quote) analytics</li>
                <li>Product views and engagement</li>
                <li>Buyer interactions</li>
              </ul>
              <p className="pt-4 text-sm text-muted-foreground">
                Check back soon to track your business growth and optimize your
                B2B strategy.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Your business at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Total Leads</div>
                <div className="text-sm text-muted-foreground">Coming soon</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Active RFQs</div>
                <div className="text-sm text-muted-foreground">Coming soon</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Catalog Views</div>
                <div className="text-sm text-muted-foreground">Coming soon</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">New Messages</div>
                <div className="text-sm text-muted-foreground">Coming soon</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
