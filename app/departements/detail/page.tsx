'use client';
import { useRouter } from 'next/navigation';


import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    GraduationCap,
    Loader2,
    MoreHorizontal,
    Building,
} from 'lucide-react';
import '../depart.css';

interface Filiere {
    codef: string;
    intitule: string;
    niveau: string;
    duree?: number;
    departement?: {
        coded: string;
        nom: string;
    };
}

function getFiliereIcon(niveau: string) {
    const lower = niveau.toLowerCase();
    if (lower.includes('licence')) return <GraduationCap className="icon" size={40} />;
    if (lower.includes('master')) return <GraduationCap className="icon" size={40} />;
    return <MoreHorizontal className="icon" size={40} />;
}

function NavigationCard({
                            icon,
                            title,
                            description,
                            establishment,
                            onClick,
                        }: {
    icon: React.ReactNode;
    title: string;
    description?: string;
    establishment?: string;
    onClick?: () => void;
}) {
    return (
        <div className="dashboard-card" onClick={onClick} style={{ cursor: 'pointer' }}>
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

export default function FilieresByDepartment() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const coded = searchParams.get('code');
    const [filieres, setFilieres] = useState<Filiere[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [departmentName, setDepartmentName] = useState('');

    useEffect(() => {
        const fetchFilieres = async () => {
            try {
                if (!coded) return;

                // First fetch the department name
                const deptResponse = await fetch(`/api/departements/${coded}`);
                if (!deptResponse.ok) throw new Error('Department not found');
                const deptData = await deptResponse.json();
                setDepartmentName(deptData.nom);

                // Then fetch filieres for this department
                const response = await fetch(`/api/filieres?coded=${coded}`);
                if (!response.ok) throw new Error('Error retrieving filières');
                const data = await response.json();
                setFilieres(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unable to load filières');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFilieres();
    }, [coded]);

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-state">
                    <Loader2 className="icon animate-spin" />
                    <p>Loading filières...</p>
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
                <h1 className="text-2xl font-bold mb-4">Filières of Department {departmentName || coded}</h1>
            </div>

            <div className="departments-stats">
                <div className="stat-card">
                    <GraduationCap className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-number">{filieres.length}</span>
                        <span className="stat-label">Filières</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {filieres.length > 0 ? (
                    filieres.map((filiere) => (
                        <NavigationCard
                            key={filiere.codef}
                            icon={getFiliereIcon(filiere.niveau)}
                            title={filiere.intitule}
                            description={`Niveau: ${filiere.niveau}${filiere.duree ? ` (${filiere.duree} years)` : ''}`}
                            establishment={filiere.departement?.nom}
                            onClick={() => router.push(`/filieres/${filiere.codef}/modules`)}
                        />
                    ))
                ) : (
                    <div className="empty-state">
                        <p>No filières found for this department</p>
                    </div>
                )}
            </div>
        </div>
    );
}