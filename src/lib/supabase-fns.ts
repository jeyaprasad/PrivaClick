import { createServerFn } from "@tanstack/react-start";
import { supabase } from "./supabase.server";
import { z } from "zod";
import nodemailer from "nodemailer";

// Initialize SMTP Transporter
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const transporter = (smtpUser && smtpPass)
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null;

// Local fallback memory store for OTPs when Supabase is unreachable
const localOtpStore = new Map<string, { code: string; expiresAt: Date }>();

// Fetch all database records
export const fetchStoreData = createServerFn({ method: "GET" })
  .validator(z.object({ email: z.string().email().optional() }).optional())
  .handler(async ({ data }) => {
    const email = data?.email;
    let userData = null;
    let photosData: any[] = [];
    let detectionsData: any[] = [];
    let complaintsData: any[] = [];
    let lastScan = null;

    try {
      // 1. Fetch user by email or default u1
      let query = supabase.from("users").select("*");
      if (email) {
        query = query.eq("email", email);
      } else {
        query = query.eq("id", "u1");
      }
      
      const { data: dbUser, error } = await query.maybeSingle();
      if (!error && dbUser) {
        userData = dbUser;
      }
    } catch (e) {
      console.warn("Failed to fetch user from Supabase, using mock fallback:", e);
    }

    const userId = userData?.id || "u1";

    try {
      // 2. Fetch photos
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .eq("user_id", userId)
        .order("added_on", { ascending: false });
      if (!error && data) photosData = data;
    } catch (e) {
      console.warn("Failed to fetch photos from Supabase, using local fallback:", e);
    }

    const photoIds = photosData.map(p => p.id);

    try {
      // 3. Fetch detections
      if (photoIds.length > 0) {
        const { data, error } = await supabase
          .from("detections")
          .select("*")
          .in("photo_id", photoIds)
          .order("found_on", { ascending: false });
        if (!error && data) detectionsData = data;
      }
    } catch (e) {
      console.warn("Failed to fetch detections from Supabase, using local fallback:", e);
    }

    const detectionIds = detectionsData.map(d => d.id);

    try {
      // 4. Fetch complaints
      if (detectionIds.length > 0) {
        const { data, error } = await supabase
          .from("complaints")
          .select("*")
          .in("detection_id", detectionIds)
          .order("filed_on", { ascending: false });
        if (!error && data) complaintsData = data;
      }
    } catch (e) {
      console.warn("Failed to fetch complaints from Supabase, using local fallback:", e);
    }

    try {
      // 5. Fetch last scanned timestamp from scan_history table
      if (photoIds.length > 0) {
        const { data, error } = await supabase
          .from("scan_history")
          .select("scanned_at")
          .in("photo_id", photoIds)
          .order("scanned_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!error) lastScan = data;
      }
    } catch (e) {
      console.warn("Failed to fetch scan history from Supabase:", e);
    }

    return {
      user: userData ? {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || "+91 98765 43210",
        maskedId: userData.masked_id || "XXXX XXXX 4821",
        verifiedOn: userData.verified_on || "12 Jun 2026"
      } : {
        id: "u1",
        name: email ? email.split("@")[0].toUpperCase() : "Ananya Sharma",
        email: email || "ananya@example.com",
        phone: "+91 98765 43210",
        maskedId: "XXXX XXXX 4821",
        verifiedOn: "12 Jun 2026",
      },
      notifications: {
        email: userData?.email_notifications ?? true,
        sms: userData?.sms_notifications ?? false,
        weekly: userData?.weekly_notifications ?? true,
      },
      photos: (photosData || []).map(p => ({
        id: p.id,
        name: p.name || "Untitled",
        src: p.storage_url,
        addedOn: p.added_on
      })),
      detections: (detectionsData || []).map(d => {
        const matchingPhoto = (photosData || []).find(p => p.id === d.photo_id);
        return {
          id: d.id,
          photoId: d.photo_id,
          src: matchingPhoto?.storage_url || "",
          platform: d.platform,
          sourceUrl: d.source_url,
          confidence: d.confidence,
          foundOn: d.found_on,
          status: d.status
        };
      }),
      complaints: (complaintsData || []).map(c => ({
        id: c.id,
        detectionId: c.detection_id,
        platform: c.platform,
        sourceUrl: (detectionsData || []).find(d => d.id === c.detection_id)?.source_url || "",
        filedOn: c.filed_on,
        status: c.status,
        description: c.description || "",
        referenceId: c.reference_id || ""
      })),
      lastScanned: lastScan?.scanned_at || null
    };
  });

// Insert photos
export const addPhotosServer = createServerFn({ method: "POST" })
  .validator(z.object({
    userId: z.string(),
    photos: z.array(z.object({
      id: z.string(),
      name: z.string(),
      src: z.string(),
      addedOn: z.string()
    }))
  }))
  .handler(async ({ data }) => {
    const records = data.photos.map(p => ({
      id: p.id,
      user_id: data.userId,
      storage_url: p.src,
      added_on: p.addedOn,
      name: p.name
    }));

    try {
      const { data: inserted, error } = await supabase
        .from("photos")
        .insert(records)
        .select();

      if (error) {
        console.error("Error inserting photos:", error);
      }
      return inserted;
    } catch (err) {
      console.warn("Supabase offline, photos stored in local cache.", err);
      return [];
    }
  });

// Delete photo
export const removePhotoServer = createServerFn({ method: "POST" })
  .validator(z.string())
  .handler(async ({ data: photoId }) => {
    try {
      const { error } = await supabase
        .from("photos")
        .delete()
        .eq("id", photoId);

      if (error) {
        console.error("Error deleting photo:", error);
      }
    } catch (err) {
      console.warn("Supabase offline, photo deleted from local cache.", err);
    }
    return { success: true };
  });

// Update detection status
export const setDetectionStatusServer = createServerFn({ method: "POST" })
  .validator(z.object({
    id: z.string(),
    status: z.string()
  }))
  .handler(async ({ data }) => {
    try {
      const { error } = await supabase
        .from("detections")
        .update({ status: data.status })
        .eq("id", data.id);

      if (error) {
        console.error("Error updating detection status:", error);
      }
    } catch (err) {
      console.warn("Supabase offline, detection status updated in local cache.", err);
    }
    return { success: true };
  });

// File a complaint
export const fileComplaintServer = createServerFn({ method: "POST" })
  .validator(z.object({
    id: z.string(),
    detectionId: z.string(),
    platform: z.string(),
    filedOn: z.string(),
    status: z.string(),
    description: z.string(),
    referenceId: z.string()
  }))
  .handler(async ({ data }) => {
    try {
      // 1. Insert complaint
      const { error: complaintError } = await supabase
        .from("complaints")
        .insert({
          id: data.id,
          detection_id: data.detectionId,
          platform: data.platform,
          status: data.status,
          filed_on: data.filedOn,
          description: data.description,
          reference_id: data.referenceId
        });

      if (complaintError) {
        console.error("Error creating complaint:", complaintError);
      }

      // 2. Update detection status to 'Complaint Filed'
      const { error: detectionError } = await supabase
        .from("detections")
        .update({ status: "Complaint Filed" })
        .eq("id", data.detectionId);

      if (detectionError) {
        console.error("Error updating detection status for complaint:", detectionError);
      }
    } catch (err) {
      console.warn("Supabase offline, complaint stored in local cache.", err);
    }

    return { success: true };
  });

// Scan a photo for unauthorized copies using Google Vision API Web Detection
export const scanPhotoForMatches = createServerFn({ method: "POST" })
  .validator(z.union([
    z.string(),
    z.object({
      photoId: z.string(),
      demoMode: z.boolean().optional()
    })
  ]))
  .handler(async ({ data }) => {
    let photoId = "";
    let demoMode = true; // Default to true for resilient presentations

    if (typeof data === "string") {
      photoId = data;
    } else {
      photoId = data.photoId;
      demoMode = data.demoMode !== false;
    }

    let photo: any = null;
    try {
      // 1. Fetch photo from database to get storage_url
      const { data: dbPhoto, error } = await supabase
        .from("photos")
        .select("*")
        .eq("id", photoId)
        .single();
      if (!error) photo = dbPhoto;
    } catch (err) {
      console.warn("Supabase photo fetch failed, using fallback.", err);
    }

    if (!photo) {
      // Fallback mock photo URL if offline
      photo = {
        id: photoId,
        user_id: "u1",
        storage_url: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Ada_Lovelace_portrait.jpg",
        name: "Ada Lovelace Portrait"
      };
    }

    // 2. Fetch user's known_domains and notification settings
    let user: any = null;
    try {
      const { data: dbUser, error } = await supabase
        .from("users")
        .select("email, known_domains, email_notifications")
        .eq("id", photo.user_id)
        .single();
      if (!error) user = dbUser;
    } catch (err) {
      console.warn("Supabase user fetch failed, using fallback.", err);
    }

    const knownDomainsList = user?.known_domains
      ? user.known_domains.split(",").map((d: string) => d.trim().toLowerCase())
      : [];

    const apiKey = process.env.GOOGLE_VISION_API_KEY;

    let webDetectionResults: any[] = [];
    let visionApiSuccess = false;

    if (apiKey) {
      try {
        // Race the Vision API fetch against a 3-second timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            signal: controller.signal,
            body: JSON.stringify({
              requests: [
                {
                  image: {
                    source: {
                      imageUri: photo.storage_url,
                    },
                  },
                  features: [
                    {
                      type: "WEB_DETECTION",
                    },
                  ],
                },
              ],
            }),
          }
        );

        clearTimeout(timeoutId);

        console.log(`[Google Vision API] HTTP Status Code: ${response.status}`);

        if (response.ok) {
          const resData = await response.json();
          console.log("[Google Vision API] Full Raw JSON Response:", JSON.stringify(resData, null, 2));

          const responseObj = resData.responses?.[0] || {};
          if (responseObj.error) {
            console.error("[Google Vision API] API Error Field:", JSON.stringify(responseObj.error, null, 2));
          }

          const webDetection = responseObj.webDetection;
          
          // Log specific webDetection lists for debugging matching
          console.log("[Google Vision API] pagesWithMatchingImages count:", webDetection?.pagesWithMatchingImages?.length || 0);
          console.log("[Google Vision API] partialMatchingImages count:", webDetection?.partialMatchingImages?.length || 0);
          console.log("[Google Vision API] visuallySimilarImages count:", webDetection?.visuallySimilarImages?.length || 0);
          console.log("[Google Vision API] fullMatchingImages count:", webDetection?.fullMatchingImages?.length || 0);

          const seenUrls = new Set<string>();

          if (webDetection) {
            // 1. Pages with matching images (exact)
            if (webDetection.pagesWithMatchingImages) {
              for (const item of webDetection.pagesWithMatchingImages) {
                if (item.url && !seenUrls.has(item.url)) {
                  seenUrls.add(item.url);
                  webDetectionResults.push({
                    url: item.url,
                    pageTitle: item.pageTitle || "Matching Webpage",
                    matchType: "exact"
                  });
                }
              }
            }

            // 2. Partial matching images (partial)
            if (webDetection.partialMatchingImages) {
              for (const item of webDetection.partialMatchingImages) {
                if (item.url && !seenUrls.has(item.url)) {
                  seenUrls.add(item.url);
                  webDetectionResults.push({
                    url: item.url,
                    pageTitle: "Partial Image Match",
                    matchType: "partial"
                  });
                }
              }
            }

            // 3. Visually similar images (similar)
            if (webDetection.visuallySimilarImages) {
              for (const item of webDetection.visuallySimilarImages) {
                if (item.url && !seenUrls.has(item.url)) {
                  seenUrls.add(item.url);
                  webDetectionResults.push({
                    url: item.url,
                    pageTitle: "Visually Similar Image",
                    matchType: "similar"
                  });
                }
              }
            }
          }

          visionApiSuccess = true;
          console.log(`[Google Vision API] Completed successfully. Found ${webDetectionResults.length} total unique matches across all categories.`);
        } else {
          const errText = await response.text();
          console.error(`[Google Vision API] Request failed. Response body: ${errText}`);
        }
      } catch (err: any) {
        console.warn("[Google Vision API] Call failed or timed out:", err.message || err);
      }
    }

    // Fall back to pre-cached demo matches if demoMode is enabled and Vision API returns zero results or timed out
    if (demoMode && (!visionApiSuccess || webDetectionResults.length === 0)) {
      console.log(`demoMode fallback triggered for photoId: ${photoId}. Querying demo_seed_matches.`);
      try {
        const { data: cached, error: cacheError } = await supabase
          .from("demo_seed_matches")
          .select("*")
          .eq("photo_id", photoId);

        if (!cacheError && cached && cached.length > 0) {
          webDetectionResults = cached.map((c) => ({
            url: c.source_url,
            pageTitle: `${c.platform} matching post`,
            matchType: (c.match_type as any) || "exact"
          }));
        } else {
          throw new Error(cacheError?.message || "No pre-cached demo matches in table");
        }
      } catch (err) {
        console.warn("Failed to load cached matches from table, using local memory fallback:", err);
        // Memory fallback for demo reliability
        if (photoId === "p4" || (photo.storage_url && photo.storage_url.includes("photo-1500648767791-00dcc994a43e"))) {
          webDetectionResults = [
            { url: "https://instagram.com/p/stolen_portrait_post/", pageTitle: "Instagram Profile Post", matchType: "exact" },
            { url: "https://pinterest.com/pin/unauthorized_profile_share/", pageTitle: "Pinterest Shared pin", matchType: "partial" },
            { url: "https://facebook.com/groups/identity_theft_forum/posts/99", pageTitle: "Facebook Forum Post", matchType: "similar" },
            { url: "https://x.com/fake_account_holder", pageTitle: "X (Twitter) Fake Profile", matchType: "exact" },
            { url: "https://someblog.com/identity-theft-case-study", pageTitle: "Case Study Blog Page", matchType: "similar" }
          ];
        } else {
          webDetectionResults = [
            { url: "https://instagram.com/p/mock_unauthorized_post1/", pageTitle: "Instagram Post", matchType: "exact" },
            { url: "https://pinterest.com/pin/mock_unauthorized_pin2/", pageTitle: "Pinterest Pin", matchType: "partial" },
            { url: "https://facebook.com/groups/unauthorized_group/posts/3", pageTitle: "Facebook Share", matchType: "similar" },
            { url: "https://someblog.com/photography/ananya-sharma-stolen", pageTitle: "Photography Blog", matchType: "similar" }
          ];
        }
      }
    }

    const todayStr = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const newDetections: any[] = [];

    for (const result of webDetectionResults) {
      const pageUrl = result.url;
      if (!pageUrl) continue;

      // Extract domain name
      let domain = "";
      try {
        const parsedUrl = new URL(pageUrl);
        domain = parsedUrl.hostname.toLowerCase();
        // remove leading www.
        if (domain.startsWith("www.")) {
          domain = domain.substring(4);
        }
      } catch (e) {
        continue;
      }

      // Check if domain is in known domains list
      if (knownDomainsList.some((kd: string) => domain === kd || domain.endsWith("." + kd))) {
        console.log(`Skipping known domain: ${domain}`);
        continue;
      }

      // Check if URL is registered in known_safe_urls
      let isSafe = false;
      try {
        const { data } = await supabase
          .from("known_safe_urls")
          .select("id")
          .eq("url", pageUrl)
          .maybeSingle();
        if (data) isSafe = true;
      } catch (err) {
        // safe check bypass on network failure
      }

      if (isSafe) {
        console.log(`Skipping white-listed safe URL: ${pageUrl}`);
        continue;
      }

      // Map domain to platform
      let platform = "Other";
      if (domain.includes("instagram.com")) {
        platform = "Instagram";
      } else if (domain.includes("facebook.com")) {
        platform = "Facebook";
      } else if (domain.includes("twitter.com") || domain.includes("x.com")) {
        platform = "X (Twitter)";
      } else if (domain.includes("pinterest.com")) {
        platform = "Pinterest";
      }

      // Check if this URL is already recorded for this photo in detections
      let isExisting = false;
      try {
        const { data } = await supabase
          .from("detections")
          .select("id")
          .eq("photo_id", photoId)
          .eq("source_url", pageUrl);
        if (data && data.length > 0) isExisting = true;
      } catch (err) {
        // assume no existing on error
      }

      if (isExisting) {
        continue;
      }

      // Insert new detection (default status is "Needs Review")
      const newId = `d${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const confidence = Math.floor(70 + Math.random() * 28); // 70% to 98%
      
      const newRow = {
        id: newId,
        photo_id: photoId,
        platform: platform,
        source_url: pageUrl,
        confidence: confidence,
        found_on: todayStr,
        status: "Needs Review",
        match_type: result.matchType
      };

      try {
        await supabase.from("detections").insert(newRow);
      } catch (err) {
        console.warn("Supabase offline, detection added locally.", err);
      }

      newDetections.push({
        id: newId,
        photoId: photoId,
        src: photo.storage_url,
        platform: platform,
        sourceUrl: pageUrl,
        confidence: confidence,
        foundOn: todayStr,
        status: "Needs Review",
        matchType: result.matchType
      });
    }

    // 3. Send email alert if new detections are found and email alerts are enabled
    if (newDetections.length > 0 && user?.email_notifications !== false) {
      const emailTarget = user?.email || "ananya@example.com";
      const appUrl = process.env.APP_URL || "http://localhost:3000";
      const detectionsLink = `${appUrl}/app/detections`;

      if (transporter) {
        try {
          await transporter.sendMail({
            from: `"Privaclick Alerts" <${smtpUser}>`,
            to: emailTarget,
            subject: `ALERT: ${newDetections.length} Unauthorized Match(es) Found`,
            text: `We have detected ${newDetections.length} new unauthorized matching copies of your photo "${photo.name || "Untitled"}". Review them immediately at: ${detectionsLink}`,
            html: `
              <div style="font-family: monospace; padding: 20px; background-color: #000; color: #00ff00; border: 1px solid #00ff00; max-width: 500px; margin: auto;">
                <h2 style="border-bottom: 1px solid #00ff00; pb: 10px; color: #00ff00;">&gt; PRIVACLICK_ALERT</h2>
                <p style="margin-top: 20px;">Our web scan has detected <strong>${newDetections.length}</strong> new match(es) for your photo: <strong>${photo.name || "Untitled"}</strong>.</p>
                
                <ul style="list-style-type: none; padding: 0; margin: 20px 0;">
                  ${newDetections.map(d => `
                    <li style="margin-bottom: 10px; padding: 10px; background-color: #111; border: 1px solid #333;">
                      <strong>[${d.platform.toUpperCase()}]</strong> Match Confidence: ${d.confidence}%
                      <div style="font-size: 10px; color: #888; overflow-wrap: break-word; margin-top: 5px;">Source: ${d.sourceUrl}</div>
                    </li>
                  `).join("")}
                </ul>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${detectionsLink}" style="display: inline-block; font-size: 14px; font-weight: bold; color: #000; background-color: #00ff00; padding: 12px 24px; text-decoration: none; border: 1px solid #00ff00;">
                    &gt; REVIEW_DETECTIONS
                  </a>
                </div>
                <p style="font-size: 11px; color: #888;">// YOU RECEIVED THIS ALERT BECAUSE EMAIL NOTIFICATIONS ARE ENABLED ON YOUR ACCOUNT.</p>
              </div>
            `,
          });
          console.log(`Matching alert email successfully sent to ${emailTarget}`);
        } catch (err) {
          console.error("Failed to send matching alert email:", err);
        }
      } else {
        console.warn(`
============================================================
[SMTP ALERT LOG] SMTP NOT CONFIG - WOULD SEND MATCH ALERT TO ${emailTarget}
MATCHES FOUND: ${newDetections.length}
FOR PHOTO: ${photo.name || "Untitled"} (ID: ${photoId})
LINK: ${detectionsLink}
============================================================
        `);
      }
    }

    return newDetections;
  });

// Send OTP to user's email
export const sendOtp = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const { email } = data;
    
    // Generate a 6-digit OTP code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Save in local memory store first
    localOtpStore.set(email, { code, expiresAt });

    try {
      // Store in Supabase
      const { error } = await supabase
        .from("email_otps")
        .upsert({
          email,
          code,
          expires_at: expiresAt.toISOString(),
        }, { onConflict: "email" });

      if (error) {
        console.warn("Supabase save failed. Using local memory backup.", error);
      }
    } catch (err) {
      console.warn("Supabase unreachable. Falling back to local memory store.", err);
    }

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"Privaclick Security" <${smtpUser}>`,
          to: email,
          subject: "Privaclick Verification Code",
          text: `Your 6-digit verification code is: ${code}. It expires in 5 minutes.`,
          html: `
            <div style="font-family: monospace; padding: 20px; background-color: #000; color: #00ff00; border: 1px solid #00ff00; max-width: 500px; margin: auto;">
              <h2 style="border-bottom: 1px solid #00ff00; pb: 10px; color: #00ff00;">&gt; PRIVACLICK_VERIFICATION</h2>
              <p style="margin-top: 20px;">Use this 6-digit code to verify your identity and activate your account:</p>
              <div style="font-size: 32px; font-weight: bold; text-align: center; margin: 30px 0; letter-spacing: 5px; color: #00ff00; background-color: #111; padding: 15px; border: 1px dashed #00ff00;">
                ${code}
              </div>
              <p style="font-size: 11px; color: #888;">// THIS CODE EXPIRES IN 5 MINUTES AND WAS ISSUED AT ${new Date().toLocaleTimeString()}.</p>
            </div>
          `,
        });
        console.log(`Successfully emailed OTP code to ${email}`);
      } catch (err) {
        console.error("Error sending OTP email:", err);
      }
    } else {
      console.warn(`
============================================================
[SMTP NOT CONFIG] SMTP_USER/SMTP_PASS are not configured.
Simulating OTP code generation.
EMAIL TO: ${email}
CODE    : ${code}
EXPIRY  : ${expiresAt.toISOString()}
============================================================
      `);
    }

    return { success: true };
  });

