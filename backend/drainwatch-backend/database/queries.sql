-- Run after migration and seed: npm run sql:demo
-- 1. Complaint summary with citizen and drain
SELECT c.public_tracking_code, c.category, c.severity, c.status,
       u.full_name AS citizen, d.location_name
FROM complaints c
JOIN users u ON u.user_id=c.citizen_id
LEFT JOIN drainage_locations d ON d.drain_id=c.drain_id;

-- 2. Tasks with assigned employee
SELECT t.task_id, c.public_tracking_code, u.full_name AS employee,
       t.priority, t.status, t.deadline_at
FROM tasks t
JOIN complaints c ON c.complaint_id=t.complaint_id
LEFT JOIN employees e ON e.employee_id=t.assigned_employee_id
LEFT JOIN users u ON u.user_id=e.user_id;

-- 3. Overdue tasks
SELECT * FROM v_overdue_tasks;

-- 4. Complaint count by status
SELECT status, COUNT(*) AS total
FROM complaints GROUP BY status ORDER BY total DESC;

-- 5. Complaint count by severity
SELECT severity, COUNT(*) AS total
FROM complaints GROUP BY severity ORDER BY total DESC;

-- 6. High and critical risk assessments
SELECT d.location_name, r.risk_score, r.risk_level, r.assessed_at
FROM risk_assessments r
JOIN drainage_locations d ON d.drain_id=r.drain_id
WHERE r.risk_level IN ('HIGH','CRITICAL')
ORDER BY r.risk_score DESC;

-- 7. Average risk score by risk level
SELECT risk_level, ROUND(AVG(risk_score),2) AS average_score,
       MIN(risk_score) AS minimum_score, MAX(risk_score) AS maximum_score
FROM risk_assessments GROUP BY risk_level;

-- 8. Employee workload
SELECT * FROM v_employee_workload ORDER BY active_task_count DESC;

-- 9. Complaints without tasks
SELECT c.complaint_id, c.public_tracking_code, c.status
FROM complaints c
LEFT JOIN tasks t ON t.complaint_id=c.complaint_id
WHERE t.task_id IS NULL;

-- 10. Evidence and citizen acknowledgement
SELECT c.public_tracking_code, ce.evidence_id, ce.review_status, a.decision, a.comment
FROM cleaning_evidence ce
JOIN tasks t ON t.task_id=ce.task_id
JOIN complaints c ON c.complaint_id=t.complaint_id
LEFT JOIN acknowledgements a ON a.evidence_id=ce.evidence_id;

-- 11. Disputed evidence awaiting review
SELECT ce.*, c.public_tracking_code
FROM cleaning_evidence ce
JOIN tasks t ON t.task_id=ce.task_id
JOIN complaints c ON c.complaint_id=t.complaint_id
WHERE ce.review_status IN ('DISPUTED','SUPERVISOR_REVIEW');

-- 12. Complaints created in the last 30 days
SELECT complaint_id, public_tracking_code, created_at
FROM complaints
WHERE created_at >= strftime('%Y-%m-%dT%H:%M:%fZ','now','-30 days')
ORDER BY created_at DESC;

-- 13. Approved employees who have never received a task
SELECT e.employee_id, u.full_name
FROM employees e
JOIN users u ON u.user_id=e.user_id
WHERE e.approval_status='APPROVED'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.assigned_employee_id=e.employee_id
  );

-- 14. Rank latest risk score per drain (window function)
WITH latest AS (
  SELECT r.*, ROW_NUMBER() OVER(PARTITION BY drain_id ORDER BY assessed_at DESC) AS rn
  FROM risk_assessments r
)
SELECT d.location_name, latest.risk_score, latest.risk_level
FROM latest JOIN drainage_locations d ON d.drain_id=latest.drain_id
WHERE latest.rn=1 ORDER BY latest.risk_score DESC;

-- 15. Rank employee workload (window function)
SELECT employee_id, full_name, active_task_count,
       RANK() OVER(ORDER BY active_task_count DESC) AS workload_rank
FROM v_employee_workload;

-- 16. Use a correlated subquery to find each complaint's latest evidence
SELECT c.public_tracking_code,
       (SELECT MAX(ce.submitted_at)
        FROM tasks t JOIN cleaning_evidence ce ON ce.task_id=t.task_id
        WHERE t.complaint_id=c.complaint_id) AS latest_evidence_at
FROM complaints c;

-- 17. Categories with more than one complaint (HAVING demonstration)
SELECT category, COUNT(*) AS total
FROM complaints GROUP BY category HAVING COUNT(*) > 1;

-- 18. Query a view
SELECT * FROM v_complaint_summary ORDER BY created_at DESC;

-- 19. Cumulative complaint count by creation timestamp
SELECT complaint_id, public_tracking_code, created_at,
       COUNT(*) OVER(ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_count
FROM complaints;

-- 20. Safe pagination example
SELECT complaint_id, public_tracking_code, status, created_at
FROM complaints
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;

-- Query plan example; inspect the planner output
EXPLAIN QUERY PLAN
SELECT complaint_id, status, created_at
FROM complaints
WHERE citizen_id=1
ORDER BY created_at DESC;
