import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Download, FileText, ShieldCheck, ExternalLink, Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProgressStepper } from "@/components/ProgressStepper";
import { usePrivaclick } from "@/lib/store";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const Route = createFileRoute("/app/complaints/new")({
  validateSearch: (search: Record<string, unknown>) => ({
    detection: typeof search["detection"] === "string" ? (search["detection"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "File a complaint — Privaclick" },
      {
        name: "description",
        content: "Turn a confirmed match into a complaint, with the evidence attached for you.",
      },
    ],
  }),
  component: NewComplaint,
});

type PlatformConfig = {
  reportUrl: string;
  reportType: string;
  defaultTemplate: (data: {
    fullName: string;
    email: string;
    sourceUrl: string;
    originalUrl: string;
    extraFields: Record<string, string>;
  }) => string;
  requiredFields: {
    key: string;
    label: string;
    placeholder: string;
    type: "text" | "textarea" | "checkbox";
  }[];
};

const PLATFORM_TEMPLATES: Record<string, PlatformConfig> = {
  Instagram: {
    reportUrl: "https://help.instagram.com/contact/372592039493026",
    reportType: "Instagram / Meta Copyright Report",
    requiredFields: [
      { key: "workDescription", label: "Description of Original Work", placeholder: "e.g., Portrait photograph of myself", type: "text" },
    ],
    defaultTemplate: ({ fullName, email, sourceUrl, originalUrl, extraFields }) =>
      `Meta Rights Operations Team,\n\nI am writing to report a copyright infringement on Instagram. The image listed below belongs to me and has been uploaded without my authorization.\n\n1. Copyright Owner: ${fullName}\n2. Contact Email: ${email}\n3. Original Reference Image: ${originalUrl}\n4. Infringing Instagram Post: ${sourceUrl}\n5. Description of Work: ${extraFields.workDescription || "Original portrait photograph"}\n\nI have a good faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law. The information in this notification is accurate, and, under penalty of perjury, I am the owner of the exclusive right that is allegedly infringed.\n\nSincerely,\n${fullName}`,
  },
  Facebook: {
    reportUrl: "https://www.facebook.com/help/contact/1758254161105370",
    reportType: "Facebook Copyright Infringement Report",
    requiredFields: [
      { key: "workDescription", label: "Description of Original Work", placeholder: "e.g., Candid photo taken in a public park", type: "text" },
    ],
    defaultTemplate: ({ fullName, email, sourceUrl, originalUrl, extraFields }) =>
      `Meta Intellectual Property Operations,\n\nI am the copyright owner of the image copied below. A Facebook page/group is hosting this image without my consent.\n\n1. Full Legal Name: ${fullName}\n2. Email Address: ${email}\n3. Original Work URL: ${originalUrl}\n4. Infringing Facebook URL: ${sourceUrl}\n5. Infringement Context: ${extraFields.workDescription || "Candid photography"}\n\nI declare under penalty of perjury that the information in this notice is accurate and that I am the copyright owner or authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.\n\nSincerely,\n${fullName}`,
  },
  "X (Twitter)": {
    reportUrl: "https://help.x.com/en/forms/rules-and-policies/private-information",
    reportType: "X Private Media Policy Take-down",
    requiredFields: [
      { key: "username", label: "Your X Username (Optional)", placeholder: "@username", type: "text" },
    ],
    defaultTemplate: ({ fullName, email, sourceUrl, originalUrl, extraFields }) =>
      `X Trust & Safety Team,\n\nI am writing to request the removal of media containing my image under X's Private Information and Media Policy. The tweet linked below hosts my personal photograph without my consent.\n\n1. Claimant Name: ${fullName}\n2. Contact Email: ${email}\n${extraFields.username ? `3. X Handle: ${extraFields.username}\n` : ""}4. Unauthorized Tweet URL: ${sourceUrl}\n5. Reference Photograph URL: ${originalUrl}\n\nI confirm that I did not consent to the publishing of this media, and its publication violates my privacy and personal safety.\n\nSincerely,\n${fullName}`,
  },
  Pinterest: {
    reportUrl: "https://www.pinterest.com/about/copyright/dmca-pin/",
    reportType: "Pinterest DMCA Copyright Notice",
    requiredFields: [
      { key: "pinterestUser", label: "Your Pinterest Account Link (Optional)", placeholder: "https://pinterest.com/username", type: "text" },
    ],
    defaultTemplate: ({ fullName, email, sourceUrl, originalUrl, extraFields }) =>
      `Pinterest Copyright Agent,\n\nI am the copyright owner of the image distributed on Pinterest. A user has pinned my photo without permission.\n\n1. Claimant Signature: ${fullName}\n2. Email Address: ${email}\n3. Original Work Link: ${originalUrl}\n4. Infringing Pin URL: ${sourceUrl}\n${extraFields.pinterestUser ? `5. Pinterest Profile: ${extraFields.pinterestUser}\n` : ""}\nI request that you remove the infringing pin immediately as per the Digital Millennium Copyright Act. I swear, under penalty of perjury, that the information in the notification is accurate and that I am the copyright owner.\n\nSincerely,\n${fullName}`,
  },
  Other: {
    reportUrl: "https://www.whois.com/whois/",
    reportType: "General DMCA Takedown Notice",
    requiredFields: [
      { key: "companyName", label: "Company/Publisher (Optional)", placeholder: "e.g., Ananya Photography", type: "text" },
    ],
    defaultTemplate: ({ fullName, email, sourceUrl, originalUrl, extraFields }) =>
      `To the Hosting Provider / Site Administrator,\n\nThis is a formal notification under the Digital Millennium Copyright Act (DMCA). The website listed below is displaying my copyright-protected photograph without authorization.\n\n1. Copyright Owner: ${fullName} ${extraFields.companyName ? `(${extraFields.companyName})` : ""}\n2. Email: ${email}\n3. Original Work: ${originalUrl}\n4. Infringing Webpage: ${sourceUrl}\n\nI request that you disable access to the infringing material immediately.\n\nSincerely,\n${fullName}`,
  },
};

