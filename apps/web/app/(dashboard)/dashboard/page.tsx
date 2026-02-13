"use client";

import Sidebar from "@/components/sidebar/Sidebar";
import { DashboardStats } from "@/components/dashboardcomponents/CardStatus";
import { TodoProgress } from "@/components/dashboardcomponents/TodoProgress";
import { TodoStatusChart } from "@/components/dashboardcomponents/TodoCharts";
import { useTodoQuery } from "@/hooks/queryhook";
import StatCard from "@/components/dashboardcomponents/StatCard";

export default function DashboardPage() {
  const { data: todos = [] } = useTodoQuery();

  const backlogCount = todos.filter((t) => t.status === "backlog").length;
  const cancelled = todos.filter((t) => t.status === "cancelled").length;

  return (
    <div className="flex min-h-screen bg-muted/40">

     
      <aside>
        <Sidebar />
      </aside>


      <main className="flex-1 transition-all duration-500 ease-in-out">
        <div className="space-y-8 p-8">

          <div className="flex flex-col space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Overview of your work
            </p>
          </div>

          <DashboardStats />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-9xl">
            <StatCard label="Backlog" value={backlogCount} variant="backlog" total={todos.length} />
            <StatCard label="Cancelled" value={cancelled} variant="cancelled" total={todos.length} />
            <TodoProgress />
          </div>

          <TodoStatusChart />

        </div>
      </main>

    </div>
  );
}
