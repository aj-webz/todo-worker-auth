"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import {
  LayoutDashboard,
  Settings,
  Shield,
  Menu,
  ChevronLeft,
} from "lucide-react"

export default function Sidebar() {
  const [open, setOpen] = useState(true)

  return (
    <div
      onClick={() => setOpen((prev) => !prev)} 
      className={cn(
        "h-full border-r border-border/50 bg-background shadow-sm transition-all duration-300 ease-in-out cursor-pointer select-none",
        open ? "w-50" : "w-16"
      )}
    >
      <div className="flex h-full flex-col py-4">

       
        <div className="flex justify-end px-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation() 
              setOpen((prev) => !prev)
            }}
            className="rounded-full h-8 w-8"
          >
            {open ? <ChevronLeft size={18} /> : <Menu size={18} />}
          </Button>
        </div>

        
        <nav className="flex-1 space-y-6 px-3.5">
          <SidebarItem
            href="/dashboard"
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            open={open} 
          />
          <SidebarItem
            href="/manage"
            icon={<Settings size={20} />}
            label="Manage"
            open={open}
          />
          <SidebarItem
            href="/admin"
            icon={<Shield size={20} />}
            label="Administer"
            open={open}
          />
        </nav>

      </div>
    </div>
  )
}

function SidebarItem({
  href,
  icon,
  label,
  open,
}: {
  href: string
  icon: React.ReactNode
  label: string
  open: boolean
}) {
  return (
    <Link
      href={href}
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-300"
    >
      <span className="flex-shrink-0">{icon}</span>

      <span
        className={cn(
          "whitespace-nowrap overflow-hidden transition-all duration-300",
          open
            ? "opacity-100 translate-x-0 w-auto"
            : "opacity-0 -translate-x-2 w-0"
        )}
      >
        {label}
      </span>
    </Link>
  )
}