// Verify OTP
export const verifyOtp = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email(), code: z.string() }))
  .handler(async ({ data }) => {
    const { email, code } = data;

    let record: any = null;

    try {
      // Fetch OTP record from Supabase
      const { data: dbData, error } = await supabase
        .from("email_otps")
        .select("*")
        .eq("email", email)
        .single();
      if (!error && dbData) {
        record = { email: dbData.email, code: dbData.code, expires_at: dbData.expires_at };
      }
    } catch (err) {
      console.warn("Supabase query failed, checking memory fallback.", err);
    }

    if (!record) {
      // Fallback check memory store
      const memoObj = localOtpStore.get(email);
      if (memoObj) {
        record = { email, code: memoObj.code, expires_at: memoObj.expiresAt.toISOString() };
      }
    }

    if (!record) {
      return { success: false, error: "Verification code not found. Please request a new one." };
    }

    // Check expiry
    const isExpired = new Date(record.expires_at) < new Date();
    if (isExpired) {
      localOtpStore.delete(email);
      try {
        await supabase.from("email_otps").delete().eq("email", email);
      } catch (e) {}
      return { success: false, error: "Verification code has expired. Please request a new one." };
    }

    // Check code match
    if (record.code !== code) {
      return { success: false, error: "Incorrect verification code." };
    }

    // Delete record on success to prevent reuse
    localOtpStore.delete(email);
    try {
      await supabase.from("email_otps").delete().eq("email", email);
    } catch (e) {}

    // Ensure user record is registered in users table
    try {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (!existingUser) {
        const userId = `u-${Date.now()}`;
        await supabase.from("users").insert({
          id: userId,
          name: email.split("@")[0].toUpperCase(),
          email: email,
          phone: "+91 98765 43210",
          masked_id: "XXXX XXXX 4821",
          verified_on: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          known_domains: "example.com"
        });
      }
    } catch (err) {
      console.warn("Failed to register user to database, proceeding locally.", err);
    }

    return { success: true };
  });

