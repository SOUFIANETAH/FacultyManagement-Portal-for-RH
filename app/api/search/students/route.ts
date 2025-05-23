// app/api/search/students/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        const students = await prisma.etudiants.findMany({
            where: {
                OR: [
                    { cne: { contains: query, mode: 'insensitive' } },
                    { personnes: { nom: { contains: query, mode: 'insensitive' } } },
                    { personnes: { prenom: { contains: query, mode: 'insensitive' } } },
                    { personnes: { cin: { contains: query, mode: 'insensitive' } } }
                ]
            },
            include: {
                personnes: true
            },
            take: 10
        });

        const formattedStudents = students.map(student => ({
            id: student.cne,
            type: 'etudiant',
            nom: student.personnes.nom,
            prenom: student.personnes.prenom,
            cne: student.cne,
            cin: student.personnes.cin,
            email: student.personnes.email
        }));

        return NextResponse.json(formattedStudents);
    } catch (error) {
        console.error('Error searching students:', error);
        return NextResponse.json({ error: 'Erreur de recherche' }, { status: 500 });
    }
}

// app/api/search/personnel/route.ts
