"use client";
import { useState } from "react";
import "../modules/register.css";

export default function DemandeCompte() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [cin, setCin] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [telephone, setTelephone] = useState("");
    const [photo, setPhoto] = useState<File | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [role, setRole] = useState("user");
    const [department, setDepartment] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setMessage(null);

        // Client-side validation
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            setIsLoading(false);
            return;
        }

        if (!cin || cin.length < 5) {
            setError("Veuillez entrer un CIN valide.");
            setIsLoading(false);
            return;
        }

        if (!telephone || telephone.length < 10) {
            setError("Veuillez entrer un numéro de téléphone valide.");
            setIsLoading(false);
            return;
        }

        try {
            const fullName = `${firstName} ${lastName}`;

            // Create request data
            const requestData = {
                title: `Demande de compte ${role} pour ${department}`,
                description: `${fullName} (${email}) a demandé un compte ${role} dans le département ${department}.`,
                type: "adduser",
                department,
                userData: {
                    name: fullName,
                    email,
                    password,
                    role,
                    department,
                },
                personData: {
                    prenom: firstName,
                    nom: lastName,
                    cin,
                    date_nai: dateOfBirth,
                    email,
                    adr: address,
                    ville: city,
                    tele: telephone,
                    photo: null,
                }
            };

            // Handle photo if provided
            if (photo) {
                // Validate file size (max 5MB)
                if (photo.size > 5 * 1024 * 1024) {
                    setError("La photo ne doit pas dépasser 5MB.");
                    setIsLoading(false);
                    return;
                }

                // Validate file type
                if (!photo.type.startsWith('image/')) {
                    setError("Veuillez sélectionner un fichier image valide.");
                    setIsLoading(false);
                    return;
                }

                const reader = new FileReader();
                reader.readAsDataURL(photo);

                reader.onload = async () => {
                    const base64String = reader.result as string;
                    const base64Data = base64String.split(',')[1];
                    requestData.personData.photo = base64Data;
                    await sendRequest(requestData);
                };

                reader.onerror = () => {
                    setError("Erreur lors du traitement de la photo.");
                    setIsLoading(false);
                };
            } else {
                await sendRequest(requestData);
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi de la demande :", error);
            setError("Une erreur est survenue lors de la demande.");
            setIsLoading(false);
        }
    };

    const sendRequest = async (requestData: any) => {
        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || "Échec de la demande de compte.");
            }

            setMessage("🎉 Votre demande de compte a été envoyée avec succès! Vous recevrez une notification une fois qu'elle sera traitée.");

            // Reset form
            setFirstName("");
            setLastName("");
            setCin("");
            setDateOfBirth("");
            setAddress("");
            setCity("");
            setTelephone("");
            setPhoto(null);
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setDepartment("");
            setRole("user");

            // Clear message after delay
            setTimeout(() => setMessage(null), 8000);
        } catch (error: any) {
            console.error("Erreur lors de l'envoi de la demande :", error);
            setError(error.message || "Une erreur est survenue lors de la demande.");
        } finally {
            setIsLoading(false);
        }
    };

    const formatPhoneNumber = (value: string) => {
        // Remove all non-digit characters
        const digits = value.replace(/\D/g, '');

        // Format as XX XX XX XX XX for Moroccan numbers
        if (digits.length <= 10) {
            return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
        }
        return digits.slice(0, 10).replace(/(\d{2})(?=\d)/g, '$1 ').trim();
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setTelephone(formatted);
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h1>Demande de Compte</h1>
                <p style={{ textAlign: 'center', color: 'var(--gray-600)', marginBottom: '2rem' }}>
                    Veuillez remplir tous les champs pour soumettre votre demande
                </p>

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="lastName">Nom *</label>
                            <input
                                id="lastName"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                placeholder="Entrez votre nom"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="firstName">Prénom *</label>
                            <input
                                id="firstName"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                placeholder="Entrez votre prénom"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="cin">CIN *</label>
                            <input
                                id="cin"
                                type="text"
                                value={cin}
                                onChange={(e) => setCin(e.target.value.toUpperCase())}
                                required
                                placeholder="Ex: AB123456"
                                maxLength={8}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="dateOfBirth">Date de naissance *</label>
                            <input
                                id="dateOfBirth"
                                type="date"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="address">Adresse *</label>
                            <input
                                id="address"
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                                placeholder="Entrez votre adresse"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="city">Ville *</label>
                            <input
                                id="city"
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                                placeholder="Entrez votre ville"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="telephone">Téléphone *</label>
                            <input
                                id="telephone"
                                type="text"
                                value={telephone}
                                onChange={handlePhoneChange}
                                required
                                placeholder="06 12 34 56 78"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="exemple@email.com"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Mot de passe *</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmer le mot de passe *</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="department">Département *</label>
                            <input
                                id="department"
                                type="text"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                required
                                placeholder="Département demandé"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="role">Rôle *</label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="user">Utilisateur</option>
                                <option value="admin">Administrateur</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="photo">Photo (facultatif, max 5MB)</label>
                        <input
                            id="photo"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    {message && <p className="success-message">{message}</p>}

                    <button type="submit" className="submit-button" disabled={isLoading}>
                        {isLoading ? "Envoi en cours..." : "Soumettre la demande"}
                    </button>
                </form>
            </div>
        </div>
    );
}
