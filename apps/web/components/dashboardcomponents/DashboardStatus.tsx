"use client";


import { useTodoQuery } from "@/hooks/queryhook";
import { isToday } from "date-fns";
import StatCard from "./StatCard";

export function DashboardStats() {

    const { data: todos = [] } = useTodoQuery();

    const today = todos.filter((t) => isToday(t.createdAt)).length;

    const pending = todos.filter((t) => t.status === "in-progress").length;

    const completed = todos.filter((t) => t.status === "completed").length;

    const backlogCount = todos.filter((t) => t.status === "backlog").length;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            <StatCard label="Today" value={today} variant="today" total={todos.length} />
            <StatCard label="Pending" value={pending} variant="pending" total={todos.length}/>
            <StatCard label="Completed" value={completed} variant="completed" total={todos.length}/>
            <StatCard label="Backlog" value={backlogCount} variant="backlog" total={todos.length}/>
        </div>
    );

}
