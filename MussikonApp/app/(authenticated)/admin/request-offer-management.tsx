import React from 'react';
import { AdminRequestOfferManagementScreen } from '../../../src/screens';
import RoleGuard from '../../../src/components/RoleGuard';

export default function AdminRequestOfferManagementRoute() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <AdminRequestOfferManagementScreen />
    </RoleGuard>
  );
}