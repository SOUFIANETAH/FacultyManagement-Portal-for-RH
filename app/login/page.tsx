"use client";
import React, { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiMail, FiLock, FiLogIn, FiLogOut, FiAlertCircle } from "react-icons/fi";
import styles from './login.module.css';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState("");
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      redirect_Role(session?.user?.role as string);
    }
  }, [status, session, router]);

  // Add body class when component mounts
  useEffect(() => {
    document.body.classList.add(styles.loginBody);

    // Clean up function to remove the class when component unmounts
    return () => {
      document.body.classList.remove(styles.loginBody);
    };
  }, []);

  const redirect_Role = (role: string) => {
    switch (role) {
      case "admin":
        window.location.href = "/admin/dashboard";
        break;
      case "dean":
        window.location.href = "/dean/dashboard";

        break;
      case "administration":
        window.location.href = "/administration/dashboard";
        break;
      default:
        router.push("./app");
    }
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError(result.error || "Invalid email or password");
        setIsLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("An error occurred during login. Please try again.");
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
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
        <h1>Se Connecter</h1>
      </div>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <div className={styles.formGroup}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <div className={styles.inputWithIcon}>
              <FiMail className={styles.inputIcon} />
              <input
                className={styles.inputEmail}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Entrez votre email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.inputWithIcon}>
              <FiLock className={styles.inputIcon} />
              <input
                className={styles.inputPassword}
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Entrez votre mot de passe"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.forgotPassword}>
            <Link href="/forgot-password">Mot de passe oublié?</Link>
          </div>

          {error && (
            <div className={`${styles.alert} ${styles.alertDanger}`}>
              <FiAlertCircle className={styles.alertIcon} />
              <div>{error}</div>
            </div>
          )}

          <button
            type="submit"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={isLoading}
          >
            {isLoading ? (
              "Patientez..."
            ) : (
              <>
                <FiLogIn className={styles.btnIcon} />
                <span>Se Connecter</span>
              </>
            )}
          </button>

          {status === "authenticated" && (
            <button
              onClick={handleLogout}
              type="button"
              className={`${styles.btn} ${styles.btnLogout}`}
            >
              <FiLogOut className={styles.btnIcon} />
              <span>Déconnexion</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
