// app/api/documents/personnel/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const personnelId = parseInt(id);

        if (isNaN(personnelId)) {
            return NextResponse.json({ error: 'ID personnel invalide' }, { status: 400 });
        }

        console.log('Searching for personnel with ID:', personnelId);

        // Find personnel by ID with all related data
        const personnel = await prisma.personnels.findUnique({
            where: { idpersonnel: personnelId },
            include: {
                personne: {
                    include: {
                        personne_departement: {
                            include: {
                                departements: {
                                    include: {
                                        etablissements: true
                                    }
                                }
                            }
                        },
                        personne_role: true
                    }
                }
            }
        });

        console.log('Found personnel:', personnel ? 'Yes' : 'No');

        if (!personnel || !personnel.personne) {
            return NextResponse.json(
                { error: 'Personnel non trouvé' },
                { status: 404 }
            );
        }

        // Safely access department and establishment data
        const departementData = personnel.personne.personne_departement &&
        personnel.personne.personne_departement.length > 0
            ? personnel.personne.personne_departement[0] : null;

        // Format the data for document generation
        const personData = {
            // Personal information
            nom: personnel.personne.nom || '',
            prenom: personnel.personne.prenom || '',
            cin: personnel.personne.cin || '',
            email: personnel.personne.email || '',
            telephone: personnel.personne.tele || '',
            adresse: personnel.personne.adr || '',
            ville: personnel.personne.ville || '',
            date_naissance: personnel.personne.date_nai ?
                new Date(personnel.personne.date_nai).toLocaleDateString('fr-FR') : '',

            // Personnel specific information
            fonction: personnel.fonction || '',
            specialite: personnel.specialite || '',

            // Department and establishment information
            departement: departementData?.departements?.nom || '',
            code_departement: departementData?.departements?.coded || '',
            etablissement: departementData?.departements?.etablissements?.nom || '',

            // Roles
            roles: personnel.personne.personne_role && personnel.personne.personne_role.length > 0
                ? personnel.personne.personne_role.map(pr => pr.role).join(', ')
                : '',

            // Current date for document generation
            date_actuelle: new Date().toLocaleDateString('fr-FR')
        };

        console.log('Returning personnel data:', {
            nom: personData.nom,
            prenom: personData.prenom,
            fonction: personData.fonction,
            departement: personData.departement,
            rolesCount: personnel.personne.personne_role?.length || 0
        });

        return NextResponse.json({
            success: true,
            data: personData,
            type: 'personnel'
        });

    } catch (error) {
        console.error('Error fetching personnel data:', error);
        return NextResponse.json(
            {
                error: 'Erreur lors de la récupération des données personnel',
                details: error instanceof Error ? error.message : String(error),
                success: false
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}