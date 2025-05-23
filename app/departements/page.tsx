'use client';

import React, { useEffect, useState } from 'react';
import {
  Code,
  Calculator,
  Atom,
  FlaskConical,
  Leaf,
  Mountain,
  MoreHorizontal,
  Loader2,
  Users,
  Building,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import './depart.css';

interface Department {
  coded: string;
  nom: string;
  description?: string;
  date_creat?: string;
  codee?: string;
  etablissements?: {
    nom: string;
  };
}

interface NavigationCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  establishment?: string;
  onClick?: () => void;
}

function NavigationCard({
                          icon, title, description, establishment, onClick
                        }: NavigationCardProps) {
  return (
      <div className="dashboard-card" onClick={onClick}>
        <div className="icon-container">{icon}</div>
        <h3 className="card-title">{title}</h3>
        {description && <p className="card-description">{description}</p>}
        {establishment && (
            <div className="card-establishment">
              <Building size={14} className="mr-1" />
              <span>{establishment}</span>
            </div>
        )}
      </div>
  );
}

function getIconForDepartment(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('informatique')) return <Code className="icon" size={40} />;
  if (lower.includes('mathématique')) return <Calculator className="icon" size={40} />;
  if (lower.includes('physique')) return <Atom className="icon" size={40} />;
  if (lower.includes('chimie')) return <FlaskConical className="icon" size={40} />;
  if (lower.includes('biologie')) return <Leaf className="icon" size={40} />;
  if (lower.includes('géologie')) return <Mountain className="icon" size={40} />;
  return <MoreHorizontal className="icon" size={40} />;
}

export default function DepartmentsView() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/departements');
        if (!response.ok) throw new Error('Error retrieving departments');
        const data = await response.json();
        setDepartments(data);
      } catch (err) {
        setError('Unable to load departments');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const filteredDepartments = departments.filter(dept =>
      dept.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.etablissements?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
        <div className="dashboard-container">
          <div className="loading-state">
            <Loader2 className="icon animate-spin" />
            <p>Loading departments...</p>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="dashboard-container">
          <div className="error-state">
            <p>Error: {error}</p>
          </div>
        </div>
    );
  }

  return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="text-2xl font-bold mb-4">University Departments</h1>
          <div className="search-container">
            <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />
          </div>
        </div>

        <div className="departments-stats">
          <div className="stat-card">
            <Users className="stat-icon" />
            <div className="stat-info">
              <span className="stat-number">{departments.length}</span>
              <span className="stat-label">Departments</span>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {filteredDepartments.length > 0 ? (
              filteredDepartments.map((dept) => (
                  <NavigationCard
                      key={dept.coded}
                      icon={getIconForDepartment(dept.nom || '')}
                      title={dept.nom || 'Unnamed'}
                      description={dept.description}
                      establishment={dept.etablissements?.nom}
                      onClick={() => router.push(`/departements/detail?code=${dept.coded}`)}
                  />
              ))
          ) : (
              <div className="empty-state">
                {searchTerm ? (
                    <p>No departments found matching "{searchTerm}"</p>
                ) : (
                    <p>No departments available</p>
                )}
              </div>
          )}
        </div>
      </div>
  );
}
