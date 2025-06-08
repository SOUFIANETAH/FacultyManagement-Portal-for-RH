'use client';

import React from 'react';

export default function AnnoncesLayout({ children }) {
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
