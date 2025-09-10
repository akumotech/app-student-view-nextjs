"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  List,
  Plus,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  Menu,
  Award,
  ClipboardPen,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Admin overview and stats",
  },
  {
    name: "User Management",
    href: "/admin/users",
    icon: Users,
    description: "Manage users and permissions",
  },
  {
    name: "View Batches",
    href: "/admin/batches",
    icon: List,
    description: "View and manage existing batches",
  },
  {
    name: "Demo Sessions",
    href: "/admin/demo-sessions",
    icon: Calendar,
    description: "Manage demo sessions",
  },
  {
    name: "Certificates",
    href: "/admin/certificates",
    icon: Award,
    description: "Manage certificates",
  },
  {
    name: "Projects",
    href: "/admin/projects",
    icon: ClipboardPen,
    description: "Manage projects",
  },
  {
    name: "Interviews",
    href: "/admin/interviews",
    icon: MessageSquare,
    description: "Manage interview sessions",
  },
];

interface AdminSidebarProps {
  className?: string;
}

export default function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (user?.role !== "admin") {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-white shadow-md"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64",
          "lg:translate-x-0", // Always visible on desktop
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0", // Hidden on mobile unless opened
          className,
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex"
            >
              <ChevronLeft
                className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")}
              />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group",
                    active
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      active ? "text-blue-700" : "text-gray-400",
                    )}
                  />
                  {!isCollapsed && (
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="truncate">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500 truncate">{item.description}</div>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            {!isCollapsed && (
              <div className="text-xs text-gray-500">
                <div className="font-medium">{user?.name}</div>
                <div className="capitalize">{user?.role}</div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
