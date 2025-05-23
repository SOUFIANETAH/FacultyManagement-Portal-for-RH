'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Plus, X, Save, AlertCircle, Loader2
} from 'lucide-react';
import './departdean.css';

interface Department {
  coded: string;
  nom: string;
  description?: string;
  codee?: string;
  etablissements?: {
    nom: string;
  };
}

export default function DeanDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({
    coded: '',
    nom: '',
    description: '',
    codee: '',
  });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch('/api/departements');
        if (!res.ok) throw new Error('Failed to fetch departments');
        const data = await res.json();
        setDepartments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load departments');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setFormError(null);

    try {
      const res = await fetch('/api/departements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create department');
      }

      const newDept = await res.json();
      setDepartments(prev => [...prev, newDept]);
      setForm({ coded: '', nom: '', description: '', codee: '' });
      setFormVisible(false);
      setNotification({ type: 'success', message: 'Department created successfully!' });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to create department'
      });
    } finally {
      setCreating(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDelete = async (coded: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      const res = await fetch(`/api/departements/${coded}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete department');
      }

      setDepartments(prev => prev.filter(d => d.coded !== coded));
      setNotification({ type: 'success', message: 'Department deleted successfully!' });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to delete department'
      });
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="text-2xl font-bold mb-4">Departments Management</h1>
          <div className="action-buttons">
            <button
                className="add-btn"
                onClick={() => setFormVisible(prev => !prev)}
            >
              {formVisible ? <X size={20} /> : <Plus size={20} />}
              {formVisible ? 'Cancel' : 'Add Department'}
            </button>
          </div>
        </div>

        {notification && (
            <div className={`notification ${notification.type}`}>
              {notification.type === 'error' ? <AlertCircle size={20} /> : null}
              <p>{notification.message}</p>
            </div>
        )}

        {formVisible && (
            <div className="form-container">
              <h2 className="form-title">Create New Department</h2>
              <form onSubmit={handleSubmit} className="department-form">
                <div className="form-group">
                  <label htmlFor="coded">Department Code:</label>
                  <input
                      name="coded"
                      value={form.coded}
                      onChange={handleChange}
                      placeholder="e.g., MATH-DEP"
                      required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="nom">Department Name:</label>
                  <input
                      name="nom"
                      value={form.nom}
                      onChange={handleChange}
                      placeholder="e.g., Mathematics"
                      required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="codee">Establishment Code:</label>
                  <input
                      name="codee"
                      value={form.codee}
                      onChange={handleChange}
                      placeholder="e.g., EST001"
                      required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description:</label>
                  <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Optional description"
                      rows={3}
                  />
                </div>
                <button type="submit" className="submit-btn" disabled={creating}>
                  {creating ? (
                      <Loader2 className="animate-spin mr-2" size={16} />
                  ) : (
                      <Save size={16} className="mr-2" />
                  )}
                  Add Department
                </button>
                {formError && <div className="form-error">{formError}</div>}
              </form>
            </div>
        )}

        <div className="department-list">
          {loading ? (
              <div>Loading...</div>
          ) : error ? (
              <div>Error: {error}</div>
          ) : (
              departments.map(dept => (
                  <div key={dept.coded} className="department-item">
                    <Link href={`/dean/departements/${dept.coded}`} className="department-link">
                      <div className="icon-container">
                        <BookOpen size={24} className="icon" />
                      </div>
                      <div className="department-info">
                        <h3>{dept.nom}</h3>
                        <p>{dept.description || 'No description'}</p>
                      </div>
                    </Link>
                    <div className="actions">
                      <button
                          className="delete-btn"
                          onClick={() => handleDelete(dept.coded)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
              ))
          )}
        </div>
      </div>
  );
}
