import type {
  Complaint,
  DemoSession,
  EvidenceEntry,
  PreventionItem,
  TaskItem,
} from '../types';

export const demoEmployee: DemoSession = {
  employeeName: 'Aisha Kumar',
  email: 'aisha.kumar@drainwatch.gov',
  employeeId: 'MW-2048',
  role: 'Municipality Drainage Officer',
};

export const initialComplaints: Complaint[] = [
  {
    id: 'DW-1042',
    title: 'Blocked drain near market square',
    location: 'Market Square, Koramangala',
    reportedAt: '2026-10-09T08:15:00',
    priority: 'High',
    status: 'Awaiting Citizen Acknowledgement',
    assignedTo: 'Drainage Crew 3',
    deadline: '2026-10-15',
    description:
      'Overflowing stormwater is collecting near the pedestrian crossing and the drain inlet is clogged with plastic waste.',
    image:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80',
    activity: [
      {
        id: 'a1',
        time: '2026-10-09 08:15',
        text: 'Citizen submitted blockage report with photo.',
        actor: 'Citizen portal',
      },
      {
        id: 'a2',
        time: '2026-10-09 09:30',
        text: 'Assigned to Drainage Crew 3 and inspection scheduled.',
        actor: 'Aisha Kumar',
      },
      {
        id: 'a3',
        time: '2026-10-12 15:00',
        text: 'Cleaning evidence uploaded and waiting for citizen acknowledgement.',
        actor: 'R. Singh',
      },
    ],
  },
  {
    id: 'DW-1048',
    title: 'Stormwater inlet blocked by silt',
    location: 'Garden Road',
    reportedAt: '2026-10-11T18:40:00',
    priority: 'Critical',
    status: 'Assigned',
    assignedTo: 'Emergency Team A',
    deadline: '2026-10-14',
    description:
      'Heavy runoff is accumulating near the culvert inlet. Residents report standing water after even light showers.',
    image:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80',
    activity: [
      {
        id: 'a4',
        time: '2026-10-11 18:40',
        text: 'Critical blockage reported after a sudden downpour.',
        actor: 'Citizen portal',
      },
      {
        id: 'a5',
        time: '2026-10-12 07:15',
        text: 'Emergency team dispatched to inspect inlet.',
        actor: 'Operations desk',
      },
    ],
  },
  {
    id: 'DW-1051',
    title: 'Open roadside drain covered by debris',
    location: 'Nagarbhavi 2nd Stage',
    reportedAt: '2026-10-10T12:25:00',
    priority: 'Medium',
    status: 'In Progress',
    assignedTo: 'Street Maintenance Unit',
    deadline: '2026-10-18',
    description:
      'The roadside drain has been partially submerged under accumulated waste and leaves, impeding water runoff.',
    image:
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
    activity: [
      {
        id: 'a6',
        time: '2026-10-10 12:25',
        text: 'Citizen complaint logged for blocked roadside drain.',
        actor: 'Citizen portal',
      },
      {
        id: 'a7',
        time: '2026-10-11 14:45',
        text: 'Crew cleared debris and is reviewing final drainage flow.',
        actor: 'Street Maintenance Unit',
      },
    ],
  },
  {
    id: 'DW-1058',
    title: 'Neighbourhood drain overflow near school',
    location: 'Banjara Layout',
    reportedAt: '2026-10-08T07:55:00',
    priority: 'Medium',
    status: 'Verified',
    assignedTo: 'Zone 4 Team',
    deadline: '2026-10-12',
    description:
      'Water accumulated near the school boundary after required cleaning. Measures were completed and the issue was verified.',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    activity: [
      {
        id: 'a8',
        time: '2026-10-08 07:55',
        text: 'Neighbourhood overflow reported by resident association.',
        actor: 'Citizen portal',
      },
      {
        id: 'a9',
        time: '2026-10-09 11:20',
        text: 'Cleaning completed and a photo review was accepted.',
        actor: 'Zone 4 Team',
      },
    ],
  },
];

export const initialTasks: TaskItem[] = [
  {
    id: 'T-201',
    complaintId: 'DW-1042',
    title: 'Inspect blocked drain near market square',
    team: 'Drainage Crew 3',
    dueDate: '2026-10-15',
    status: 'Due today',
  },
  {
    id: 'T-202',
    complaintId: 'DW-1048',
    title: 'Emergency drain clearing',
    team: 'Emergency Team A',
    dueDate: '2026-10-14',
    status: 'Overdue',
  },
  {
    id: 'T-203',
    complaintId: 'DW-1051',
    title: 'Roadside debris removal and flow check',
    team: 'Street Maintenance Unit',
    dueDate: '2026-10-18',
    status: 'Due soon',
  },
  {
    id: 'T-204',
    complaintId: 'DW-1058',
    title: 'Final verification and citizen follow-up',
    team: 'Zone 4 Team',
    dueDate: '2026-10-12',
    status: 'Completed',
  },
];

export const initialPrevention: PreventionItem[] = [
  {
    id: 'P-301',
    location: 'Lalbagh Lake Road',
    riskLevel: 'High',
    reason: 'Low-lying stretch with repeated runoff accumulation during short storms.',
    lastInspection: '2026-10-03',
    nextInspection: '2026-10-17',
    status: 'Scheduled',
    assignedTeam: 'Pre-Rain Response Unit',
  },
  {
    id: 'P-302',
    location: 'Varthur Main Road',
    riskLevel: 'Medium',
    reason: 'Drain inlet partially clogged by vegetation and construction debris.',
    lastInspection: '2026-10-05',
    nextInspection: '2026-10-20',
    status: 'In progress',
    assignedTeam: 'Drainage Monitoring Team',
  },
  {
    id: 'P-303',
    location: 'Madiwala Junction',
    riskLevel: 'High',
    reason: 'Large catchment area with regular waterlogging during evening rains.',
    lastInspection: '2026-10-01',
    nextInspection: '2026-10-16',
    status: 'Needs follow-up',
    assignedTeam: 'Surface Water Unit',
  },
];

export const initialEvidence: EvidenceEntry[] = [
  {
    id: 'E-401',
    complaintId: 'DW-1042',
    employeeName: 'R. Singh',
    submittedAt: '2026-10-12T15:00:00',
    description: 'Drain inlet cleared of plastic waste and visible runoff restored.',
    imageUrl:
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=80',
    reviewStatus: 'Pending review',
  },
  {
    id: 'E-402',
    complaintId: 'DW-1058',
    employeeName: 'Aisha Kumar',
    submittedAt: '2026-10-09T11:20:00',
    description: 'Final verification photo after drain cleaning and debris removal.',
    imageUrl:
      'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=900&q=80',
    reviewStatus: 'Accepted',
  },
];
