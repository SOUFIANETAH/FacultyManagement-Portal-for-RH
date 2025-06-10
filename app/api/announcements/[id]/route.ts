export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer une annonce spécifique
export async function GET(request: NextRequest, context) {
  try {
    const id = parseInt(context.params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID non valide' },
        { status: 400 }
      );
    }

    const annonce = await prisma.annonces.findUnique({
      where: { ida: id },
    });

    if (!annonce) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(annonce);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'annonce:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'annonce' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une annonce spécifique
export async function PUT(request: NextRequest, context) {
  try {
    const id = parseInt(context.params.id);
    const data = await request.json();

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID non valide' },
        { status: 400 }
      );
    }

    const annonceExistante = await prisma.annonces.findUnique({
      where: { ida: id },
    });

    if (!annonceExistante) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    if (data.date_pub) {
      data.date_pub = new Date(data.date_pub);
    }

    const annonceMAJ = await prisma.annonces.update({
      where: { ida: id },
      data: {
        titre: data.titre,
        contenu: data.contenu,
        date_pub: data.date_pub,
        deg_imp: data.deg_imp
      },
    });

    return NextResponse.json(annonceMAJ);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'annonce:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'annonce' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une annonce spécifique
export async function DELETE(request: NextRequest, context) {
  try {
    const id = parseInt(context.params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID non valide' },
        { status: 400 }
      );
    }

    const annonceExistante = await prisma.annonces.findUnique({
      where: { ida: id },
    });

    if (!annonceExistante) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    await prisma.personne_annonce.deleteMany({
      where: { ida: id },
    });

    await prisma.annonces.delete({
      where: { ida: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'annonce:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'annonce' },
      { status: 500 }
    );
  }
}
