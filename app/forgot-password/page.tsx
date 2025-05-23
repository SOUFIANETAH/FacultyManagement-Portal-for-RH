"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiUser, FiAlertCircle, FiArrowLeft, FiCopy, FiCalendar, FiCreditCard } from "react-icons/fi";
import styles from './forgot-password.module.css'; // Import CSS module

export default function ForgotPassword() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cin, setCin] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState("");

  // Add body class when component mounts
  useEffect(() => {
    document.body.classList.add(styles.forgotPasswordBody);

    // Clean up function to remove the class when component unmounts
    return () => {
      document.body.classList.remove(styles.forgotPasswordBody);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    let formattedDate = '';
    if (dateOfBirth) {
      try {
        const date = new Date(dateOfBirth);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
        }
      } catch (error) {
        console.error("Error formatting date:", error);
        setError("Format de date invalide. Veuillez utiliser le format YYYY-MM-DD.");
        setIsLoading(false);
        return;
      }
    }

    try {
      // Additional validation before making the API call
      if (!firstName.trim() || !lastName.trim() || !cin.trim() || !formattedDate) {
        setError("Tous les champs sont requis et doivent être valides");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          cin: cin.trim(),
          dateOfBirth: formattedDate
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Une erreur s'est produite");
      }

      // Store the reset token to display it to the user
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }

      setSuccess(true);
    } catch (error) {
      console.error("Error in forgot password:", error);
      setError(error instanceof Error ? error.message : "Une erreur s'est produite lors de la vérification de vos informations");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resetToken)
        .then(() => {
          alert("Token copié dans le presse-papiers!");
        })
        .catch(err => {
          console.error('Erreur lors de la copie: ', err);
        });
  };

  return (
      <div className={styles.mainContainer}>
        <div className={styles.logoContainer}>
          <Image
              src="/logo-2.png"
              alt="Faculty Management Logo"
              width={120}
              height={120}
              className={styles.logoImage}
          />
        </div>
        <div className={styles.signinContainer}>
          <h1>Réinitialisation de mot de passe</h1>
        </div>

        {!success ? (
            <form onSubmit={handleSubmit} className={styles.loginForm}>
              <div className={styles.formGroup}>
                <p className={styles.forgotPasswordInfo}>
                  Entrez vos informations personnelles pour réinitialiser votre mot de passe.
                </p>
                <div className={styles.inputGroup}>
                  <label htmlFor="firstName">Prénom</label>
                  <div className={styles.inputWithIcon}>
                    <FiUser className={styles.inputIcon} />
                    <input
                        className={styles.inputEmail}
                        id="firstName"
                        type="text"
                        autoComplete="given-name"
                        placeholder="Entrez votre prénom"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="lastName">Nom</label>
                  <div className={styles.inputWithIcon}>
                    <FiUser className={styles.inputIcon} />
                    <input
                        className={styles.inputEmail}
                        id="lastName"
                        type="text"
                        autoComplete="family-name"
                        placeholder="Entrez votre nom"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="cin">CIN (Carte d'identité nationale)</label>
                  <div className={styles.inputWithIcon}>
                    <FiCreditCard className={styles.inputIcon} />
                    <input
                        className={styles.inputEmail}
                        id="cin"
                        type="text"
                        placeholder="Entrez votre CIN"
                        required
                        value={cin}
                        onChange={(e) => setCin(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="dateOfBirth">Date de naissance</label>
                  <div className={styles.inputWithIcon}>
                    <FiCalendar className={styles.inputIcon} />
                    <input
                        className={styles.inputEmail}
                        id="dateOfBirth"
                        type="date"
                        required
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                    <div className={`${styles.alert} ${styles.alertDanger}`}>
                      <FiAlertCircle className={styles.alertIcon} />
                      <div>{error}</div>
                    </div>
                )}

                <button
                    type="submit"
                    className={styles.btnPrimary}
                    disabled={isLoading}
                >
                  {isLoading ? "Patientez..." : "Vérifier mes informations"}
                </button>

                <div className={styles.backToLogin}>
                  <Link href="/login">
                    <FiArrowLeft className={styles.backIcon} /> Retour à la connexion
                  </Link>
                </div>
              </div>
            </form>
        ) : (
            <div className={styles.successMessage}>
              <div className={`${styles.alert} ${styles.alertSuccess}`}>
                <div>
                  <p>Vos informations ont été vérifiées avec succès.</p>
                  <p>Votre jeton de réinitialisation de mot de passe a été généré:</p>
                  <div className={styles.resetTokenContainer}>
                    <code className={styles.resetToken}>{resetToken}</code>
                    <button onClick={copyToClipboard} className={styles.copyButton}>
                      <FiCopy /> Copier
                    </button>
                  </div>
                  <p>Utilisez ce jeton sur la page de réinitialisation de mot de passe:</p>
                  <Link href={`/reset-password?token=${resetToken}`} className={styles.resetLink}>
                    Aller à la page de réinitialisation
                  </Link>
                </div>
              </div>
              <div className={styles.backToLogin}>
                <Link href="/login">
                  <FiArrowLeft className={styles.backIcon} /> Retour à la connexion
                </Link>
              </div>
            </div>
        )}
      </div>
  );
}