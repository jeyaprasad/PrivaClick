import { createFileRoute } from "@tanstack/react-router";
import { Download, KeyRound, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePrivaclick } from "@/lib/store";
import { platforms } from "@/lib/mock-data";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Privaclick" },
      {
        name: "description",
        content: "Manage monitoring, notifications, your account and how your data is handled.",
      },
      { property: "og:title", content: "Settings — Privaclick" },
      { property: "og:description", content: "Manage your Privaclick account and preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, photos, removePhoto, prefs, togglePlatform, notifications, setNotification } =
    usePrivaclick();

  return (
    <div className="animate-fade-up mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust what we watch, how we reach you, and what we keep.
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Registered photos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {photos.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-lg border p-3">
              <img
                src={p.src}
                alt={p.name}
                loading="lazy"
                className="size-12 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">Added {p.addedOn}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  removePhoto(p.id);
                  toast.success("Photo removed.");
                }}
              >
                <Trash2 className="size-4" /> Remove
              </Button>
            </div>
          ))}
          {photos.length === 0 && (
            <p className="text-sm text-muted-foreground">No photos registered yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Monitoring</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {platforms.map((p) => (
            <SwitchRow
              key={p}
              id={`m-${p}`}
              label={p}
              checked={prefs[p]}
              onChange={() => togglePlatform(p)}
            />
          ))}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SwitchRow
            id="n-email"
            label="Email me about new matches"
            checked={notifications.email}
            onChange={(v) => setNotification("email", v)}
          />
          <SwitchRow
            id="n-sms"
            label="Text me for high-confidence matches"
            checked={false}
            onChange={() => {}}
            disabled={true}
            badge="Coming Soon"
          />
          <SwitchRow
            id="n-weekly"
            label="Send a weekly summary"
            checked={notifications.weekly}
            onChange={(v) => setNotification("weekly", v)}
          />
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Account & security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-3 text-sm">
            <p className="font-medium">{user.name}</p>
            <p className="text-muted-foreground">{user.email}</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="mt-2 w-fit cursor-help text-xs text-muted-foreground underline decoration-dotted">
                  Verified {user.verifiedOn} · {user.maskedId}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                Only the last four digits are retained as a masked reference. The full identifier is
                discarded after the one-time eKYC OTP check.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => toast.success("Password reset link sent.")}>
              <KeyRound className="size-4" /> Change password
            </Button>
            <Button variant="outline" onClick={() => toast.success("Preparing your data export.")}>
              <Download className="size-4" /> Export my data
            </Button>
            <Button
              variant="destructive"
              onClick={() => toast.success("Account deletion requested. Everything is erased in 24h.")}
            >
              <Trash2 className="size-4" /> Delete account
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">How your data is handled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">No ID numbers kept.</span> Your identity
            check happens once. We store only a masked reference so you can see it was done.
          </p>
          <Separator />
          <p>
            <span className="font-medium text-foreground">Photos stay encrypted.</span> Reference
            photos are encrypted in transit and at rest, and are only compared against images we
            find while monitoring.
          </p>
          <Separator />
          <p>
            <span className="font-medium text-foreground">You can delete everything.</span> Removing
            a photo stops it being used immediately. Deleting your account erases your photos,
            matches and complaint drafts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function SwitchRow({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  badge,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <div className={`flex items-center justify-between rounded-lg border px-4 py-3 ${disabled ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className={`text-sm font-medium ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
          {label}
        </Label>
        {badge && (
          <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary border border-primary/30">
            {badge}
          </span>
        )}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}