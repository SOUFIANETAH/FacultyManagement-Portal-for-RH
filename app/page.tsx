"use client";
import React, { useState, useEffect } from "react";
import Navbar from "./components/navbar";
import Link from "next/link";
import {
  FiUser,
  FiKey,
  FiSend,
  FiAlertCircle,
  FiCheckCircle,
  FiFileText,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";
import "./modules/homepage.css";

interface Document {
  idd: number;
  titre: string;
  type: string;
  chemin: string;
  date_creat: string;
  version: string;
  niveau_confid: number;
}

interface Announcement {
  ida: number;
  titre: string;
  contenu: string;
  date_pub: string;
  deg_imp: number;
  document: Document | null;
}

export default function HomePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch announcements on component mount
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/announcements');

        if (!response.ok) {
          throw new Error('Failed to fetch announcements');
        }

        const data = await response.json();
        setAnnouncements(data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoadingAnnouncements(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Auto-advance slideshow
  useEffect(() => {
    if (announcements.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [announcements, currentSlide]);

  const nextSlide = () => {
    setCurrentSlide(current =>
        current === announcements.length - 1 ? 0 : current + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide(current =>
        current === 0 ? announcements.length - 1 : current - 1
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    if (!name || !email || !message) {
      setError("Veuillez remplir tous les champs.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Message de ${name}`,
          description: message,
          type: "info",
          userId: null, // Anonymous message
        }),
      });

      if (!response.ok) {
        throw new Error("Échec de l'envoi du message.");
      }

      setSuccess("Votre message a été envoyé avec succès. Nous vous répondrons bientôt.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError("Une erreur s'est produite. Veuillez réessayer plus tard.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Function to get importance color
  const getImportanceColor = (degre: number) => {
    switch (degre) {
      case 1: return "var(--importance-low, #4caf50)";
      case 2: return "var(--importance-medium, #ff9800)";
      case 3: return "var(--importance-high, #f44336)";
      default: return "var(--text-color, #333)";
    }
  };

  // Function to check if a file is an image
  const isImage = (path: string) => {
    if (!path) return false;
    const lowerPath = path.toLowerCase();
    return lowerPath.endsWith('.jpg') ||
        lowerPath.endsWith('.jpeg') ||
        lowerPath.endsWith('.png') ||
        lowerPath.endsWith('.gif') ||
        lowerPath.endsWith('.webp');
  };

  return (
      <div className="homepage-container">
        <Navbar />

        <main className="homepage-main">
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-content">
              <h1>Bienvenue à la Faculté Des Sciences</h1>
              <p>
                Système de gestion de personnel
              </p>
            </div>
          </section>

          {/* Announcements Section */}
          <section className="announcements-section">
            <h2>Annonces</h2>
            <div className="slideshow-container">
              {loadingAnnouncements ? (
                  <div className="slideshow-loading">Chargement des annonces...</div>
              ) : announcements.length === 0 ? (
                  <div className="slideshow-placeholder">
                    Aucune annonce disponible pour le moment
                  </div>
              ) : (
                  <>
                    <div className="slideshow-slides">
                      {announcements.map((announcement, index) => (
                          <div
                              key={announcement.ida}
                              className={`slideshow-slide ${index === currentSlide ? 'active' : ''}`}
                          >
                            <div
                                className="announcement-card"
                                style={{ borderLeft: `4px solid ${getImportanceColor(announcement.deg_imp)}` }}
                            >
                              <h3>{announcement.titre}</h3>
                              <p className="announcement-date">
                                {formatDate(announcement.date_pub)}
                              </p>
                              <div className="announcement-content">
                                {announcement.contenu}
                              </div>

                              {announcement.document && (
                                  <div className="announcement-attachment">
                                    <a
                                        href={announcement.document.chemin.startsWith('/')
                                            ? announcement.document.chemin
                                            : `/${announcement.document.chemin}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="attachment-link"
                                    >
                                      {isImage(announcement.document.chemin) ? (
                                          <div className="attachment-preview">
                                            <img
                                                src={announcement.document.chemin.startsWith('/')
                                                    ? announcement.document.chemin
                                                    : `/${announcement.document.chemin}`}
                                                alt={announcement.document.titre}
                                                className="attachment-thumbnail"
                                            />
                                          </div>
                                      ) : (
                                          <div className="attachment-file">
                                            <FiFileText className="file-icon" />
                                            Voir le document attaché
                                          </div>
                                      )}
                                    </a>
                                  </div>
                              )}
                            </div>
                          </div>
                      ))}
                    </div>

                    {announcements.length > 1 && (
                        <>
                          <button
                              className="slideshow-prev"
                              onClick={prevSlide}
                              aria-label="Annonce précédente"
                          >
                            <FiChevronLeft />
                          </button>
                          <button
                              className="slideshow-next"
                              onClick={nextSlide}
                              aria-label="Annonce suivante"
                          >
                            <FiChevronRight />
                          </button>

                          <div className="slideshow-dots">
                            {announcements.map((_, index) => (
                                <button
                                    key={index}
                                    className={`slideshow-dot ${index === currentSlide ? 'active' : ''}`}
                                    onClick={() => setCurrentSlide(index)}
                                    aria-label={`Aller à l'annonce ${index + 1}`}
                                />
                            ))}
                          </div>
                        </>
                    )}
                  </>
              )}
            </div>
          </section>

          {/* Cards Section */}
          <section className="cards-section">
            <div className="card-container">
              <div className="card">
                <FiUser className="card-icon" size={48} />
                <h3>Créer un compte</h3>
                <p>
                  Vous êtes un nouvel étudiant ou membre du personnel? Créez votre compte pour accéder à nos services.
                </p>
                <Link href="/Register" className="card-button">
                  S'inscrire
                </Link>
              </div>

              <div className="card">
                <FiKey className="card-icon" size={48} />
                <h3>Mot de passe oublié</h3>
                <p>
                  Vous avez oublié votre mot de passe? Utilisez notre service de récupération de mot de passe.
                </p>
                <Link href="/forgot-password" className="card-button">
                  Récupérer
                </Link>
              </div>
            </div>
          </section>

          {/* Message Section */}
          <section className="message-section">
            <h2>Nous contacter</h2>
            <p>
              Si vous rencontrez des problèmes ou avez des questions, n'hésitez pas à nous contacter.
            </p>

            <form className="message-form" onSubmit={handleSubmit}>
              {error && (
                  <div className="alert alert-danger">
                    <FiAlertCircle className="alert-icon" size={20} />
                    {error}
                  </div>
              )}

              {success && (
                  <div className="alert alert-success">
                    <FiCheckCircle className="alert-icon" size={20} />
                    {success}
                  </div>
              )}

              <div className="form-group">
                <label htmlFor="name">Nom complet</label>
                <div className="input-with-icon">
                  <FiUser className="input-icon" />
                  <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Votre nom complet"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-with-icon">
                  <FiUser className="input-icon" />
                  <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Votre adresse email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                    id="message"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Décrivez votre problème ou question"
                />
              </div>

              <button
                  type="submit"
                  className="submit-button"
                  disabled={isSubmitting}
              >
                {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                {!isSubmitting && <FiSend className="button-icon" />}
              </button>
            </form>
          </section>
        </main>

        <footer className="homepage-footer">
          <p>&copy; {new Date().getFullYear()} Faculté Des Sciences. Tous droits réservés.</p>
        </footer>
      </div>
  );
}