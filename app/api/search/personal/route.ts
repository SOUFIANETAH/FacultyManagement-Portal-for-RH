import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        const personnel = await prisma.personnels.findMany({
            where: {
                OR: [
                    { personne: { nom: { contains: query, mode: 'insensitive' } } },
                    { personne: { prenom: { contains: query, mode: 'insensitive' } } },
                    { personne: { cin: { contains: query, mode: 'insensitive' } } },
                    { fonction: { contains: query, mode: 'insensitive' } }
                ]
            },
            include: {
                personne: true
            },
            take: 10
        });

        const formattedPersonnel = personnel.map(person => ({
            id: person.idpersonnel.toString(),
            type: 'personnel',
            nom: person.personne.nom,
            prenom: person.personne.prenom,
            fonction: person.fonction,
            cin: person.personne.cin,
            email: person.personne.email
        }));

        return NextResponse.json(formattedPersonnel);
    } catch (error) {
        console.error('Error searching personnel:', error);
        return NextResponse.json({ error: 'Erreur de recherche' }, { status: 500 });
    }
}