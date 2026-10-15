import { useState, type FormEvent } from "react";
import { Droplets } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCitizenData } from "./CitizenStore";

export default function RegisterPage() {
  const { setCitizenName } = useCitizenData();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    if (password !== String(data.get("confirmPassword"))) {
      setError("The passwords do not match.");
      return;
    }
    try {
      setCitizenName(String(data.get("name")).trim());
      navigate("/dashboard");
    } catch (submitError) {
      console.error("Could not save the demo citizen session.", submitError);
      setError("Could not save this demo session in your browser.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Link to="/" className="inline-flex items-center gap-2 font-bold text-slate-900"><Droplets className="text-blue-700" /> DrainWatch</Link>
        <h1 className="mt-8 text-2xl font-bold text-slate-950">Create a citizen profile</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">This demo stores your display name in this browser only. No account is sent to a server.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-slate-800">Full name<input name="name" required maxLength={80} autoComplete="name" className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-3 font-normal" /></label>
          <label className="block text-sm font-semibold text-slate-800">Email address<input name="email" type="email" required autoComplete="email" className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-3 font-normal" /></label>
          <label className="block text-sm font-semibold text-slate-800">Password<input name="password" type="password" required minLength={6} autoComplete="new-password" className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-3 font-normal" /></label>
          <label className="block text-sm font-semibold text-slate-800">Confirm password<input name="confirmPassword" type="password" required minLength={6} autoComplete="new-password" className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-3 font-normal" /></label>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800">Create demo profile</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">Already have a profile? <Link to="/login" className="font-semibold text-blue-700 hover:underline">Log in</Link></p>
      </section>
    </main>
  );
}
