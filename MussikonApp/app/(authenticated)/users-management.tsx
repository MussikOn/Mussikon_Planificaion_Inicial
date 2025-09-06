import React from 'react';
import { UsersManagementScreen } from '../../src/screens';
import RoleGuard from '../../src/components/RoleGuard';

export default function UsersManagementPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <UsersManagementScreen />
    </RoleGuard>
  );
}
