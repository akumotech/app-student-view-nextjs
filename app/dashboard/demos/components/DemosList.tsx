"use client";
import type { DemoRead } from "@/lib/dashboard-types";

export default function DemosList({ demos }: { demos: DemoRead[] }) {
  return (
    <div>
      <h2>Your Demos</h2>
      <ul>
        {demos.map((demo) => (
          <li key={demo.id}>
            <strong>{demo.title}</strong> — {demo.demo_url}
          </li>
        ))}
      </ul>
    </div>
  );
}