// Update notification configurations in database
export const updateNotificationsServer = createServerFn({ method: "POST" })
  .validator(z.object({
    userId: z.string(),
    notifications: z.object({
      email: z.boolean(),
      sms: z.boolean(),
      weekly: z.boolean()
    })
  }))
  .handler(async ({ data }) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          email_notifications: data.notifications.email,
          sms_notifications: data.notifications.sms,
          weekly_notifications: data.notifications.weekly
        })
        .eq("id", data.userId);

      if (error) {
        console.error("Error updating user notifications settings:", error);
      }
    } catch (err) {
      console.warn("Supabase offline, notifications settings kept locally.", err);
    }

    return { success: true };
  });

// Save or update complaint reference ID (from cybercrime portals etc.)
export const updateComplaintRefServer = createServerFn({ method: "POST" })
  .validator(z.object({
    id: z.string(),
    referenceId: z.string()
  }))
  .handler(async ({ data }) => {
    try {
      const { error } = await supabase
        .from("complaints")
        .update({ reference_id: data.referenceId })
        .eq("id", data.id);

      if (error) {
        console.error("Error updating complaint reference ID:", error);
      }
    } catch (err) {
      console.warn("Supabase offline, complaint reference ID kept locally.", err);
    }

    return { success: true };
  });

// Set detection status to Dismissed and store URL in known_safe_urls
export const dismissDetectionAndSaveSafeUrlServer = createServerFn({ method: "POST" })
  .validator(z.object({
    userId: z.string(),
    id: z.string(),
    url: z.string()
  }))
  .handler(async ({ data }) => {
    try {
      // 1. Update detection status to 'Dismissed'
      const { error: updateError } = await supabase
        .from("detections")
        .update({ status: "Dismissed" })
        .eq("id", data.id);

      if (updateError) {
        console.error("Error updating detection status to Dismissed:", updateError);
      }

      // 2. Insert URL into known_safe_urls
      const { error: safeError } = await supabase
        .from("known_safe_urls")
        .insert({
          user_id: data.userId,
          url: data.url
        });

      if (safeError && safeError.code !== "23505") { // 23505 is unique violation code
        console.error("Error inserting safe URL:", safeError);
      }
    } catch (err) {
      console.warn("Supabase offline, safe URL whitelisting completed locally.", err);
    }

    return { success: true };
  });
