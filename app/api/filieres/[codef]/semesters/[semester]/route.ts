import { NextResponse } from 'next/server';
import prisma from "../../../../../lib/db";

interface Params {
    params: {
        codef: string;
        semester: string;
    };
}

export async function GET(request: Request, { params }: Params) {
    try {
        const { codef, semester } = params;
        const semesterNumber = parseInt(semester.replace('S', ''));

        // Get modules for the filiere and semester
        const modules = await prisma.filiere_module.findMany({
            where: {
                codef,
                modules: {
                    semester: semesterNumber,
                },
            },
            include: {
                modules: true,
            },
            orderBy: {
                modules: {
                    intitule: 'asc',
                },
            },
        });

        return NextResponse.json(modules);
    } catch (error: any) {
        console.error('Error fetching modules:', error.message, error.stack);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch modules' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request, { params }: Params) {
    try {
        const { codef, semester } = params;
        const body = await request.json();
        const { codem } = body;

        if (!codem) {
            return NextResponse.json(
                { error: 'Module code (codem) is required' },
                { status: 400 }
            );
        }

        // Check if the filiere exists
        const filiere = await prisma.filieres.findUnique({
            where: { codef },
        });

        if (!filiere) {
            return NextResponse.json(
                { error: 'Filière not found' },
                { status: 404 }
            );
        }

        // Check if the module exists and matches the semester
        const semesterNumber = parseInt(semester.replace('S', ''));
        const module = await prisma.modules.findUnique({
            where: { codem },
        });

        if (!module) {
            return NextResponse.json(
                { error: 'Module not found' },
                { status: 404 }
            );
        }

        if (module.semester !== semesterNumber) {
            return NextResponse.json(
                { error: 'Module does not belong to the specified semester' },
                { status: 400 }
            );
        }

        // Check if the module is already assigned to this filiere
        const existingAssignment = await prisma.filiere_module.findUnique({
            where: {
                codef_codem: {
                    codef,
                    codem,
                },
            },
        });

        if (existingAssignment) {
            return NextResponse.json(
                { error: 'Module is already assigned to this filière' },
                { status: 409 }
            );
        }

        // Create the association between filiere and module
        const filiere_module = await prisma.filiere_module.create({
            data: {
                codef,
                codem,
            },
            include: {
                modules: true,
                filieres: true,
            },
        });

        return NextResponse.json(filiere_module);
    } catch (error: any) {
        console.error('Error adding module to semester:', error.message, error.stack);
        return NextResponse.json(
            { error: error.message || 'Failed to add module to semester' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: Params) {
    try {
        const { codef, semester } = params;
        const body = await request.json();
        const { codem } = body;

        if (!codem) {
            return NextResponse.json(
                { error: 'Module code (codem) is required' },
                { status: 400 }
            );
        }

        // Check if the module exists and matches the semester
        const semesterNumber = parseInt(semester.replace('S', ''));
        const module = await prisma.modules.findUnique({
            where: { codem },
        });

        if (!module) {
            return NextResponse.json(
                { error: 'Module not found' },
                { status: 404 }
            );
        }

        if (module.semester !== semesterNumber) {
            return NextResponse.json(
                { error: 'Module does not belong to the specified semester' },
                { status: 400 }
            );
        }

        // Check if the association exists
        const filiere_module = await prisma.filiere_module.findUnique({
            where: {
                codef_codem: {
                    codef,
                    codem,
                },
            },
        });

        if (!filiere_module) {
            return NextResponse.json(
                { error: 'Module not found in this filière' },
                { status: 404 }
            );
        }

        // Delete the association
        await prisma.filiere_module.delete({
            where: {
                codef_codem: {
                    codef,
                    codem,
                },
            },
        });

        return NextResponse.json({ message: 'Module removed successfully from the filière' });
    } catch (error: any) {
        console.error('Error removing module:', error.message, error.stack);
        return NextResponse.json(
            { error: error.message || 'Failed to remove module' },
            { status: 500 }
        );
    }
}