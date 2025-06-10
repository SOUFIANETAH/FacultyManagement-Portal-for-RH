import prisma from "../../../lib/db"
export const dynamic = "force-dynamic";
export async function GET() {
    try {
        const count = await prisma.etudiants.count();
        return Response.json({ count });
    } catch (error) {
        console.error('Error fetching etudiants count:', error);
        return Response.json({ error: 'Failed to fetch count', count: 0 }, { status: 500 });
    }
}
