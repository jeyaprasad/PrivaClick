import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  Lock,
  ScanEye,
  BrainCircuit,
  Database,
  Activity,
  Sliders,
  Search,
  CheckCircle2,
  FileArchive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Privaclick — Protect Your Privacy Online" },
      {
        name: "description",
        content:
          "Privaclick finds where your photos are being used without permission and helps you get them taken down.",
      },
    ],
  }),
  component: Landing,
});

function DetectionFoundCard() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="absolute -inset-1 bg-gradient-to-tr from-destructive/20 to-primary/10 rounded-2xl blur-2xl" />
      <div className="relative bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-[float_6s_ease-in-out_infinite_alternate]">
        <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ScanEye className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Match Detected</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              98% Confidence • Instagram
            </p>
          </div>
        </div>
        <div className="p-4">
          <div className="relative h-48 w-full rounded-md overflow-hidden bg-muted">
            <img 
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80" 
              alt="Detected image" 
              className="object-cover w-full h-full opacity-90"
            />
            <div className="absolute inset-0 border-2 border-destructive/80 m-4 rounded" />
          </div>
          <div className="mt-4 p-3 rounded-md bg-muted/50 border border-border">
            <p className="text-xs font-semibold text-foreground mb-1">Source URL</p>
            <p className="text-xs text-muted-foreground truncate font-mono">instagram.com/p/unauthorized...</p>
          </div>
        </div>
        <div className="p-4 pt-0 flex gap-3">
          <Button variant="outline" className="flex-1 border-border text-foreground">
            Dismiss
          </Button>
          <Button className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Take Action
          </Button>
        </div>
      </div>
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
            
      <header className="fixed top-4 left-0 right-0 z-50 px-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-background/60 px-6 py-3 backdrop-blur-xl shadow-2xl relative">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <ShieldCheck className="size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Privaclick</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground bg-white/5 px-6 py-2 rounded-full border border-white/5">
            <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <Link to="/about" className="hover:text-primary transition-colors">About</Link>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex hover:text-foreground rounded-full">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90  shadow-primary/20 rounded-full px-6">
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="pt-24 md:pt-28 relative z-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-8 md:pt-12 pb-16">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6  shadow-primary/10 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                New — AI Deepfake Detection <ArrowRight className="size-3 ml-1" />
              </div>
              <h1 className="font-display text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl xl:text-7xl text-balance">
                Take Back Control of Your <span className="text-primary italic">Photos</span> Online.
              </h1>
              <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg text-balance">
                Advanced AI detection paired with guided cybercrime complaint filing. We scan the web for unauthorized use of your images and help you take them down.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 font-semibold  shadow-primary/25 rounded-full">
                  <Link to="/auth">Get Started Free</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-8 font-semibold border-border bg-card hover:bg-accent hover:text-foreground rounded-full backdrop-blur-sm">
                  <a href="#how-it-works">See How It Works</a>
                </Button>
              </div>
            </div>
            
            <div className="lg:ml-auto w-full relative">
              <DetectionFoundCard />
            </div>
          </div>
        </section>

        {/* Trust Strip */}
        <section className="border-y border-border bg-card/50 py-10">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-center text-sm font-medium text-muted-foreground mb-8">
              Trusted by students, creators, and privacy-conscious users
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {["AI-Powered", "GDPR-Aware", "Encrypted", "Built for Privacy"].map((badge) => (
                <div key={badge} className="flex items-center gap-2 font-bold text-lg text-slate-400">
                  <CheckCircle2 className="size-5 text-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="py-24 relative">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-up">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Everything you need to protect your image</h2>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: ScanEye,
                  title: "AI Detection",
                  desc: "We continuously scan the web for unauthorized use of your photos using advanced facial matching.",
                },
                {
                  icon: FileText,
                  title: "Guided Complaint Filing",
                  desc: "Auto-generate and file a formal cybercrime complaint in minutes to expedite removals.",
                },
                {
                  icon: Lock,
                  title: "Full Control",
                  desc: "Review every match, decide what happens, and delete your data from our system anytime.",
                },
              ].map((f, i) => (
                <div key={i} className="group relative rounded-xl border border-primary/50 bg-primary/10 p-8 feature-card-hover">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-foreground shadow-md">
                    <f.icon className="size-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="border-t border-border bg-muted/20 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-up">
              <h2 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">How It Works</h2>
              <p className="mt-4 text-lg text-muted-foreground">From upload to takedown — simple, fast, and fully in your control.</p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { 
                  icon: Database,
                  title: "1. Register Photos", 
                  desc: "Upload your images to our secure, encrypted vault. We extract features for matching, not identity." 
                },
                { 
                  icon: ScanEye,
                  title: "2. Continuous Scanning", 
                  desc: "Our AI engine actively monitors the public web, social platforms, and forums for visual matches." 
                },
                { 
                  icon: ShieldCheck,
                  title: "3. Take Action", 
                  desc: "When a match is found, auto-generate and file a formal cybercrime complaint with one click." 
                },
              ].map((step, i) => (
                <div key={i} className="flex flex-col rounded-2xl border border-border bg-card p-8 shadow-sm feature-card-hover items-center text-center">
                  <div className="mb-6 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <step.icon className="size-8" />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities Grid */}
        <section className="py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 animate-fade-up">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">Comprehensive Protection, Built In</h2>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Search, title: "Photo Monitoring", desc: "Global web scanning engine" },
                { 
                  icon: BrainCircuit, 
                  title: "Deepfake Detection", 
                  desc: "Identify AI-manipulated imagery"
                },
                { icon: FileArchive, title: "Evidence Reports", desc: "Generate court-ready PDFs" },
                { icon: Database, title: "Secure Storage", desc: "End-to-end encrypted vaults" },
                { icon: Activity, title: "Complaint Tracking", desc: "Live status updates on removals" },
                { icon: Sliders, title: "Data Control", desc: "One-click complete data wipe" },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl border border-primary/50 bg-primary/10 p-5 feature-card-hover">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-foreground shadow-md">
                    <c.icon className="size-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{c.title}</h4>
                    <p className="text-xs text-muted-foreground">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border bg-primary/5 py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-topography opacity-50 mix-blend-overlay" />
          <div className="relative mx-auto max-w-3xl px-6 text-center animate-fade-up">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
              Ready to secure your digital footprint?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Join thousands of users who have taken back control of their photos online.
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 text-lg font-semibold  shadow-primary/30">
              <Link to="/auth">Start Your Free Scan</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
