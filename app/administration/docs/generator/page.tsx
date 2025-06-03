"use client";
import React, { useState, useEffect } from 'react';
import "./gen.css"
import { Search, FileText, Download, Plus, Edit, Trash2, User, GraduationCap, Building } from 'lucide-react';
import jsPDF from 'jspdf';
import {router} from "next/client";
import {useSession} from "next-auth/react";

const DocumentGenerator = () => {
    const [activeTab, setActiveTab] = useState('student');
    const [searchId, setSearchId] = useState('');
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showTemplateForm, setShowTemplateForm] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        type: 'etudiant',
        title: '',
        content: ''
    });

    // Helper function to handle API responses
    const handleApiResponse = async (response) => {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server returned non-JSON response. Check if API routes are properly configured.');
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return await response.json();
    };
    const { data: session, status , } = useSession();
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }
    }, [status, session, router]);
    // Load templates from database
    const loadTemplates = async () => {
        try {
            const response = await fetch('/api/document-templates');
            const data = await handleApiResponse(response);
            setTemplates(data);
        } catch (error) {
            console.error('Error loading templates:', error);
            // Set some default templates if API fails
            setTemplates([
                {
                    id: 'default-1',
                    type: 'etudiant',
                    title: 'Attestation de Scolarité',
                    content: `ATTESTATION DE SCOLARITÉ

Je soussigné(e), certifie que:

Nom: {{nom}}
Prénom: {{prenom}}
CIN: {{cin}}
CNE: {{cne}}

Est régulièrement inscrit(e) en {{niveau}} à {{etablissement}}.
Département: {{departement}}
Date d'inscription: {{date_inscription}}
Statut: {{statut}}

Cette attestation est délivrée pour servir et valoir ce que de droit.

Fait à {{ville}}, le {{date_actuelle}}`
                },
                {
                    id: 'default-2',
                    type: 'personnel',
                    title: 'Attestation de Travail',
                    content: `ATTESTATION DE TRAVAIL

Je soussigné(e), certifie que:

Nom: {{nom}}
Prénom: {{prenom}}
CIN: {{cin}}

Travaille à {{etablissement}} en qualité de {{fonction}}.
Département: {{departement}}
Spécialité: {{specialite}}
Rôles: {{roles}}

Cette attestation est délivrée pour servir et valoir ce que de droit.

Fait à {{ville}}, le {{date_actuelle}}`
                }
            ]);
            alert('Impossible de charger les modèles depuis la base de données. Utilisation des modèles par défaut.');
        }
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    const searchPerson = async () => {
        if (!searchId.trim()) return;

        setLoading(true);
        try {
            let response;
            if (activeTab === 'student') {
                response = await fetch(`/api/documents/etudiants/${searchId}`);
            } else {
                response = await fetch(`/api/documents/personnel/${searchId}`);
            }

            const result = await handleApiResponse(response);

            if (result.success) {
                setSelectedPerson(result.data);
                setDocuments([]); // Clear previous documents
            } else {
                alert(result.error || 'Personne non trouvée');
                setSelectedPerson(null);
            }
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);

            // For demo purposes, create mock data if API fails
            if (activeTab === 'student') {
                setSelectedPerson({
                    nom: 'Dupont',
                    prenom: 'Jean',
                    cin: 'AB123456',
                    email: 'jean.dupont@email.com',
                    ville: 'Casablanca',
                    cne: searchId,
                    niveau: 'Master 2',
                    statut: 'Actif',
                    date_inscription: '2023-09-15',
                    departement: 'Informatique',
                    etablissement: 'École Nationale Supérieure'
                });
                alert('API non disponible. Utilisation de données de démonstration.');
            } else {
                setSelectedPerson({
                    nom: 'Martin',
                    prenom: 'Marie',
                    cin: 'CD789012',
                    email: 'marie.martin@ecole.ma',
                    ville: 'Rabat',
                    fonction: 'Professeur',
                    specialite: 'Mathématiques',
                    roles: 'Enseignant-Chercheur',
                    departement: 'Sciences',
                    etablissement: 'École Nationale Supérieure'
                });
                alert('API non disponible. Utilisation de données de démonstration.');
            }
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = async (template) => {
        if (!selectedPerson) return;

        try {
            const pdf = new jsPDF();

            // Load and add logo
            try {
                const logoImg = new Image();
                logoImg.crossOrigin = 'anonymous';

                await new Promise((resolve, reject) => {
                    logoImg.onload = resolve;
                    logoImg.onerror = reject;
                    logoImg.src = '/logo-2.png';
                });

                // Add logo to PDF (top center)
                const logoWidth = 30;
                const logoHeight = 20;
                const pageWidth = pdf.internal.pageSize.getWidth();
                const logoX = (pageWidth - logoWidth) / 2;

                pdf.addImage(logoImg, 'PNG', logoX, 10, logoWidth, logoHeight);
            } catch (logoError) {
                console.warn('Could not load logo:', logoError);
                // Continue without logo
            }

            // Process template content
            let content = template.content;

            // Add current date
            const currentDate = new Date().toLocaleDateString('fr-FR');
            content = content.replace(/{{date_actuelle}}/g, currentDate);

            // Replace placeholders with actual data
            Object.keys(selectedPerson).forEach(key => {
                if (key === 'notes' && Array.isArray(selectedPerson[key])) {
                    // Handle special case for notes array
                    let notesContent = '';
                    selectedPerson[key].forEach(note => {
                        notesContent += `Date d'évaluation : ${note.date_val}\n`;
                        notesContent += `Moyenne : ${note.moyenne}/20\n`;
                        notesContent += `Mention : ${note.mention}\n\n`;
                    });

                    // Replace the notes section in template
                    const notesRegex = /{{#notes}}(.*?){{\/notes}}/gs;
                    content = content.replace(notesRegex, notesContent);
                } else {
                    const regex = new RegExp(`{{${key}}}`, 'g');
                    content = content.replace(regex, selectedPerson[key] || '');
                }
            });

            // Replace any remaining placeholders with empty strings
            content = content.replace(/{{[^}]+}}/g, '');

            // Add text to PDF
            const lines = content.split('\n');
            let yPosition = 40; // Start below logo
            const lineHeight = 7;
            const leftMargin = 20;
            const pageHeight = pdf.internal.pageSize.getHeight();

            pdf.setFontSize(12);

            lines.forEach((line, index) => {
                // Check if we need a new page
                if (yPosition > pageHeight - 30) {
                    pdf.addPage();
                    yPosition = 20;
                }

                // Handle title (first non-empty line)
                if (index === 0 && line.trim()) {
                    pdf.setFontSize(16);
                    pdf.setFont(undefined, 'bold');
                    const textWidth = pdf.getTextWidth(line);
                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const xPosition = (pageWidth - textWidth) / 2;
                    pdf.text(line, xPosition, yPosition);
                    pdf.setFontSize(12);
                    pdf.setFont(undefined, 'normal');
                } else if (line.trim()) {
                    // Check if line contains field labels (contains ':')
                    if (line.includes(':')) {
                        const parts = line.split(':');
                        if (parts.length === 2) {
                            pdf.setFont(undefined, 'bold');
                            pdf.text(parts[0] + ':', leftMargin, yPosition);
                            pdf.setFont(undefined, 'normal');
                            const labelWidth = pdf.getTextWidth(parts[0] + ': ');
                            pdf.text(parts[1].trim(), leftMargin + labelWidth, yPosition);
                        } else {
                            pdf.text(line, leftMargin, yPosition);
                        }
                    } else {
                        pdf.text(line, leftMargin, yPosition);
                    }
                }

                yPosition += lineHeight;
            });

            // Save the PDF
            const fileName = `${template.title}_${selectedPerson.nom}_${selectedPerson.prenom}.pdf`;
            pdf.save(fileName);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Erreur lors de la génération du PDF');
        }
    };

    const saveTemplate = async () => {
        if (!newTemplate.title.trim() || !newTemplate.content.trim()) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        try {
            const response = await fetch('/api/document-templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTemplate),
            });

            const savedTemplate = await handleApiResponse(response);

            // Reload templates to get the updated list
            await loadTemplates();

            // Reset form
            setNewTemplate({ type: 'etudiant', title: '', content: '' });
            setShowTemplateForm(false);

            alert('Modèle créé avec succès!');
        } catch (error) {
            console.error('Error saving template:', error);

            // For demo purposes, add template locally if API fails
            const newId = Date.now().toString();
            const localTemplate = { ...newTemplate, id: newId };
            setTemplates(prev => [...prev, localTemplate]);

            // Reset form
            setNewTemplate({ type: 'etudiant', title: '', content: '' });
            setShowTemplateForm(false);

            alert('API non disponible. Modèle ajouté localement pour cette session.');
        }
    };

    const deleteTemplate = async (templateId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) return;

        try {
            const response = await fetch(`/api/document-templates/${templateId}`, {
                method: 'DELETE',
            });

            await handleApiResponse(response);

            // Reload templates to get the updated list
            await loadTemplates();
            alert('Modèle supprimé avec succès!');
        } catch (error) {
            console.error('Error deleting template:', error);

            // For demo purposes, remove template locally if API fails
            setTemplates(prev => prev.filter(t => t.id !== templateId));
            alert('API non disponible. Modèle supprimé localement pour cette session.');
        }
    };

    const filteredTemplates = templates.filter(t =>
        activeTab === 'student' ? t.type === 'etudiant' : t.type === 'personnel'
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6 border-b">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Générateur de Documents</h1>

                        {/* Tab Navigation */}
                        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
                            <button
                                onClick={() => {
                                    setActiveTab('student');
                                    setSelectedPerson(null);
                                    setSearchId('');
                                }}
                                className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                                    activeTab === 'student'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <GraduationCap size={16} />
                                <span>Étudiants</span>
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('personnel');
                                    setSelectedPerson(null);
                                    setSearchId('');
                                }}
                                className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                                    activeTab === 'personnel'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <Building size={16} />
                                <span>Personnel</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Search Section */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h2 className="text-lg font-semibold mb-4 flex items-center">
                                    <Search className="mr-2" size={20} />
                                    Rechercher {activeTab === 'student' ? 'Étudiant' : 'Personnel'}
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {activeTab === 'student' ? 'CNE' : 'ID Personnel'}
                                        </label>
                                        <input
                                            type="text"
                                            value={searchId}
                                            onChange={(e) => setSearchId(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder={activeTab === 'student' ? 'Entrez le CNE' : 'Entrez l\'ID Personnel'}
                                            onKeyPress={(e) => e.key === 'Enter' && searchPerson()}
                                        />
                                    </div>

                                    <button
                                        onClick={searchPerson}
                                        disabled={loading || !searchId.trim()}
                                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {loading ? (
                                            <span>Recherche...</span>
                                        ) : (
                                            <>
                                                <Search className="mr-2" size={16} />
                                                Rechercher
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Person Info */}
                                {selectedPerson && (
                                    <div className="mt-6 p-4 bg-white rounded-lg border">
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                            <User className="mr-2" size={16} />
                                            Informations
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="font-medium">Nom:</span> {selectedPerson.nom}</p>
                                            <p><span className="font-medium">Prénom:</span> {selectedPerson.prenom}</p>
                                            <p><span className="font-medium">CIN:</span> {selectedPerson.cin}</p>
                                            <p><span className="font-medium">Email:</span> {selectedPerson.email}</p>
                                            <p><span className="font-medium">Ville:</span> {selectedPerson.ville}</p>
                                            {activeTab === 'student' && (
                                                <>
                                                    <p><span className="font-medium">CNE:</span> {selectedPerson.cne}</p>
                                                    <p><span className="font-medium">Niveau:</span> {selectedPerson.niveau}</p>
                                                    <p><span className="font-medium">Statut:</span> {selectedPerson.statut}</p>
                                                    <p><span className="font-medium">Date inscription:</span> {selectedPerson.date_inscription}</p>
                                                </>
                                            )}
                                            {activeTab === 'personnel' && (
                                                <>
                                                    <p><span className="font-medium">Fonction:</span> {selectedPerson.fonction}</p>
                                                    <p><span className="font-medium">Spécialité:</span> {selectedPerson.specialite}</p>
                                                    <p><span className="font-medium">Rôles:</span> {selectedPerson.roles}</p>
                                                </>
                                            )}
                                            <p><span className="font-medium">Département:</span> {selectedPerson.departement}</p>
                                            <p><span className="font-medium">Établissement:</span> {selectedPerson.etablissement}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Templates Section */}
                        <div className="lg:col-span-2">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold flex items-center">
                                    <FileText className="mr-2" size={20} />
                                    Modèles de Documents
                                </h2>
                                <button
                                    onClick={() => setShowTemplateForm(true)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                                >
                                    <Plus className="mr-2" size={16} />
                                    Nouveau Modèle
                                </button>
                            </div>

                            {/* Template Form */}
                            {showTemplateForm && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                                    <h3 className="font-semibold mb-3">Créer un nouveau modèle</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                            <select
                                                value={newTemplate.type}
                                                onChange={(e) => setNewTemplate({...newTemplate, type: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="etudiant">Étudiant</option>
                                                <option value="personnel">Personnel</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                                            <input
                                                type="text"
                                                value={newTemplate.title}
                                                onChange={(e) => setNewTemplate({...newTemplate, title: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Titre du document"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
                                            <textarea
                                                value={newTemplate.content}
                                                onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40"
                                                placeholder="Variables disponibles: {{nom}}, {{prenom}}, {{cin}}, {{email}}, {{adresse}}, {{ville}}, {{date_naissance}}, {{departement}}, {{etablissement}}, {{date_actuelle}}

Pour les étudiants: {{cne}}, {{niveau}}, {{date_inscription}}, {{statut}}, {{#notes}}...{{/notes}}
Pour le personnel: {{fonction}}, {{specialite}}, {{roles}}"
                                            />
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={saveTemplate}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                            >
                                                Sauvegarder
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowTemplateForm(false);
                                                    setNewTemplate({ type: 'etudiant', title: '', content: '' });
                                                }}
                                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Templates Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredTemplates.map((template) => (
                                    <div key={template.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-semibold text-gray-900">{template.title}</h3>
                                            <div className="flex space-x-1">
                                                <button
                                                    onClick={() => deleteTemplate(template.id)}
                                                    className="text-red-600 hover:text-red-800 p-1"
                                                    title="Supprimer le modèle"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="text-sm text-gray-600 mb-4 max-h-24 overflow-hidden">
                                            {template.content.substring(0, 150)}...
                                        </div>

                                        <button
                                            onClick={() => generatePDF(template)}
                                            disabled={!selectedPerson}
                                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        >
                                            <Download className="mr-2" size={16} />
                                            Générer PDF
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {filteredTemplates.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>Aucun modèle disponible pour {activeTab === 'student' ? 'les étudiants' : 'le personnel'}</p>
                                    <p className="text-sm mt-2">Créez votre premier modèle en cliquant sur "Nouveau Modèle"</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentGenerator;