// app/administration/dashboard/layout.tsx
'use client';

import React, { ReactNode } from 'react';
import RoleNav from "@/app/components/Sidebar";

type LayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: LayoutProps) {
  return (
    <div className="admin-container">
      <RoleNav />
      <div className="admin-app">
        <header className="app-header">
          <div className="header-content">
            {/* Optional header content */}
          </div>
        </header>
        <main className="dashboard-container">
          {children}
        </main>
      </div>
    </div>
  );
}
