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
import { logoutServer } from "@/lib/supabase-fns";

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
    <div className="min-h-screen bg-background text-foreground lg:flex font-sans">
      <aside className="flex flex-col border-b border-border bg-primary text-primary-foreground lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0">
        <div className="flex items-center gap-2 px-6 py-8">
          <ShieldCheck className="size-6 text-primary-foreground" />
          <span className="font-display font-bold text-xl tracking-tight">Privaclick</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-3 lg:flex-col lg:overflow-visible">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/app" }}
              activeProps={{
                className: "bg-primary-foreground/10 text-primary-foreground font-semibold",
              }}
              inactiveProps={{ className: "text-primary-foreground/70 hover:bg-primary-foreground/5 hover:text-primary-foreground" }}
              className="flex shrink-0 items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto hidden px-4 py-6 lg:block">
          <div className="rounded-xl bg-primary-foreground/5 p-4 border border-primary-foreground/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-foreground/10 font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-sm">{user.name}</p>
                <p className="truncate text-xs text-primary-foreground/70">{user.email}</p>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-primary-foreground/70 mb-3 border-t border-primary-foreground/10 pt-3">
              <span>Status</span>
              <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-green-400"></span> Verified</span>
            </div>
            <button
              onClick={async (e) => {
                e.preventDefault();
                await logoutServer();
                window.location.href = "/auth";
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-foreground/10 px-3 py-2 text-xs font-medium hover:bg-primary-foreground/20 transition-colors"
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-5 py-8 lg:p-10 bg-background">
        <Outlet />
      </main>
    </div>
  );
}