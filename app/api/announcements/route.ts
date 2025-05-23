import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const prisma = new PrismaClient();

const allowedFileTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];
const maxFileSize = 5 * 1024 * 1024; // 5MB

async function processFormData(request: NextRequest) {
  const formData = await request.formData();

  const title = formData.get('title');
  const content = formData.get('content');
  const importance = parseInt(formData.get('importance') as string || '1', 10);
  const file = formData.get('file') as File | null;

  if (!title || !content) {
    throw new Error('Le titre et le contenu sont requis');
  }

  let filePath = null;
  if (file && file.size > 0) {
    if (!allowedFileTypes.includes(file.type)) {
      throw new Error('Type de fichier non supporté');
    }
    if (file.size > maxFileSize) {
      throw new Error('Fichier trop volumineux (max 5MB)');
    }

    const fileName = `${uuidv4()}-${file.name}`;
    const relativePath = join('uploads', fileName);
    const fullPath = join(process.cwd(), 'public', relativePath);

    const dir = dirname(fullPath);
    if (!fs.existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(fullPath, buffer);

    filePath = relativePath; // public URL path
  }

  return { title, content, importance, filePath };
}

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de requête facultatifs
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string, 10) : undefined;
    const orderBy = searchParams.get('orderBy') || 'date_pub';
    const order = searchParams.get('order') || 'desc';

    // Construire les options de requête
    const options: any = {
      orderBy: {
        [orderBy]: order,
      },
    };

    // Ajouter une limite si spécifiée
    if (limit && !isNaN(limit)) {
      options.take = limit;
    }

    // Récupérer toutes les annonces avec leurs documents associés
    const annonces = await prisma.annonces.findMany({
      ...options,
      include: {
        personne_annonce: {
          include: {
            personnes: true
          }
        }
      }
    });

    // Récupérer les documents associés à chaque annonce
    const annonceIds = annonces.map(a => a.ida);
    const documents = await prisma.documents.findMany({
      where: {
        titre: {
          in: annonces.map(a => a.titre)
        },
        type: 'Annonce'
      }
    });

    // Associer les documents aux annonces correspondantes
    const annoncesWithDocs = annonces.map(annonce => {
      const doc = documents.find(d => d.titre === annonce.titre);
      return {
        ...annonce,
        document: doc || null
      };
    });

    return NextResponse.json(annoncesWithDocs);
  } catch (error) {
    console.error('Erreur lors de la récupération des annonces:', error);
    return NextResponse.json(
        { error: 'Erreur lors de la récupération des annonces' },
        { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { title, content, importance, filePath } = await processFormData(request);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { personne: true },
    });

    if (!user?.personneId) {
      return NextResponse.json({ message: 'Utilisateur introuvable' }, { status: 404 });
    }

    const announcement = await prisma.$transaction(async (tx) => {
      const annonce = await tx.annonces.create({
        data: {
          titre: title,
          contenu: content,
          date_pub: new Date(),
          deg_imp: importance,
          personne_annonce: {
            create: {
              personnes: {
                connect: { idp: user.personneId },
              },
              date_proposition: new Date(),
            },
          },
        },
        include: {
          personne_annonce: {
            include: {
              personnes: true,
            },
          },
        },
      });

      if (filePath) {
        await tx.documents.create({
          data: {
            titre: title,
            type: 'Annonce',
            chemin: filePath,
            date_creat: new Date(),
            version: '1.0',
            niveau_confid: 1,
            personne_document: {
              create: {
                personnes: {
                  connect: { idp: user.personneId },
                },
                date_publication: new Date(),
              },
            },
          },
        });
      }

      return annonce;
    });

    return NextResponse.json({ message: 'Annonce créée avec succès', data: announcement });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
        { message: error.message || "Erreur lors de la création de l'annonce" },
        { status: 500 }
    );
  }
}
