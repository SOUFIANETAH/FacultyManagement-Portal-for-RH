// layout.tsx
'use client';

import React, { ReactNode } from 'react';
import RoleNav from "@/app/components/Sidebar";




interface AdminLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function AdminLayout({
                                      children,
}: AdminLayoutProps) {
  return (
      <div className="admin-container">
        {<RoleNav />}
        <RoleNav />
    <div className="admin-app">
      <header className="app-header">
        <div className="header-content">

        </div>
      </header>

      <main className="dashboard-container">
          {children}

      </main>
    </div>
      </div>
  );
}