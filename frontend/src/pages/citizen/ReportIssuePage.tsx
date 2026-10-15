import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import CitizenLayout from "./CitizenLayout";
import { useCitizenData } from "./CitizenStore";

export default function ReportIssuePage() {
  const { addComplaint } = useCitizenData();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [photoName, setPhotoName] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      addComplaint({
        title: String(form.get("title")).trim(),
        description: String(form.get("description")).trim(),
        address: String(form.get("address")).trim(),
        category: String(form.get("category")),
        photoName: photoName || undefined,
      });
      navigate("/complaints", { state: { notice: "Your report was saved in this browser." } });
    } catch (submitError) {
      console.error("Could not save the drainage report.", submitError);
      setError("The report could not be saved in this browser. Please try again.");
    }
  }

  return (
    <CitizenLayout
      title="Report a drainage issue"
      description="Share what is happening and where. This demo saves your report to this browser only."
    >
      <form onSubmit={handleSubmit} className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800">
            Issue type
            <select
              name="category"
              required
              defaultValue=""
              className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal"
            >
              <option value="" disabled>Select an issue</option>
              <option>Blocked drain</option>
              <option>Overflowing drain</option>
              <option>Damaged drain cover</option>
              <option>Debris / litter</option>
              <option>Other</option>
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Short title
            <input
              name="title"
              required
              maxLength={90}
              placeholder="For example, blocked drain near the bus stop"
              className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800 sm:col-span-2">
            Location or nearby landmark
            <input
              name="address"
              required
              maxLength={160}
              placeholder="Street, area, ward, or a nearby landmark"
              className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800 sm:col-span-2">
            Describe the problem
            <textarea
              name="description"
              required
              minLength={10}
              maxLength={1000}
              rows={5}
              placeholder="Tell us what you noticed and when it started."
              className="mt-2 block w-full resize-y rounded-lg border border-slate-300 px-3 py-3 font-normal"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800 sm:col-span-2">
            Photo (optional)
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setPhotoName(event.currentTarget.files?.[0]?.name ?? "")}
              className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2 font-normal file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-700"
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">
              {photoName ? `${photoName} selected (the image itself is not uploaded).` : "The filename is saved; image upload is not connected to a server."}
            </span>
          </label>
        </div>
        {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="mt-7 flex flex-wrap gap-3">
          <button type="submit" className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800">
            Submit report
          </button>
          <button type="button" onClick={() => navigate("/dashboard")} className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </form>
    </CitizenLayout>
  );
}
