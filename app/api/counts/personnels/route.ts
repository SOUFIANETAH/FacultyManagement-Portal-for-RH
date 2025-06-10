import prisma from "../../../lib/db"
export const dynamic = "force-dynamic";
export async function GET() {
    try {
        const count = await prisma.personne.count();
        return Response.json({ count });
    } catch (error) {
        console.error('Error fetching personnels count:', error);
        return Response.json({ error: 'Failed to fetch count', count: 0 }, { status: 500 });
    }
}
