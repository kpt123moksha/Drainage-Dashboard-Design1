PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY,
  full_name TEXT NOT NULL CHECK(length(trim(full_name)) BETWEEN 2 AND 120),
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'CITIZEN'
    CHECK(role IN ('CITIZEN','MUNICIPAL_EMPLOYEE','ADMIN')),
  account_status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK(account_status IN ('ACTIVE','PENDING','SUSPENDED')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS employees (
  employee_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE RESTRICT,
  municipal_employee_code TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  approval_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK(approval_status IN ('PENDING','APPROVED','REJECTED')),
  approved_by INTEGER REFERENCES users(user_id) ON DELETE RESTRICT,
  approved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS drainage_locations (
  drain_id INTEGER PRIMARY KEY,
  location_name TEXT NOT NULL,
  latitude REAL NOT NULL CHECK(latitude BETWEEN -90 AND 90),
  longitude REAL NOT NULL CHECK(longitude BETWEEN -180 AND 180),
  elevation_meters REAL,
  drain_type TEXT NOT NULL DEFAULT 'STORM_DRAIN',
  known_risk_level TEXT NOT NULL DEFAULT 'MEDIUM'
    CHECK(known_risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  is_low_lying INTEGER NOT NULL DEFAULT 0 CHECK(is_low_lying IN (0,1)),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS complaints (
  complaint_id INTEGER PRIMARY KEY,
  public_tracking_code TEXT NOT NULL UNIQUE,
  citizen_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  drain_id INTEGER REFERENCES drainage_locations(drain_id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK(category IN (
    'BLOCKED_DRAIN','STAGNANT_WATER','DAMAGED_DRAINAGE','WATERLOGGING_RISK','OTHER'
  )),
  description TEXT NOT NULL DEFAULT '',
  latitude REAL NOT NULL CHECK(latitude BETWEEN -90 AND 90),
  longitude REAL NOT NULL CHECK(longitude BETWEEN -180 AND 180),
  severity TEXT NOT NULL DEFAULT 'MEDIUM' CHECK(severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK(status IN (
    'SUBMITTED','UNDER_REVIEW','ASSIGNED','IN_PROGRESS','CLEANING_SUBMITTED',
    'AWAITING_VERIFICATION','RESOLVED','DISPUTED','REOPENED','REJECTED','CANCELLED'
  )),
  deadline_at TEXT,
  resolved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS complaint_images (
  image_id INTEGER PRIMARY KEY,
  complaint_id INTEGER NOT NULL REFERENCES complaints(complaint_id) ON DELETE RESTRICT,
  uploaded_by INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL DEFAULT 'COMPLAINT'
    CHECK(image_type IN ('COMPLAINT','ADDITIONAL','BEFORE_CLEANING','AFTER_CLEANING')),
  uploaded_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS tasks (
  task_id INTEGER PRIMARY KEY,
  complaint_id INTEGER NOT NULL REFERENCES complaints(complaint_id) ON DELETE RESTRICT,
  assigned_employee_id INTEGER REFERENCES employees(employee_id) ON DELETE RESTRICT,
  assigned_by INTEGER REFERENCES users(user_id) ON DELETE RESTRICT,
  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK(priority IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK(status IN ('PENDING','IN_PROGRESS','SUBMITTED','OVERDUE','COMPLETED','REOPENED','CANCELLED')),
  assigned_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  started_at TEXT,
  deadline_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS task_history (
  history_id INTEGER PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(task_id) ON DELETE RESTRICT,
  changed_by INTEGER REFERENCES users(user_id) ON DELETE RESTRICT,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS cleaning_evidence (
  evidence_id INTEGER PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(task_id) ON DELETE RESTRICT,
  submitted_by INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  before_image_url TEXT NOT NULL,
  after_image_url TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  latitude REAL CHECK(latitude BETWEEN -90 AND 90),
  longitude REAL CHECK(longitude BETWEEN -180 AND 180),
  location_verification_status TEXT NOT NULL DEFAULT 'NOT_CHECKED'
    CHECK(location_verification_status IN ('NOT_CHECKED','PASSED','FLAGGED')),
  review_status TEXT NOT NULL DEFAULT 'AWAITING_CITIZEN'
    CHECK(review_status IN ('AWAITING_CITIZEN','CONFIRMED','DISPUTED','SUPERVISOR_REVIEW','REJECTED')),
  submitted_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS acknowledgements (
  acknowledgement_id INTEGER PRIMARY KEY,
  complaint_id INTEGER NOT NULL REFERENCES complaints(complaint_id) ON DELETE RESTRICT,
  citizen_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  evidence_id INTEGER NOT NULL REFERENCES cleaning_evidence(evidence_id) ON DELETE RESTRICT,
  decision TEXT NOT NULL CHECK(decision IN ('CONFIRMED','DISPUTED')),
  comment TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(evidence_id, citizen_id)
);

CREATE TABLE IF NOT EXISTS risk_assessments (
  risk_assessment_id INTEGER PRIMARY KEY,
  drain_id INTEGER NOT NULL REFERENCES drainage_locations(drain_id) ON DELETE RESTRICT,
  risk_score INTEGER NOT NULL CHECK(risk_score BETWEEN 0 AND 100),
  risk_level TEXT NOT NULL CHECK(risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  rainfall_input TEXT NOT NULL DEFAULT 'UNKNOWN',
  blockage_history_score INTEGER NOT NULL DEFAULT 0 CHECK(blockage_history_score BETWEEN 0 AND 100),
  elevation_risk_score INTEGER NOT NULL DEFAULT 0 CHECK(elevation_risk_score BETWEEN 0 AND 100),
  method TEXT NOT NULL DEFAULT 'RULE_BASED_DEMO',
  assessed_by INTEGER REFERENCES users(user_id) ON DELETE RESTRICT,
  assessed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS deadline_rules (
  deadline_rule_id INTEGER PRIMARY KEY,
  risk_level TEXT NOT NULL CHECK(risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  response_hours INTEGER NOT NULL CHECK(response_hours BETWEEN 1 AND 8760),
  reminder_minutes_before INTEGER NOT NULL DEFAULT 60 CHECK(reminder_minutes_before BETWEEN 0 AND 10080),
  escalation_enabled INTEGER NOT NULL DEFAULT 1 CHECK(escalation_enabled IN (0,1)),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0,1)),
  updated_by INTEGER REFERENCES users(user_id) ON DELETE RESTRICT,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(risk_level, is_active)
);

CREATE TABLE IF NOT EXISTS notifications (
  notification_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  complaint_id INTEGER REFERENCES complaints(complaint_id) ON DELETE RESTRICT,
  task_id INTEGER REFERENCES tasks(task_id) ON DELETE RESTRICT,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'INFO',
  is_read INTEGER NOT NULL DEFAULT 0 CHECK(is_read IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS audit_logs (
  audit_id INTEGER PRIMARY KEY,
  actor_user_id INTEGER REFERENCES users(user_id) ON DELETE RESTRICT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  old_values TEXT,
  new_values TEXT,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, account_status);
CREATE INDEX IF NOT EXISTS idx_complaints_citizen_created ON complaints(citizen_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_status_created ON complaints(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_severity ON complaints(severity);
CREATE INDEX IF NOT EXISTS idx_tasks_employee_status ON tasks(assigned_employee_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline_status ON tasks(deadline_at, status);
CREATE INDEX IF NOT EXISTS idx_evidence_task_submitted ON cleaning_evidence(task_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_drain_assessed ON risk_assessments(drain_id, assessed_at DESC);

CREATE VIEW IF NOT EXISTS v_complaint_summary AS
SELECT c.complaint_id, c.public_tracking_code, c.category, c.severity, c.status,
       c.created_at, c.deadline_at, u.full_name AS citizen_name,
       d.location_name AS drain_name
FROM complaints c
JOIN users u ON u.user_id = c.citizen_id
LEFT JOIN drainage_locations d ON d.drain_id = c.drain_id;

CREATE VIEW IF NOT EXISTS v_overdue_tasks AS
SELECT t.task_id, t.complaint_id, t.assigned_employee_id, t.deadline_at,
       t.status, c.public_tracking_code, c.severity
FROM tasks t
JOIN complaints c ON c.complaint_id = t.complaint_id
WHERE t.deadline_at IS NOT NULL
  AND t.deadline_at < strftime('%Y-%m-%dT%H:%M:%fZ','now')
  AND t.status NOT IN ('COMPLETED','CANCELLED');

CREATE VIEW IF NOT EXISTS v_employee_workload AS
SELECT e.employee_id, u.full_name, e.department,
       COUNT(t.task_id) AS active_task_count
FROM employees e
JOIN users u ON u.user_id = e.user_id
LEFT JOIN tasks t ON t.assigned_employee_id = e.employee_id
  AND t.status IN ('PENDING','IN_PROGRESS','OVERDUE','REOPENED')
WHERE e.approval_status = 'APPROVED'
GROUP BY e.employee_id, u.full_name, e.department;

CREATE VIEW IF NOT EXISTS v_cleaning_verification_status AS
SELECT ce.evidence_id, ce.task_id, t.complaint_id, ce.submitted_at,
       ce.review_status, a.decision, a.created_at AS acknowledgement_at
FROM cleaning_evidence ce
JOIN tasks t ON t.task_id = ce.task_id
LEFT JOIN acknowledgements a ON a.evidence_id = ce.evidence_id;

CREATE TRIGGER IF NOT EXISTS trg_complaint_updated_at
AFTER UPDATE ON complaints
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE complaints
  SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
  WHERE complaint_id = NEW.complaint_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_audit_logs_no_update
BEFORE UPDATE ON audit_logs
BEGIN
  SELECT RAISE(ABORT, 'Audit logs are append-only');
END;

CREATE TRIGGER IF NOT EXISTS trg_audit_logs_no_delete
BEFORE DELETE ON audit_logs
BEGIN
  SELECT RAISE(ABORT, 'Audit logs are append-only');
END;
