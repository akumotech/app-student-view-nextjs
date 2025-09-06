"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, Award, Play, Users, List, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

import { cn } from "@/lib/utils";

export function MainNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    {
      name: "Code",
      href: "/dashboard",
      icon: Code2,
      admin: false,
    },
    {
      name: "Certificates",
      href: "/dashboard/certificates",
      icon: Award,
      admin: false,
    },
    {
      name: "Demos",
      href: "/dashboard/demos",
      icon: Play,
      admin: false,
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: User,
      admin: false,
    },
    {
      name: "Create Batch",
      href: "/admin/batches/newBatch",
      icon: Users,
      admin: true,
    },
    {
      name: "View Batches",
      href: "/admin/batches",
      icon: List,
      admin: true,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      admin: true,
    },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (item.admin) {
      return user?.role === "admin";
    }
    return true;
  });

  return (
    <nav className="flex items-center space-x-6">
      {filteredNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center space-x-2 text-sm font-medium transition-colors",
            pathname === item.href ||
              (item.href === "/admin/batches/newBatch" && pathname === "/admin/batches/newBatch") ||
              (item.href === "/admin/batches" && pathname === "/admin/batches") ||
              (item.href === "/admin/users" && pathname === "/admin/users")
              ? "text-primary"
              : "text-muted-foreground hover:text-primary",
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.name}</span>
        </Link>
      ))}
    </nav>
  );
}
