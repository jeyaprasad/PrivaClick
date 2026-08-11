import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";

export function PageShell({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <span className="font-display font-semibold">Privaclick</span>
          </Link>
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary">
            Get Protected
          </Link>
        </div>
      </header>
      <main className="animate-fade-up mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
        {lead && <p className="mt-4 text-lg text-muted-foreground">{lead}</p>}
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}