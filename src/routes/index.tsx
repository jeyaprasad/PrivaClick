import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Eye,
  FileCheck2,
  Fingerprint,
  Lock,
  ShieldCheck,
  TerminalSquare,
} from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/SiteFooter";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Privaclick | Terminal" },
      {
        name: "description",
        content:
          "Privaclick finds where your photos are being used without permission and helps you get them taken down.",
      },
    ],
  }),
  component: Landing,
});

const steps = [
  {
    icon: UploadCloud,
    title: "UPLOAD_PROOF",
    body: "Add a few reference photos. They stay private and are only used to look for matches.",
  },
  {
    icon: Eye,
    title: "INIT_MONITOR",
    body: "Our matching engine keeps an eye on the platforms you choose and flags likely matches.",
  },
  {
    icon: FileCheck2,
    title: "EXECUTE_TAKEDOWN",
    body: "Review each match yourself. Nothing is reported unless you say so.",
  },
];

function UploadCloud(props: any) {
  return <TerminalSquare {...props} />;
}

function TypewriterText({ text, delay = 0, speed = 50 }: { text: string, delay?: number, speed?: number }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;
    
    timeout = setTimeout(() => {
      setIsTyping(true);
      let i = 0;
      interval = setInterval(() => {
        setDisplayedText(text.substring(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setIsTyping(false);
          setIsComplete(true);
        }
      }, speed);
    }, delay);
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, delay, speed]);

  return (
    <>
      {displayedText}
      {(!isComplete || isTyping) && <span className="animate-pulse">_</span>}
    </>
  );
}

