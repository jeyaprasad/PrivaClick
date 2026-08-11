import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t bg-card/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <span className="font-display text-lg font-semibold">Privaclick</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Helping people keep control of the photos that belong to them.
          </p>
        </div>
        <FooterCol
          title="Company"
          links={[
            ["About", "/about"],
            ["Contact", "/contact"],
          ]}
        />
        <FooterCol
          title="Legal"
          links={[
            ["Privacy Policy", "/privacy"],
            ["How your data is handled", "/privacy"],
          ]}
        />
        <FooterCol
          title="Support"
          links={[
            ["Cyber Crime Resources", "/resources"],
            ["Get protected", "/auth"],
          ]}
        />
      </div>
      <div className="border-t px-6 py-5 text-center text-xs text-muted-foreground">
        © 2026 Privaclick. Your photos stay yours.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {links.map(([label, to]) => (
          <li key={label + to}>
            <Link to={to} className="transition-colors hover:text-primary">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}