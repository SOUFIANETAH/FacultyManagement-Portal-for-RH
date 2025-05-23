"use client";
import React, { useState, useEffect } from "react";
import "./DeanCreateModule.css";

interface Establishment {
    codee: string;
    nom: string;
}

interface Department {
    coded: string;
    nom: string | null;
    codee: string | null;
}

export default function DeanCreateModule() {
    const [moduleName, setModuleName] = useState("");
    const [establishmentId, setEstablishmentId] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [volumeH, setVolumeH] = useState("");
    const [semester, setSemester] = useState("");
    const [message, setMessage] = useState<
        { type: "error" | "success"; text: string } | null
    >(null);
    const [establishments, setEstablishments] = useState<Establishment[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch establishments on component mount
    useEffect(() => {
        const fetchEstablishments = async () => {
            try {
                const response = await fetch("/api/establishments");
                if (!response.ok) throw new Error("Failed to fetch establishments");
                const data = await response.json();
                setEstablishments(data);
            } catch (error) {
                console.error("Error fetching establishments:", error);
                setMessage({ type: "error", text: "Failed to load establishments" });
            }
        };
        fetchEstablishments();
    }, []);

    // Fetch all departments on establishment change, then filter client-side
    useEffect(() => {
        const fetchDepartments = async () => {
            if (!establishmentId) {
                setDepartments([]);
                return;
            }
            try {
                const response = await fetch("/api/departements");
                if (!response.ok) throw new Error("Failed to fetch departments");
                const allDepartments: Department[] = await response.json();

                // Filter departments by selected establishment codee
                const filtered = allDepartments.filter(
                    (d) => d.codee === establishmentId
                );
                setDepartments(filtered);
            } catch (error) {
                console.error("Error fetching departments:", error);
                setMessage({ type: "error", text: "Failed to load departments" });
            }
        };
        fetchDepartments();
    }, [establishmentId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        if (!moduleName || !establishmentId || !departmentId) {
            setMessage({ type: "error", text: "Please fill in all required fields." });
            setIsLoading(false);
            return;
        }

        try {
            // Generate a module code (you might want to improve this logic)
            const codem = `MOD-${Date.now().toString().slice(-6)}`;

            const response = await fetch("/api/modules", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    codem,
                    intitule: moduleName,
                    volumeh: volumeH ? parseInt(volumeH) : null,
                    semester: semester ? parseInt(semester) : null,
                    establishmentId,
                    departmentId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create module");
            }

            setMessage({ type: "success", text: "Module created successfully!" });

            // Reset form
            setModuleName("");
            setEstablishmentId("");
            setDepartmentId("");
            setVolumeH("");
            setSemester("");
        } catch (error: any) {
            console.error("Error creating module:", error);
            setMessage({ type: "error", text: error.message || "Failed to create module" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dean-create-module-container">
            <h2>Create Module</h2>
            <form className="dean-create-module-form" onSubmit={handleSubmit}>
                <label>
                    Module Name *
                    <input
                        type="text"
                        value={moduleName}
                        onChange={(e) => setModuleName(e.target.value)}
                        placeholder="Enter module name"
                        required
                    />
                </label>

                <label>
                    Volume Horaire
                    <input
                        type="number"
                        value={volumeH}
                        onChange={(e) => setVolumeH(e.target.value)}
                        placeholder="Enter volume horaire"
                        min="0"
                    />
                </label>

                <label>
                    Semester
                    <select value={semester} onChange={(e) => setSemester(e.target.value)}>
                        <option value="">Select semester</option>
                        {[1, 2, 3, 4, 5, 6].map((sem) => (
                            <option key={sem} value={sem}>
                                Semester {sem}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Establishment *
                    <select
                        value={establishmentId}
                        onChange={(e) => {
                            setEstablishmentId(e.target.value);
                            setDepartmentId("");
                        }}
                        required
                    >
                        <option value="">Select establishment</option>
                        {establishments.map((est) => (
                            <option key={est.codee} value={est.codee}>
                                {est.nom}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Department *
                    <select
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                        disabled={!establishmentId || departments.length === 0}
                        required
                    >
                        <option value="">Select department</option>
                        {departments.map((dep) => (
                            <option key={dep.coded} value={dep.coded}>
                                {dep.nom}
                            </option>
                        ))}
                    </select>
                </label>

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Module"}
                </button>

                {message && <div className={`form-message ${message.type}`}>{message.text}</div>}
            </form>
        </div>
    );
}
