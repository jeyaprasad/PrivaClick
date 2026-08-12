import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhotoUpload, type PendingPhoto } from "@/components/PhotoUpload";
import { usePrivaclick } from "@/lib/store";

export const Route = createFileRoute("/app/photos")({
  head: () => ({
    meta: [
      { title: "My Photos — Privaclick" },
      {
        name: "description",
        content: "Manage the reference photos Privaclick uses to look for matches.",
      },
      { property: "og:title", content: "My Photos — Privaclick" },
      { property: "og:description", content: "Add or remove your registered reference photos." },
    ],
  }),
  component: PhotosPage,
});

function PhotosPage() {
  const { photos, addPhotos, removePhoto, scanPhotoForMatches } = usePrivaclick();
  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const [scanningId, setScanningId] = useState<string | null>(null);

  const handleScan = async (photoId: string) => {
    setScanningId(photoId);
    try {
      const newMatches = await scanPhotoForMatches(photoId);
      if (newMatches.length > 0) {
        toast.success(`> SCAN_COMPLETE: FOUND ${newMatches.length} NEW MATCH(ES)`);
      } else {
        toast.info("> SCAN_COMPLETE: NO NEW MATCHES FOUND");
      }
    } catch (err) {
      console.error(err);
      toast.error("> ERROR: SCAN_FAILED");
    } finally {
      setScanningId(null);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-primary">&gt; MY_PHOTOS</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          // These are only used to find matches. You can remove any of them at any time.
        </p>
      </div>

      <Card className="border border-border bg-black rounded-none">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-sm font-bold text-primary">
            &gt; REGISTERED_PHOTOS [{photos.length}]
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((p) => (
              <figure key={p.id} className="group relative overflow-hidden border border-border bg-black flex flex-col justify-between h-full">
                <div className="relative aspect-square w-full overflow-hidden">
                  <img
                    src={p.src}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover grayscale opacity-80"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute right-2 top-2 size-8 opacity-0 transition-opacity group-hover:opacity-100 rounded-none border border-destructive"
                    aria-label={`Remove ${p.name}`}
                    onClick={() => {
                      removePhoto(p.id);
                      toast.success("> PHOTO_REMOVED");
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <figcaption className="border-t border-border bg-primary/5 px-3 py-2 flex flex-col justify-between flex-grow gap-2">
                  <div>
                    <p className="truncate text-xs font-bold text-primary">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">// ADDED: {p.addedOn}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-full border border-primary/30 rounded-none font-mono text-[9px] hover:bg-primary/15 uppercase flex items-center justify-center gap-1"
                    onClick={() => handleScan(p.id)}
                    disabled={scanningId === p.id}
                  >
                    {scanningId === p.id ? (
                      <>
                        <Loader2 className="size-3 animate-spin text-primary" /> SCANNING...
                      </>
                    ) : (
                      "> SCAN_THE_WEB"
                    )}
                  </Button>
                </figcaption>
              </figure>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border bg-black rounded-none">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-sm font-bold text-primary">&gt; ADD_MORE_PHOTOS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <PhotoUpload
            files={pending}
            onChange={setPending}
            note="// These stay private and are only used to detect matches."
          />
          <Button
            disabled={pending.length === 0}
            onClick={() => {
              addPhotos(pending);
              setPending([]);
              toast.success("> PHOTOS_SAVED");
            }}
          >
            &gt; SAVE_PHOTOS
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}