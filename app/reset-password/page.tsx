"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiLock, FiAlertCircle, FiArrowLeft, FiCheck } from "react-icons/fi";
import "../modules/reset-password.css";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Jeton de réinitialisation invalide. Veuillez demander un nouveau jeton de réinitialisation.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit comporter au moins 8 caractères");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Validate token before making the API call
      if (!token || token.trim() === '') {
        setError("Jeton de réinitialisation manquant ou invalide");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/forgot-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Une erreur s'est produite");
      }

      setSuccess(true);
    } catch (error) {
      console.error("Error resetting password:", error);
      setError(error instanceof Error ? error.message : "Une erreur s'est produite lors de la réinitialisation du mot de passe");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-container">
      <div className="logo-container">
        <Image 
          src="/logo-2.png" 
          alt="Faculty Management Logo" 
          width={120} 
          height={120} 
          className="logo-image"
        />
      </div>
      <div className="Signin-container">
        <h1>Réinitialiser le mot de passe</h1>
      </div>

      {!success ? (
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            {!token ? (
              <div className="alert alert-danger">
                <FiAlertCircle className="alert-icon" />
                <div>Jeton de réinitialisation invalide. Veuillez demander un nouveau jeton de réinitialisation.</div>
              </div>
            ) : (
              <>
                <p className="reset-password-info">
                  Veuillez entrer votre nouveau mot de passe.
                </p>
                <div className="input-group">
                  <label htmlFor="password">Nouveau mot de passe</label>
                  <div className="input-with-icon">
                    <FiLock className="input-icon" />
                    <input
                      className="inputPassword"
                      id="password"
                      type="password"
                      placeholder="Entrez votre nouveau mot de passe"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                  <div className="input-with-icon">
                    <FiLock className="input-icon" />
                    <input
                      className="inputPassword"
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirmez votre mot de passe"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger">
                    <FiAlertCircle className="alert-icon" />
                    <div>{error}</div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading || !token}
                >
                  {isLoading ? "Patientez..." : "Réinitialiser le mot de passe"}
                </button>
              </>
            )}

            <div className="back-to-login">
              <Link href="/login">
                <FiArrowLeft className="back-icon" /> Retour à la connexion
              </Link>
            </div>
          </div>
        </form>
      ) : (
        <div className="success-message">
          <div className="alert alert-success">
            <FiCheck className="success-icon" />
            <div>Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</div>
          </div>
          <div className="back-to-login">
            <Link href="/login">
              <FiArrowLeft className="back-icon" /> Aller à la page de connexion
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
