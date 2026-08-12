import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "../lib/supabase.server";
import { scanPhotoForMatches } from "../lib/supabase-fns";

export const Route = createFileRoute("/api/cron-scan")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Authenticate using CRON_SECRET or default fallback
        const authHeader = request.headers.get("Authorization");
        const cronSecret = process.env.CRON_SECRET || "default_secret";
        
        if (authHeader !== `Bearer ${cronSecret}`) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          // 1. Fetch all photos
          const { data: photos, error: photosError } = await supabase
            .from("photos")
            .select("id");

          if (photosError) {
            throw new Error(`Failed to fetch photos: ${photosError.message}`);
          }

          let totalScanned = 0;
          let totalNewMatches = 0;

          // 2. Scan each photo and log
          for (const photo of photos) {
            const start = new Date();
            let newCount = 0;
            let status = "Success";
            let logMessage = "Scan completed successfully.";
            
            try {
              // Execute the matching logic directly (returns new detections array)
              const result = await scanPhotoForMatches({ data: photo.id });
              newCount = result.length;
              totalNewMatches += newCount;
            } catch (err: any) {
              status = "Failed";
              logMessage = err.message || String(err);
            }

            // Write log entry to scan_history
            const { error: logError } = await supabase
              .from("scan_history")
              .insert({
                photo_id: photo.id,
                new_detections_count: newCount,
                status: status,
                log_message: logMessage,
                scanned_at: start.toISOString(),
              });

            if (logError) {
              console.error(`Failed to insert scan history log for photo ${photo.id}:`, logError);
            }
            
            totalScanned++;
          }

          return new Response(
            JSON.stringify({
              success: true,
              totalScanned,
              totalNewMatches,
            }),
            {
              headers: { "Content-Type": "application/json" },
            }
          );
        } catch (err: any) {
          console.error("Cron scan handler error:", err);
          return new Response(
            JSON.stringify({ error: err.message || String(err) }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      },
    },
  },
});
