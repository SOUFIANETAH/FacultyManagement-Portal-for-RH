// app/api/document-templates/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all document templates
export async function GET() {
    try {
        const templates = await prisma.document_templates.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json({ error: 'Error fetching templates' }, { status: 500 });
    }
}

// POST create new template
export async function POST(request: Request) {
    try {
        const { type, title, content } = await request.json();

        if (!type || !title || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const template = await prisma.document_templates.create({
            data: {
                type,
                title,
                content
            }
        });

        return NextResponse.json(template);
    } catch (error) {
        console.error('Error creating template:', error);
        return NextResponse.json({ error: 'Error creating template' }, { status: 500 });
    }
}
