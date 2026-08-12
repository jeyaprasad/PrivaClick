export const photo1 =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80";
export const photo2 =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80";
export const photo3 =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80";
export const photo4 =
  "https://upload.wikimedia.org/wikipedia/commons/a/a4/Ada_Lovelace_portrait.jpg";

export type Platform = "Instagram" | "Facebook" | "X (Twitter)" | "Pinterest" | "Other";
export type DetectionStatus = "Needs Review" | "Confirmed Unauthorized" | "Complaint Filed" | "Dismissed";
export type ComplaintStatus = "Submitted" | "Under Review" | "Action Taken";

export type RegisteredPhoto = {
  id: string;
  name: string;
  src: string;
  addedOn: string;
};

export type Detection = {
  id: string;
  photoId: string;
  src: string;
  platform: Platform;
  sourceUrl: string;
  confidence: number;
  foundOn: string;
  status: DetectionStatus;
};

export type Complaint = {
  id: string;
  detectionId: string;
  platform: Platform;
  sourceUrl: string;
  filedOn: string;
  status: ComplaintStatus;
  description: string;
  referenceId: string;
};

export const mockUser = {
  name: "Ananya Sharma",
  email: "ananya@example.com",
  phone: "+91 98765 43210",
  maskedId: "XXXX XXXX 4821",
  verifiedOn: "12 Jun 2026",
};

export const initialPhotos: RegisteredPhoto[] = [
  { id: "p1", name: "Profile portrait", src: photo1, addedOn: "12 Jun 2026" },
  { id: "p2", name: "Park afternoon", src: photo2, addedOn: "12 Jun 2026" },
  { id: "p3", name: "Cafe candid", src: photo3, addedOn: "18 Jun 2026" },
  { id: "p4", name: "Ada Lovelace Portrait", src: photo4, addedOn: "12 Aug 2026" },
];

export const initialDetections: Detection[] = [
  {
    id: "d1",
    photoId: "p1",
    src: photo1,
    platform: "Instagram",
    sourceUrl: "https://instagram.com/p/9fJk21_ad/",
    confidence: 97,
    foundOn: "04 Aug 2026",
    status: "Needs Review",
  },
  {
    id: "d2",
    photoId: "p2",
    src: photo2,
    platform: "Pinterest",
    sourceUrl: "https://pinterest.com/pin/71829301/",
    confidence: 88,
    foundOn: "31 Jul 2026",
    status: "Needs Review",
  },
  {
    id: "d3",
    photoId: "p3",
    src: photo3,
    platform: "X (Twitter)",
    sourceUrl: "https://x.com/unknown_acct/status/17281",
    confidence: 76,
    foundOn: "24 Jul 2026",
    status: "Confirmed Unauthorized",
  },
  {
    id: "d4",
    photoId: "p1",
    src: photo1,
    platform: "Facebook",
    sourceUrl: "https://facebook.com/groups/2381/posts/9912",
    confidence: 93,
    foundOn: "19 Jul 2026",
    status: "Complaint Filed",
  },
];

export const initialComplaints: Complaint[] = [
  {
    id: "PVC-2026-004192",
    detectionId: "d4",
    platform: "Facebook",
    sourceUrl: "https://facebook.com/groups/2381/posts/9912",
    filedOn: "20 Jul 2026",
    status: "Under Review",
    description: "My photo was reposted without permission on a public group page.",
    referenceId: "PVC-2026-004192"
  },
];

export const platforms: Platform[] = ["Instagram", "Facebook", "X (Twitter)", "Pinterest"];