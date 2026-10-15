import { Link } from "react-router-dom";
import {
  MapPin,
  Camera,
  ClipboardList,
  ShieldCheck,
  CloudRain,
  ArrowRight,
  Droplets,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Report Blockages",
    description: "Upload a photo and report blocked drains in your neighbourhood.",
  },
  {
    icon: ClipboardList,
    title: "Track Progress",
    description: "Follow your complaints from reporting to cleaning completion.",
  },
  {
    icon: MapPin,
    title: "Explore Nearby Issues",
    description: "Discover drainage problems and risk areas around you.",
  },
  {
    icon: ShieldCheck,
    title: "Cleaner Communities",
    description: "Help your municipality keep roads and drains clean.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="rounded-xl bg-blue-600 p-2 text-white">
              <Droplets size={25} />
            </span>
            <span>
              <span className="block text-xl font-bold text-slate-900">
                DrainWatch
              </span>
              <span className="text-xs text-slate-500">
                Cleaner Drains, Safer Tomorrow
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <a href="#home" className="text-sm font-medium hover:text-blue-600">
              Home
            </a>
            <a href="#features" className="text-sm font-medium hover:text-blue-600">
              About
            </a>
            <Link to="/map" className="text-sm font-medium hover:text-blue-600">
              Nearby Map
            </Link>
            <Link to="/dashboard" className="text-sm font-medium hover:text-blue-600">
              Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:block"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section
          id="home"
          className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700"
        >
          <div className="pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:py-28">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-blue-100">
                <Droplets size={16} />
                Community-powered drainage monitoring
              </div>

              <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Report Drainage Blockages{" "}
                <span className="text-cyan-300">Before It Rains.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-blue-100">
                Help keep your city clean and prevent waterlogging. Report
                blocked drains, share photos and track cleaning progress in
                your neighbourhood.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  to="/report"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 font-bold text-slate-950 shadow-lg transition hover:bg-cyan-300"
                >
                  Report an Issue <ArrowRight size={19} />
                </Link>
                <Link
                  to="/map"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 font-semibold text-white transition hover:bg-white/20"
                >
                  <MapPin size={19} /> View Nearby Issues
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-blue-100">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-cyan-300" />
                  Simple reporting
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-cyan-300" />
                  Progress tracking
                </span>
              </div>
            </div>

            <div className="mx-auto w-full max-w-lg">
              <div className="rounded-3xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-md sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-100">Community alert</p>
                    <h2 className="mt-1 text-xl font-bold text-white">
                      Stay prepared for rain
                    </h2>
                  </div>
                  <span className="rounded-2xl bg-cyan-300/20 p-3 text-cyan-200">
                    <CloudRain size={30} />
                  </span>
                </div>

                <div className="mt-6 rounded-2xl bg-white p-5">
                  <div className="flex items-start gap-3">
                    <span className="rounded-xl bg-orange-100 p-3 text-orange-600">
                      <CloudRain size={25} />
                    </span>
                    <div>
                      <p className="font-bold text-slate-800">
                        Check drainage conditions
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Identify blocked drains and report them before heavy
                        rainfall causes waterlogging.
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/map"
                    className="mt-5 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3 font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    Explore drainage map <ArrowRight size={18} />
                  </Link>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-white/10 p-3">
                    <Camera className="mx-auto text-cyan-200" size={22} />
                    <p className="mt-2 text-xs font-medium text-white">
                      Report
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3">
                    <ClipboardList className="mx-auto text-cyan-200" size={22} />
                    <p className="mt-2 text-xs font-medium text-white">
                      Track
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3">
                    <ShieldCheck className="mx-auto text-cyan-200" size={22} />
                    <p className="mt-2 text-xs font-medium text-white">
                      Verify
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-5 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              How DrainWatch helps
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Small reports. Safer streets.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Work together with your local municipality to make drainage
              problems visible and cleaning progress transparent.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <span className="inline-flex rounded-xl bg-blue-50 p-3 text-blue-700">
                    <Icon size={25} />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Droplets size={20} className="text-blue-600" />
            DrainWatch
          </div>
          <p className="text-sm text-slate-500">
            Cleaner Drains, Safer Tomorrow · Community drainage reporting
          </p>
        </div>
      </footer>
    </div>
  );
}