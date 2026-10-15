import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Droplets } from "lucide-react";
import { useCitizenData } from "./CitizenStore";

export default function LoginPage() {
  const { setCitizenName } = useCitizenData();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email")).trim();
    const name = email.split("@")[0]?.replace(/[._-]+/g, " ") || "Citizen";
    try {
      setCitizenName(name.replace(/\b\w/g, (letter) => letter.toUpperCase()));
      navigate("/dashboard");
    } catch (submitError) {
      console.error("Could not save the demo citizen session.", submitError);
      setError("Could not save this demo session in your browser.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Link to="/" className="inline-flex items-center gap-2 font-bold text-slate-900"><Droplets className="text-blue-700" /> DrainWatch</Link>
        <h1 className="mt-8 text-2xl font-bold text-slate-950">Citizen login</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Demo mode only. Your email is used to personalize this browser session; there is no real authentication.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <label className="block text-sm font-semibold text-slate-800">
            Email address
            <input name="email" type="email" autoComplete="email" required className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-3 font-normal" placeholder="you@example.com" />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Password
            <input name="password" type="password" autoComplete="current-password" required minLength={4} className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-3 font-normal" placeholder="Any 4 or more characters" />
          </label>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800">Continue to dashboard</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">New to DrainWatch? <Link to="/register" className="font-semibold text-blue-700 hover:underline">Create an account</Link></p>
      </section>
    </main>
  );
}
