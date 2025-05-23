// app/api/document-templates/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const templateId = parseInt(params.id);

        if (isNaN(templateId)) {
            return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 });
        }

        await prisma.document_templates.delete({
            where: { id: templateId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting template:', error);
        return NextResponse.json({ error: 'Error deleting template' }, { status: 500 });
    }
}