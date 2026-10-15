import { createContext, useContext } from "react";

export type ComplaintStatus = "Submitted" | "In progress" | "Resolved";

export type Complaint = {
  id: string;
  title: string;
  description: string;
  address: string;
  category: string;
  status: ComplaintStatus;
  createdAt: string;
  photoName?: string;
  verification?: string;
};

export type CitizenDataValue = {
  complaints: Complaint[];
  citizenName: string;
  addComplaint: (complaint: Omit<Complaint, "id" | "status" | "createdAt">) => void;
  submitVerification: (complaintId: string, feedback: string) => void;
  setCitizenName: (name: string) => void;
  signOut: () => void;
};

export const demoComplaints: Complaint[] = [
  {
    id: "DW-1042",
    title: "Blocked drain near the bus stop",
    description: "Water is collecting around the drain after recent rain.",
    address: "Market Street, Ward 4",
    category: "Blocked drain",
    status: "In progress",
    createdAt: "2026-10-12T09:30:00.000Z",
  },
  {
    id: "DW-1038",
    title: "Overflowing roadside drain",
    description: "The drain is overflowing onto the footpath.",
    address: "Lake View Road, Ward 2",
    category: "Overflowing drain",
    status: "Submitted",
    createdAt: "2026-10-09T13:15:00.000Z",
  },
  {
    id: "DW-1021",
    title: "Debris cleared from street drain",
    description: "Leaves and litter were blocking the drain.",
    address: "Park Avenue, Ward 1",
    category: "Debris / litter",
    status: "Resolved",
    createdAt: "2026-10-02T07:45:00.000Z",
  },
];

export const CitizenDataContext = createContext<CitizenDataValue | null>(null);

export function useCitizenData() {
  const context = useContext(CitizenDataContext);
  if (!context) {
    throw new Error("useCitizenData must be used inside CitizenDataProvider.");
  }
  return context;
}

export function formatComplaintDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
