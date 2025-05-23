import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    // Only fetch personal information, exclude student data
    const person = await prisma.personne.findUnique({
      where: { idp: id },
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
    });

    if (!person) {
      return NextResponse.json({ error: 'Personnel non trouvé' }, { status: 404 });
    }

    // Format response with only personal information
    const formatted = {
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
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
        { error: 'Erreur serveur lors de la récupération du personnel' },
        { status: 500 }
    );
  }
}