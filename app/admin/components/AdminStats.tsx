"use client";

export default function AdminStats({ stats, users }: { stats: any; users: any }) {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <pre>{JSON.stringify(stats, null, 2)}</pre>
      <h3>Users</h3>
      <ul>
        {users.users.map((user: any) => (
          <li key={user.id}>
            {user.email} — {user.role}
          </li>
        ))}
      </ul>
    </div>
  );
}
