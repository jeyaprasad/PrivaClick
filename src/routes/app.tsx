import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  Camera,
  FileText,
  LayoutDashboard,
  LogOut,
  ScanFace,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { usePrivaclick } from "@/lib/store";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

const nav = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/photos", label: "My Photos", icon: Camera },
  { to: "/app/detections", label: "Detections", icon: ScanFace },
  { to: "/app/complaints", label: "Complaints", icon: FileText },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

function AppLayout() {
  const { user } = usePrivaclick();

  return (
    <div className="min-h-screen bg-background text-foreground font-mono lg:flex">
      <aside className="flex flex-col border-b border-border bg-black lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2 px-5 py-6">
          <span className="font-bold tracking-widest text-primary">&gt; PRIVACLICK</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/app" }}
              activeProps={{
                className: "bg-primary text-black font-bold",
              }}
              inactiveProps={{ className: "text-muted-foreground hover:bg-primary/20 hover:text-primary" }}
              className="group flex shrink-0 items-center gap-2.5 px-3 py-2 text-sm uppercase transition-colors"
            >
              <span className="opacity-0 group-hover:opacity-100 group-[.active]:opacity-100">&gt;</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto hidden space-y-3 px-5 py-4 lg:block">
          <div className="border border-border bg-black p-3 font-mono text-xs text-primary/80">
            <div className="border-b border-border pb-1 mb-2">&gt;_ session_info</div>
            <p className="font-bold text-primary">USER: {user.name}</p>
            <p className="truncate opacity-70">ID: {user.email}</p>
            <p className="mt-2 opacity-70">
              [AUTHED] {user.verifiedOn}
            </p>
            <p className="opacity-70">[{user.maskedId}]</p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive hover:text-black uppercase font-bold transition-colors"
          >
            <LogOut className="size-4" />
            &gt; LOGOUT
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-5 py-8 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
}