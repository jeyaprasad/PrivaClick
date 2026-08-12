import { useRef, useState } from "react";
import { ImagePlus, Trash2, UploadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabaseClient, isSupabaseConfigured } from "@/lib/supabase-client";

export type PendingPhoto = { name: string; src: string };

type UploadingFile = {
  id: string;
  name: string;
  progress: number;
};

export function PhotoUpload({
  files,
  onChange,
  note,
}: {
  files: PendingPhoto[];
  onChange: (files: PendingPhoto[]) => void;
  note?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const handleFiles = async (list: FileList | null) => {
    if (!list) return;

    const filesArray = Array.from(list);
    
    // Process files sequentially to maintain state integrity
    for (const file of filesArray) {
      // 1. Validation: JPG or PNG only
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        toast.error(`> ERROR: INVALID_FILE_TYPE [${file.name}]. ONLY JPG & PNG ARE ALLOWED.`);
        continue;
      }

      // 2. Validation: Max size 10MB
      const maxBytes = 10 * 1024 * 1024;
      if (file.size > maxBytes) {
        toast.error(`> ERROR: FILE_TOO_LARGE [${file.name}]. MAX SIZE IS 10MB.`);
        continue;
      }

      // Register file upload entry
      const uploadId = `u-${Date.now()}-${Math.random()}`;
      setUploadingFiles((prev) => [...prev, { id: uploadId, name: file.name, progress: 0 }]);

      if (isSupabaseConfigured()) {
        try {
          const fileExt = file.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.${fileExt}`;
          const filePath = `${fileName}`;

          // Upload to Supabase Storage in 'photos' bucket
          const { data, error } = await supabaseClient.storage
            .from("photos")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
              onUploadProgress: (progress) => {
                const percent = (progress.loaded / progress.total) * 100;
                setUploadingFiles((prev) =>
                  prev.map((f) => (f.id === uploadId ? { ...f, progress: percent } : f))
                );
              },
            });

          if (error) throw error;

          // Retrieve public access URL
          const { data: { publicUrl } } = supabaseClient.storage
            .from("photos")
            .getPublicUrl(filePath);

          // Add file to pending photos
          onChange([...files, { name: file.name, src: publicUrl }]);
          toast.success(`> UPLOAD_COMPLETE: ${file.name.toUpperCase()}`);
        } catch (err: any) {
          console.error("Storage upload error:", err);
          toast.error(`> UPLOAD_FAILED: ${file.name.toUpperCase()}. ${err.message || ""}`);
        } finally {
          // Remove from uploading files array
          setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId));
        }
      } else {
        // Fallback simulation: show progress bar when Supabase URL/Key is not set
        let percent = 0;
        const intervalTime = 100;
        const step = 8;
        
        await new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            percent = Math.min(100, percent + step + Math.floor(Math.random() * 5));
            setUploadingFiles((prev) =>
              prev.map((f) => (f.id === uploadId ? { ...f, progress: percent } : f))
            );

            if (percent >= 100) {
              clearInterval(interval);
              
              // Generate a local object URL of the actual uploaded file for correct local preview
              const localUrl = URL.createObjectURL(file);
              
              onChange([...files, { name: file.name, src: localUrl }]);
              setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId));
              toast.success(`> SIMULATED_UPLOAD_COMPLETE: ${file.name.toUpperCase()}`);
              resolve();
            }
          }, intervalTime);
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center transition-colors",
          dragging ? "border-primary bg-primary/10" : "border-border bg-card/60 hover:bg-accent/40",
        )}
      >
        <UploadCloud className="mb-3 size-8 text-primary animate-bounce" />
        <p className="text-sm font-medium">Drag photos here, or click to browse</p>
        <p className="mt-1 text-xs text-muted-foreground">JPG or PNG only, up to 10MB per file</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {note && <p className="text-xs text-muted-foreground">{note}</p>}

      {(files.length > 0 || uploadingFiles.length > 0) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {files.map((f, i) => (
            <figure key={`${f.name}-${i}`} className="group relative overflow-hidden rounded-lg border border-border">
              <img
                src={f.src}
                alt={f.name}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute right-1.5 top-1.5 size-7 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                aria-label={`Remove ${f.name}`}
              >
                <Trash2 className="size-3.5" />
              </Button>
              <figcaption className="truncate bg-card px-2 py-1.5 text-[11px] text-muted-foreground">
                {f.name}
              </figcaption>
            </figure>
          ))}

          {uploadingFiles.map((uf) => (
            <figure
              key={uf.id}
              className="relative overflow-hidden rounded-lg border border-border bg-black/60 aspect-square flex flex-col justify-between p-3 font-mono text-[10px] text-primary"
            >
              <div className="space-y-1">
                <p className="font-bold truncate">{uf.name}</p>
                <p className="text-muted-foreground uppercase flex items-center gap-1">
                  <Loader2 className="size-3 animate-spin text-primary" /> UPLOADING...
                </p>
              </div>
              <div className="space-y-2 w-full">
                <div className="h-1.5 w-full bg-muted overflow-hidden border border-border/50">
                  <div
                    className="bg-primary h-full transition-all duration-150"
                    style={{ width: `${uf.progress}%` }}
                  />
                </div>
                <p className="text-right font-bold text-primary">{Math.round(uf.progress)}%</p>
              </div>
            </figure>
          ))}
        </div>
      )}

      {files.length === 0 && uploadingFiles.length === 0 && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ImagePlus className="size-3.5" /> No photos added yet
        </p>
      )}
    </div>
  );
}