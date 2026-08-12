import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import {
  initialComplaints,
  initialDetections,
  initialPhotos,
  mockUser,
  platforms,
  type Complaint,
  type Detection,
  type DetectionStatus,
  type Platform,
  type RegisteredPhoto,
} from "./mock-data";
import {
  fetchStoreData,
  addPhotosServer,
  removePhotoServer,
  setDetectionStatusServer,
  fileComplaintServer,
  scanPhotoForMatches as scanPhotoForMatchesServer,
  updateNotificationsServer,
  updateComplaintRefServer,
  dismissDetectionAndSaveSafeUrlServer,
} from "./supabase-fns";

type Prefs = Record<Platform, boolean>;

type Store = {
  user: typeof mockUser & { id: string };
  photos: RegisteredPhoto[];
  detections: Detection[];
  complaints: Complaint[];
  prefs: Prefs;
  notifications: { email: boolean; sms: boolean; weekly: boolean };
  riskScore: number;
  lastScanned: string | null;
  addPhotos: (files: { name: string; src: string }[]) => void;
  removePhoto: (id: string) => void;
  setDetectionStatus: (id: string, status: DetectionStatus) => void;
  togglePlatform: (p: Platform) => void;
  setNotification: (key: "email" | "sms" | "weekly", value: boolean) => void;
  fileComplaint: (input: { detectionId: string; description: string }) => Complaint;
  scanPhotoForMatches: (photoId: string) => Promise<Detection[]>;
  updateComplaintRef: (id: string, referenceId: string) => Promise<void>;
  dismissDetectionAndSaveSafeUrl: (id: string, url: string) => Promise<void>;
};

const StoreContext = createContext<Store | null>(null);