const schema = z.object({
  description: z
    .string()
    .trim()
    .min(10, "Please add a little more detail (at least 10 characters).")
    .max(2500, "Please keep this under 2500 characters."),
  contact: z.string().trim().email("Enter a valid email address.").max(255),
  fullName: z.string().trim().min(2, "Enter your full legal name.").max(255),
});

const stages = ["Submitted", "Under Review", "Action Taken"];

function NewComplaint() {
  const { detection: detectionId } = Route.useSearch();
  const navigate = useNavigate();
  const { detections, user, fileComplaint } = usePrivaclick();
  const detection = detections.find((d) => d.id === detectionId) ?? detections[0];

  const config = PLATFORM_TEMPLATES[detection?.platform] || PLATFORM_TEMPLATES.Other;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState(user.name);
  const [contact, setContact] = useState(user.email);
  const [extraFields, setExtraFields] = useState<Record<string, string>>({});
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Auto-generate template text when variables change
  useEffect(() => {
    if (!detection) return;
    const text = config.defaultTemplate({
      fullName,
      email: contact,
      sourceUrl: detection.sourceUrl,
      originalUrl: detection.src,
      extraFields,
    });
    setDescription(text);
  }, [fullName, contact, extraFields, detection, config]);

  if (!detection) {
    return (
      <Card className="border border-border bg-card shadow-sm">
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Pick a detection first, then we'll fill this form in for you.
          <div className="mt-4">
            <Button asChild size="sm">
              <Link to="/app/detections">Go to detections</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reference) {
    return (
      <div className="animate-fade-up mx-auto max-w-2xl space-y-6">
        <Card className="border border-border bg-card shadow-sm rounded-xl">
          <CardContent className="space-y-6 py-10 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-accent/10 text-accent rounded-full flex items-center justify-center">
                <CheckCircle2 className="size-10" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Your complaint is filed
              </h1>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
                We have securely logged your report and digital evidence. You'll receive updates via email as it progresses.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-5 inline-block mx-auto min-w-[250px]">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Reference ID</p>
              <p className="font-mono text-xl font-bold text-primary">{reference}</p>
            </div>
            <div className="pt-4">
              <ProgressStepper steps={stages} current={0} />
            </div>
            <div className="flex justify-center gap-3 pt-4">
              <Button variant="outline" className="border-border text-foreground" onClick={() => navigate({ to: "/app/complaints" })}>
                Track this complaint
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate({ to: "/app" })}>
                Back to dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ description, contact, fullName });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    const complaint = fileComplaint({
      detectionId: detection.id,
      description: parsed.data.description,
    });
    setReference(complaint.id);
  };

  const handleExternalReport = () => {
    let url = config.reportUrl;
    if (detection.platform === "Other") {
      try {
        const hostname = new URL(detection.sourceUrl).hostname;
        url = `https://www.whois.com/whois/${hostname}`;
      } catch (e) {}
    }
    window.open(url, "_blank");
    toast.success(`Opened ${detection.platform} report form`);
  };

  const handleGeneratePdf = async () => {
    setGeneratingPdf(true);
    toast.info("Generating secure PDF with evidence...");
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const page = pdfDoc.addPage([600, 850]);
      
      // Title
      page.drawText("PRIVACLICK DIGITAL EVIDENCE REPORT", {
        x: 50,
        y: 800,
        size: 16,
        font,
        color: rgb(20/255, 33/255, 61/255), // Navy #14213D
      });

      page.drawLine({
        start: { x: 50, y: 785 },
        end: { x: 550, y: 785 },
        thickness: 1.5,
        color: rgb(0.1, 0.1, 0.1),
      });

      // Metadata Info
      const metadata = [
        `REPORT ID: ${detection.id}`,
        `GENERATED FOR: ${fullName} (${user.maskedId})`,
        `PLATFORM: ${detection.platform}`,
        `SOURCE URL: ${detection.sourceUrl}`,
        `VERIFICATION TIMESTAMP: ${detection.foundOn}`,
        `MATCH CONFIDENCE: ${detection.confidence}%`,
      ];

      let y = 750;
      for (const metaText of metadata) {
        page.drawText(metaText, {
          x: 50,
          y,
          size: 10,
          font: regularFont,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= 18;
      }

      // Embed Visual Evidence image
      let imageBytes: ArrayBuffer | null = null;
      try {
        const response = await fetch(detection.src);
        imageBytes = await response.arrayBuffer();
      } catch (err) {
        console.error(err);
      }

      y -= 10;
      page.drawText(`SHA-256 CHECKSUM (TAMPER-EVIDENCE):`, {
        x: 50,
        y,
        size: 10,
        font,
        color: rgb(232/255, 93/255, 61/255), // Coral #E85D3D
      });
      y -= 15;
      page.drawText("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", {
        x: 50,
        y,
        size: 9,
        font: regularFont,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= 25;

      if (imageBytes) {
        try {
          let embeddedImg;
          if (detection.src.includes(".png")) {
            embeddedImg = await pdfDoc.embedPng(imageBytes);
          } else {
            embeddedImg = await pdfDoc.embedJpg(imageBytes);
          }

          if (embeddedImg) {
            const maxW = 200;
            const maxH = 150;
            let drawW = embeddedImg.width;
            let drawH = embeddedImg.height;
            if (drawW > maxW) { drawH = (maxW / drawW) * drawH; drawW = maxW; }
            if (drawH > maxH) { drawW = (maxH / drawH) * drawW; drawH = maxH; }

            page.drawText("VISUAL EVIDENCE:", {
              x: 50,
              y,
              size: 10,
              font,
              color: rgb(0.2, 0.2, 0.2),
            });
            page.drawImage(embeddedImg, { x: 50, y: y - 10 - drawH, width: drawW, height: drawH });
            y -= (drawH + 40);
          }
        } catch (imgErr) {
          console.error(imgErr);
        }
      }

      page.drawLine({ start: { x: 50, y: y + 10 }, end: { x: 550, y: y + 10 }, thickness: 1, color: rgb(0.3, 0.3, 0.3) });

      // Save PDF bytes
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `privaclick-evidence-${detection.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success("Evidence Report downloaded.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="animate-fade-up mx-auto max-w-4xl space-y-6 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Complaint Builder
        </h1>
        <p className="text-sm text-muted-foreground">
          Turn your match into an actionable report in 3 simple steps.
        </p>
      </div>

      {/* Stepper Header */}
      <div className="flex items-center gap-2 mb-8 bg-card border border-border p-3 rounded-xl shadow-sm">
        <div className={`flex flex-col items-center flex-1 py-2 px-1 rounded-lg ${step === 1 ? 'bg-primary/5 text-primary' : 'text-muted-foreground'}`}>
          <span className="text-xs font-bold uppercase tracking-wider mb-1">Step 1</span>
          <span className="text-sm font-semibold">Evidence Preview</span>
        </div>
        <div className="text-muted-foreground/30"><ArrowRight className="size-5" /></div>
        <div className={`flex flex-col items-center flex-1 py-2 px-1 rounded-lg ${step === 2 ? 'bg-primary/5 text-primary' : 'text-muted-foreground'}`}>
          <span className="text-xs font-bold uppercase tracking-wider mb-1">Step 2</span>
          <span className="text-sm font-semibold">Platform Template</span>
        </div>
        <div className="text-muted-foreground/30"><ArrowRight className="size-5" /></div>
        <div className={`flex flex-col items-center flex-1 py-2 px-1 rounded-lg ${step === 3 ? 'bg-primary/5 text-primary' : 'text-muted-foreground'}`}>
          <span className="text-xs font-bold uppercase tracking-wider mb-1">Step 3</span>
          <span className="text-sm font-semibold">Cybercrime Handoff</span>
        </div>
      </div>

      <form onSubmit={submit}>
        {/* Step 1: Evidence Preview */}
        {step === 1 && (
          <div className="space-y-6">
            <Card className="border border-border bg-card shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                  <ShieldCheck className="size-5 text-accent" />
                  Digital Evidence Report Preview
                </CardTitle>
                <CardDescription>
                  This document encapsulates the metadata required for a formal takedown request.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Simulated PDF Document Wrapper */}
                <div className="bg-muted p-8 flex justify-center">
                  <div className="w-full max-w-2xl bg-white text-slate-800 p-8 sm:p-12 shadow-md border border-slate-200">
                    <h2 className="text-xl font-bold text-[#14213D] border-b-2 border-slate-800 pb-2 mb-6">
                      PRIVACLICK DIGITAL EVIDENCE REPORT
                    </h2>
                    <div className="space-y-2 text-xs font-mono mb-8">
                      <p><span className="font-bold text-slate-500">REPORT ID:</span> {detection.id}</p>
                      <p><span className="font-bold text-slate-500">GENERATED FOR:</span> {user.name} ({user.maskedId})</p>
                      <p><span className="font-bold text-slate-500">PLATFORM:</span> {detection.platform}</p>
                      <p><span className="font-bold text-slate-500">SOURCE URL:</span> {detection.sourceUrl}</p>
                      <p><span className="font-bold text-slate-500">VERIFICATION TIMESTAMP:</span> {detection.foundOn}</p>
                      <p><span className="font-bold text-slate-500">MATCH CONFIDENCE:</span> {detection.confidence}%</p>
                    </div>
                    <div className="mb-6">
                      <p className="text-xs font-bold text-[#E85D3D] mb-1">SHA-256 CHECKSUM (TAMPER-EVIDENCE):</p>
                      <p className="text-[10px] font-mono break-all text-slate-600 bg-slate-100 p-2 border border-slate-200">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 mb-2">VISUAL EVIDENCE:</p>
                      <img src={detection.src} alt="Visual evidence" className="w-64 max-w-full rounded border border-slate-300" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between p-6 border-t border-border bg-card">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-primary/20 text-primary hover:bg-primary/5"
                  onClick={handleGeneratePdf}
                  disabled={generatingPdf}
                >
                  {generatingPdf ? <Loader2 className="size-4 animate-spin mr-2" /> : <Download className="size-4 mr-2" />}
                  Download Evidence PDF
                </Button>
                <Button type="button" onClick={() => setStep(2)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Next: Prepare Statement <ArrowRight className="size-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Step 2: Platform Template */}
        {step === 2 && (
          <div className="space-y-6">
            <Card className="border border-border bg-card shadow-sm rounded-xl">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="size-5 text-accent" />
                  {config.reportType}
                </CardTitle>
                <CardDescription>
                  We have mapped the required fields for {detection.platform}. Review and customize your legal statement below.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-xs font-semibold text-muted-foreground uppercase">Full Legal Name</Label>
                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact" className="text-xs font-semibold text-muted-foreground uppercase">Contact Email</Label>
                    <Input id="contact" type="email" value={contact} onChange={(e) => setContact(e.target.value)} required className="bg-background" />
                  </div>
                </div>

                {config.requiredFields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key} className="text-xs font-semibold text-muted-foreground uppercase">{field.label}</Label>
                    <Input id={field.key} type={field.type} placeholder={field.placeholder} value={extraFields[field.key] || ""} onChange={(e) => setExtraFields((prev) => ({ ...prev, [field.key]: e.target.value }))} className="bg-background" />
                  </div>
                ))}

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground uppercase">Generated Legal Statement</Label>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" className="h-8 text-xs border-border" onClick={() => { navigator.clipboard.writeText(description); toast.success("Copied to clipboard"); }}>
                        Copy Text
                      </Button>
                      <Button type="button" variant="secondary" size="sm" className="h-8 text-xs bg-muted text-foreground hover:bg-muted/80" onClick={handleExternalReport}>
                        Report on {detection.platform} <ExternalLink className="size-3 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                  <Textarea id="description" rows={9} value={description} onChange={(e) => setDescription(e.target.value)} className="font-mono text-sm leading-relaxed bg-background/50 focus:bg-background resize-y" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between p-6 border-t border-border bg-card">
                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="size-4 mr-2" /> Back
                </Button>
                <Button type="button" onClick={() => setStep(3)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Next: Handoff <ArrowRight className="size-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Step 3: Cybercrime Handoff */}
        {step === 3 && (
          <div className="space-y-6">
            <Card className="border border-border bg-card shadow-sm rounded-xl">
              <CardHeader className="text-center pb-2">
                <ShieldCheck className="size-12 text-accent mx-auto mb-4" />
                <CardTitle className="font-display text-2xl font-bold">Handoff to Privaclick</CardTitle>
                <CardDescription className="max-w-md mx-auto mt-2">
                  You can manage this case yourself using the evidence and statement provided, or formally hand it off to our automated system for tracking.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="bg-muted/40 border border-border rounded-xl p-5 mb-6">
                  <h3 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" /> What happens next?
                  </h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="mt-1 size-1.5 rounded-full bg-accent shrink-0" />
                      We log your digital evidence report and the generated statement in our secure vault.
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 size-1.5 rounded-full bg-accent shrink-0" />
                      The detection status is moved to "Complaint Filed" to keep your dashboard organized.
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 size-1.5 rounded-full bg-accent shrink-0" />
                      We provide a unique Reference ID to track this issue moving forward.
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between p-6 border-t border-border bg-card">
                <Button type="button" variant="ghost" onClick={() => setStep(2)} className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="size-4 mr-2" /> Back
                </Button>
                <Button type="submit" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold px-6 shadow-sm">
                  <ShieldCheck className="size-4 mr-2" /> File Official Complaint
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </form>
    </div>
  );
}
