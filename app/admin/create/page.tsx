"use client";

import React, { useState } from "react";
import styles from './create.module.css';

export default function CreerUtil() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
        nom: "",
        prenom: "",
        cin: "",
        adr: "",
        ville: "",
        date_nai: "",
        tele: "",
        department: ""
    });
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage(null);

        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create user");
            }

            setStatusMessage("User and person created successfully!");
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "user",
                nom: "",
                prenom: "",
                cin: "",
                adr: "",
                ville: "",
                date_nai: "",
                tele: "",
                department: ""
            });
        } catch (error) {
            setStatusMessage((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.createUserFormContainer}>
            <h1 className={styles.heading}>Créer un utilisateur</h1>
            <div className={styles.formSection}>
                <form onSubmit={handleSubmit}>
                    <h2>User Information</h2>
                    <div className={styles.formGroup}>
                        <label>
                            Display Name:
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </div>

                    <div className={styles.formGroup}>
                        <label>
                            Email:
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </div>

                    <div className={styles.formGroup}>
                        <label>
                            Password:
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </div>

                    <div className={styles.formGroup}>
                        <label>
                            Role:
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="admin">Admin</option>
                                <option value="dean">Doyen</option>
                                <option value="Vicedean">Vice Doyen</option>
                                <option value="administration">Administration</option>
                            </select>
                        </label>
                    </div>

                    <div className={styles.formGroup}>
                        <label>
                            Department:
                            <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                            />
                        </label>
                    </div>

                    <h2>Personal Information</h2>
                    <div className={styles.formGroup}>
                        <label>
                            Last Name (Nom):
                            <input
                                type="text"
                                name="nom"
                                value={formData.nom}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </div>

                    <div className={styles.formGroup}>
                        <label>
                            First Name (Prénom):
                            <input
                                type="text"
                                name="prenom"
                                value={formData.prenom}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </div>

                    <div className={styles.formGroup}>
                        <label>
                            CIN:
                            <input
                                type="text"
                                name="cin"
                                value={formData.cin}
                                onChange={handleChange}
                            />
                        </label>
                    </div>

                    <div className={styles.formGroup}>
                        <label>
                            Address (Adresse):
                            <input
                                type="text"
                                name="adr"
                                value={formData.adr}
                                onChange={handleChange}
                            />
                        </label>
                    </div>

                    <div className={styles.formGroup}>
                        <label>
                            City (Ville):
                            <input
                                type="text"
                                name="ville"
                                value={formData.ville}
                                onChange={handleChange}
                            />
                        </label>
                    </div>

                    <div className={styles.formGroup}>
                        <label>
                            Birth Date (Date de naissance):
                            <input
                                type="date"
                                name="date_nai"
                                value={formData.date_nai}
                                onChange={handleChange}
                            />
                        </label>
                    </div>

                    <div className={styles.formGroup}>
                        <label>
                            Phone (Téléphone):
                            <input
                                type="text"
                                name="tele"
                                value={formData.tele}
                                onChange={handleChange}
                            />
                        </label>
                    </div>

                    <button className={styles.button} type="submit" disabled={loading}>
                        {loading ? "Création..." : "Créer un utilisateur"}
                    </button>
                </form>
            </div>

            {statusMessage && <p className={styles.statusMessage}>{statusMessage}</p>}
        </div>
    );
}