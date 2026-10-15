import {
  ClipboardList,
  Droplets,
  Home,
  LogOut,
  MapPin,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useCitizenData } from "./CitizenStore";

const navigation = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/report", label: "Report an issue", icon: PlusCircle },
  { to: "/complaints", label: "My complaints", icon: ClipboardList },
  { to: "/map", label: "Nearby map", icon: MapPin },
  { to: "/verification", label: "Verify cleaning", icon: ShieldCheck },
];

export default function CitizenLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: import("react").ReactNode;
}) {
  const { citizenName, signOut } = useCitizenData();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3" aria-label="DrainWatch home">
            <span className="rounded-xl bg-blue-600 p-2 text-white">
              <Droplets size={23} />
            </span>
            <span>
              <span className="block text-lg font-bold text-slate-900">DrainWatch</span>
              <span className="text-xs text-slate-500">Citizen services</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">
              Hello, <strong className="text-slate-900">{citizenName}</strong>
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
        <nav
          aria-label="Citizen navigation"
          className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6"
        >
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-700">DrainWatch citizen portal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
          <p className="mt-2 max-w-2xl leading-6 text-slate-600">{description}</p>
        </div>
        {children}
      </main>
      <footer className="border-t border-slate-200 bg-white px-4 py-5 text-center text-sm text-slate-500">
        DrainWatch · Demonstration frontend using sample data stored in this browser
      </footer>
    </div>
  );
}
