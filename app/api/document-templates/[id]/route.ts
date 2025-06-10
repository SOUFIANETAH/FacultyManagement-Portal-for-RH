import { NextResponse, type NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
export const dynamic = "force-dynamic";
const prisma = new PrismaClient();
// @ts-ignore
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const templateId = parseInt(params.id);

    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 });
    }

    await prisma.document_templates.delete({
      where: { id: templateId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Error deleting template' }, { status: 500 });
  }
}
