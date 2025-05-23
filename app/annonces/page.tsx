"use client";
import React from "react";
import { FiUpload, FiAlertCircle, FiCheckCircle, FiSend } from "react-icons/fi";
import Navbar from "../components/navbar";
import "./annonce.css"

export default function AnnouncementForm() {
  // Initialize state with React.useState explicitly
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [file, setFile] = React.useState(null);
  const [importance, setImportance] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const handleFileChange = React.useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  }, []);

  const handleSubmit = React.useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    if (!title || !content) {
      setError("Veuillez remplir tous les champs obligatoires.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("importance", importance);
    if (file) {
      formData.append("file", file);
    }

    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Échec de l'ajout de l'annonce.");
      }

      setSuccess("Votre annonce a été publiée avec succès!");
      setTitle("");
      setContent("");
      setFile(null);
      setImportance(1);

      const fileInput = document.getElementById("announcement-file");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setError(err.message || "Une erreur s'est produite. Veuillez réessayer plus tard.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }, [title, content, importance, file]);

  return (
      <div className="announcement-container">
        <Navbar />
        <main className="announcement-main">
          <section className="announcement-form-section">
            <h1>Publier une annonce</h1>
            <p>
              Remplissez le formulaire ci-dessous pour ajouter une nouvelle annonce
              qui sera affichée sur la page d'accueil.
            </p>

            <form className="announcement-form" onSubmit={handleSubmit}>
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
                <label htmlFor="title">Titre de l'annonce*</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Titre de votre annonce"
                    required
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">Contenu de l'annonce*</label>
                <textarea
                    id="content"
                    rows={5}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Décrivez votre annonce en détail"
                    required
                />
              </div>

              <div className="form-group">
                <label htmlFor="importance">Niveau d'importance</label>
                <select
                    id="importance"
                    value={importance}
                    onChange={(e) => setImportance(Number(e.target.value))}
                >
                  <option value={1}>Basse</option>
                  <option value={2}>Moyenne</option>
                  <option value={3}>Haute</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="announcement-file">Document associé (optionnel)</label>
                <div className="file-input-container">
                  <input
                      type="file"
                      id="announcement-file"
                      onChange={handleFileChange}
                      className="file-input"
                  />
                  <div className="file-input-label">
                    <FiUpload className="upload-icon" />
                    <span>{file ? file.name : "Sélectionner un fichier"}</span>
                  </div>
                </div>
                <p className="file-help-text">
                  Formats acceptés: PDF, DOC, DOCX, JPG, PNG (max 5MB)
                </p>
              </div>

              <button
                  type="submit"
                  className="submit-button"
                  disabled={isSubmitting}
              >
                {isSubmitting ? "Publication en cours..." : "Publier l'annonce"}
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