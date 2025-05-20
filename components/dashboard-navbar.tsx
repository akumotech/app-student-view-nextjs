"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, Award, Play } from "lucide-react";

import { cn } from "@/lib/utils";

export function MainNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Code",
      href: "/dashboard",
      icon: Code2,
      active: pathname === "/dashboard",
    },
    {
      name: "Certificates",
      href: "/dashboard/certificates",
      icon: Award,
      active: pathname === "/dashboard/certificates",
    },
    {
      name: "Demos",
      href: "/dashboard/demos",
      icon: Play,
      active: pathname === "/dashboard/demos",
    },
  ];

  return (
    <nav className="flex items-center space-x-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center space-x-2 text-sm font-medium transition-colors",
            item.active
              ? "text-primary"
              : "text-muted-foreground hover:text-primary"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.name}</span>
        </Link>
      ))}
    </nav>
  );
}
