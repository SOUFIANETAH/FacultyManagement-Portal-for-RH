import { NextResponse } from 'next/server';
import prisma from "../../lib/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const coded = searchParams.get('coded'); // Get department code from query params

        // Build the where clause conditionally
        const whereClause = coded ? { coded } : {};

        const filieres = await prisma.filieres.findMany({
            where: whereClause,
            include: {
                departement: true,
            },
            orderBy: {
                intitule: 'asc',
            },
        });

        return NextResponse.json(filieres);
    } catch (error: any) {
        console.error('Error fetching filieres:', error.message, error.stack);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch filieres' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { codef, intitule, niveau, duree, coded } = body;

        if (!codef || !intitule || !coded) {
            return NextResponse.json(
                { error: 'Filière code, intitule, and department code are required' },
                { status: 400 }
            );
        }

        // Check if department exists
        const department = await prisma.departements.findUnique({
            where: { coded },
        });

        if (!department) {
            return NextResponse.json(
                { error: 'Department not found' },
                { status: 404 }
            );
        }

        // Check if filière already exists
        const existingFiliere = await prisma.filieres.findUnique({
            where: { codef },
        });

        if (existingFiliere) {
            return NextResponse.json(
                { error: 'Filière with this code already exists' },
                { status: 409 }
            );
        }

        // Create the filière
        const newFiliere = await prisma.filieres.create({
            data: {
                codef,
                intitule,
                niveau,
                duree: duree ? (duree) : undefined,
                coded,
            },
            include: {
                departement: true,
            },
        });

        return NextResponse.json(newFiliere, { status: 201 });
    } catch (error: any) {
        console.error('Error creating filiere:', error.message, error.stack);
        return NextResponse.json(
            { error: error.message || 'Failed to create filière' },
            { status: 500 }
        );
    }
}