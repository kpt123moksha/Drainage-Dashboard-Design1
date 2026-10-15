import { useState, type ReactNode } from "react";
import { CitizenDataContext, demoComplaints, type Complaint } from "./CitizenStore";

const STORAGE_KEY = "drainwatch-citizen-complaints";
const NAME_KEY = "drainwatch-citizen-name";

function isComplaint(value: unknown): value is Complaint {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.description === "string" &&
    typeof item.address === "string" &&
    typeof item.category === "string" &&
    typeof item.createdAt === "string" &&
    (item.status === "Submitted" ||
      item.status === "In progress" ||
      item.status === "Resolved") &&
    (item.photoName === undefined || typeof item.photoName === "string") &&
    (item.verification === undefined || typeof item.verification === "string")
  );
}

function loadComplaints(): Complaint[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return demoComplaints;

  try {
    const parsed: unknown = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.every(isComplaint)) return parsed;
    console.error("Saved DrainWatch complaints were invalid; using demo data.");
  } catch (error) {
    console.error("Could not read saved DrainWatch complaints; using demo data.", error);
  }
  return demoComplaints;
}

export default function CitizenDataProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(loadComplaints);
  const [citizenName, setName] = useState(
    () => localStorage.getItem(NAME_KEY) ?? "Citizen",
  );

  function saveComplaints(nextComplaints: Complaint[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextComplaints));
    setComplaints(nextComplaints);
  }

  function addComplaint(
    complaint: Omit<Complaint, "id" | "status" | "createdAt">,
  ) {
    const nextComplaint: Complaint = {
      ...complaint,
      id: `DW-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "Submitted",
      createdAt: new Date().toISOString(),
    };
    saveComplaints([nextComplaint, ...complaints]);
  }

  function submitVerification(complaintId: string, feedback: string) {
    saveComplaints(
      complaints.map((complaint) =>
        complaint.id === complaintId
          ? { ...complaint, verification: feedback.trim() }
          : complaint,
      ),
    );
  }

  function setCitizenName(name: string) {
    localStorage.setItem(NAME_KEY, name);
    setName(name);
  }

  function signOut() {
    localStorage.removeItem(NAME_KEY);
    setName("Citizen");
  }

  return (
    <CitizenDataContext.Provider
      value={{
        complaints,
        citizenName,
        addComplaint,
        submitVerification,
        setCitizenName,
        signOut,
      }}
    >
      {children}
    </CitizenDataContext.Provider>
  );
}
