import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
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

type Prefs = Record<Platform, boolean>;

type Store = {
  user: typeof mockUser;
  photos: RegisteredPhoto[];
  detections: Detection[];
  complaints: Complaint[];
  prefs: Prefs;
  notifications: { email: boolean; sms: boolean; weekly: boolean };
  riskScore: number;
  addPhotos: (files: { name: string; src: string }[]) => void;
  removePhoto: (id: string) => void;
  setDetectionStatus: (id: string, status: DetectionStatus) => void;
  togglePlatform: (p: Platform) => void;
  setNotification: (key: "email" | "sms" | "weekly", value: boolean) => void;
  fileComplaint: (input: { detectionId: string; description: string }) => Complaint;
};

const StoreContext = createContext<Store | null>(null);

const today = () =>
  new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export function PrivaclickProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<RegisteredPhoto[]>(initialPhotos);
  const [detections, setDetections] = useState<Detection[]>(initialDetections);
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [prefs, setPrefs] = useState<Prefs>({
    Instagram: true,
    Facebook: true,
    "X (Twitter)": true,
    Pinterest: false,
  });
  const [notifications, setNotifications] = useState({ email: true, sms: false, weekly: true });

  const addPhotos = useCallback((files: { name: string; src: string }[]) => {
    setPhotos((prev) => [
      ...prev,
      ...files.map((f, i) => ({
        id: `p${Date.now()}-${i}`,
        name: f.name,
        src: f.src,
        addedOn: today(),
      })),
    ]);
  }, []);

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const setDetectionStatus = useCallback((id: string, status: DetectionStatus) => {
    setDetections((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
  }, []);

  const togglePlatform = useCallback((p: Platform) => {
    setPrefs((prev) => ({ ...prev, [p]: !prev[p] }));
  }, []);

  const setNotification = useCallback((key: "email" | "sms" | "weekly", value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  }, []);

  const fileComplaint = useCallback<Store["fileComplaint"]>(
    ({ detectionId, description }) => {
      const detection = detections.find((d) => d.id === detectionId);
      const complaint: Complaint = {
        id: `PVC-2026-${String(Math.floor(100000 + Math.random() * 899999))}`,
        detectionId,
        platform: detection?.platform ?? "Instagram",
        sourceUrl: detection?.sourceUrl ?? "",
        filedOn: today(),
        status: "Submitted",
        description,
      };
      setComplaints((prev) => [complaint, ...prev]);
      setDetections((prev) =>
        prev.map((d) => (d.id === detectionId ? { ...d, status: "Complaint Filed" } : d)),
      );
      return complaint;
    },
    [detections],
  );

  const riskScore = useMemo(() => {
    const open = detections.filter((d) => d.status === "New").length;
    const watched = platforms.filter((p) => prefs[p]).length;
    return Math.max(8, Math.min(96, 18 + open * 17 + (4 - watched) * 6));
  }, [detections, prefs]);

  const value = useMemo(
    () => ({
      user: mockUser,
      photos,
      detections,
      complaints,
      prefs,
      notifications,
      riskScore,
      addPhotos,
      removePhoto,
      setDetectionStatus,
      togglePlatform,
      setNotification,
      fileComplaint,
    }),
    [
      photos,
      detections,
      complaints,
      prefs,
      notifications,
      riskScore,
      addPhotos,
      removePhoto,
      setDetectionStatus,
      togglePlatform,
      setNotification,
      fileComplaint,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function usePrivaclick() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("usePrivaclick must be used inside PrivaclickProvider");
  return ctx;
}