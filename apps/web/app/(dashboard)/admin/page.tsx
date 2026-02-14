"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { Skeleton } from "@workspace/ui/components/skeleton";
import Sidebar from "@/components/sidebar/Sidebar";


type User = {
  id: string;        
  email: string;    
  role: "user" | "admin";
  createdAt: string;
};
export default function AdminUsersPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("api/admin");
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to fetch users");
      }
      return res.json();
    },
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <Card className="w-full max-w-5xl mx-auto rounded-2xl border border-border/50 shadow-lg">
          <CardHeader className="px-6 py-4">
            <CardTitle className="text-2xl font-bold">Total Users</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
            ) : users && users.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user:User) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground">No users found.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
