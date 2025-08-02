import { DashboardStats } from "@/components/dashboard/stats-cards";

export default function DashboardPage() {

  return (
    <div className="flex-1 p-6">
      <div className="flex flex-col space-y-6">
        <DashboardStats />
      </div>
    </div>
  );
}