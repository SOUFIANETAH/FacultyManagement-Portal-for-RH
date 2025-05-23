// layout.tsx
'use client';

import React, { ReactNode } from 'react';




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