'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './filieres.css';

interface Departement {
    coded: string;
    nom: string | null;
}

interface Filiere {
    codef: string;
    intitule: string | null;
    niveau: string | null;
    duree: number | null;
    departement: Departement | null;
}

interface Module {
    codem: string;
    intitule: string | null;
    volumeh: number | null;
    semester: number | null;
}

export default function FilieresPage() {
    const [filieres, setFilieres] = useState<Filiere[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSemester, setSelectedSemester] = useState<{codef: string, semester: string} | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [modulesLoading, setModulesLoading] = useState(false);
    const router = useRouter();

    // State for the add module modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [availableModules, setAvailableModules] = useState<Module[]>([]);
    const [selectedModule, setSelectedModule] = useState<string>('');
    const [isAddingModule, setIsAddingModule] = useState(false);
    const [moduleError, setModuleError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFilieres = async () => {
            try {
                const res = await fetch('/api/filieres');
                if (!res.ok) {
                    throw new Error('Failed to fetch filières');
                }
                const data = await res.json();
                setFilieres(data);
            } catch (err) {
                console.error('Error fetching filières:', err);
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchFilieres();
    }, []);

    useEffect(() => {
        if (selectedSemester) {
            const fetchModules = async () => {
                setModulesLoading(true);
                try {
                    const res = await fetch(
                        `/api/filieres/${selectedSemester.codef}/semesters/${selectedSemester.semester}`
                    );
                    if (!res.ok) {
                        throw new Error('Failed to fetch modules');
                    }
                    const data = await res.json();
                    setModules(data.map((item: any) => item.modules));
                } catch (err) {
                    console.error('Error fetching modules:', err);
                    setError(err instanceof Error ? err.message : 'An unknown error occurred');
                } finally {
                    setModulesLoading(false);
                }
            };

            fetchModules();
        }
    }, [selectedSemester]);

    const handleSemesterClick = (codef: string, semester: string) => {
        setSelectedSemester({ codef, semester });
    };

    const openAddModuleModal = async () => {
        if (selectedSemester) {
            setModuleError(null);
            setIsAddingModule(true);
            try {
                const semesterNumber = parseInt(selectedSemester.semester.replace('S', ''));
                const res = await fetch(`/api/modules?semester=${semesterNumber}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch available modules');
                }
                const data = await res.json();
                setAvailableModules(data);
                setIsModalOpen(true);
            } catch (err) {
                console.error('Error fetching available modules:', err);
                setModuleError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setIsAddingModule(false);
            }
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedModule('');
        setModuleError(null);
    };

    const handleModuleSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedModule(e.target.value);
    };

    const addModuleToSemester = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSemester || !selectedModule) return;

        setIsAddingModule(true);
        setModuleError(null);

        try {
            const res = await fetch(`/api/filieres/${selectedSemester.codef}/semesters/${selectedSemester.semester}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    codem: selectedModule,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to add module');
            }

            const modulesRes = await fetch(
                `/api/filieres/${selectedSemester.codef}/semesters/${selectedSemester.semester}`
            );
            if (!modulesRes.ok) {
                throw new Error('Failed to refresh modules');
            }
            const modulesData = await modulesRes.json();
            setModules(modulesData.map((item: any) => item.modules));

            closeModal();
        } catch (err) {
            console.error('Error adding module:', err);
            setModuleError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsAddingModule(false);
        }
    };

    const removeModule = async (codem: string) => {
        if (!selectedSemester) return;

        if (!confirm('Are you sure you want to remove this module from the semester?')) {
            return;
        }

        try {
            const res = await fetch(
                `/api/filieres/${selectedSemester.codef}/semesters/${selectedSemester.semester}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        codem: codem
                    })
                }
            );

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to remove module');
            }

            setModules(modules.filter(module => module.codem !== codem));
        } catch (err) {
            console.error('Error removing module:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
    };

    if (loading) {
        return <div className="page-content">Loading filières...</div>;
    }

    if (error) {
        return <div className="page-content">Error: {error}</div>;
    }

    return (
        <div className="dashboard-container">


        <div className="page-content">
            <div className="content-wrapper">
                <h1 className="page-title">Gestion des Filières</h1>

                {filieres.length === 0 && !loading && <p className="no-data-message">Aucune filière trouvée.</p>}

                <div className="filieres-grid">
                    {filieres.map((filiere) => (
                        <div key={filiere.codef} className="filiere-card">
                            <div className="filiere-header">
                                {filiere.intitule} ({filiere.niveau}) – {filiere.departement?.nom || 'Département non spécifié'}
                            </div>

                            <div className="semesters-container">
                                {Array.from({ length: filiere.duree ? filiere.duree * 2 : 0 }, (_, i) => {
                                    const semester = `S${i + 1}`;
                                    const isSelected = selectedSemester?.codef === filiere.codef && selectedSemester?.semester === semester;
                                    return (
                                        <div key={i} className="semester-wrapper">
                                            <button
                                                className={`semester-btn ${isSelected ? 'active' : ''}`}
                                                onClick={() => handleSemesterClick(filiere.codef, semester)}
                                            >
                                                Semestre {i + 1}
                                            </button>
                                            {isSelected && (
                                                <div className="semester-details">
                                                    <div className="modules-header">
                                                        <h3>Modules</h3>
                                                        <button
                                                            className="btn-add-module"
                                                            onClick={openAddModuleModal}
                                                            disabled={isAddingModule}
                                                        >
                                                            {isAddingModule ? 'Loading...' : 'Ajouter un module'}
                                                        </button>
                                                    </div>

                                                    {modulesLoading ? (
                                                        <div className="loading-modules">Loading modules...</div>
                                                    ) : modules.length > 0 ? (
                                                        <ul className="modules-list">
                                                            {modules.map((module) => (
                                                                <li key={module.codem} className="module-item">
                                                                    <div className="module-info">
                                                                        <span className="module-title">{module.intitule}</span>
                                                                        <span className="module-hours">{module.volumeh}h</span>
                                                                    </div>
                                                                    <button
                                                                        className="btn-remove-module"
                                                                        onClick={() => removeModule(module.codem)}
                                                                    >
                                                                        &times;
                                                                    </button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <div className="no-modules">Aucun module trouvé pour ce semestre</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Module Modal */}
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-dialog">
                            <div className="modal-header">
                                <h2>Ajouter un Module au Semestre {selectedSemester?.semester.replace('S', '')}</h2>
                                <button className="modal-close-btn" onClick={closeModal}>&times;</button>
                            </div>

                            <form onSubmit={addModuleToSemester} className="modal-form">
                                {moduleError && <div className="error-message">{moduleError}</div>}

                                <div className="form-group">
                                    <label htmlFor="module-select">Sélectionner un module:</label>
                                    <select
                                        id="module-select"
                                        value={selectedModule}
                                        onChange={handleModuleSelection}
                                        required
                                        className="form-select"
                                    >
                                        <option value="">-- Choisir un module --</option>
                                        {availableModules.map(module => (
                                            <option key={module.codem} value={module.codem}>
                                                {module.intitule} ({module.volumeh}h)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="btn-cancel"
                                        onClick={closeModal}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-submit"
                                        disabled={isAddingModule || !selectedModule}
                                    >
                                        {isAddingModule ? 'Ajout en cours...' : 'Ajouter'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
            </div>
    );
}