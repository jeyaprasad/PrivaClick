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
import { MatrixRain } from "@/components/MatrixRain";

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

function Hero3DGraphic() {
  return (
    <div className="relative w-full aspect-square max-w-[480px] mx-auto flex items-center justify-center">
      {/* Background layer: glow & particles */}
      <div className="absolute inset-0 bg-primary/15 blur-[100px] rounded-full" />
      
      {/* Floating particles */}
      <div className="absolute top-1/4 left-1/4 size-2 rounded-full bg-primary/40 animate-[float_4s_ease-in-out_infinite_alternate]" />
      <div className="absolute top-1/2 right-1/4 size-3 rounded-full bg-primary/20 animate-[float_6s_ease-in-out_infinite_alternate_reverse]" />
      <div className="absolute bottom-1/4 left-1/3 size-1.5 rounded-full bg-primary/50 animate-[float_3s_ease-in-out_infinite_alternate]" />

      {/* Floating Accent Icons */}
      <div className="absolute top-[15%] right-[10%] bg-card p-3 rounded-xl border border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.5)] z-20 animate-[float_5s_ease-in-out_infinite_alternate]">
        <Lock className="size-5 text-muted-foreground" />
      </div>
      <div className="absolute bottom-[20%] left-[5%] bg-card p-3 rounded-xl border border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.5)] z-20 animate-[float_7s_ease-in-out_infinite_alternate_reverse]">
        <ScanEye className="size-6 text-primary" />
      </div>
      <div className="absolute top-[30%] left-[10%] bg-card p-2 rounded-lg border border-white/10 shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-0 animate-[float_4s_ease-in-out_infinite_alternate]" style={{ animationDelay: '1s' }}>
        <CheckCircle2 className="size-4 text-primary" />
      </div>

      {/* Mid Layer: Photo Card */}
      <div className="relative w-64 h-80 bg-slate-900 border border-white/10 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] -rotate-[8deg] overflow-hidden flex flex-col z-10 transition-transform duration-700 hover:-rotate-6">
        
        {/* Photo Content Area */}
        <div className="flex-1 bg-slate-800 m-3 mb-0 rounded-xl overflow-hidden relative flex flex-col items-center justify-end pt-8">
          
          {/* Abstract Silhouette */}
          <div className="w-16 h-16 bg-slate-700 rounded-full mb-3 z-10" />
          <div className="w-28 h-20 bg-slate-700 rounded-t-[40px] z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent z-10" />

          {/* Scanning Effect */}
          <div className="absolute left-0 right-0 h-0.5 bg-primary box-glow animate-[scan_3s_linear_infinite] z-20 shadow-[0_0_15px_rgba(16,185,129,1)]">
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-primary/30 to-transparent translate-y-[-1px]" />
          </div>
        </div>
        
        {/* Card Footer */}
        <div className="h-16 px-5 flex flex-col justify-center gap-2">
          <div className="h-2 w-20 bg-slate-800 rounded-full" />
          <div className="h-1.5 w-12 bg-slate-800 rounded-full opacity-50" />
        </div>

        {/* Foreground Badge (Verification Shield) */}
        <div className="absolute -bottom-4 -right-4 bg-[#0A0E17] p-1.5 rounded-full shadow-[0_10px_30px_rgba(16,185,129,0.4)] border border-primary/20 rotate-[8deg] z-30">
          <div className="bg-primary/10 border border-primary/30 p-4 rounded-full flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/20 blur-md" />
            <ShieldCheck className="size-8 text-primary relative z-10 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          </div>
        </div>

      </div>
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <MatrixRain />
      
      <header className="fixed top-4 left-0 right-0 z-50 px-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-background/60 px-6 py-3 backdrop-blur-xl shadow-2xl relative">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <ShieldCheck className="size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Privaclick</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground bg-white/5 px-6 py-2 rounded-full border border-white/5">
            <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <Link to="/about" className="hover:text-primary transition-colors">About</Link>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex hover:text-white rounded-full">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 box-glow shadow-primary/20 rounded-full px-6">
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
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6 box-glow shadow-primary/10 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                New — AI Deepfake Detection <ArrowRight className="size-3 ml-1" />
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl xl:text-6xl text-balance">
                Take Back Control of Your <span className="emerald-gradient-text emerald-glow">Photos</span> Online
              </h1>
              <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg text-balance">
                Advanced AI detection paired with guided cybercrime complaint filing. We scan the web for unauthorized use of your images and help you take them down.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 font-semibold box-glow shadow-primary/25 rounded-full">
                  <Link to="/auth">Get Started Free</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-8 font-semibold border-border bg-card hover:bg-accent hover:text-white rounded-full backdrop-blur-sm">
                  <a href="#how-it-works">See How It Works</a>
                </Button>
              </div>
            </div>
            
            <div className="lg:ml-auto w-full relative">
              <Hero3DGraphic />
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
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Everything you need to protect your image</h2>
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
                <div key={i} className="group relative rounded-xl border border-green-500/50 bg-green-500/10 p-8 feature-card-hover">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                    <f.icon className="size-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-white">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="border-t border-border bg-card/30 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-up">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">How It Works</h2>
              <p className="mt-4 text-lg text-muted-foreground">From upload to takedown — simple, fast, and fully in your control.</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {[
                { title: "Register Your Photos", desc: "Upload reference images securely. We only extract face embeddings and drop the files." },
                { title: "We Monitor the Web", desc: "Our AI continuously scans social platforms and websites for matches." },
                { title: "Review Detected Matches", desc: "Get notified when we find a match and decide if it's authorized or not." },
                { title: "File & Track Your Complaint", desc: "One-click generation of cybercrime complaints and takedown notices." },
              ].map((step, i) => (
                <div key={i} className="flex gap-6 rounded-xl border border-green-500/50 bg-green-500/10 p-6 items-start feature-card-hover">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 text-white font-bold shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities Grid */}
        <section className="py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 animate-fade-up">
              <h2 className="text-3xl font-bold tracking-tight text-white">Comprehensive Protection, Built In</h2>
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
                <div key={i} className="flex items-center gap-4 rounded-xl border border-green-500/50 bg-green-500/10 p-5 feature-card-hover">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                    <c.icon className="size-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{c.title}</h4>
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
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
              Ready to secure your digital footprint?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Join thousands of users who have taken back control of their photos online.
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 text-lg font-semibold box-glow shadow-primary/30">
              <Link to="/auth">Start Your Free Scan</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
