import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

// Types TypeScript pour la route
interface RouteParams {
  params: {
    id: string;
  };
}

// GET un document spécifique
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    const document = await prisma.documents.findUnique({
      where: { iddoc: id }
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// Mettre à jour un document
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();

    const updatedDoc = await prisma.documents.update({
      where: { iddoc: id },
      data: {
        titre: data.titre,
        type: data.type || null,
        chemin: data.chemin || null,
        version: data.version || null,
        niveau_confid: data.niveau_confid || null
      }
    });

    return NextResponse.json(updatedDoc);
  } catch (error) {
    return NextResponse.json(
      { error: "Échec de la mise à jour" },
      { status: 500 }
    );
  }
}

// Supprimer un document
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    await prisma.documents.delete({
      where: { iddoc: id }
    });

    return NextResponse.json(
      { message: "Document supprimé" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Échec de la suppression" },
      { status: 500 }
    );
  }
}
