import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Link, Navigate, NavLink, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { MapContainer, CircleMarker, Popup, TileLayer } from 'react-leaflet';
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock3,
  FileText,
  Flame,
  LayoutDashboard,
  LogOut,
  MapPinned,
  ShieldCheck,
  Upload,
  UserCircle2,
  Users,
  Wrench,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './App.css';
import {
  demoEmployee,
  initialComplaints,
  initialEvidence,
  initialPrevention,
  initialTasks,
} from './data/mockData';
import type {
  Complaint,
  ComplaintStatus,
  DemoSession,
  EvidenceEntry,
  PreventionItem,
  Priority,
  TaskItem,
  TaskStatus,
} from './types';

const STORAGE_KEY = 'drainwatch-municipality-demo';

const priorityClass: Record<Priority, string> = {
  Low: 'priority-low',
  Medium: 'priority-medium',
  High: 'priority-high',
  Critical: 'priority-critical',
};

const statusClass: Record<ComplaintStatus, string> = {
  Reported: 'status-reported',
  Assigned: 'status-assigned',
  'In Progress': 'status-progress',
  'Cleaning Evidence Submitted': 'status-evidence',
  'Awaiting Citizen Acknowledgement': 'status-pending',
  Verified: 'status-verified',
  Reopened: 'status-reopened',
  Disputed: 'status-disputed',
};

const taskClass: Record<TaskStatus, string> = {
  'Due today': 'status-evidence',
  'Due soon': 'status-pending',
  Overdue: 'status-disputed',
  Completed: 'status-verified',
};

const navItems = [
  { to: '/municipality/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/municipality/complaints', label: 'Complaints', icon: FileText },
  { to: '/municipality/tasks', label: 'Tasks', icon: Wrench },
  { to: '/municipality/prevention', label: 'Prevention', icon: ShieldCheck },
  { to: '/municipality/map', label: 'Map', icon: MapPinned },
  { to: '/municipality/evidence', label: 'Evidence', icon: Upload },
  { to: '/municipality/deadlines', label: 'Deadlines', icon: Clock3 },
  { to: '/municipality/feedback', label: 'Feedback', icon: BellRing },
  { to: '/municipality/profile', label: 'Profile', icon: UserCircle2 },
];

const mapCoordinates: Record<string, [number, number]> = {
  'DW-1042': [12.9352, 77.6245],
  'DW-1048': [12.9716, 77.5952],
  'DW-1051': [13.0339, 77.5605],
  'DW-1058': [12.9088, 77.5761],
};

function loadStoredState() {
  if (typeof window === 'undefined') {
    return {
      session: null,
      complaints: initialComplaints,
      tasks: initialTasks,
      prevention: initialPrevention,
      evidence: initialEvidence,
    };
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      session: null,
      complaints: initialComplaints,
      tasks: initialTasks,
      prevention: initialPrevention,
      evidence: initialEvidence,
    };
  }

  try {
    const parsed = JSON.parse(raw) as {
      session: DemoSession | null;
      complaints: Complaint[];
      tasks: TaskItem[];
      prevention: PreventionItem[];
      evidence: EvidenceEntry[];
    };
    return {
      session: parsed.session ?? null,
      complaints: parsed.complaints ?? initialComplaints,
      tasks: parsed.tasks ?? initialTasks,
      prevention: parsed.prevention ?? initialPrevention,
      evidence: parsed.evidence ?? initialEvidence,
    };
  } catch {
    return {
      session: null,
      complaints: initialComplaints,
      tasks: initialTasks,
      prevention: initialPrevention,
      evidence: initialEvidence,
    };
  }
}

