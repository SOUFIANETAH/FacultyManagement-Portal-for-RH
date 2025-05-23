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
    const [department, setDepartment] = useState(""); // fixed from departement
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setMessage(null);

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
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
                    photo: null, // Initialize photo property as null
                }
            };

            // Handle photo if provided
            if (photo) {
                const reader = new FileReader();
                reader.readAsDataURL(photo);

                reader.onload = async () => {
                    // Remove the data:image/jpeg;base64, prefix
                    const base64String = reader.result as string;
                    const base64Data = base64String.split(',')[1];


                    requestData.personData.photo = base64Data;

                    // Send the request
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

            if (!response.ok) {
                throw new Error("Échec de la demande de compte.");
            }

            setMessage("Votre demande de compte a été envoyée avec succès.");
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

            // Optionally clear message after delay
            setTimeout(() => setMessage(null), 5000);
        } catch (error) {
            console.error("Erreur lors de l'envoi de la demande :", error);
            setError("Une erreur est survenue lors de la demande.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h1>Demande de Compte</h1>
                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="lastName">Nom</label>
                            <input
                                id="lastName"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="firstName">Prénom</label>
                            <input
                                id="firstName"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="cin">CIN</label>
                            <input
                                id="cin"
                                type="text"
                                value={cin}
                                onChange={(e) => setCin(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="dateOfBirth">Date de naissance</label>
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
                            <label htmlFor="address">Adresse</label>
                            <input
                                id="address"
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="city">Ville</label>
                            <input
                                id="city"
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="telephone">Téléphone</label>
                            <input
                                id="telephone"
                                type="tel"
                                value={telephone}
                                onChange={(e) => setTelephone(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="photo">Photo</label>
                            <input
                                id="photo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="department">Département</label>
                            <select
                                id="department"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                required
                            >
                                <option value="">Sélectionner un département</option>
                                <option value="Info">Info</option>
                                <option value="Mathematics">Mathématiques</option>
                                <option value="Physics">Physique</option>
                                <option value="Administration">Administration</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Mot de passe</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmer</label>
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
                            <label htmlFor="role">Rôle</label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                            >
                                <option value="user">Utilisateur</option>
                                <option value="doyen">Doyen</option>
                                <option value="vice-doyen">Vice-Doyen</option>
                                <option value="administration">Administration</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? "Chargement..." : "Envoyer"}
                    </button>

                    {error && <div className="error-message">{error}</div>}
                    {message && <div className="success-message">{message}</div>}
                </form>
            </div>
        </div>
    );
}
