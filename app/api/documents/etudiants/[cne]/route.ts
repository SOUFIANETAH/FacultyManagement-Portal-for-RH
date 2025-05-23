// app/api/documents/etudiants/[cne]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface StudentData {
    nom: string;
    prenom: string;
    cin: string;
    email: string;
    telephone: string;
    adresse: string;
    ville: string;
    date_naissance: string;
    cne: string;
    niveau: string;
    date_inscription: string;
    statut: string;
    departement: string;
    code_departement: string;
    etablissement: string;
    notes: {
        date_val: string;
        moyenne: string;
        mention: string;
    }[];
    date_actuelle: string;
}

export async function GET(
    request: Request,
    { params }: { params: { cne: string } }
) {
    try {
        const { cne } = params;

        if (!cne) {
            return NextResponse.json(
                { error: 'CNE parameter is required', success: false },
                { status: 400 }
            );
        }

        console.log('Searching for student with CNE:', cne);

        // First, find the student by CNE
        const etudiant = await prisma.etudiants.findUnique({
            where: { cne: cne },
            include: {
                personnes: {
                    include: {
                        personne_departement: {
                            include: {
                                departements: {
                                    include: {
                                        etablissements: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        console.log('Found student:', etudiant ? 'Yes' : 'No');

        if (!etudiant) {
            return NextResponse.json(
                { error: 'Étudiant non trouvé', success: false },
                { status: 404 }
            );
        }

        if (!etudiant.personnes) {
            return NextResponse.json(
                { error: 'Informations personnelles manquantes', success: false },
                { status: 404 }
            );
        }

        // Now get the grades using the student's idp
        const grades = await prisma.date_val.findMany({
            where: { idp: etudiant.idp },
            orderBy: { date_val: 'desc' }
        });

        console.log('Found grades:', grades?.length || 0);

        // Safely access department and establishment data
        const departementData = etudiant.personnes.personne_departement &&
        etudiant.personnes.personne_departement.length > 0
            ? etudiant.personnes.personne_departement[0] : null;

        // Format the data for document generation
        const personData: StudentData = {
            // Personal information
            nom: etudiant.personnes.nom || '',
            prenom: etudiant.personnes.prenom || '',
            cin: etudiant.personnes.cin || '',
            email: etudiant.personnes.email || '',
            telephone: etudiant.personnes.tele || '',
            adresse: etudiant.personnes.adr || '',
            ville: etudiant.personnes.ville || '',
            date_naissance: etudiant.personnes.date_nai
                ? new Date(etudiant.personnes.date_nai).toLocaleDateString('fr-FR')
                : '',

            // Student specific information
            cne: etudiant.cne || '',
            niveau: etudiant.niveau || '',
            date_inscription: etudiant.date_insc
                ? new Date(etudiant.date_insc).toLocaleDateString('fr-FR')
                : '',
            statut: etudiant.statut || '',

            // Department and establishment information
            departement: departementData?.departements?.nom || '',
            code_departement: departementData?.departements?.coded || '',
            etablissement: departementData?.departements?.etablissements?.nom || '',

            // Academic records
            notes: grades && grades.length > 0
                ? grades.map(note => ({
                    date_val: note.date_val
                        ? new Date(note.date_val).toLocaleDateString('fr-FR')
                        : '',
                    moyenne: note.moyenne?.toString() || '',
                    mention: note.mention || ''
                }))
                : [],

            // Current date for document generation
            date_actuelle: new Date().toLocaleDateString('fr-FR')
        };

        console.log('Returning student data:', {
            nom: personData.nom,
            prenom: personData.prenom,
            cne: personData.cne,
            departement: personData.departement,
            etablissement: personData.etablissement,
            notesCount: personData.notes.length
        });

        return NextResponse.json({
            success: true,
            data: personData,
            type: 'etudiant'
        });

    } catch (error) {
        console.error('Error fetching student data:', error);
        return NextResponse.json(
            {
                error: 'Erreur lors de la récupération des données étudiant',
                details: error instanceof Error ? error.message : String(error),
                success: false
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}