function MunicipalityApp() {
  const loaded = loadStoredState();
  const [session, setSession] = useState<DemoSession | null>(loaded.session);
  const [complaints, setComplaints] = useState<Complaint[]>(loaded.complaints);
  const [tasks, setTasks] = useState<TaskItem[]>(loaded.tasks);
  const [prevention, setPrevention] = useState<PreventionItem[]>(loaded.prevention);
  const [evidence, setEvidence] = useState<EvidenceEntry[]>(loaded.evidence);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        session,
        complaints,
        tasks,
        prevention,
        evidence,
      }),
    );
  }, [session, complaints, tasks, prevention, evidence]);

  const handleSignOut = () => {
    setSession(null);
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/municipality/dashboard" replace />} />
      <Route
        path="/municipality/login"
        element={
          session ? (
            <Navigate to="/municipality/dashboard" replace />
          ) : (
            <LoginPage onLogin={setSession} />
          )
        }
      />
      <Route
        path="/municipality/register"
        element={
          session ? (
            <Navigate to="/municipality/dashboard" replace />
          ) : (
            <RegisterPage />
          )
        }
      />

      <Route
        element={
          <ProtectedLayout session={session} onSignOut={handleSignOut} />
        }
      >
        <Route
          path="/municipality/dashboard"
          element={
            <DashboardPage
              complaints={complaints}
              tasks={tasks}
              prevention={prevention}
              evidence={evidence}
            />
          }
        />
        <Route
          path="/municipality/complaints"
          element={<ComplaintsPage complaints={complaints} />}
        />
        <Route
          path="/municipality/complaints/:id"
          element={
            <ComplaintDetailsPage
              complaints={complaints}
              setComplaints={setComplaints}
              setTasks={setTasks}
            />
          }
        />
        <Route
          path="/municipality/tasks"
          element={<TasksPage tasks={tasks} complaints={complaints} />}
        />
        <Route
          path="/municipality/prevention"
          element={
            <PreventionPage
              prevention={prevention}
              setPrevention={setPrevention}
            />
          }
        />
        <Route
          path="/municipality/map"
          element={<MapPage complaints={complaints} />}
        />
        <Route
          path="/municipality/evidence"
          element={
            <EvidencePage
              complaints={complaints}
              evidence={evidence}
              setComplaints={setComplaints}
              setEvidence={setEvidence}
            />
          }
        />
        <Route
          path="/municipality/deadlines"
          element={<DeadlinesPage tasks={tasks} complaints={complaints} />}
        />
        <Route
          path="/municipality/feedback"
          element={
            <FeedbackPage
              complaints={complaints}
              evidence={evidence}
              setComplaints={setComplaints}
            />
          }
        />
        <Route
          path="/municipality/profile"
          element={<ProfilePage session={session} onSignOut={handleSignOut} />}
        />
      </Route>
    </Routes>
  );
}

