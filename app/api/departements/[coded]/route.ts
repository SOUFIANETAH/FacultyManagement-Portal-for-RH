// app/api/departements/[coded]/route.ts
import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';
export const dynamic = "force-dynamic";
export async function GET(request: Request, context) {
    const { coded } = context.params;

    try {
        const department = await prisma.departements.findUnique({
            where: { coded },
            include: {
                etablissements: {
                    select: { nom: true }
                },
                filieres: {
                    select: {
                        codef: true,
                        intitule: true,
                        niveau: true,
                        duree: true
                    }
                }
            }
        });

        if (!department) {
            return NextResponse.json({ error: 'Department not found' }, { status: 404 });
        }

        return NextResponse.json(department);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch department' },
            { status: 500 }
        );
    }
}
