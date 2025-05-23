import prisma from "../../../lib/db"

export async function GET() {
    try {
        const count = await prisma.documents.count();
        return Response.json({ count });
    } catch (error) {
        console.error('Error fetching documents count:', error);
        return Response.json({ error: 'Failed to fetch count', count: 0 }, { status: 500 });
    }
}