import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const establishments = await prisma.etablissements.findMany({
            orderBy: {
                nom: 'asc',
            },
        });

        return NextResponse.json(establishments);
    } catch (error: any) {
        console.error('Error fetching establishments:', error.message, error.stack);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch establishments' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
