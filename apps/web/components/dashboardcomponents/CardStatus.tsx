"use client";
import StatCard from "./StatCard";
import { useTodoQuery } from "@/hooks/queryhook"
import  { isToday } from "date-fns"
export function DashboardStats() {
  const { data: todos = [] } = useTodoQuery();

  const todayCount = todos.filter((t) => isToday(new Date(t.createdAt))).length;

  const pendingCount = todos.filter((t) => t.status === "in-progress").length;

  const completedCount = todos.filter((t) => t.status === "completed").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <StatCard label="Today" value={todayCount} variant="today" total={todos.length} />
      <StatCard label="Pending" value={pendingCount} variant="pending"  total={todos.length}/>
      <StatCard label="Completed" value={completedCount} variant="completed" total={todos.length} />
    </div>
  );
}
