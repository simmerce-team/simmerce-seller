import { DashboardStats } from "@/components/dashboard/stats-cards";

export default function DashboardPage() {
  return (
    <div className="flex-1 p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your business.
        </p>
      </div>

      <DashboardStats />
    </div>
  );
}