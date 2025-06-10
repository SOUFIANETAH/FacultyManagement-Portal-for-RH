import { NextResponse } from 'next/server';
import prisma from "../../lib/db";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const semester = searchParams.get('semester');

        // Base query to get all modules
        let whereClause = {};

        // If semester is provided, filter by semester
        if (semester) {
            const semesterNum = parseInt(semester);
            if (!isNaN(semesterNum)) {
                whereClause = {
                    semester: semesterNum
                };
            }
        }

        const modules = await prisma.modules.findMany({
            where: whereClause,
            orderBy: {
                intitule: 'asc',
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

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { codem, intitule, volumeh, semester } = body;

        if (!codem || !intitule) {
            return NextResponse.json(
                { error: 'Module code (codem) and title (intitule) are required' },
                { status: 400 }
            );
        }

        // Check if module with this code already exists
        const existingModule = await prisma.modules.findUnique({
            where: { codem },
        });

        if (existingModule) {
            return NextResponse.json(
                { error: 'A module with this code already exists' },
                { status: 409 }
            );
        }

        // Create new module
        const newModule = await prisma.modules.create({
            data: {
                codem,
                intitule,
                volumeh: volumeh ? parseInt(volumeh) : null,
                semester: semester ? parseInt(semester) : null,
            },
        });

        return NextResponse.json(newModule);
    } catch (error: any) {
        console.error('Error creating module:', error.message, error.stack);
        return NextResponse.json(
            { error: error.message || 'Failed to create module' },
            { status: 500 }
        );
    }
}
