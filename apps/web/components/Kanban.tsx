"use client";

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { format } from "date-fns";
import { useMemo, useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

import type { Todo, TodoStatus } from "@repo/shared";
import { useTodoQuery, useUpdateTodoStatus } from "../hooks/queryhook";
import { useDeleteTodo } from "../hooks/queryhook"


const isTodoStatus = (value: string): value is TodoStatus =>
  value === "backlog" ||
  value === "todo" ||
  value === "in-progress" ||
  value === "completed" ||
  value === "cancelled";

const statusColumns: { id: TodoStatus; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "todo", label: "Todo" },
  { id: "in-progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

const statusColor: Record<TodoStatus, string> = {
  backlog: "bg-slate-500",
  todo: "bg-purple-500",
  "in-progress": "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};


const getCardBg = (todo: Todo, now: number) => {
  if (!todo.endAt) return "bg-white";
  if (todo.status !== "in-progress") return "bg-white";

  const start = new Date(todo.createdAt).getTime();
  const end = new Date(todo.endAt).getTime();
  const total = end - start;
  const remaining = end - now;

  //if (remaining <= 0) return "bg-red-200";
  const remainingRatio = remaining / total;
  if (remainingRatio <= 0.25) return "bg-red-50";
  if (remainingRatio <= 0.5) return "bg-yellow-50";
  return "bg-gray-50";
};


const getProgress = (todo: Todo, now: number) => {
  if (!todo.endAt || todo.status !== "in-progress") return null;

  const start = new Date(todo.createdAt).getTime();
  const end = new Date(todo.endAt).getTime();
  const total = end - start;
  const elapsed = now - start;
  const remaining = end - now;

  let color = "bg-gray-200";
  if (remaining <= 2 * 60 * 60 * 1000) color = "bg-red-100";
  else if (elapsed >= total / 2) color = "bg-yellow-200";

  const value = Math.min(100, (elapsed / total) * 100);
  return { value, color };
};


export const KanbanBoard = () => {
  const { data: todos = [] } = useTodoQuery();
  const updateTodoStatus = useUpdateTodoStatus();

  const [now, setNow] = useState(Date.now());


  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    todos.forEach((todo) => {
      if (
        todo.status === "in-progress" &&
        todo.endAt &&
        new Date(todo.endAt).getTime() <= now
      ) {
        updateTodoStatus.mutate({ id: todo.id, status: "backlog" });
      }
    });
  }, [now, todos, updateTodoStatus]);

  const grouped = useMemo(() => {
    const map: Record<TodoStatus, Todo[]> = {
      backlog: [],
      todo: [],
      "in-progress": [],
      completed: [],
      cancelled: [],
    };
    todos.forEach((t) => map[t.status].push(t));
    return map;
  }, [todos]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const fromStatus = source.droppableId;
    const toStatus = destination.droppableId;
   // if (fromStatus === "backlog") return;
    if (toStatus === fromStatus) return;
    if (!isTodoStatus(toStatus)) return;
    if (toStatus === "backlog") return;
    updateTodoStatus.mutate({
      id: draggableId.replace("todo-", ""),
      status: toStatus,
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {statusColumns.map((col) => (
          <Card key={col.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-[12px] font-semibold">
                {col.label}
                <span className="text-muted-foreground text-[11px]">
                  {grouped[col.id].length}
                </span>
              </CardTitle>
            </CardHeader>

            <Droppable droppableId={col.id}>
              {(p) => (
                <CardContent
                  ref={p.innerRef}
                  {...p.droppableProps}
                  className="space-y-4 min-h-[160px]"
                >
                  {grouped[col.id].map((todo, index) => (
                    <TodoCard key={todo.id} todo={todo} index={index} now={now} />
                  ))}
                  {p.placeholder}
                </CardContent>
              )}
            </Droppable>
          </Card>
        ))}
      </div>
    </DragDropContext>
  );
};


const TodoCard = ({
  todo,
  index,
  now,
}: {
  todo: Todo;
  index: number;
  now: number;
}) => {
  const progress = getProgress(todo, now);
  const deleteTodoMutation = useDeleteTodo();

  const handleDelete = () => {
    deleteTodoMutation.mutate(todo.id);
  };

  return (
    <Draggable draggableId={`todo-${todo.id}`} index={index}>
      {(p) => (
        <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}>
          <Card
            className={cn(
              "flex flex-col justify-between h-[200px] rounded-sm shadow-md",
              getCardBg(todo, now)
            )}
          >
            <CardContent className="p-4 flex flex-col h-46.25 justify-between">

              <div className="flex justify-between h-3 items-center ">
                <h3
                  className="font-semibold text-[12px] leading-tight"
                  title={todo.title}
                >
                  {todo.title.length > 12
                    ? `${todo.title.slice(0, 12)}…`
                    : todo.title}
                </h3>
                <div className="flex items-center  gap-2">
                  <Badge className={cn(statusColor[todo.status], "text-[10px] h-4")}>
                    {todo.status}
                  </Badge>
                  <Button onClick={handleDelete} className="rounded-full h-5 text-[8px] text-white bg-red-600">
                    X
                  </Button>
                </div>
              </div>


              <p className="text-[10px] text-gray-400 line-clamp-2">
                {todo.description}
              </p>


              <div className="flex justify-between mt-2">
                <span className="flex flex-col">
                  <span className="text-[8px] font-semibold text-gray-700">Start</span>
                  <span className="text-[10px] font-semibold text-black">
                    {format(new Date(todo.createdAt), "dd MMM HH:mm:ss")}
                  </span>
                </span>
                {todo.endAt && (
                  <span className="flex flex-col">
                    <span className="text-[8px] font-semibold text-gray-700">End</span>
                    <span className="text-[10px] font-semibold text-black">
                      {format(new Date(todo.endAt), "dd MMM HH:mm:ss")}
                    </span>
                  </span>
                )}
              </div>

              {/* Progress */}
              {progress && (
                <Progress value={progress.value} className={cn("h-2 mt-2 rounded", progress.color)} />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};
