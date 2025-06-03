'use client';

import { useState } from 'react';
import { Search, User, Phone, Mail, MapPin, Calendar, Briefcase, Award, Building, ImageIcon } from 'lucide-react';
import "./pers.css";

interface PersonnelData {
  idp: number;
  nom: string;
  prenom: string;
  cin?: string;
  adr?: string;
  ville?: string;
  date_nai?: string;
  email?: string;
  tele?: string;
  photo?: string; // base64 string
  personnels?: {
    fonction?: string;
    specialite?: string;
    idpersonnel?: number;
  };
  personne_role?: Array<{
    role: string;
  }>;
  personne_departement?: Array<{
    departements: {
      nom: string;
      coded: string;
    };
  }>;
  isPersonnel?: boolean;
  type?: string;
}

export default function PersonnelPage() {
  const [personData, setPersonData] = useState<PersonnelData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<PersonnelData[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();

    if (!query) {
      setError('Veuillez entrer un terme de recherche');
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowResults(false);
    setPersonData(null);

    try {
      const response = await fetch(`/api/personnel/search?query=${encodeURIComponent(query)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Recherche échouée');
      }

      const results = await response.json();
      setSearchResults(results);
      setShowResults(true);

      if (results.length === 0) {
        setError('Aucun personnel trouvé');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Recherche échouée');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPerson = async (person: PersonnelData) => {
    setIsLoading(true);
    setError(null);
    setShowResults(false);

    try {
      const response = await fetch(`/api/personnel/${person.idp}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec du chargement des données détaillées');
      }

      const detailedData = await response.json();
      setPersonData(detailedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des détails');
      console.error('Detail fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

  const InfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) => (
      <div className="info-item">
        <Icon className="icon" />
        <div className="info-content">
          <span className="label">{label}</span>
          <span className="value">{value || 'N/A'}</span>
        </div>
      </div>
  );

  const PhotoDisplay = ({ photo, nom, prenom }: { photo?: string; nom: string; prenom: string }) => {
    if (photo) {
      return (
          <img
              src={`data:image/jpeg;base64,${photo}`}
              alt={`Photo de ${prenom} ${nom}`}
              className="person-photo"
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '8px',
                objectFit: 'cover',
                border: '2px solid #e5e7eb'
              }}
          />
      );
    }

    return (
        <div
            className="person-photo-placeholder"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '8px',
              backgroundColor: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #e5e7eb'
            }}
        >
          <ImageIcon size={40} color="#9ca3af" />
        </div>
    );
  };

  return (
      <div className="container">
        {/* Header */}
        <h1>Système d'Information Personnel</h1>
        <p className="subtitle">
          Recherchez et consultez les informations du personnel universitaire
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="search-form">
          <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, prénom, CIN ou email..."
              className="search-input"
              disabled={isLoading}
          />
          <button
              type="submit"
              disabled={isLoading}
              className="search-button"
          >
            {isLoading ? 'Recherche...' : 'Rechercher'}
          </button>
        </form>

        {/* Error Display */}
        {error && (
            <div className="error-message">
              {error}
            </div>
        )}

        {/* Loading State */}
        {isLoading && (
            <div className="loading">
              Chargement en cours...
            </div>
        )}

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
            <div className="search-results">
              <h2>Personnel trouvé ({searchResults.length})</h2>
              <div className="results-list">
                {searchResults.map((person) => (
                    <div
                        key={person.idp}
                        className="result-item"
                        onClick={() => handleSelectPerson(person)}
                    >
                      <div className="result-icon-container">
                        <PhotoDisplay
                            photo={person.photo}
                            nom={person.nom}
                            prenom={person.prenom}
                        />
                      </div>
                      <div className="result-details">
                        <h3>{person.prenom} {person.nom}</h3>
                        <p>{person.personnels?.fonction || 'Fonction non spécifiée'}</p>
                        {person.email && <p className="email">{person.email}</p>}
                        <span className="type-badge personnel">
                          Personnel
                        </span>
                      </div>
                      <div className="result-meta">
                        <p>ID: {person.idp}</p>
                        {person.cin && <p>CIN: {person.cin}</p>}
                      </div>
                    </div>
                ))}
              </div>
            </div>
        )}

        {/* Person Details */}
        {personData && (
            <div className="person-details">
              <div className="person-header">
                <div className="person-identity">
                  <PhotoDisplay
                      photo={personData.photo}
                      nom={personData.nom}
                      prenom={personData.prenom}
                  />
                  <div style={{ marginLeft: '20px' }}>
                    <h2>{personData.prenom} {personData.nom}</h2>
                    <p>{personData.personnels?.fonction || 'Personnel'}</p>
                    <span className="type-badge personnel">
                      Personnel
                    </span>
                  </div>
                </div>
                <div className="actions">
                  <button
                      onClick={() => window.print()}
                      className="action-button print-button"
                  >
                    Imprimer
                  </button>
                  <button
                      onClick={() => {
                        setPersonData(null);
                        setSearchQuery('');
                        setShowResults(false);
                        setError(null);
                      }}
                      className="action-button"
                  >
                    Nouvelle recherche
                  </button>
                </div>
              </div>

              <div className="info-sections">
                {/* Personal Information */}
                <div className="info-section">
                  <h3>Informations Personnelles</h3>
                  <div className="info-grid">
                    <InfoItem icon={User} label="Nom complet" value={`${personData.prenom} ${personData.nom}`} />
                    <InfoItem icon={User} label="CIN" value={personData.cin} />
                    <InfoItem icon={MapPin} label="Adresse" value={personData.adr} />
                    <InfoItem icon={MapPin} label="Ville" value={personData.ville} />
                    <InfoItem icon={Calendar} label="Date de naissance" value={formatDate(personData.date_nai)} />
                    <InfoItem icon={Mail} label="Email" value={personData.email} />
                    <InfoItem icon={Phone} label="Téléphone" value={personData.tele} />
                  </div>
                </div>

                {/* Professional Information */}
                <div className="info-section">
                  <h3>Informations Professionnelles</h3>
                  <div className="info-grid">
                    <InfoItem
                        icon={Briefcase}
                        label="Fonction"
                        value={personData.personnels?.fonction}
                    />
                    <InfoItem
                        icon={Award}
                        label="Spécialité"
                        value={personData.personnels?.specialite}
                    />
                    <InfoItem
                        icon={User}
                        label="Rôles"
                        value={personData.personne_role?.map(r => r.role).join(', ')}
                    />
                    <InfoItem
                        icon={Building}
                        label="Département"
                        value={personData.personne_departement?.map(d => d.departements.nom).join(', ')}
                    />
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* Initial State */}
        {!personData && !showResults && !isLoading && !error && (
            <div className="instructions">
              <Briefcase className="icon-large" />
              <h3>Rechercher un membre du personnel</h3>
              <p>
                Utilisez le formulaire ci-dessus pour rechercher et afficher les informations du personnel universitaire
              </p>
            </div>
        )}
      </div>
  );
}