import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/db';
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: 'Paramètre de recherche manquant' }, { status: 400 });
    }

    // Search only in personnel records, exclude students
    const persons = await prisma.personne.findMany({
      where: {
        AND: [
          // Ensure this person has personnel record (not student)
          {
            personnels: {
              some: {}
            }
          },
          // Search criteria
          {
            OR: [
              { nom: { contains: query, mode: 'insensitive' } },
              { prenom: { contains: query, mode: 'insensitive' } },
              { cin: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ]
          }
        ]
      },
      include: {
        personnels: {
          select: {
            fonction: true,
            specialite: true,
          }
        },
        personne_role: {
          select: { role: true },
        },
      },
      take: 10, // Limit results
    });

    const formatted = persons.map(person => ({
      idp: person.idp,
      nom: person.nom,
      prenom: person.prenom,
      cin: person.cin,
      adr: person.adr,
      ville: person.ville,
      date_nai: person.date_nai,
      email: person.email,
      tele: person.tele,
      photo: person.photo,
      fonction: person.personnels?.[0]?.fonction,
      specialite: person.personnels?.[0]?.specialite,
      roles: person.personne_role.map((r) => r.role),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
        { error: 'Erreur serveur lors de la recherche' },
        { status: 500 }
    );
  }
}
