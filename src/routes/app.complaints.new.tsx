import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Download, FileText, ShieldCheck, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      { property: "og:title", content: "File a complaint — Privaclick" },
      { property: "og:description", content: "File a complaint with the evidence pre-filled." },
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
      `Meta Rights Operations Team,

I am writing to report a copyright infringement on Instagram. The image listed below belongs to me and has been uploaded without my authorization.

1. Copyright Owner: ${fullName}
2. Contact Email: ${email}
3. Original Reference Image: ${originalUrl}
4. Infringing Instagram Post: ${sourceUrl}
5. Description of Work: ${extraFields.workDescription || "Original portrait photograph"}

I have a good faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law. The information in this notification is accurate, and, under penalty of perjury, I am the owner of the exclusive right that is allegedly infringed.

Sincerely,
${fullName}`,
  },
  Facebook: {
    reportUrl: "https://www.facebook.com/help/contact/1758254161105370",
    reportType: "Facebook Copyright Infringement Report",
    requiredFields: [
      { key: "workDescription", label: "Description of Original Work", placeholder: "e.g., Candid photo taken in a public park", type: "text" },
    ],
    defaultTemplate: ({ fullName, email, sourceUrl, originalUrl, extraFields }) =>
      `Meta Intellectual Property Operations,

I am the copyright owner of the image copied below. A Facebook page/group is hosting this image without my consent.

1. Full Legal Name: ${fullName}
2. Email Address: ${email}
3. Original Work URL: ${originalUrl}
4. Infringing Facebook URL: ${sourceUrl}
5. Infringement Context: ${extraFields.workDescription || "Candid photography"}

I declare under penalty of perjury that the information in this notice is accurate and that I am the copyright owner or authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.

Sincerely,
${fullName}`,
  },
  "X (Twitter)": {
    reportUrl: "https://help.x.com/en/forms/rules-and-policies/private-information",
    reportType: "X Private Media Policy Take-down",
    requiredFields: [
      { key: "username", label: "Your X Username (Optional)", placeholder: "@username", type: "text" },
    ],
    defaultTemplate: ({ fullName, email, sourceUrl, originalUrl, extraFields }) =>
      `X Trust & Safety Team,

I am writing to request the removal of media containing my image under X's Private Information and Media Policy. The tweet linked below hosts my personal photograph without my consent.

1. Claimant Name: ${fullName}
2. Contact Email: ${email}
${extraFields.username ? `3. X Handle: ${extraFields.username}\n` : ""}4. Unauthorized Tweet URL: ${sourceUrl}
5. Reference Photograph URL: ${originalUrl}

I confirm that I did not consent to the publishing of this media, and its publication violates my privacy and personal safety.

Sincerely,
${fullName}`,
  },
  Pinterest: {
    reportUrl: "https://www.pinterest.com/about/copyright/dmca-pin/",
    reportType: "Pinterest DMCA Copyright Notice",
    requiredFields: [
      { key: "pinterestUser", label: "Your Pinterest Account Link (Optional)", placeholder: "https://pinterest.com/username", type: "text" },
    ],
    defaultTemplate: ({ fullName, email, sourceUrl, originalUrl, extraFields }) =>
      `Pinterest Copyright Agent,

I am the copyright owner of the image distributed on Pinterest. A user has pinned my photo without permission.

1. Claimant Signature: ${fullName}
2. Email Address: ${email}
3. Original Work Link: ${originalUrl}
4. Infringing Pin URL: ${sourceUrl}
${extraFields.pinterestUser ? `5. Pinterest Profile: ${extraFields.pinterestUser}\n` : ""}
I request that you remove the infringing pin immediately as per the Digital Millennium Copyright Act. I swear, under penalty of perjury, that the information in the notification is accurate and that I am the copyright owner.

Sincerely,
${fullName}`,
  },
  Other: {
    reportUrl: "https://www.whois.com/whois/",
    reportType: "General DMCA Takedown Notice",
    requiredFields: [
      { key: "companyName", label: "Company/Publisher (Optional)", placeholder: "e.g., Ananya Photography", type: "text" },
    ],
    defaultTemplate: ({ fullName, email, sourceUrl, originalUrl, extraFields }) =>
      `To the Hosting Provider / Site Administrator,

This is a formal notification under the Digital Millennium Copyright Act (DMCA). The website listed below is displaying my copyright-protected photograph without authorization.

1. Copyright Owner: ${fullName} ${extraFields.companyName ? `(${extraFields.companyName})` : ""}
2. Email: ${email}
3. Original Work: ${originalUrl}
4. Infringing Webpage: ${sourceUrl}

I request that you disable access to the infringing material immediately.

Sincerely,
${fullName}`,
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
      <Card className="glass-card">
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
        <Card className="glass-card">
          <CardContent className="space-y-6 py-10 text-center">
            <ShieldCheck className="animate-shield-pulse mx-auto size-14 text-primary" />
            <div>
              <h1 className="text-2xl font-semibold">
                Your complaint is <span className="text-gradient">on its way</span>
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                We've passed your report and evidence on. You'll get an update here and by email as
                it moves along.
              </p>
            </div>
            <div className="rounded-xl border bg-background/40 p-4">
              <p className="text-xs text-muted-foreground">Reference ID</p>
              <p className="font-display text-lg font-semibold">{reference}</p>
            </div>
            <ProgressStepper steps={stages} current={0} />
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => navigate({ to: "/app/complaints" })}>
                Track this complaint
              </Button>
              <Button onClick={() => navigate({ to: "/app" })}>Back to dashboard</Button>
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
    toast.success(`> OPENING: ${detection.platform.toUpperCase()} REPORT FORM`);
  };

  const handleGeneratePdf = async () => {
    setGeneratingPdf(true);
    toast.info("> INITIALIZING_SECURE_PDF_PIPELINE...");
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
        color: rgb(0, 0.8, 0),
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

      // 1. Fetch image bytes and compute SHA-256 checksum for tamper-evidence
      let imageBytes: ArrayBuffer | null = null;
      let sha256Hash = "FETCH_FAILED";
      
      try {
        const response = await fetch(detection.src);
        imageBytes = await response.arrayBuffer();
        
        // Calculate crypto SHA-256
        const hashBuffer = await crypto.subtle.digest("SHA-256", imageBytes);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        sha256Hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      } catch (err) {
        console.error("Tamper-evidence hash extraction failed:", err);
        sha256Hash = "ERROR_RETRIEVING_SECURE_METADATA";
      }

      y -= 10;
      page.drawText(`SHA-256 CHECKSUM (TAMPER-EVIDENCE):`, {
        x: 50,
        y,
        size: 10,
        font,
        color: rgb(0.8, 0, 0),
      });
      y -= 15;
      
      page.drawText(sha256Hash, {
        x: 50,
        y,
        size: 9,
        font: regularFont,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= 25;

      // 2. Embed Visual Evidence image
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

            if (drawW > maxW) {
              drawH = (maxW / drawW) * drawH;
              drawW = maxW;
            }
            if (drawH > maxH) {
              drawW = (maxH / drawH) * drawW;
              drawH = maxH;
            }

            page.drawText("VISUAL EVIDENCE:", {
              x: 50,
              y,
              size: 10,
              font,
              color: rgb(0.2, 0.2, 0.2),
            });
            
            page.drawImage(embeddedImg, {
              x: 50,
              y: y - 10 - drawH,
              width: drawW,
              height: drawH,
            });
            
            y -= (drawH + 40);
          }
        } catch (imgErr) {
          console.error("Failed to render visual screenshot in PDF:", imgErr);
          page.drawText("[IMAGE ATTACHMENT COMPRESSION ERROR]", {
            x: 50,
            y: y - 10,
            size: 10,
            font: regularFont,
            color: rgb(0.6, 0.6, 0.6),
          });
          y -= 30;
        }
      }

      page.drawLine({
        start: { x: 50, y: y + 10 },
        end: { x: 550, y: y + 10 },
        thickness: 1,
        color: rgb(0.3, 0.3, 0.3),
      });

      // 3. User Statement
      page.drawText("COMPLAINT STATEMENT:", {
        x: 50,
        y,
        size: 11,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      y -= 20;

      const words = description.split(" ");
      let currentLine = "";
      for (const word of words) {
        const testLine = currentLine + word + " ";
        if (testLine.length > 75) {
          page.drawText(currentLine, {
            x: 50,
            y,
            size: 9,
            font: regularFont,
            color: rgb(0.15, 0.15, 0.15),
          });
          currentLine = word + " ";
          y -= 13;
        } else {
          currentLine = testLine;
        }
        
        if (y < 50) {
          break; // Avoid overflow
        }
      }
      
      if (currentLine && y >= 50) {
        page.drawText(currentLine, {
          x: 50,
          y,
          size: 9,
          font: regularFont,
          color: rgb(0.15, 0.15, 0.15),
        });
      }

      // Save PDF bytes
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `privaclick-evidence-${detection.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success("> EVIDENCE_REPORT_PDF_GENERATED: TAMPER_HASH_ATTACHED");
    } catch (err) {
      console.error(err);
      toast.error("> ERROR: SECURE_PDF_GENERATION_FAILED");
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <form onSubmit={submit} className="animate-fade-up mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          File a <span className="text-gradient">complaint</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We've prepared the platform-specific reporting templates. You can submit it through us or directly on {detection.platform}.
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Evidence collected</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-[160px_1fr]">
          <img
            src={detection.src}
            alt={`Image found on ${detection.platform}`}
            loading="lazy"
            className="aspect-square w-full rounded-xl border object-cover"
          />
          <dl className="space-y-3 text-sm">
            <Row label="Platform" value={detection.platform} />
            <Row label="Source URL" value={detection.sourceUrl} />
            <Row label="Detected on" value={detection.foundOn} />
            <Row label="Match confidence" value={`${detection.confidence}%`} />
            <Row label="Verified account" value={`${user.name} · ${user.maskedId}`} />
          </dl>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">&gt; STATEMENT_GENERATOR [{config.reportType}]</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Legal Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full legal name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Email</Label>
              <Input
                id="contact"
                type="email"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {config.requiredFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                type={field.type}
                placeholder={field.placeholder}
                value={extraFields[field.key] || ""}
                onChange={(e) =>
                  setExtraFields((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
              />
            </div>
          ))}

          <div className="space-y-2 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="description">Generated Statement</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] uppercase font-mono border-primary/30 text-primary hover:bg-primary/10 flex items-center gap-1"
                  onClick={handleExternalReport}
                >
                  Report on {detection.platform} <ExternalLink className="size-2.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] uppercase font-mono"
                  onClick={() => {
                    navigator.clipboard.writeText(description);
                    toast.success("> STATEMENT_COPIED_TO_CLIPBOARD");
                  }}
                >
                  Copy Text
                </Button>
              </div>
            </div>
            <Textarea
              id="description"
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="font-mono text-xs bg-black text-primary border-primary/20"
            />
            <p className="text-xs text-muted-foreground">// You can customize the auto-filled statement above before copying or submitting.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          className="border-primary/50 text-primary hover:bg-primary/10 flex items-center gap-2"
          onClick={handleGeneratePdf}
          disabled={generatingPdf}
        >
          {generatingPdf ? (
            <>
              <Loader2 className="size-4 animate-spin" /> GENERATING...
            </>
          ) : (
            <>
              <Download className="size-4" /> Generate Evidence Report
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-primary/50 text-primary hover:bg-primary/10 flex items-center gap-1.5"
          onClick={handleExternalReport}
        >
          Report directly on {detection.platform} <ExternalLink className="size-3.5" />
        </Button>
        <Button type="submit">
          <FileText className="size-4" /> Submit Complaint
        </Button>
      </div>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap gap-x-2">
      <dt className="w-36 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-all font-medium">{value}</dd>
    </div>
  );
}