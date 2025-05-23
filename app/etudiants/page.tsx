'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiPrinter, FiEye } from 'react-icons/fi';
import './etud.css';

type EtudiantData = {
  idp: number;
  nom: string;
  prenom: string;
  email: string | null;
  cin: string | null;
  adr: string | null;
  ville: string | null;
  date_nai: string | null;
  tele: string | null;
  cne: string | null;
  niveau: string | null;
  statut: string | null;
  date_insc: string | null;
  date_val: string | null;
  moyenne: number | null;
  mention: string | null;
  nbMV: number | null;
  codem: string | null;
};

const FicheEtudiant = ({ etudiant, onClose }: { etudiant: EtudiantData; onClose: () => void }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fiche-modal">
      <div className="fiche-content">
        <div className="fiche-header">
          <h2>Fiche de l'étudiant</h2>
          <div className="fiche-actions">
            <button onClick={handlePrint} className="print-button">
              <FiPrinter /> Imprimer
            </button>
            <button onClick={onClose} className="close-button">
              Fermer
            </button>
          </div>
        </div>
        <div className="fiche-body">
          <table className="fiche-table">
            <tbody>
              <tr>
                <th>Nom :</th>
                <td>{etudiant.nom}</td>
              </tr>
              <tr>
                <th>Prénom :</th>
                <td>{etudiant.prenom}</td>
              </tr>
              <tr>
                <th>CIN :</th>
                <td>{etudiant.cin || '-'}</td>
              </tr>
              <tr>
                <th>Email :</th>
                <td>{etudiant.email || '-'}</td>
              </tr>
              <tr>
                <th>Téléphone :</th>
                <td>{etudiant.tele || '-'}</td>
              </tr>
              <tr>
                <th>Adresse :</th>
                <td>{etudiant.adr || '-'}</td>
              </tr>
              <tr>
                <th>Ville :</th>
                <td>{etudiant.ville || '-'}</td>
              </tr>
              <tr>
                <th>Date de naissance :</th>
                <td>{etudiant.date_nai || '-'}</td>
              </tr>
              <tr>
                <th>CNE :</th>
                <td>{etudiant.cne || '-'}</td>
              </tr>
              <tr>
                <th>Niveau :</th>
                <td>{etudiant.niveau || '-'}</td>
              </tr>
              <tr>
                <th>Statut :</th>
                <td>{etudiant.statut || '-'}</td>
              </tr>
              <tr>
                <th>Date d'inscription :</th>
                <td>{etudiant.date_insc || '-'}</td>
              </tr>
              <tr>
                <th>Date de Validation :</th>
                <td>{etudiant.date_val || 'Non définie'}</td>
              </tr>
              <tr>
                <th>Moyenne :</th>
                <td>{etudiant.moyenne !== null ? etudiant.moyenne : '-'}</td>
              </tr>
              <tr>
                <th>Mention :</th>
                <td>{etudiant.mention || '-'}</td>
              </tr>
              <tr>
                <th>Modules Validés :</th>
                <td>{etudiant.nbMV !== null ? etudiant.nbMV : '-'}</td>
              </tr>
              {etudiant.codem && (
                <tr>
                  <th>Code Module :</th>
                  <td>{etudiant.codem}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function EtudiantsPage() {
  const [etudiants, setEtudiants] = useState<EtudiantData[]>([]);
  const [filteredEtudiants, setFilteredEtudiants] = useState<EtudiantData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEtudiant, setSelectedEtudiant] = useState<EtudiantData | null>(null);

  useEffect(() => {
    async function fetchEtudiants() {
      try {
        const response = await fetch('/api/etudiants');
        if (!response.ok) {
          throw new Error('Problème lors de la récupération des données');
        }
        const data = await response.json();
        console.log('Données reçues:', data);
        setEtudiants(data);
        setFilteredEtudiants(data);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les données des étudiants');
      } finally {
        setLoading(false);
      }
    }

    fetchEtudiants();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term.trim() === '') {
      setFilteredEtudiants(etudiants);
    } else {
      const filtered = etudiants.filter((etudiant) =>
        etudiant.nom.toLowerCase().includes(term) ||
        etudiant.prenom.toLowerCase().includes(term) ||
        (etudiant.cne && etudiant.cne.toLowerCase().includes(term)) ||
        (etudiant.email && etudiant.email.toLowerCase().includes(term)) ||
        (etudiant.cin && etudiant.cin.toLowerCase().includes(term))
      );
      setFilteredEtudiants(filtered);
    }
  };

  const openFiche = (etudiant: EtudiantData) => {
    setSelectedEtudiant(etudiant);
  };

  const closeFiche = () => {
    setSelectedEtudiant(null);
  };

  if (loading) return <div className="loading">Chargement des données...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <h1>Liste des Étudiants</h1>

      <div className="search-container">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Rechercher un étudiant..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table className="etud-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>CNE</th>
              <th>Niveau</th>
              <th>Date de Validation</th>
              <th>Moyenne</th>
              <th>Mention</th>
              <th>Modules Validés</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEtudiants.length > 0 ? (
              filteredEtudiants.map((etudiant) => (
                <tr key={etudiant.idp}>
                  <td>{etudiant.nom}</td>
                  <td>{etudiant.prenom}</td>
                  <td>{etudiant.email || '-'}</td>
                  <td>{etudiant.cne || '-'}</td>
                  <td>{etudiant.niveau || '-'}</td>
                  <td>{etudiant.date_val || 'Non définie'}</td>
                  <td>{etudiant.moyenne !== null ? etudiant.moyenne : '-'}</td>
                  <td>{etudiant.mention || '-'}</td>
                  <td>{etudiant.nbMV !== null ? etudiant.nbMV : '-'}</td>
                  <td className="action-cell">
                    <button onClick={() => openFiche(etudiant)} className="view-button">
                      <FiEye /> Voir
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="no-data">
                  {searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Aucun étudiant trouvé'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedEtudiant && <FicheEtudiant etudiant={selectedEtudiant} onClose={closeFiche} />}
    </div>
  );
}