const today = () =>
  new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export function PrivaclickProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<typeof mockUser & { id: string }>({ ...mockUser, id: "u1" });
  const [photos, setPhotos] = useState<RegisteredPhoto[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [prefs, setPrefs] = useState<Prefs>({
    Instagram: true,
    Facebook: true,
    "X (Twitter)": true,
    Pinterest: false,
  });
  const [notifications, setNotifications] = useState({ email: true, sms: false, weekly: true });
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  // Fetch initial data from Supabase, scoped to logged-in user if available
  useEffect(() => {
    let active = true;
    const savedEmail = typeof window !== "undefined" ? localStorage.getItem("privaclick_email") : null;

    fetchStoreData({ data: { email: savedEmail || undefined } })
      .then((data) => {
        if (!active) return;
        if (data.user) setUser(data.user);
        if (data.photos) setPhotos(data.photos);
        if (data.detections) setDetections(data.detections);
        if (data.complaints) setComplaints(data.complaints);
        if (data.notifications) setNotifications(data.notifications);
        if (data.lastScanned) setLastScanned(data.lastScanned);
      })
      .catch((err) => {
        console.error("Failed to load store data from Supabase:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  const addPhotos = useCallback((files: { name: string; src: string }[]) => {
    const newPhotos = files.map((f, i) => ({
      id: `p${Date.now()}-${i}`,
      name: f.name,
      src: f.src,
      addedOn: today(),
    }));

    // Update local state optimistically
    setPhotos((prev) => [...prev, ...newPhotos]);

    // Persist changes to Supabase in background, associated to active user
    addPhotosServer({
      data: {
        userId: user.id,
        photos: newPhotos
      }
    }).catch((err) => {
      console.error("Failed to save photos to Supabase:", err);
    });
  }, [user.id]);

  const removePhoto = useCallback((id: string) => {
    // Update local state optimistically
    setPhotos((prev) => prev.filter((p) => p.id !== id));

    // Persist deletion to Supabase in background
    removePhotoServer({ data: id }).catch((err) => {
      console.error("Failed to delete photo from Supabase:", err);
    });
  }, []);

  const setDetectionStatus = useCallback((id: string, status: DetectionStatus) => {
    // Update local state optimistically
    setDetections((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));

    // Persist update to Supabase in background
    setDetectionStatusServer({ data: { id, status } }).catch((err) => {
      console.error("Failed to update detection status in Supabase:", err);
    });
  }, []);

  const togglePlatform = useCallback((p: Platform) => {
    setPrefs((prev) => ({ ...prev, [p]: !prev[p] }));
  }, []);

  const setNotification = useCallback((key: "email" | "sms" | "weekly", value: boolean) => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: value };
      
      updateNotificationsServer({
        data: {
          userId: user.id,
          notifications: next
        }
      }).catch((err) => {
        console.error("Failed to update notifications settings in Supabase:", err);
      });

      return next;
    });
  }, [user.id]);

  const fileComplaint = useCallback<Store["fileComplaint"]>(
    ({ detectionId, description }) => {
      const detection = detections.find((d) => d.id === detectionId);
      const complaintId = `PVC-2026-${String(Math.floor(100000 + Math.random() * 899999))}`;
      const complaint: Complaint = {
        id: complaintId,
        detectionId,
        platform: detection?.platform ?? "Instagram",
        sourceUrl: detection?.sourceUrl ?? "",
        filedOn: today(),
        status: "Submitted",
        description,
        referenceId: complaintId
      };

      // Update local state optimistically
      setComplaints((prev) => [complaint, ...prev]);
      setDetections((prev) =>
        prev.map((d) => (d.id === detectionId ? { ...d, status: "Complaint Filed" } : d)),
      );

      // Persist complaint and update detection state in Supabase in background
      fileComplaintServer({
        data: {
          id: complaintId,
          detectionId,
          platform: detection?.platform ?? "Instagram",
          filedOn: today(),
          status: "Submitted",
          description,
          referenceId: complaintId
        }
      }).catch((err) => {
        console.error("Failed to file complaint in Supabase:", err);
      });

      return complaint;
    },
    [detections],
  );

  const scanPhotoForMatches = useCallback(async (photoId: string) => {
    try {
      const newDets = await scanPhotoForMatchesServer({ data: photoId });
      if (newDets && newDets.length > 0) {
        setDetections((prev) => [...newDets, ...prev]);
      }
      setLastScanned(new Date().toISOString());
      return newDets;
    } catch (err) {
      console.error("Failed to scan photo for matches in Supabase:", err);
      throw err;
    }
  }, []);

  const updateComplaintRef = useCallback(async (id: string, referenceId: string) => {
    // Update local state optimistically
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, referenceId } : c))
    );

    // Persist to Supabase
    try {
      await updateComplaintRefServer({ data: { id, referenceId } });
    } catch (err) {
      console.error("Failed to update complaint reference in Supabase:", err);
      throw err;
    }
  }, []);

  const dismissDetectionAndSaveSafeUrl = useCallback(async (id: string, url: string) => {
    // Update local state optimistically
    setDetections((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "Dismissed" } : d))
    );

    // Persist to Supabase
    try {
      await dismissDetectionAndSaveSafeUrlServer({
        data: {
          userId: user.id,
          id,
          url
        }
      });
    } catch (err) {
      console.error("Failed to dismiss detection and save safe URL in Supabase:", err);
      throw err;
    }
  }, [user.id]);

  const riskScore = useMemo(() => {
    const open = detections.filter((d) => d.status === "Needs Review").length;
    const watched = platforms.filter((p) => prefs[p]).length;
    return Math.max(8, Math.min(96, 18 + open * 17 + (4 - watched) * 6));
  }, [detections, prefs]);

  const value = useMemo(
    () => ({
      user,
      photos,
      detections,
      complaints,
      prefs,
      notifications,
      riskScore,
      lastScanned,
      addPhotos,
      removePhoto,
      setDetectionStatus,
      togglePlatform,
      setNotification,
      fileComplaint,
      scanPhotoForMatches,
      updateComplaintRef,
      dismissDetectionAndSaveSafeUrl,
    }),
    [
      user,
      photos,
      detections,
      complaints,
      prefs,
      notifications,
      riskScore,
      lastScanned,
      addPhotos,
      removePhoto,
      setDetectionStatus,
      togglePlatform,
      setNotification,
      fileComplaint,
      scanPhotoForMatches,
      updateComplaintRef,
      dismissDetectionAndSaveSafeUrl,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function usePrivaclick() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("usePrivaclick must be used inside PrivaclickProvider");
  return ctx;
}