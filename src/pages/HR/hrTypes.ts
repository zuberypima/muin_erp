// Shared HR types and demo data

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  employmentType: 'full-time' | 'part-time' | 'contract';
  startDate: string;
  status: 'active' | 'inactive' | 'on-leave';
  avatarInitials?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  hoursWorked: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid' | 'emergency';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  reviewPeriod: string;
  rating: 1 | 2 | 3 | 4 | 5;
  goals: string;
  comments: string;
  reviewedBy: string;
  reviewDate: string;
}

export const DEPARTMENTS = ['Management', 'Farm Operations', 'Finance', 'Sales & Marketing', 'IT', 'Logistics', 'HR'];

export const demoEmployees: Employee[] = [
  { id: 'EMP-001', firstName: 'Amina', lastName: 'Hassan', email: 'amina.h@muini.co.tz', phone: '+255712345678', department: 'Management', position: 'General Manager', employmentType: 'full-time', startDate: '2022-01-15', status: 'active' },
  { id: 'EMP-002', firstName: 'James', lastName: 'Okonkwo', email: 'james.o@muini.co.tz', phone: '+255723456789', department: 'Farm Operations', position: 'Head of Agriculture', employmentType: 'full-time', startDate: '2022-03-01', status: 'active' },
  { id: 'EMP-003', firstName: 'Fatuma', lastName: 'Ally', email: 'fatuma.a@muini.co.tz', phone: '+255734567890', department: 'Finance', position: 'Finance Officer', employmentType: 'full-time', startDate: '2023-06-01', status: 'active' },
  { id: 'EMP-004', firstName: 'Peter', lastName: 'Kamau', email: 'peter.k@muini.co.tz', phone: '+255745678901', department: 'Sales & Marketing', position: 'Sales Manager', employmentType: 'full-time', startDate: '2023-09-15', status: 'on-leave' },
  { id: 'EMP-005', firstName: 'Grace', lastName: 'Mwangi', email: 'grace.m@muini.co.tz', phone: '+255756789012', department: 'IT', position: 'IT Administrator', employmentType: 'full-time', startDate: '2024-01-10', status: 'active' },
  { id: 'EMP-006', firstName: 'Ibrahim', lastName: 'Salim', email: 'ibrahim.s@muini.co.tz', phone: '+255767890123', department: 'Logistics', position: 'Logistics Coordinator', employmentType: 'full-time', startDate: '2024-04-01', status: 'active' },
  { id: 'EMP-007', firstName: 'Zawadi', lastName: 'Juma', email: 'zawadi.j@muini.co.tz', phone: '+255778901234', department: 'Farm Operations', position: 'Field Supervisor', employmentType: 'contract', startDate: '2025-01-01', status: 'active' },
];

export const demoAttendance: AttendanceRecord[] = [
  { id: 'ATT-001', employeeId: 'EMP-001', employeeName: 'Amina Hassan', date: '2026-06-04', checkIn: '08:02', checkOut: '17:05', status: 'present', hoursWorked: 9 },
  { id: 'ATT-002', employeeId: 'EMP-002', employeeName: 'James Okonkwo', date: '2026-06-04', checkIn: '08:45', checkOut: '17:00', status: 'late', hoursWorked: 8.25 },
  { id: 'ATT-003', employeeId: 'EMP-003', employeeName: 'Fatuma Ally', date: '2026-06-04', checkIn: '07:58', checkOut: '17:00', status: 'present', hoursWorked: 9 },
  { id: 'ATT-004', employeeId: 'EMP-004', employeeName: 'Peter Kamau', date: '2026-06-04', checkIn: '', checkOut: '', status: 'absent', hoursWorked: 0 },
  { id: 'ATT-005', employeeId: 'EMP-005', employeeName: 'Grace Mwangi', date: '2026-06-04', checkIn: '08:01', checkOut: '13:00', status: 'half-day', hoursWorked: 5 },
  { id: 'ATT-006', employeeId: 'EMP-006', employeeName: 'Ibrahim Salim', date: '2026-06-04', checkIn: '08:00', checkOut: '17:00', status: 'present', hoursWorked: 9 },
  { id: 'ATT-007', employeeId: 'EMP-007', employeeName: 'Zawadi Juma', date: '2026-06-04', checkIn: '07:55', checkOut: '17:10', status: 'present', hoursWorked: 9.25 },
];

export const demoLeaves: LeaveRequest[] = [
  { id: 'LV-001', employeeId: 'EMP-004', employeeName: 'Peter Kamau', department: 'Sales & Marketing', leaveType: 'annual', startDate: '2026-06-01', endDate: '2026-06-14', days: 14, reason: 'Family vacation', status: 'approved', appliedOn: '2026-05-20' },
  { id: 'LV-002', employeeId: 'EMP-002', employeeName: 'James Okonkwo', department: 'Farm Operations', leaveType: 'sick', startDate: '2026-06-10', endDate: '2026-06-12', days: 3, reason: 'Medical treatment', status: 'pending', appliedOn: '2026-06-04' },
  { id: 'LV-003', employeeId: 'EMP-005', employeeName: 'Grace Mwangi', department: 'IT', leaveType: 'emergency', startDate: '2026-06-04', endDate: '2026-06-04', days: 1, reason: 'Family emergency', status: 'approved', appliedOn: '2026-06-04' },
  { id: 'LV-004', employeeId: 'EMP-007', employeeName: 'Zawadi Juma', department: 'Farm Operations', leaveType: 'annual', startDate: '2026-06-20', endDate: '2026-06-25', days: 5, reason: 'Personal time', status: 'pending', appliedOn: '2026-06-03' },
];



export const demoReviews: PerformanceReview[] = [
  { id: 'REV-001', employeeId: 'EMP-001', employeeName: 'Amina Hassan', department: 'Management', reviewPeriod: 'Q1 2026', rating: 5, goals: 'Expand market reach, improve team efficiency', comments: 'Exceptional leadership and delivery.', reviewedBy: 'Board', reviewDate: '2026-04-01' },
  { id: 'REV-002', employeeId: 'EMP-002', employeeName: 'James Okonkwo', department: 'Farm Operations', reviewPeriod: 'Q1 2026', rating: 4, goals: 'Increase crop yield by 20%', comments: 'Strong performance, exceeded crop yield targets.', reviewedBy: 'Amina Hassan', reviewDate: '2026-04-02' },
  { id: 'REV-003', employeeId: 'EMP-003', employeeName: 'Fatuma Ally', department: 'Finance', reviewPeriod: 'Q1 2026', rating: 4, goals: 'Zero audit discrepancies', comments: 'Accurate reporting, proactive in compliance.', reviewedBy: 'Amina Hassan', reviewDate: '2026-04-03' },
  { id: 'REV-004', employeeId: 'EMP-007', employeeName: 'Zawadi Juma', department: 'Farm Operations', reviewPeriod: 'Q1 2026', rating: 3, goals: 'Improve team supervision', comments: 'Good effort, needs improvement in delegation.', reviewedBy: 'James Okonkwo', reviewDate: '2026-04-04' },
];

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat('sw-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(n);

export const formatDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const getRatingStars = (rating: number) =>
  Array.from({ length: 5 }, (_, i) => i < rating ? '★' : '☆').join('');
