import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import CitizenLayout from "./CitizenLayout";
import { formatComplaintDate, useCitizenData } from "./CitizenStore";

export default function MyComplaintsPage() {
  const { complaints } = useCitizenData();
  const location = useLocation();
  const [filter, setFilter] = useState("All");
  const filtered = complaints.filter((complaint) => filter === "All" || complaint.status === filter);
  const notice = (location.state as { notice?: string } | null)?.notice;

  return (
    <CitizenLayout title="My complaints" description="Track the status and details of drainage issues you have reported.">
      {notice && <p role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">{notice}</p>}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <label className="text-sm font-semibold text-slate-700">
          Filter by status
          <select value={filter} onChange={(event) => setFilter(event.currentTarget.value)} className="ml-3 rounded-lg border border-slate-300 bg-white px-3 py-2">
            <option>All</option>
            <option>Submitted</option>
            <option>In progress</option>
            <option>Resolved</option>
          </select>
        </label>
        <Link to="/report" className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">New report</Link>
      </div>
      {filtered.length ? (
        <div className="grid gap-4">
          {filtered.map((complaint) => (
            <article key={complaint.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{complaint.id} · {complaint.category}</p>
                  <h2 className="mt-2 text-lg font-bold text-slate-950">{complaint.title}</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{complaint.status}</span>
              </div>
              <p className="mt-3 leading-6 text-slate-600">{complaint.description}</p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                <span>Location: {complaint.address}</span>
                <span>Reported: {formatComplaintDate(complaint.createdAt)}</span>
              </div>
              {complaint.photoName && <p className="mt-2 text-sm text-slate-500">Attached photo name: {complaint.photoName}</p>}
              {complaint.verification && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Your verification: {complaint.verification}</p>}
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <h2 className="font-semibold text-slate-900">No complaints match this filter</h2>
          <p className="mt-2 text-sm text-slate-600">Try another status or submit a new report.</p>
        </div>
      )}
    </CitizenLayout>
  );
}
