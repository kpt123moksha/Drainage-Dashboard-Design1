export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ComplaintStatus =
  | 'Reported'
  | 'Assigned'
  | 'In Progress'
  | 'Cleaning Evidence Submitted'
  | 'Awaiting Citizen Acknowledgement'
  | 'Verified'
  | 'Reopened'
  | 'Disputed';

export type TaskStatus = 'Due today' | 'Due soon' | 'Overdue' | 'Completed';
export type EvidenceReviewStatus = 'Pending review' | 'Accepted' | 'Disputed';
export type PreventionStatus = 'Scheduled' | 'In progress' | 'Completed' | 'Needs follow-up';

export interface ActivityLog {
  id: string;
  time: string;
  text: string;
  actor: string;
}

export interface Complaint {
  id: string;
  title: string;
  location: string;
  reportedAt: string;
  priority: Priority;
  status: ComplaintStatus;
  assignedTo: string;
  deadline: string;
  description: string;
  image?: string;
  activity: ActivityLog[];
}

export interface TaskItem {
  id: string;
  complaintId: string;
  title: string;
  team: string;
  dueDate: string;
  status: TaskStatus;
}

export interface PreventionItem {
  id: string;
  location: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  reason: string;
  lastInspection: string;
  nextInspection: string;
  status: PreventionStatus;
  assignedTeam: string;
}

export interface EvidenceEntry {
  id: string;
  complaintId: string;
  employeeName: string;
  submittedAt: string;
  description: string;
  imageUrl: string;
  reviewStatus: EvidenceReviewStatus;
}

export interface DemoSession {
  employeeName: string;
  email: string;
  employeeId: string;
  role: string;
}
