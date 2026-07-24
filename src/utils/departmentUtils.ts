export interface DepartmentUser {
  department?: string | null;
  is_staff?: boolean;
}

export const resolveDepartmentRoute = (user?: DepartmentUser | null): string => {
  if (!user) return '/self-service';
  
  const isSuperAdmin = user.is_staff || user.department === 'Management';
  if (isSuperAdmin) return '/services';

  const dept = (user.department || '').toLowerCase().trim();
  if (!dept) return '/self-service';

  if (dept.includes('management') || dept.includes('admin') || dept.includes('executive')) {
    return '/services';
  }
  if (dept.includes('hr') || dept.includes('human') || dept.includes('personnel')) {
    return '/hr';
  }
  if (dept.includes('finance') || dept.includes('account') || dept.includes('payroll')) {
    return '/finance';
  }
  if (dept.includes('asset') || dept.includes('record') || dept.includes('archival')) {
    return '/assets';
  }
  if (dept.includes('logistics') || dept.includes('shipping') || dept.includes('supply') || dept.includes('transport') || dept.includes('marine') || dept.includes('farm')) {
    return '/logistics';
  }
  if (dept.includes('procurement') || dept.includes('purchas') || dept.includes('buying')) {
    return '/procurement';
  }
  if (dept.includes('it') || dept.includes('tech') || dept.includes('system')) {
    return '/it';
  }

  return '/self-service';
};

export const isDepartmentMatch = (userDept: string | null | undefined, targetKey: 'hr' | 'finance' | 'it' | 'logistics' | 'procurement' | 'assets' | 'management'): boolean => {
  if (!userDept) return false;
  const d = userDept.toLowerCase().trim();

  switch (targetKey) {
    case 'hr':
      return d.includes('hr') || d.includes('human') || d.includes('personnel');
    case 'finance':
      return d.includes('finance') || d.includes('account') || d.includes('payroll');
    case 'it':
      return d.includes('it') || d.includes('tech') || d.includes('system');
    case 'assets':
      return d.includes('asset') || d.includes('record') || d.includes('archival');
    case 'logistics':
      return d.includes('logistics') || d.includes('shipping') || d.includes('supply') || d.includes('transport') || d.includes('marine') || d.includes('farm');
    case 'procurement':
      return d.includes('procurement') || d.includes('purchas') || d.includes('buying');
    case 'management':
      return d.includes('management') || d.includes('admin') || d.includes('executive');
    default:
      return false;
  }
};
