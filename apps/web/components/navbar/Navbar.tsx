"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@workspace/ui/components/navigation-menu";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <NavigationMenuLink asChild>
      <Link
        href={href}
        className={`text-sm font-medium transition ${
          active
            ? "text-blue-600 font-semibold"
            : "text-neutral-700 hover:text-blue-600"
        }`}
      >
        {label}
      </Link>
    </NavigationMenuLink>
  );
}

export default function Navbar() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: session, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch("/api/get-session");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    },
    onError: () => {
      toast.error("Failed to logout");
    },
  });

  return (
    <header className="h-16 w-full border-b bg-white px-9 flex items-center justify-between">
      <span className="text-lg font-semibold tracking-tight text-neutral-900">
        WORK <span className="text-blue-600">TRACKER</span>
      </span>

      <div className="flex items-center gap-10">
        <NavigationMenu>
          <NavigationMenuList className="gap-4">
            <NavigationMenuItem>
              <NavLink href="/dashboard" label="Dashboard" />
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink href="/manage" label="Manage" />
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full hover:bg-neutral-100 p-1 transition disabled:opacity-50" disabled={isLoggingOut}>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar.png" alt="User" />
                <AvatarFallback>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (session?.user?.email?.[0].toUpperCase() || "U")}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
              {session?.user?.email || "Loading..."}
            </div>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <LayoutDashboard className="h-4 w-4" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem 
              className="flex items-center gap-2 text-destructive cursor-pointer"
              disabled={isLoggingOut}
              onClick={() => logout()}
            >
              {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
