'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    BookOpen,
    GraduationCap,
    Calendar,
    Clock,
    Info,
    ArrowLeft,
    Plus,
    X,
    Save,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import Link from 'next/link';
import './coded.css';

interface DepartmentDetails {
    coded: string;
    nom: string;
    description?: string;
    date_creat?: string;
    codee?: string;
    etablissements?: {
        nom: string;
    };
    filieres?: {
        codef: string;
        intitule?: string;
        niveau?: string;
        duree?: number;
    }[];
}

export default function DepartmentDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const coded = params.coded as string;
    const [department, setDepartment] = useState<DepartmentDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formVisible, setFormVisible] = useState(false);
    const [creating, setCreating] = useState(false);
    const [notification, setNotification] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const [filiereForm, setFiliereForm] = useState({
        codef: '',
        intitule: '',
        niveau: '',
        duree: '',
        coded: coded,
    });

    useEffect(() => {
        const fetchDepartment = async () => {
            try {
                const response = await fetch(`/api/departements/${coded}`);
                if (!response.ok) throw new Error('Failed to fetch department details');
                const data = await response.json();
                setDepartment(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load department');
            } finally {
                setLoading(false);
            }
        };

        if (coded) fetchDepartment();
    }, [coded]);

    const handleFiliereChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFiliereForm({ ...filiereForm, [e.target.name]: e.target.value });
    };

    const handleFiliereSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setNotification(null);

        try {
            const res = await fetch('/api/filieres', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...filiereForm,
                    duree: filiereForm.duree ? parseInt(filiereForm.duree) : undefined,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to create program');
            }

            const newFiliere = await res.json();
            setDepartment((prev) =>
                prev
                    ? { ...prev, filieres: [...(prev.filieres || []), newFiliere] }
                    : prev
            );

            setFiliereForm({
                codef: '',
                intitule: '',
                niveau: '',
                duree: '',
                coded: coded,
            });
            setFormVisible(false);
            setNotification({ type: 'success', message: 'Program created successfully!' });
        } catch (err) {
            setNotification({
                type: 'error',
                message: err instanceof Error ? err.message : 'Failed to create program',
            });
        } finally {
            setCreating(false);
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const handleDeleteFiliere = async (codef: string) => {
        if (!confirm('Are you sure you want to delete this program?')) return;

        try {
            const res = await fetch(`/api/filieres/${codef}`, { method: 'DELETE' });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to delete program');
            }

            setDepartment((prev) =>
                prev
                    ? {
                        ...prev,
                        filieres: prev.filieres?.filter((f) => f.codef !== codef) || [],
                    }
                    : prev
            );

            setNotification({ type: 'success', message: 'Program deleted successfully!' });
        } catch (err) {
            setNotification({
                type: 'error',
                message: err instanceof Error ? err.message : 'Failed to delete program',
            });
        } finally {
            setTimeout(() => setNotification(null), 3000);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
    if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
    if (!department) return <div>Department not found</div>;

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <Link href="/dean/departements" className="flex items-center text-blue-600 hover:text-blue-800">
                    <ArrowLeft size={20} className="mr-2" /> Back to Departments
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex items-center mb-4">
                    <BookOpen size={32} className="text-blue-600 mr-4" />
                    <h1 className="text-3xl font-bold text-gray-800">{department.nom}</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold mb-3 text-gray-700 flex items-center">
                            <Info className="mr-2" /> Department Information
                        </h2>
                        <div className="space-y-2">
                            <p><span className="font-medium">Code:</span> {department.coded}</p>
                            {department.description && (
                                <p><span className="font-medium">Description:</span> {department.description}</p>
                            )}
                            {department.date_creat && (
                                <p><span className="font-medium">Creation Date:</span> {new Date(department.date_creat).toLocaleDateString()}</p>
                            )}
                            {department.etablissements && (
                                <p><span className="font-medium">Establishment:</span> {department.etablissements.nom}</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold mb-3 text-gray-700 flex items-center">
                            <GraduationCap className="mr-2" /> Statistics
                        </h2>
                        <div className="space-y-2">
                            <p><span className="font-medium">Number of Programs:</span> {department.filieres?.length || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
                            Programs ({department.filieres?.length || 0})
                        </h2>
                        <button
                            onClick={() => setFormVisible(!formVisible)}
                            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            {formVisible ? <><X size={18} className="mr-2" /> Cancel</> : <><Plus size={18} className="mr-2" /> Add Program</>}
                        </button>
                    </div>

                    {notification && (
                        <div className={notification.type === 'success' ? 'notification-success' : 'notification-error'}>
                            <AlertCircle className="mr-2" />
                            <p>{notification.message}</p>
                        </div>
                    )}

                    {formVisible && (
                        <div className="bg-gray-50 p-6 rounded-lg mb-6">
                            <h3 className="text-xl font-semibold mb-4">Create New Program</h3>
                            <form onSubmit={handleFiliereSubmit} className="space-y-4 add-program-form">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label>Program Code</label>
                                        <input type="text" name="codef" value={filiereForm.codef} onChange={handleFiliereChange} required />
                                    </div>
                                    <div>
                                        <label>Program Name</label>
                                        <input type="text" name="intitule" value={filiereForm.intitule} onChange={handleFiliereChange} required />
                                    </div>
                                    <div>
                                        <label>Level</label>
                                        <select name="niveau" value={filiereForm.niveau} onChange={handleFiliereChange}>
                                            <option value="">Select level</option>
                                            <option value="Bachelor">Bachelor</option>
                                            <option value="Master">Master</option>
                                            <option value="PhD">PhD</option>
                                            <option value="Diploma">Diploma</option>
                                            <option value="Certificate">Certificate</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Duration (years)</label>
                                        <input type="number" name="duree" value={filiereForm.duree} onChange={handleFiliereChange} min="1" max="10" />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg" disabled={creating}>
                                        {creating ? <><Loader2 className="animate-spin mr-2" size={18} /> Creating...</> : <><Save size={18} className="mr-2" /> Create Program</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {department.filieres && department.filieres.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {department.filieres.map((filiere) => (
                                <div key={filiere.codef} className="program-card relative">
                                    <button onClick={() => handleDeleteFiliere(filiere.codef)} className="program-delete" title="Delete program">
                                        <X size={18} />
                                    </button>
                                    <h3 className="program-header">{filiere.intitule || 'Unnamed Program'}</h3>
                                    <div className="program-meta">
                                        <Calendar size={16} className="mr-2" />
                                        <span>Level: {filiere.niveau || 'N/A'}</span>
                                    </div>
                                    <div className="program-meta">
                                        <Clock size={16} className="mr-2" />
                                        <span>Duration: {filiere.duree ? `${filiere.duree} years` : 'N/A'}</span>
                                    </div>
                                    <div className="mt-3 pt-3 border-t">
                                        <span className="program-chip">Code: {filiere.codef}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No programs found for this department.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
