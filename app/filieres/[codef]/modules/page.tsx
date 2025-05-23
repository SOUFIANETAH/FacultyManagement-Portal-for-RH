'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, BookOpen } from 'lucide-react';
import "./module.css"
interface Module {
    codem: string;
    intitule: string;
    volumeh: number | null;
    semester: number | null;
}

export default function FiliereModules() {
    const params = useParams();
    const codef = params.codef as string;
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filiereInfo, setFiliereInfo] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch filiere info
                const filiereResponse = await fetch(`/api/filieres/${codef}`);
                if (!filiereResponse.ok) throw new Error('Filière not found');
                const filiereData = await filiereResponse.json();
                setFiliereInfo(filiereData);

                // Fetch modules for this filiere
                const modulesResponse = await fetch(`/api/filieres/${codef}/modules`);
                if (!modulesResponse.ok) throw new Error('Error retrieving modules');
                const modulesData = await modulesResponse.json();
                setModules(modulesData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unable to load modules');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [codef]);

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-state">
                    <Loader2 className="icon animate-spin" />
                    <p>Loading modules...</p>
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
                <h1 className="text-2xl font-bold mb-2">Modules for {filiereInfo?.intitule}</h1>
                <p className="text-gray-600 mb-4">
                    {filiereInfo?.niveau} • {filiereInfo?.departement?.nom}
                </p>
            </div>

            <div className="modules-list">
                {modules.length > 0 ? (
                    modules.map((module) => (
                        <div key={module.codem} className="module-card">
                            <BookOpen className="module-icon" size={24} />
                            <div className="module-info">
                                <h3 className="module-title">{module.intitule}</h3>
                                <div className="module-details">
                                    {module.semester && (
                                        <span className="module-semester">Semester {module.semester}:</span>
                                    )}
                                    {module.volumeh && (
                                        <span className="module-hours">{module.volumeh}h</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <p>No modules found for this filière</p>
                    </div>
                )}
            </div>
        </div>
    );
}