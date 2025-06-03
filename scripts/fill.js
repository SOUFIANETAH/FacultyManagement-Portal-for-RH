import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // Clear existing data (optional - be careful with this in production)
    await prisma.personne_role.deleteMany();
    await prisma.personne_departement.deleteMany();
    await prisma.personne_annonce.deleteMany();
    await prisma.personne_document.deleteMany();
    await prisma.date_val.deleteMany();
    await prisma.etudiants.deleteMany();
    await prisma.personnels.deleteMany();
    await prisma.personne.deleteMany();
    await prisma.filiere_module.deleteMany();
    await prisma.modules.deleteMany();
    await prisma.filieres.deleteMany();
    await prisma.departements.deleteMany();
    await prisma.etablissements.deleteMany();
    await prisma.annonces.deleteMany();
    await prisma.document_templates.deleteMany();

    // Create establishments
    const establishments = await Promise.all([
        prisma.etablissements.create({
            data: {
                codee: 'FS',
                nom: 'Faculté des Sciences',
                adresse: 'Avenue des Facultés',
                ville: 'Casablanca',
                code_postal: '20000'
            }
        }),
        prisma.etablissements.create({
            data: {
                codee: 'FLSH',
                nom: 'Faculté des Lettres et Sciences Humaines',
                adresse: 'Boulevard des Humanités',
                ville: 'Casablanca',
                code_postal: '20000'
            }
        }),
        prisma.etablissements.create({
            data: {
                codee: 'FSJES',
                nom: 'Faculté des Sciences Juridiques, Économiques et Sociales',
                adresse: 'Rue des Juristes',
                ville: 'Casablanca',
                code_postal: '20000'
            }
        })
    ]);

    // Create departments for FS
    const departments = await Promise.all([
        prisma.departements.create({
            data: {
                coded: 'INFO',
                nom: 'Département d\'Informatique',
                description: 'Département dédié aux sciences informatiques',
                date_creat: new Date('2000-01-01'),
                codee: 'FS'
            }
        }),
        prisma.departements.create({
            data: {
                coded: 'MATH',
                nom: 'Département de Mathématiques',
                description: 'Département dédié aux mathématiques pures et appliquées',
                date_creat: new Date('2000-01-01'),
                codee: 'FS'
            }
        }),
        prisma.departements.create({
            data: {
                coded: 'PHYS',
                nom: 'Département de Physique',
                description: 'Département dédié à la physique fondamentale et appliquée',
                date_creat: new Date('2000-01-01'),
                codee: 'FS'
            }
        })
    ]);

    // Create filieres for each department
    const filieres = await Promise.all([
        // Informatique filieres
        prisma.filieres.create({
            data: {
                codef: 'SMI',
                niveau: 'Licence',
                duree: 3,
                intitule: 'Sciences Mathématiques et Informatique',
                coded: 'INFO'
            }
        }),
        prisma.filieres.create({
            data: {
                codef: 'ISOC',
                niveau: 'Licence d\'Excellence',
                duree: 3,
                intitule: 'Ingénierie des Systèmes et des Objets Connectés',
                coded: 'INFO'
            }
        }),
        prisma.filieres.create({
            data: {
                codef: 'AI',
                niveau: 'Master',
                duree: 2,
                intitule: 'Intelligence Artificielle',
                coded: 'INFO'
            }
        }),
        prisma.filieres.create({
            data: {
                codef: 'DIG',
                niveau: 'Master d\'Excellence',
                duree: 2,
                intitule: 'Digitalisation et Transformation Digitale',
                coded: 'INFO'
            }
        }),
        prisma.filieres.create({
            data: {
                codef: 'GENIE',
                niveau: 'Doctorat',
                duree: 3,
                intitule: 'Génie Informatique',
                coded: 'INFO'
            }
        }),

        // Mathématiques filieres
        prisma.filieres.create({
            data: {
                codef: 'SMA',
                niveau: 'Licence',
                duree: 3,
                intitule: 'Sciences Mathématiques et Applications',
                coded: 'MATH'
            }
        }),
        prisma.filieres.create({
            data: {
                codef: 'SMAD',
                niveau: 'Master',
                duree: 2,
                intitule: 'Systèmes et Modèles Appliqués aux Données',
                coded: 'MATH'
            }
        }),

        // Physique filieres
        prisma.filieres.create({
            data: {
                codef: 'SP',
                niveau: 'Licence',
                duree: 3,
                intitule: 'Sciences Physiques',
                coded: 'PHYS'
            }
        }),
        prisma.filieres.create({
            data: {
                codef: 'MP',
                niveau: 'Master',
                duree: 2,
                intitule: 'Mécanique et Physique',
                coded: 'PHYS'
            }
        })
    ]);

    // Create modules for each filiere
    const modules = await Promise.all([
        // SMI modules
        prisma.modules.create({ data: { codem: 'SMI1', intitule: 'Algorithmique', volumeh: 60, semester: 1 } }),
        prisma.modules.create({ data: { codem: 'SMI2', intitule: 'Programmation C', volumeh: 60, semester: 1 } }),
        prisma.modules.create({ data: { codem: 'SMI3', intitule: 'Mathématiques Discrètes', volumeh: 60, semester: 1 } }),
        prisma.modules.create({ data: { codem: 'SMI4', intitule: 'Systèmes d\'Exploitation', volumeh: 60, semester: 2 } }),
        prisma.modules.create({ data: { codem: 'SMI5', intitule: 'Bases de Données', volumeh: 60, semester: 2 } }),

        // ISOC modules
        prisma.modules.create({ data: { codem: 'ISOC1', intitule: 'UML', volumeh: 60, semester: 1 } }),
        prisma.modules.create({ data: { codem: 'ISOC2', intitule: 'Développement Embarqué', volumeh: 60, semester: 1 } }),
        prisma.modules.create({ data: { codem: 'ISOC3', intitule: 'Programmation Réseau', volumeh: 60, semester: 1 } }),
        prisma.modules.create({ data: { codem: 'ISOC4', intitule: 'IoT', volumeh: 60, semester: 2 } }),
        prisma.modules.create({ data: { codem: 'ISOC5', intitule: 'Sécurité des Systèmes', volumeh: 60, semester: 2 } }),

        // AI modules
        prisma.modules.create({ data: { codem: 'AI1', intitule: 'Machine Learning', volumeh: 60, semester: 1 } }),
        prisma.modules.create({ data: { codem: 'AI2', intitule: 'Deep Learning', volumeh: 60, semester: 1 } }),
        prisma.modules.create({ data: { codem: 'AI3', intitule: 'Traitement du Langage Naturel', volumeh: 60, semester: 2 } }),
        prisma.modules.create({ data: { codem: 'AI4', intitule: 'Vision par Ordinateur', volumeh: 60, semester: 2 } }),

        // SMA modules
        prisma.modules.create({ data: { codem: 'SMA1', intitule: 'Algèbre Linéaire', volumeh: 60, semester: 1 } }),
        prisma.modules.create({ data: { codem: 'SMA2', intitule: 'Analyse Réelle', volumeh: 60, semester: 1 } }),
        prisma.modules.create({ data: { codem: 'SMA3', intitule: 'Probabilités', volumeh: 60, semester: 2 } }),
        prisma.modules.create({ data: { codem: 'SMA4', intitule: 'Statistiques', volumeh: 60, semester: 2 } }),

        // SP modules
        prisma.modules.create({ data: { codem: 'SP1', intitule: 'Mécanique du Point', volumeh: 60, semester: 1 } }),
        prisma.modules.create({ data: { codem: 'SP2', intitule: 'Electromagnétisme', volumeh: 60, semester: 1 } }),
        prisma.modules.create({ data: { codem: 'SP3', intitule: 'Thermodynamique', volumeh: 60, semester: 2 } }),
        prisma.modules.create({ data: { codem: 'SP4', intitule: 'Optique', volumeh: 60, semester: 2 } })
    ]);

    // Create filiere_module relationships
    await Promise.all([
        // SMI modules
        prisma.filiere_module.create({ data: { codef: 'SMI', codem: 'SMI1' } }),
        prisma.filiere_module.create({ data: { codef: 'SMI', codem: 'SMI2' } }),
        prisma.filiere_module.create({ data: { codef: 'SMI', codem: 'SMI3' } }),
        prisma.filiere_module.create({ data: { codef: 'SMI', codem: 'SMI4' } }),
        prisma.filiere_module.create({ data: { codef: 'SMI', codem: 'SMI5' } }),

        // ISOC modules
        prisma.filiere_module.create({ data: { codef: 'ISOC', codem: 'ISOC1' } }),
        prisma.filiere_module.create({ data: { codef: 'ISOC', codem: 'ISOC2' } }),
        prisma.filiere_module.create({ data: { codef: 'ISOC', codem: 'ISOC3' } }),
        prisma.filiere_module.create({ data: { codef: 'ISOC', codem: 'ISOC4' } }),
        prisma.filiere_module.create({ data: { codef: 'ISOC', codem: 'ISOC5' } }),

        // AI modules
        prisma.filiere_module.create({ data: { codef: 'AI', codem: 'AI1' } }),
        prisma.filiere_module.create({ data: { codef: 'AI', codem: 'AI2' } }),
        prisma.filiere_module.create({ data: { codef: 'AI', codem: 'AI3' } }),
        prisma.filiere_module.create({ data: { codef: 'AI', codem: 'AI4' } }),

        // SMA modules
        prisma.filiere_module.create({ data: { codef: 'SMA', codem: 'SMA1' } }),
        prisma.filiere_module.create({ data: { codef: 'SMA', codem: 'SMA2' } }),
        prisma.filiere_module.create({ data: { codef: 'SMA', codem: 'SMA3' } }),
        prisma.filiere_module.create({ data: { codef: 'SMA', codem: 'SMA4' } }),

        // SP modules
        prisma.filiere_module.create({ data: { codef: 'SP', codem: 'SP1' } }),
        prisma.filiere_module.create({ data: { codef: 'SP', codem: 'SP2' } }),
        prisma.filiere_module.create({ data: { codef: 'SP', codem: 'SP3' } }),
        prisma.filiere_module.create({ data: { codef: 'SP', codem: 'SP4' } })
    ]);

    // Create personnel (Dean, Vice Dean, and 5 admin staff)
    const dean = await prisma.personne.create({
        data: {
            nom: 'El Kadi',
            prenom: 'Ahmed',
            cin: 'AB123456',
            adr: '123 Avenue des Facultés',
            ville: 'Casablanca',
            date_nai: new Date('1970-05-15'),
            email: 'ahmed.elkadi@univ.edu',
            tele: '0612345678',
            personnels: {
                create: {
                    fonction: 'Doyen',
                    specialite: 'Gestion Universitaire'
                }
            },
            personne_departement: {
                create: {
                    coded: 'INFO'
                }
            },
            personne_role: {
                create: {
                    role: 'DEAN'
                }
            }
        }
    });

    const viceDean = await prisma.personne.create({
        data: {
            nom: 'Benani',
            prenom: 'Fatima',
            cin: 'CD789012',
            adr: '456 Boulevard des Humanités',
            ville: 'Casablanca',
            date_nai: new Date('1975-08-20'),
            email: 'fatima.benani@univ.edu',
            tele: '0623456789',
            personnels: {
                create: {
                    fonction: 'Vice-Doyen',
                    specialite: 'Pédagogie'
                }
            },
            personne_departement: {
                create: {
                    coded: 'INFO'
                }
            },
            personne_role: {
                create: {
                    role: 'VICE_DEAN'
                }
            }
        }
    });

    // Create 5 admin staff
    const adminStaff = await Promise.all([
        prisma.personne.create({
            data: {
                nom: 'Alaoui',
                prenom: 'Karim',
                cin: 'EF345678',
                adr: '789 Rue des Administrateurs',
                ville: 'Casablanca',
                date_nai: new Date('1980-03-10'),
                email: 'karim.alaoui@univ.edu',
                tele: '0634567890',
                personnels: {
                    create: {
                        fonction: 'Administrateur',
                        specialite: 'Gestion des Ressources'
                    }
                },
                personne_departement: {
                    create: {
                        coded: 'INFO'
                    }
                },
                personne_role: {
                    create: {
                        role: 'ADMIN'
                    }
                }
            }
        }),
        prisma.personne.create({
            data: {
                nom: 'Bennis',
                prenom: 'Leila',
                cin: 'GH456789',
                adr: '101 Avenue des Services',
                ville: 'Casablanca',
                date_nai: new Date('1982-07-22'),
                email: 'leila.bennis@univ.edu',
                tele: '0645678901',
                personnels: {
                    create: {
                        fonction: 'Secrétaire',
                        specialite: 'Accueil et Scolarité'
                    }
                },
                personne_departement: {
                    create: {
                        coded: 'INFO'
                    }
                },
                personne_role: {
                    create: {
                        role: 'ADMIN'
                    }
                }
            }
        }),
        prisma.personne.create({
            data: {
                nom: 'Cherkaoui',
                prenom: 'Youssef',
                cin: 'IJ567890',
                adr: '202 Boulevard des Employés',
                ville: 'Casablanca',
                date_nai: new Date('1985-11-05'),
                email: 'youssef.cherkaoui@univ.edu',
                tele: '0656789012',
                personnels: {
                    create: {
                        fonction: 'Technicien',
                        specialite: 'Informatique'
                    }
                },
                personne_departement: {
                    create: {
                        coded: 'INFO'
                    }
                },
                personne_role: {
                    create: {
                        role: 'ADMIN'
                    }
                }
            }
        }),
        prisma.personne.create({
            data: {
                nom: 'Daoudi',
                prenom: 'Nadia',
                cin: 'KL678901',
                adr: '303 Rue des Assistants',
                ville: 'Casablanca',
                date_nai: new Date('1988-09-18'),
                email: 'nadia.daoudi@univ.edu',
                tele: '0667890123',
                personnels: {
                    create: {
                        fonction: 'Comptable',
                        specialite: 'Finances'
                    }
                },
                personne_departement: {
                    create: {
                        coded: 'INFO'
                    }
                },
                personne_role: {
                    create: {
                        role: 'ADMIN'
                    }
                }
            }
        }),
        prisma.personne.create({
            data: {
                nom: 'El Fassi',
                prenom: 'Mehdi',
                cin: 'MN789012',
                adr: '404 Avenue des Gestionnaires',
                ville: 'Casablanca',
                date_nai: new Date('1990-12-30'),
                email: 'mehdi.elfassi@univ.edu',
                tele: '0678901234',
                personnels: {
                    create: {
                        fonction: 'Responsable Scolarité',
                        specialite: 'Gestion des Étudiants'
                    }
                },
                personne_departement: {
                    create: {
                        coded: 'INFO'
                    }
                },
                personne_role: {
                    create: {
                        role: 'ADMIN'
                    }
                }
            }
        })
    ]);

    // Create 5 students with their scores
    const students = await Promise.all([
        // Student 1 - ISOC
        prisma.personne.create({
            data: {
                nom: 'Zouhairi',
                prenom: 'Amine',
                cin: 'OP901234',
                adr: '505 Rue des Étudiants',
                ville: 'Casablanca',
                date_nai: new Date('2000-02-15'),
                email: 'amine.zouhairi@etu.univ.edu',
                tele: '0689012345',
                etudiants: {
                    create: {
                        cne: 'E123456789',
                        niveau: 'Licence d\'Excellence',
                        date_insc: new Date('2020-09-01'),
                        statut: 'Actif',
                        date_val: {
                            create: [
                                { date_val: new Date('2021-01-15'), moyenne: 18.5, mention: 'Très Bien', codem: 'ISOC1' },
                                { date_val: new Date('2021-01-15'), moyenne: 17.0, mention: 'Bien', codem: 'ISOC2' },
                                { date_val: new Date('2021-06-20'), moyenne: 16.5, mention: 'Bien', codem: 'ISOC3' },
                                { date_val: new Date('2021-06-20'), moyenne: 19.0, mention: 'Très Bien', codem: 'ISOC4' }
                            ]
                        }
                    }
                },
                personne_departement: {
                    create: {
                        coded: 'INFO'
                    }
                }
            }
        }),

        // Student 2 - SMI
        prisma.personne.create({
            data: {
                nom: 'Benjelloun',
                prenom: 'Sara',
                cin: 'QR012345',
                adr: '606 Avenue des Étudiantes',
                ville: 'Casablanca',
                date_nai: new Date('2001-04-20'),
                email: 'sara.benjelloun@etu.univ.edu',
                tele: '0690123456',
                etudiants: {
                    create: {
                        cne: 'E234567890',
                        niveau: 'Licence',
                        date_insc: new Date('2020-09-01'),
                        statut: 'Actif',
                        date_val: {
                            create: [
                                { date_val: new Date('2021-01-15'), moyenne: 15.5, mention: 'Assez Bien', codem: 'SMI1' },
                                { date_val: new Date('2021-01-15'), moyenne: 14.0, mention: 'Passable', codem: 'SMI2' },
                                { date_val: new Date('2021-06-20'), moyenne: 16.0, mention: 'Bien', codem: 'SMI3' },
                                { date_val: new Date('2021-06-20'), moyenne: 13.5, mention: 'Passable', codem: 'SMI4' }
                            ]
                        }
                    }
                },
                personne_departement: {
                    create: {
                        coded: 'INFO'
                    }
                }
            }
        }),

        // Student 3 - AI
        prisma.personne.create({
            data: {
                nom: 'Khaldi',
                prenom: 'Yassin',
                cin: 'ST123456',
                adr: '707 Boulevard des Masters',
                ville: 'Casablanca',
                date_nai: new Date('1998-07-10'),
                email: 'yassin.khaldi@etu.univ.edu',
                tele: '0612345678',
                etudiants: {
                    create: {
                        cne: 'E345678901',
                        niveau: 'Master',
                        date_insc: new Date('2021-09-01'),
                        statut: 'Actif',
                        date_val: {
                            create: [
                                { date_val: new Date('2022-01-20'), moyenne: 17.5, mention: 'Bien', codem: 'AI1' },
                                { date_val: new Date('2022-01-20'), moyenne: 18.0, mention: 'Très Bien', codem: 'AI2' },
                                { date_val: new Date('2022-06-25'), moyenne: 16.5, mention: 'Bien', codem: 'AI3' }
                            ]
                        }
                    }
                },
                personne_departement: {
                    create: {
                        coded: 'INFO'
                    }
                }
            }
        }),

        // Student 4 - SMA
        prisma.personne.create({
            data: {
                nom: 'Mansouri',
                prenom: 'Hicham',
                cin: 'UV234567',
                adr: '808 Rue des Mathématiciens',
                ville: 'Casablanca',
                date_nai: new Date('1999-09-25'),
                email: 'hicham.mansouri@etu.univ.edu',
                tele: '0623456789',
                etudiants: {
                    create: {
                        cne: 'E456789012',
                        niveau: 'Licence',
                        date_insc: new Date('2020-09-01'),
                        statut: 'Actif',
                        date_val: {
                            create: [
                                { date_val: new Date('2021-01-15'), moyenne: 14.5, mention: 'Assez Bien', codem: 'SMA1' },
                                { date_val: new Date('2021-01-15'), moyenne: 15.0, mention: 'Bien', codem: 'SMA2' },
                                { date_val: new Date('2021-06-20'), moyenne: 13.0, mention: 'Passable', codem: 'SMA3' }
                            ]
                        }
                    }
                },
                personne_departement: {
                    create: {
                        coded: 'MATH'
                    }
                }
            }
        }),

        // Student 5 - SP
        prisma.personne.create({
            data: {
                nom: 'Rahmouni',
                prenom: 'Lina',
                cin: 'WX345678',
                adr: '909 Avenue des Physiciens',
                ville: 'Casablanca',
                date_nai: new Date('2000-11-30'),
                email: 'lina.rahmouni@etu.univ.edu',
                tele: '0634567890',
                etudiants: {
                    create: {
                        cne: 'E567890123',
                        niveau: 'Licence',
                        date_insc: new Date('2020-09-01'),
                        statut: 'Actif',
                        date_val: {
                            create: [
                                { date_val: new Date('2021-01-15'), moyenne: 16.5, mention: 'Bien', codem: 'SP1' },
                                { date_val: new Date('2021-01-15'), moyenne: 17.0, mention: 'Bien', codem: 'SP2' },
                                { date_val: new Date('2021-06-20'), moyenne: 15.5, mention: 'Assez Bien', codem: 'SP3' }
                            ]
                        }
                    }
                },
                personne_departement: {
                    create: {
                        coded: 'PHYS'
                    }
                }
            }
        })
    ]);

    // Create announcements
    const announcements = await Promise.all([
        prisma.annonces.create({
            data: {
                titre: 'Réunion du Département',
                contenu: 'Une réunion du département d\'informatique est prévue le 15/06/2023 à 10h en salle B12.',
                date_pub: new Date('2023-05-30'),
                deg_imp: 2,
                personne_annonce: {
                    create: {
                        idp: dean.idp
                    }
                }
            }
        }),
        prisma.annonces.create({
            data: {
                titre: 'Inscriptions Pédagogiques',
                contenu: 'Les inscriptions pédagogiques pour le semestre d\'automne 2023 débuteront le 1er juillet.',
                date_pub: new Date('2023-06-10'),
                deg_imp: 1,
                personne_annonce: {
                    create: {
                        idp: viceDean.idp
                    }
                }
            }
        }),
        prisma.annonces.create({
            data: {
                titre: 'Stage en Entreprise',
                contenu: 'Des offres de stage sont disponibles au bureau des relations entreprises pour les étudiants en Master.',
                date_pub: new Date('2023-06-05'),
                deg_imp: 3,
                personne_annonce: {
                    create: {
                        idp: adminStaff[4].idp
                    }
                }
            }
        })
    ]);

    // Create document templates (same as in your generator page)
    const templates = await Promise.all([
        prisma.document_templates.create({
            data: {
                type: 'etudiant',
                title: 'Certificat de Scolarité',
                content: `CERTIFICAT DE SCOLARITÉ

Je soussigné(e), Directeur/Directrice de l'établissement, certifie que :

Nom : {{nom}}
Prénom : {{prenom}}
CNE : {{cne}}
CIN : {{cin}}
Date de naissance : {{date_nai}}
Adresse : {{adr}}
Ville : {{ville}}

Est régulièrement inscrit(e) en {{niveau}} pour l'année universitaire en cours.

Date d'inscription : {{date_insc}}
Statut : {{statut}}

Ce certificat est délivré pour servir et valoir ce que de droit.

Fait le {{date_actuelle}}`
            }
        }),
        prisma.document_templates.create({
            data: {
                type: 'etudiant',
                title: 'Relevé de Notes',
                content: `RELEVÉ DE NOTES

Établissement : {{etablissement}}
Département : {{departement}}
Année universitaire : [Année en cours]

INFORMATIONS ÉTUDIANT :
Nom : {{nom}}
Prénom : {{prenom}}
CNE : {{cne}}
Niveau : {{niveau}}

RÉSULTATS ACADÉMIQUES :
{{#notes}}
Date d'évaluation : {{date_val}}
Moyenne : {{moyenne}}/20
Mention : {{mention}}

{{/notes}}

Le Directeur des Études`
            }
        }),
        prisma.document_templates.create({
            data: {
                type: 'personnel',
                title: 'Attestation de Travail',
                content: `ATTESTATION DE TRAVAIL

Je soussigné(e), Directeur/Directrice des Ressources Humaines, atteste que :

Nom : {{nom}}
Prénom : {{prenom}}
CIN : {{cin}}
Ville : {{ville}}

Exerce les fonctions de {{fonction}} dans notre établissement.

Spécialité : {{specialite}}
Rôles : {{roles}}
Département : {{departement}}

Cette attestation est délivrée pour servir et valoir ce que de droit.

Fait le {{date_actuelle}}

Le Directeur des Ressources Humaines`
            }
        })
    ]);

    console.log('Database has been seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });