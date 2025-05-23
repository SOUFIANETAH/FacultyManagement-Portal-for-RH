// app/api/filieres/[codef]/route.ts
import { NextResponse } from 'next/server';
import prisma from "../../../lib/db";

interface Params {
    params: {
        codef: string;
    };
}

export async function GET(request: Request, { params }: Params) {
    try {
        const { codef } = params;

        const filiere = await prisma.filieres.findUnique({
            where: { codef },
            include: {
                departement: true,
            },
        });

        if (!filiere) {
            return NextResponse.json(
                { error: 'Filière not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(filiere);
    } catch (error: any) {
        console.error('Error fetching filiere:', error.message, error.stack);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch filière' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request, { params }: Params) {
    try {
        const { codef } = params;
        const body = await request.json();

        const existingFiliere = await prisma.filieres.findUnique({
            where: { codef },
        });

        if (!existingFiliere) {
            return NextResponse.json(
                { error: 'Filière not found' },
                { status: 404 }
            );
        }

        // Validate department if being updated
        if (body.coded) {
            const department = await prisma.departements.findUnique({
                where: { coded: body.coded },
            });
            if (!department) {
                return NextResponse.json(
                    { error: 'Department not found' },
                    { status: 404 }
                );
            }
        }

        const updatedFiliere = await prisma.filieres.update({
            where: { codef },
            data: {
                intitule: body.intitule,
                niveau: body.niveau,
                duree: body.duree ? parseInt(body.duree) : undefined,
                coded: body.coded,
            },
            include: {
                departement: true,
            },
        });

        return NextResponse.json(updatedFiliere);
    } catch (error: any) {
        console.error('Error updating filiere:', error.message, error.stack);
        return NextResponse.json(
            { error: error.message || 'Failed to update filière' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: Params) {
    try {
        const { codef } = params;

        const existingFiliere = await prisma.filieres.findUnique({
            where: { codef },
        });

        if (!existingFiliere) {
            return NextResponse.json(
                { error: 'Filière not found' },
                { status: 404 }
            );
        }

        await prisma.filieres.delete({
            where: { codef },
        });

        return NextResponse.json({ message: 'Filière deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting filiere:', error.message, error.stack);
        return NextResponse.json(
            { error: error.message || 'Failed to delete filière' },
            { status: 500 }
        );
    }
}