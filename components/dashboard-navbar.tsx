"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, Award, Play } from "lucide-react";
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
      name: "Batches",
      href: "/admin",
      icon: Play,
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
            pathname === item.href || (item.href === "/admin" && pathname.startsWith("/admin"))
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
