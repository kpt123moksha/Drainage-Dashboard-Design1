import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  ClipboardList,
  Plus,
  Waves,
} from "lucide-react";
import { Link } from "react-router-dom";
import CitizenLayout from "./CitizenLayout";
import { formatComplaintDate, useCitizenData } from "./CitizenStore";

function statusClass(status: string) {
  if (status === "Resolved") return "bg-emerald-50 text-emerald-700";
  if (status === "In progress") return "bg-amber-50 text-amber-700";
  return "bg-blue-50 text-blue-700";
}

export default function CitizenDashboard() {
  const { complaints, citizenName } = useCitizenData();
  const activeCount = complaints.filter((item) => item.status !== "Resolved").length;
  const resolvedCount = complaints.filter((item) => item.status === "Resolved").length;
  const recentComplaints = complaints.slice(0, 3);

  return (
    <CitizenLayout
      title={`Welcome back, ${citizenName}`}
      description="See the latest on your drainage reports and get to the services you need."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Complaint summary">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="inline-flex rounded-xl bg-blue-50 p-3 text-blue-700">
            <ClipboardList size={21} />
          </span>
          <p className="mt-4 text-sm font-medium text-slate-600">Total reports</p>
          <p className="mt-1 text-3xl font-bold text-slate-950">{complaints.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="inline-flex rounded-xl bg-amber-50 p-3 text-amber-700">
            <Clock3 size={21} />
          </span>
          <p className="mt-4 text-sm font-medium text-slate-600">Still being handled</p>
          <p className="mt-1 text-3xl font-bold text-slate-950">{activeCount}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="inline-flex rounded-xl bg-emerald-50 p-3 text-emerald-700">
            <CheckCircle2 size={21} />
          </span>
          <p className="mt-4 text-sm font-medium text-slate-600">Resolved</p>
          <p className="mt-1 text-3xl font-bold text-slate-950">{resolvedCount}</p>
        </article>
        <article className="flex flex-col justify-between rounded-2xl bg-blue-700 p-5 text-white shadow-sm">
          <span className="inline-flex self-start rounded-xl bg-white/15 p-3">
            <Waves size={21} />
          </span>
          <div className="mt-5">
            <p className="font-semibold">Notice a drainage problem?</p>
            <Link
              to="/report"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-blue-800 hover:bg-blue-50"
            >
              <Plus size={17} /> Report it
            </Link>
          </div>
        </article>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Recent complaints</h2>
            <p className="mt-1 text-sm text-slate-600">A quick look at your latest reports.</p>
          </div>
          <Link
            to="/complaints"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>
        {recentComplaints.length ? (
          <div className="mt-5 divide-y divide-slate-100">
            {recentComplaints.map((complaint) => (
              <article
                key={complaint.id}
                className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{complaint.title}</h3>
                    <span className="text-xs text-slate-500">{complaint.id}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{complaint.address}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Reported {formatComplaintDate(complaint.createdAt)}
                  </p>
                </div>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusClass(complaint.status)}`}>
                  {complaint.status}
                </span>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-xl bg-slate-50 px-5 py-10 text-center">
            <p className="font-semibold text-slate-800">No complaints yet</p>
            <p className="mt-1 text-sm text-slate-600">Submit a report to start tracking a drainage issue.</p>
          </div>
        )}
      </section>
    </CitizenLayout>
  );
}
