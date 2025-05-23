import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Requête complète pour récupérer toutes les informations des étudiants
    const etudiantsData = await prisma.personne.findMany({
      where: {
        etudiants: {
          isNot: null,
        },
      },
      select: {
        idp: true,
        nom: true,
        prenom: true,
        email: true,
        cin: true,
        adr: true,
        ville: true,
        date_nai: true,
        tele: true,
        etudiants: {
          select: {
            cne: true,
            niveau: true,
            statut: true,
            date_insc: true,
            date_val: {
              select: {
                id: true,
                date_val: true,
                moyenne: true,
                mention: true,
                codem: true,
              },
              orderBy: {
                date_val: 'desc',
              },
            },
          },
        },
      },
    });

    // Format des données pour l'affichage
    const formattedData = etudiantsData.map((personne) => {
      const dateValRecords = personne.etudiants?.date_val || [];
      const latestDateVal = dateValRecords[0]; // Le plus récent (grâce au orderBy desc)

      // Compter le nombre de modules validés (nombre total de date_val records)
      const nbModulesValides = dateValRecords.length;

      return {
        idp: personne.idp,
        nom: personne.nom,
        prenom: personne.prenom,
        email: personne.email,
        cin: personne.cin,
        adr: personne.adr,
        ville: personne.ville,
        date_nai: personne.date_nai ? new Date(personne.date_nai).toLocaleDateString('fr-FR') : null,
        tele: personne.tele,
        cne: personne.etudiants?.cne || null,
        niveau: personne.etudiants?.niveau || null,
        statut: personne.etudiants?.statut || null,
        date_insc: personne.etudiants?.date_insc
            ? new Date(personne.etudiants.date_insc).toLocaleDateString('fr-FR')
            : null,
        date_val: latestDateVal?.date_val
            ? new Date(latestDateVal.date_val).toLocaleDateString('fr-FR')
            : null,
        moyenne: latestDateVal?.moyenne ? Number(latestDateVal.moyenne) : null,
        mention: latestDateVal?.mention || null,
        nbMV: nbModulesValides, // Nombre de modules validés
        codem: latestDateVal?.codem || null,
      };
    });

    console.log("Données des étudiants récupérées:", formattedData.length);
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants :', error);
    return NextResponse.json(
        { error: 'Erreur lors de la récupération des données' },
        { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}