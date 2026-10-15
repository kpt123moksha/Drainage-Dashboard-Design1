import { useState, type FormEvent } from "react";
import { CheckCheck } from "lucide-react";
import CitizenLayout from "./CitizenLayout";
import { formatComplaintDate, useCitizenData } from "./CitizenStore";

export default function CleaningVerificationPage() {
  const { complaints, submitVerification } = useCitizenData();
  const resolved = complaints.filter((complaint) => complaint.status === "Resolved");
  const [selectedId, setSelectedId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!selectedId) {
      setError("Choose a completed report first.");
      return;
    }
    try {
      submitVerification(selectedId, feedback);
      setNotice("Your feedback has been saved in this browser.");
      setFeedback("");
    } catch (submitError) {
      console.error("Could not save cleaning verification.", submitError);
      setError("Could not save feedback in this browser. Please try again.");
    }
  }

  return (
    <CitizenLayout title="Verify cleaning work" description="Tell us whether the reported drain appears to have been cleaned. Your response is saved locally in this demo.">
      {resolved.length ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="space-y-4">
            {resolved.map((complaint) => (
              <article key={complaint.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><CheckCheck size={21} /></span>
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">Marked resolved · {complaint.id}</p>
                    <h2 className="mt-1 font-bold text-slate-950">{complaint.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{complaint.address}</p>
                    <p className="mt-1 text-xs text-slate-500">Reported {formatComplaintDate(complaint.createdAt)}</p>
                    {complaint.verification && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Your feedback: {complaint.verification}</p>}
                  </div>
                </div>
              </article>
            ))}
          </section>
          <form onSubmit={handleSubmit} className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-950">Leave feedback</h2>
            <label className="mt-5 block text-sm font-semibold text-slate-800">
              Completed report
              <select required value={selectedId} onChange={(event) => setSelectedId(event.currentTarget.value)} className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal">
                <option value="">Choose a report</option>
                {resolved.map((complaint) => <option key={complaint.id} value={complaint.id}>{complaint.id} — {complaint.title}</option>)}
              </select>
            </label>
            <label className="mt-4 block text-sm font-semibold text-slate-800">
              Did the cleaning resolve the issue?
              <textarea required minLength={3} maxLength={500} rows={4} value={feedback} onChange={(event) => setFeedback(event.currentTarget.value)} placeholder="Share what you observed..." className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-3 font-normal" />
            </label>
            {notice && <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
            {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button type="submit" className="mt-5 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800">Save feedback</button>
          </form>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <h2 className="font-semibold text-slate-900">Nothing to verify yet</h2>
          <p className="mt-2 text-sm text-slate-600">When a complaint is marked resolved, it will appear here for your review.</p>
        </div>
      )}
    </CitizenLayout>
  );
}
