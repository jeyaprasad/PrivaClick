import { useRef, useState } from "react";
import { ImagePlus, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PendingPhoto = { name: string; src: string };

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

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const next: PendingPhoto[] = [];
    Array.from(list)
      .filter((f) => f.type.startsWith("image/"))
      .forEach((f) => next.push({ name: f.name, src: URL.createObjectURL(f) }));
    if (next.length) onChange([...files, ...next]);
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
        <UploadCloud className="mb-3 size-8 text-primary" />
        <p className="text-sm font-medium">Drag photos here, or click to browse</p>
        <p className="mt-1 text-xs text-muted-foreground">JPG or PNG, up to 10 photos</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {note && <p className="text-xs text-muted-foreground">{note}</p>}

      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {files.map((f, i) => (
            <figure key={`${f.name}-${i}`} className="group relative overflow-hidden rounded-lg border">
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
        </div>
      )}

      {files.length === 0 && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ImagePlus className="size-3.5" /> No photos added yet
        </p>
      )}
    </div>
  );
}