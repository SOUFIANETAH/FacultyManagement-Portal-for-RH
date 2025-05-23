'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import './pers.css';

interface Document {
  iddoc: number;
  titre: string;
  type: string | null;
  chemin: string | null;
  date_creat: Date | string | null;
  version: string | null;
  niveau_confid: number | null;
}

function DocumentIcon({ type }: { type: string | null }) {
  const getIcon = () => {
    switch (type?.toLowerCase()) {
      case 'pdf': return '📕';
      case 'docx': return '📘';
      case 'xlsx': return '📗';
      default: return '📄';
    }
  };
  return <div className={`doc-icon ${type || 'unknown'}`}>{getIcon()}</div>;
}

function getNiveauConfidText(niveau: number | null): string {
  switch (niveau) {
    case 1: return "Public";
    case 2: return "Restreint";
    case 3: return "Confidentiel";
    default: return "Non défini";
  }
}

export default function DocumentsPersonnels() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!session?.user?.id) return;

      try {
        setIsLoading(true);
        const res = await fetch(`/api/documents/personnels/${session.user.id}`);
        if (!res.ok) throw new Error("Erreur lors du chargement des documents personnels");
        const data = await res.json();
        setDocuments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [session]);

  const filteredDocs = documents.filter((doc) =>
      doc.titre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
      <div className="etudiants-page">
        <header className="etudiants-header">
          <h1 className="etudiants-title">Mes Documents Personnels</h1>
          <div className="header-actions">
            <input
                type="text"
                placeholder="Rechercher un document..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <div className="table-container">
          {isLoading ? (
              <div className="loading-indicator">Chargement des documents...</div>
          ) : error ? (
              <div className="error-message">{error}</div>
          ) : (
              <table className="documents-table">
                <thead>
                <tr>
                  <th>Titre</th>
                  <th>Type</th>
                  <th>Chemin</th>
                  <th>Date Création</th>
                  <th>Version</th>
                  <th>Confidentialité</th>
                </tr>
                </thead>
                <tbody>
                {filteredDocs.length === 0 ? (
                    <tr><td colSpan={6}>Aucun document trouvé.</td></tr>
                ) : (
                    filteredDocs.map(doc => (
                        <tr key={doc.iddoc}>
                          <td>
                            <div className="doc-title-container">
                              <DocumentIcon type={doc.type} />
                              <span>{doc.titre}</span>
                            </div>
                          </td>
                          <td>{doc.type || '-'}</td>
                          <td>{doc.chemin || '-'}</td>
                          <td>{doc.date_creat ? new Date(doc.date_creat).toLocaleDateString('fr-FR') : '-'}</td>
                          <td>{doc.version || '-'}</td>
                          <td>
                      <span className={`confid-badge ${getNiveauConfidText(doc.niveau_confid).toLowerCase()}`}>
                        {getNiveauConfidText(doc.niveau_confid)}
                      </span>
                          </td>
                        </tr>
                    ))
                )}
                </tbody>
              </table>
          )}
        </div>
      </div>
  );
}
