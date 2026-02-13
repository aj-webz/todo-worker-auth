"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "@workspace/ui/components/chart";

import { isToday } from "date-fns";
import { useTodoQuery } from "@/hooks/queryhook";
import type { Todo } from "@repo/shared";

function dataVariation(todos: Todo[]) {
  return [
    {
      label: "Today",
      value: todos.filter((t) =>
        isToday(new Date(t.createdAt))
      ).length,
    },
    {
      label: "Pending",
      value: todos.filter(
        (t) => t.status === "in-progress"
      ).length,
    },
    {
      label: "Completed",
      value: todos.filter(
        (t) => t.status === "completed"
      ).length,
    },
  ];
}

export function TodoStatusChart() {
  const { data: todos = [] } = useTodoQuery();
  const data = dataVariation(todos);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Overview</CardTitle>
      </CardHeader>

      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />

            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <Tooltip />

            <Bar
              dataKey="value"
              radius={[10, 10, 0, 0]}
              fill="hsl(var(--primary))"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
