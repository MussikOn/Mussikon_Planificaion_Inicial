import React from 'react';
import { AdminDashboardScreen } from '../../src/screens';
import RoleGuard from '../../src/components/RoleGuard';

export default function AdminRoute() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <AdminDashboardScreen />
    </RoleGuard>
  );
}