function ProtectedLayout({
  session,
  onSignOut,
}: {
  session: DemoSession | null;
  onSignOut: () => void;
}) {
  if (!session) {
    return <Navigate to="/municipality/login" replace />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">DW</div>
          <div>
            <p className="eyebrow">Municipality</p>
            <h2>DrainWatch</h2>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className="nav-link">
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-card">
          <p className="eyebrow">Demo credential</p>
          <strong>{session.employeeName}</strong>
          <span>{session.role}</span>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Municipality employee portal</p>
            <h1>Drainage operations overview</h1>
          </div>
          <div className="topbar-actions">
            <button type="button" className="secondary-button small-button">
              <BellRing size={15} />
              Alerts
            </button>
            <button type="button" className="secondary-button small-button" onClick={onSignOut}>
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </header>
        <div className="content-wrap">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function LoginPage({ onLogin }: { onLogin: (session: DemoSession) => void }) {
  const [form, setForm] = useState({ email: '', employeeId: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (field: 'email' | 'employeeId' | 'password', value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.email || !form.employeeId || !form.password) {
      setError('Please complete all required fields.');
      return;
    }

    setError('');
    onLogin({
      employeeName: demoEmployee.employeeName,
      email: form.email,
      employeeId: form.employeeId,
      role: demoEmployee.role,
    });
    navigate('/municipality/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand-block brand-inline">
          <div className="brand-mark">DW</div>
          <div>
            <p className="eyebrow">Municipality portal</p>
            <h2>DrainWatch</h2>
          </div>
        </div>

        <div className="auth-alert">
          Demo access only. Production sign-in must be verified by the municipality.
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Employee email
            <input
              type="email"
              value={form.email}
              onChange={(event) => handleChange('email', event.target.value)}
              placeholder="name@municipality.gov"
            />
          </label>

          <label>
            Employee ID
            <input
              type="text"
              value={form.employeeId}
              onChange={(event) => handleChange('employeeId', event.target.value)}
              placeholder="MW-2048"
            />
          </label>

          <label>
            Password
            <div className="password-row">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(event) => handleChange('password', event.target.value)}
                placeholder="Enter password"
              />
              <button type="button" className="ghost-button" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          {error ? <div className="inline-error">{error}</div> : null}

          <button type="submit" className="primary-button full-width">
            Log in
          </button>

          <div className="auth-footnote">
            Need access? <Link to="/municipality/register">Request employee registration</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    employeeId: '',
    department: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.employeeId || !form.department || !form.password) {
      setError('All fields are required for access request.');
      return;
    }

    setError('');
    setSubmitted(true);
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="brand-block brand-inline">
          <div className="brand-mark">DW</div>
          <div>
            <p className="eyebrow">Employee access</p>
            <h2>Request registration</h2>
          </div>
        </div>

        <div className="auth-alert warning">
          New accounts remain pending verification. They are not automatically trusted.
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Full name"
            />
          </label>

          <label>
            Email address
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="name@municipality.gov"
            />
          </label>

          <label>
            Employee ID
            <input
              value={form.employeeId}
              onChange={(event) => setForm((current) => ({ ...current, employeeId: event.target.value }))}
              placeholder="MW-2048"
            />
          </label>

          <label>
            Department
            <input
              value={form.department}
              onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))}
              placeholder="Stormwater Management"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Create password"
            />
          </label>

          {error ? <div className="inline-error">{error}</div> : null}
          {submitted ? (
            <div className="success-box">
              Your access request has been submitted for verification. The municipality must approve it before production access is granted.
            </div>
          ) : null}

          <button type="submit" className="primary-button full-width">
            Submit access request
          </button>

          <div className="auth-footnote">
            Already have access? <Link to="/municipality/login">Return to login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function DashboardPage({
  complaints,
  tasks,
  prevention,
  evidence,
}: {
  complaints: Complaint[];
  tasks: TaskItem[];
  prevention: PreventionItem[];
  evidence: EvidenceEntry[];
}) {
  const openCount = complaints.filter(
    (complaint) => !['Verified', 'Reopened'].includes(complaint.status),
  ).length;
  const highPriority = complaints.filter(
    (complaint) => complaint.priority === 'High' || complaint.priority === 'Critical',
  ).length;
  const dueToday = tasks.filter((task) => task.status === 'Due today').length;
  const overdue = tasks.filter((task) => task.status === 'Overdue').length;
  const completed = complaints.filter((complaint) => complaint.status === 'Verified').length;
  const acknowledgementsPending = complaints.filter(
    (complaint) => complaint.status === 'Awaiting Citizen Acknowledgement',
  ).length;
  const upcomingInspections = prevention.filter((item) => item.status !== 'Completed').length;

  const recentActivity = useMemo(
    () => complaints.flatMap((complaint) => complaint.activity).slice(0, 4),
    [complaints],
  );

  const stats = [
    { label: 'Total open complaints', value: openCount, note: 'Across all priority levels', icon: FileText },
    { label: 'High priority issues', value: highPriority, note: 'Needs urgent follow-up', icon: Flame },
    { label: 'Tasks due today', value: dueToday, note: 'Planned maintenance today', icon: Clock3 },
    { label: 'Overdue tasks', value: overdue, note: 'Escalate and review', icon: AlertTriangle },
    { label: 'Completed cleanings', value: completed, note: 'Verified service actions', icon: CheckCircle2 },
    { label: 'Citizen acknowledgements pending', value: acknowledgementsPending, note: 'Awaiting response', icon: Users },
    { label: 'Upcoming rainfall checks', value: upcomingInspections, note: 'Pre-rain inspections', icon: ShieldCheck },
  ];

  return (
    <div className="page-section">
      <div className="page-header-row">
        <div>
          <p className="eyebrow">Operations summary</p>
          <h2>Municipality dashboard</h2>
        </div>
        <Link to="/municipality/complaints" className="primary-button">
          Review complaints
        </Link>
      </div>

      <div className="stats-grid">
        {stats.map(({ label, value, note, icon: Icon }) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon">
              <Icon size={18} />
            </div>
            <div>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
              <div className="stat-note">{note}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="panel-card wide-panel">
          <div className="panel-header">
            <h3>Recent activity</h3>
            <Link to="/municipality/complaints">View all</Link>
          </div>
          <ul className="activity-list">
            {recentActivity.map((activity) => (
              <li key={activity.id}>
                <div className="activity-dot" />
                <div>
                  <strong>{activity.text}</strong>
                  <span>{activity.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h3>Quick actions</h3>
          </div>
          <div className="quick-action-list">
            <Link to="/municipality/complaints" className="secondary-button">
              View complaints
            </Link>
            <Link to="/municipality/prevention" className="secondary-button">
              Create inspection task
            </Link>
            <Link to="/municipality/evidence" className="secondary-button">
              Upload cleaning evidence
            </Link>
          </div>
        </div>

        <div className="panel-card wide-panel">
          <div className="panel-header">
            <h3>Risk map snapshot</h3>
            <Link to="/municipality/map">Open map</Link>
          </div>
          <div className="map-summary-list">
            {complaints.slice(0, 3).map((complaint) => (
              <div key={complaint.id} className="map-summary-row">
                <span className={`status-badge ${statusClass[complaint.status]}`}>{complaint.status}</span>
                <div>
                  <strong>{complaint.location}</strong>
                  <small>{complaint.id}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-header">
          <h3>Evidence in review</h3>
          <span>{evidence.length} total</span>
        </div>
        <div className="evidence-summary-list">
          {evidence.map((item) => (
            <div key={item.id} className="summary-item">
              <strong>{item.complaintId}</strong>
              <span>{item.employeeName}</span>
              <span>{item.reviewStatus}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComplaintsPage({ complaints }: { complaints: Complaint[] }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesQuery =
      complaint.id.toLowerCase().includes(query.toLowerCase()) ||
      complaint.title.toLowerCase().includes(query.toLowerCase()) ||
      complaint.location.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'All' || complaint.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || complaint.priority === priorityFilter;
    const matchesLocation = locationFilter === 'All' || complaint.location === locationFilter;

    return matchesQuery && matchesStatus && matchesPriority && matchesLocation;
  });

  const locations = ['All', ...new Set(complaints.map((complaint) => complaint.location))];

  return (
    <div className="page-section">
      <div className="page-header-row">
        <div>
          <p className="eyebrow">Complaint management</p>
          <h2>Drainage complaints</h2>
        </div>
      </div>

      <div className="filters-row">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by ID, summary, or area"
        />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="All">All statuses</option>
          {Object.keys(statusClass).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
          <option value="All">All priorities</option>
          {Object.keys(priorityClass).map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
        <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location === 'All' ? 'All locations' : location}
            </option>
          ))}
        </select>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Issue</th>
              <th>Location</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Deadline</th>
              <th>Assigned</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.length ? (
              filteredComplaints.map((complaint) => (
                <tr key={complaint.id}>
                  <td>{complaint.id}</td>
                  <td>{complaint.title}</td>
                  <td>{complaint.location}</td>
                  <td>
                    <span className={`status-badge ${priorityClass[complaint.priority]}`}>
                      {complaint.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${statusClass[complaint.status]}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td>{complaint.deadline}</td>
                  <td>{complaint.assignedTo}</td>
                  <td>
                    <Link to={`/municipality/complaints/${complaint.id}`} className="link-button">
                      Open
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="empty-cell">
                  No complaints match the current search and filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ComplaintDetailsPage({
  complaints,
  setComplaints,
  setTasks,
}: {
  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const complaint = complaints.find((item) => item.id === id);
  const [status, setStatus] = useState<ComplaintStatus>(complaint?.status ?? 'Reported');
  const [deadline, setDeadline] = useState(complaint?.deadline ?? '');

  useEffect(() => {
    if (complaint) {
      setStatus(complaint.status);
      setDeadline(complaint.deadline);
    }
  }, [complaint]);

  if (!complaint) {
    return <div className="page-section"><div className="panel-card">Complaint not found.</div></div>;
  }

  const saveDetails = () => {
    setComplaints((current) =>
      current.map((item) => {
        if (item.id !== complaint.id) return item;
        const updatedActivity = [
          ...item.activity,
          {
            id: `log-${Date.now()}`,
            time: new Date().toLocaleString(),
            text: `Status updated to ${status} and deadline adjusted to ${deadline}.`,
            actor: demoEmployee.employeeName,
          },
        ];

        return { ...item, status, deadline, activity: updatedActivity };
      }),
    );

    setTasks((current) =>
      current.map((task) =>
        task.complaintId === complaint.id ? { ...task, dueDate: deadline } : task,
      ),
    );

    navigate('/municipality/complaints');
  };

  return (
    <div className="page-section">
      <div className="page-header-row">
        <div>
          <p className="eyebrow">Complaint details</p>
          <h2>{complaint.title}</h2>
        </div>
        <Link to="/municipality/complaints" className="secondary-button">
          Back to list
        </Link>
      </div>

      <div className="detail-grid">
        <div className="panel-card detail-main">
          <img src={complaint.image} alt={complaint.title} className="detail-image" />

          <div className="detail-meta">
            <div>
              <span className="meta-label">Complaint ID</span>
              <strong>{complaint.id}</strong>
            </div>
            <div>
              <span className="meta-label">Location</span>
              <strong>{complaint.location}</strong>
            </div>
            <div>
              <span className="meta-label">Priority</span>
              <span className={`status-badge ${priorityClass[complaint.priority]}`}>{complaint.priority}</span>
            </div>
          </div>

          <p>{complaint.description}</p>

          <div className="detail-actions">
            <label>
              Complaint status
              <select value={status} onChange={(event) => setStatus(event.target.value as ComplaintStatus)}>
                {Object.keys(statusClass).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Deadline
              <input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
            </label>
          </div>

          <button type="button" className="primary-button" onClick={saveDetails}>
            Save complaint update
          </button>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h3>Activity history</h3>
          </div>
          <ul className="activity-list">
            {complaint.activity.map((entry) => (
              <li key={entry.id}>
                <div className="activity-dot" />
                <div>
                  <strong>{entry.text}</strong>
                  <span>{entry.actor} • {entry.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function TasksPage({ tasks, complaints }: { tasks: TaskItem[]; complaints: Complaint[] }) {
  return (
    <div className="page-section">
      <div className="page-header-row">
        <div>
          <p className="eyebrow">Assigned work</p>
          <h2>Cleaning and inspection tasks</h2>
        </div>
      </div>

      <div className="task-grid">
        {tasks.map((task) => {
          const complaint = complaints.find((item) => item.id === task.complaintId);
          return (
            <div key={task.id} className="panel-card task-card">
              <div className="task-head">
                <div>
                  <span className="meta-label">{task.id}</span>
                  <h3>{task.title}</h3>
                </div>
                <span className={`status-badge ${taskClass[task.status]}`}>{task.status}</span>
              </div>
              <div className="task-meta">
                <span>{task.team}</span>
                <span>{complaint?.location ?? 'Unknown location'}</span>
                <span>Due {task.dueDate}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PreventionPage({
  prevention,
  setPrevention,
}: {
  prevention: PreventionItem[];
  setPrevention: React.Dispatch<React.SetStateAction<PreventionItem[]>>;
}) {
  const handleAction = (id: string, status: PreventionItem['status']) => {
    setPrevention((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  };

  return (
    <div className="page-section">
      <div className="page-header-row">
        <div>
          <p className="eyebrow">Pre-rain prevention</p>
          <h2>Vulnerable drainage locations</h2>
        </div>
      </div>

      <div className="prevention-grid">
        {prevention.map((item) => (
          <div key={item.id} className="panel-card prevention-card">
            <div className="task-head">
              <div>
                <span className="meta-label">{item.id}</span>
                <h3>{item.location}</h3>
              </div>
              <span className={`status-badge ${item.riskLevel === 'High' ? 'priority-high' : 'priority-medium'}`}>
                {item.riskLevel} risk
              </span>
            </div>

            <p>{item.reason}</p>
            <div className="task-meta vertical">
              <span>Last inspection: {item.lastInspection}</span>
              <span>Next inspection: {item.nextInspection}</span>
              <span>Assigned team: {item.assignedTeam}</span>
              <span>Status: {item.status}</span>
            </div>

            <div className="quick-action-list compact-action-list">
              <button type="button" className="secondary-button" onClick={() => handleAction(item.id, 'Scheduled')}>
                Schedule
              </button>
              <button type="button" className="secondary-button" onClick={() => handleAction(item.id, 'Completed')}>
                Mark complete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapPage({ complaints }: { complaints: Complaint[] }) {
  return (
    <div className="page-section">
      <div className="page-header-row">
        <div>
          <p className="eyebrow">Location overview</p>
          <h2>Drainage map</h2>
        </div>
      </div>

      <div className="panel-card map-panel">
        <MapContainer center={[12.9716, 77.5946]} zoom={11} scrollWheelZoom className="map-view">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {complaints.map((complaint) => {
            const position = mapCoordinates[complaint.id] ?? [12.9716, 77.5946];
            const color =
              complaint.priority === 'Critical'
                ? '#ef4444'
                : complaint.priority === 'High'
                  ? '#f59e0b'
                  : complaint.status === 'Verified'
                    ? '#10b981'
                    : '#2563eb';

            return (
              <CircleMarker key={complaint.id} center={position} pathOptions={{ color, fillColor: color }} radius={14}>
                <Popup>
                  <div className="popup-card">
                    <strong>{complaint.id}</strong>
                    <span>{complaint.location}</span>
                    <span>{complaint.status}</span>
                    <Link to={`/municipality/complaints/${complaint.id}`}>Open details</Link>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

function EvidencePage({
  complaints,
  evidence,
  setComplaints,
  setEvidence,
}: {
  complaints: Complaint[];
  evidence: EvidenceEntry[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  setEvidence: React.Dispatch<React.SetStateAction<EvidenceEntry[]>>;
}) {
  const [selectedComplaintId, setSelectedComplaintId] = useState(complaints[0]?.id ?? '');
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const handlePreview = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const submitEvidence = () => {
    if (!selectedComplaintId || !description) {
      setMessage('Please select a complaint and add a cleaning description.');
      return;
    }

    if (!previewUrl) {
      setMessage('Upload a cleaning photograph before submitting evidence.');
      return;
    }

    const newEvidence: EvidenceEntry = {
      id: `E-${Date.now()}`,
      complaintId: selectedComplaintId,
      employeeName: demoEmployee.employeeName,
      submittedAt: new Date().toISOString(),
      description,
      imageUrl: previewUrl,
      reviewStatus: 'Pending review',
    };

    setEvidence((current) => [newEvidence, ...current]);
    setComplaints((current) =>
      current.map((item) =>
        item.id === selectedComplaintId
          ? {
              ...item,
              status: 'Cleaning Evidence Submitted',
              activity: [
                ...item.activity,
                {
                  id: `activity-${Date.now()}`,
                  time: new Date().toLocaleString(),
                  text: 'Cleaning evidence uploaded and pending review.',
                  actor: demoEmployee.employeeName,
                },
              ],
            }
          : item,
      ),
    );
    setMessage('Evidence submitted to the municipality review queue. It is not automatically verified.');
    setDescription('');
    setPreviewUrl(null);
  };

  return (
    <div className="page-section">
      <div className="page-header-row">
        <div>
          <p className="eyebrow">Evidence review</p>
          <h2>Cleaning evidence upload</h2>
        </div>
      </div>

      <div className="detail-grid">
        <div className="panel-card">
          <label>
            Complaint or task
            <select value={selectedComplaintId} onChange={(event) => setSelectedComplaintId(event.target.value)}>
              {complaints.map((complaint) => (
                <option key={complaint.id} value={complaint.id}>
                  {complaint.id} — {complaint.location}
                </option>
              ))}
            </select>
          </label>

          <label>
            Cleaning description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              placeholder="Describe what was cleared, collected, or restored."
            />
          </label>

          <label>
            Upload photograph
            <input type="file" accept="image/*" onChange={handlePreview} />
          </label>

          {previewUrl ? <img src={previewUrl} alt="Selected evidence preview" className="upload-preview" /> : null}

          {message ? <div className="success-box">{message}</div> : null}

          <button type="button" className="primary-button" onClick={submitEvidence}>
            Submit evidence
          </button>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h3>Submitted evidence</h3>
          </div>
          <div className="evidence-list">
            {evidence.map((item) => (
              <div key={item.id} className="summary-item">
                <strong>{item.complaintId}</strong>
                <span>{item.employeeName}</span>
                <span>{item.reviewStatus}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DeadlinesPage({ tasks, complaints }: { tasks: TaskItem[]; complaints: Complaint[] }) {
  const rows = tasks.map((task) => ({
    ...task,
    complaint: complaints.find((item) => item.id === task.complaintId),
  }));

  return (
    <div className="page-section">
      <div className="page-header-row">
        <div>
          <p className="eyebrow">Accountability tracking</p>
          <h2>Deadline management</h2>
        </div>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Issue</th>
              <th>Team</th>
              <th>Due date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((task) => (
              <tr key={task.id}>
                <td>{task.id}</td>
                <td>{task.complaint?.title ?? task.title}</td>
                <td>{task.team}</td>
                <td>{task.dueDate}</td>
                <td>
                  <span className={`status-badge ${taskClass[task.status]}`}>{task.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeedbackPage({
  complaints,
  evidence,
  setComplaints,
}: {
  complaints: Complaint[];
  evidence: EvidenceEntry[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
}) {
  const handleResult = (complaintId: string, result: 'Verified' | 'Reopened') => {
    setComplaints((current) =>
      current.map((item) =>
        item.id === complaintId
          ? {
              ...item,
              status: result,
              activity: [
                ...item.activity,
                {
                  id: `feedback-${Date.now()}`,
                  time: new Date().toLocaleString(),
                  text: result === 'Verified' ? 'Citizen acknowledgement received for this case.' : 'Citizen disputed the completed work and reopened the complaint.',
                  actor: 'Citizen response simulation',
                },
              ],
            }
          : item,
      ),
    );
  };

  return (
    <div className="page-section">
      <div className="page-header-row">
        <div>
          <p className="eyebrow">Citizen follow-up</p>
          <h2>Feedback and acknowledgements</h2>
        </div>
      </div>

      <div className="feedback-grid">
        {evidence.map((item) => {
          const complaint = complaints.find((entry) => entry.id === item.complaintId);
          return (
            <div key={item.id} className="panel-card feedback-card">
              <div className="task-head">
                <div>
                  <span className="meta-label">{item.complaintId}</span>
                  <h3>{complaint?.title ?? 'Drainage complaint'}</h3>
                </div>
                <span className={`status-badge ${statusClass[complaint?.status ?? 'Reported']}`}>
                  {complaint?.status ?? 'Reported'}
                </span>
              </div>

              <p>{item.description}</p>

              <div className="quick-action-list compact-action-list">
                <button type="button" className="secondary-button" onClick={() => handleResult(item.complaintId, 'Verified')}>
                  Mark acknowledged
                </button>
                <button type="button" className="secondary-button" onClick={() => handleResult(item.complaintId, 'Reopened')}>
                  Flag dispute
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfilePage({
  session,
  onSignOut,
}: {
  session: DemoSession | null;
  onSignOut: () => void;
}) {
  return (
    <div className="page-section">
      <div className="page-header-row">
        <div>
          <p className="eyebrow">Employee profile</p>
          <h2>{session?.employeeName ?? 'Municipality employee'}</h2>
        </div>
      </div>

      <div className="panel-card profile-card">
        <div className="profile-row">
          <div className="profile-avatar">
            <UserCircle2 size={50} />
          </div>
          <div>
            <strong>{session?.employeeName}</strong>
            <span>{session?.role}</span>
          </div>
        </div>

        <div className="profile-grid">
          <div><span>Email</span><strong>{session?.email}</strong></div>
          <div><span>Employee ID</span><strong>{session?.employeeId}</strong></div>
          <div><span>Department</span><strong>Stormwater Management</strong></div>
          <div><span>Account status</span><strong>Demo pending verification</strong></div>
        </div>

        <button type="button" className="primary-button" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MunicipalityApp />
    </BrowserRouter>
  );
}

export default App;
