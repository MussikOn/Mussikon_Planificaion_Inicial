import { useAuth } from '../context/AuthContext';

export type UserRole = 'leader' | 'musician' | 'admin';

export interface RolePermissions {
  canCreateRequests: boolean;
  canCreateOffers: boolean;
  canViewAdminPanel: boolean;
  canManageUsers: boolean;
  canValidateMusicians: boolean;
  canViewAllRequests: boolean;
  canViewAllOffers: boolean;
}

export const useRolePermissions = (): RolePermissions => {
  const { user } = useAuth();
  const role = user?.role as UserRole;

  const permissions: RolePermissions = {
    canCreateRequests: role === 'leader' || role === 'admin',
    canCreateOffers: role === 'musician' || role === 'admin',
    canViewAdminPanel: role === 'admin',
    canManageUsers: role === 'admin',
    canValidateMusicians: role === 'admin',
    canViewAllRequests: role === 'admin',
    canViewAllOffers: role === 'admin',
  };

  return permissions;
};

export const hasRole = (userRole: string | undefined, requiredRoles: UserRole[]): boolean => {
  if (!userRole) return false;
  return requiredRoles.includes(userRole as UserRole);
};

export const isAdmin = (userRole: string | undefined): boolean => {
  return userRole === 'admin';
};

export const isLeader = (userRole: string | undefined): boolean => {
  return userRole === 'leader';
};

export const isMusician = (userRole: string | undefined): boolean => {
  return userRole === 'musician';
};
