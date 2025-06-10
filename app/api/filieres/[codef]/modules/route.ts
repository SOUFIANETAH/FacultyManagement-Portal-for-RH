// app/api/filieres/[codef]/modules/route.ts
import { NextResponse } from 'next/server';
import prisma from "../../../../lib/db";
export const dynamic = "force-dynamic";
interface Params {
    params: {
        codef: string;
    };
}

export async function GET(request: Request, { params }: Params) {
    try {
        const { codef } = params;

        // Verify the filiere exists
        const filiere = await prisma.filieres.findUnique({
            where: { codef },
        });

        if (!filiere) {
            return NextResponse.json(
                { error: 'Filière not found' },
                { status: 404 }
            );
        }

        // Get all modules for this filiere (across all semesters)
        const modules = await prisma.filiere_module.findMany({
            where: { codef },
            include: {
                modules: true,
            },
            orderBy: {
                modules: {
                    semester: 'asc',
                },
            },
        });

        // Transform the data to a simpler format
        const result = modules.map((fm) => ({
            codem: fm.modules.codem,
            intitule: fm.modules.intitule,
            volumeh: fm.modules.volumeh !== null ? Number(fm.modules.volumeh) : null,
            semester: fm.modules.semester,
        }));

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error fetching modules:', error.message, error.stack);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch modules' },
            { status: 500 }
        );
    }
}
