// app/api/documents/personnels/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const idpersonnel = parseInt(params.id);
  if (isNaN(idpersonnel)) {
    return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
  }

  try {
    const personnel = await prisma.personnels.findUnique({
      where: { idpersonnel },
      include: { personne: true }
    });

    if (!personnel) {
      return NextResponse.json({ error: 'Personnel introuvable' }, { status: 404 });
    }

    const documents = await prisma.personne_document.findMany({
      where: { idpersonnel: personnel.idpersonnel },
      include: {
        documents: true,
        personnel: {
          include: {
            personne: true
          }
        }
      }
    });

    const formattedDocs = documents.map(doc => ({
      ...doc.documents,
      isTemplate: doc.documents.type === 'TEMPLATE'
    }));

    return NextResponse.json(formattedDocs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