function Landing() {
  const [showSub, setShowSub] = useState(false);
  
  useEffect(() => {
    const t = setTimeout(() => setShowSub(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <TerminalSquare className="size-5" />
            <span className="text-lg font-bold tracking-tight">&gt; PRIVACLICK</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">[ LOGIN ]</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">> GET_STARTED</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative border-b border-border overflow-hidden">
          <div className="matrix-rain" />
          <div className="relative z-10 mx-auto grid max-w-6xl items-start gap-12 px-6 py-12 lg:grid-cols-2 lg:gap-16 lg:py-24">
            <div className="lg:pt-8">
              <span className="inline-flex items-center gap-2 border border-primary bg-background px-3 py-1 text-xs font-bold text-primary">
                > STATUS: SECURE
              </span>
              <h1 className="mt-6 text-3xl font-bold leading-tight sm:text-4xl xl:text-5xl text-balance text-glow text-primary h-24 sm:h-32">
                <TypewriterText text="> PROTECT_YOUR_PRIVACY.exe" speed={40} />
              </h1>
              <div className={`transition-opacity duration-1000 ${showSub ? 'opacity-100' : 'opacity-0'}`}>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base text-balance">
                  Photos get copied, reposted and reused every day, often without the person in them
                  ever knowing. Privaclick finds those copies and gives you a simple way to have them
                  removed.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button asChild size="lg">
                    <Link to="/auth">
                      > INITIALIZE_SCAN
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/resources">VIEW_MANUAL --help</Link>
                  </Button>
                </div>
                <p className="mt-5 text-xs font-bold text-muted-foreground/80">
                  // Free to start · No card needed · Delete your data anytime
                </p>
              </div>
            </div>
            
            <div className={`transition-opacity duration-1000 delay-500 relative w-full max-w-md border border-primary bg-background shadow-xl lg:ml-auto ${showSub ? 'opacity-100' : 'opacity-0'}`}>
              <div className="border-b border-primary bg-primary/10 px-3 py-1 flex items-center text-[10px] text-primary">
                <span>>_ system_monitor.sh</span>
              </div>
              <div className="relative h-48 w-full sm:h-56 p-1 border-b border-primary/30">
                <img
                  src={heroImage}
                  alt="Abstract face-matching wireframe"
                  className="h-full w-full object-cover opacity-40 mix-blend-screen filter grayscale contrast-200 sepia hue-rotate-[80deg]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>
              <div className="relative grid gap-0">
                <div className="flex items-center gap-4 border-b border-primary/30 bg-background/80 p-4">
                  <div className="text-primary">
                    <Fingerprint className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">> SIGNATURE_REGISTERED</p>
                    <p className="text-xs font-medium text-muted-foreground">3 reference photos active</p>
                  </div>
                </div>
                <div className="border-b border-primary/30 bg-background/80 p-5">
                  <div className="flex items-center justify-between font-bold mb-4">
                    <span className="flex items-center gap-2 text-sm text-primary">
                      <Eye className="size-4" /> > SCANNING_PLATFORMS
                    </span>
                    <span className="text-[10px] uppercase text-primary animate-pulse">[LIVE]</span>
                  </div>
                  <div className="space-y-4">
                    {[
                      ["INSTAGRAM", 97],
                      ["FACEBOOK", 93],
                      ["PINTEREST", 88],
                    ].map(([name, pct]) => (
                      <div key={name as string}>
                        <div className="mb-2 flex justify-between text-xs font-bold text-muted-foreground">
                          <span>{name}</span>
                          <span className="text-primary">{pct}%</span>
                        </div>
                        <div className="h-1 overflow-hidden border border-primary/20 bg-black">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${pct as number}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-background/80 p-4">
                  <div className="text-destructive animate-pulse">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-destructive">> 2_TAKEDOWNS_IN_PROGRESS</p>
                    <p className="text-xs font-medium text-muted-foreground">Awaiting user authorization</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20 border-b border-border">
          <div className="flex flex-col items-center">
            <h2 className="text-center text-2xl font-bold text-primary">> EXECUTION_FLOW</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              // Three simple steps. You stay in charge at every one of them.
            </p>
            
            <div className="mt-12 w-full max-w-3xl border border-primary bg-black p-6 font-mono text-sm sm:text-base">
              <div className="flex border-b border-primary/30 pb-2 mb-6 text-xs text-primary/60">
                <span>>_ how_it_works.sh</span>
              </div>
              <div className="space-y-6">
                {steps.map((s, i) => (
                  <div key={s.title}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-primary font-bold">[{i + 1}] {s.title}</span>
                      <span className="hidden sm:inline-block border-b border-dotted border-primary/40 flex-grow mx-4 mb-1"></span>
                      <span className="text-primary">[READY]</span>
                    </div>
                    <div className="text-muted-foreground pl-0 sm:pl-8 text-xs">{s.body}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-primary/30 flex items-center text-primary">
                <span>root@privaclick:~# </span><span className="animate-pulse ml-1">_</span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-black/50">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-primary">> SYSTEM_ARCHITECTURE</h2>
              <p className="mt-4 text-sm text-muted-foreground">
                // Built privacy-first. Protecting your photos should never mean handing over more of yourself. We keep the amount of information we hold as small as possible.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Lock, t: "E2E_ENCRYPTED", d: "Data encrypted in transit and at rest." },
                  { icon: Fingerprint, t: "ZERO_ID_RETENTION", d: "One-time checks. We drop government IDs." },
                  { icon: Eye, t: "MANUAL_AUTHORIZATION", d: "Nothing is reported without user signal." },
                  { icon: ShieldCheck, t: "ONE_CLICK_PURGE", d: "Remove your photos and account instantly." },
                ].map((b) => (
                  <div key={b.t} className="border border-border bg-black p-4">
                    <b.icon className="size-4 text-primary mb-2" />
                    <h3 className="text-xs font-bold text-primary">{b.t}</h3>
                    <p className="mt-1 text-[10px] text-muted-foreground">{b.d}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border border-primary bg-black p-6">
               <div className="border-b border-primary/30 pb-2 mb-6 text-xs text-primary/60">
                <span>>_ display_metrics</span>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {[
                  ["1.2M", "PHOTOS_MONITORED"],
                  ["43k", "MATCHES_REVIEWED"],
                  ["18k", "TAKEDOWNS_SUPPORTED"],
                  ["4.8/5", "USER_RATING"],
                ].map(([n, l]) => (
                  <div key={l} className="text-center">
                    <p className="text-2xl font-bold text-primary text-glow">{n}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground uppercase">{l}</p>
                  </div>
                ))}
                <blockquote className="col-span-1 sm:col-span-2 mt-4 border border-dashed border-border bg-black p-4 text-xs text-muted-foreground">
                  "I found out my photos were being used on a page I'd never heard of. Privaclick made
                  the whole reporting part feel manageable instead of frightening."
                  <footer className="mt-3 text-[10px] font-bold text-primary">
                    > USER: Meera K. [JOINED: 2025]
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-primary">> INITIATE_PROTOCOL</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            // Set up takes about three minutes. You can remove everything just as quickly.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link to="/auth">
              > GET_PROTECTED <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
