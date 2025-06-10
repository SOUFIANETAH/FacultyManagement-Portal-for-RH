// app/api/personnel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const department = searchParams.get('department');
        const role = searchParams.get('role');

        const skip = (page - 1) * limit;

        // Build where clause - only include personnel (not students)
        const whereClause: any = {
            personnels: {
                some: {} // Must have at least one personnel record
            }
        };

        // Add filters if provided
        if (department) {
            whereClause.personne_departement = {
                some: {
                    departements: {
                        coded: department
                    }
                }
            };
        }

        if (role) {
            whereClause.personne_role = {
                some: {
                    role: role
                }
            };
        }

        // Get personnel with pagination
        const [personnel, total] = await Promise.all([
            prisma.personne.findMany({
                where: whereClause,
                include: {
                    personnels: {
                        select: {
                            fonction: true,
                            specialite: true,
                            idpersonnel: true
                        }
                    },
                    personne_role: {
                        select: {
                            role: true
                        }
                    },
                    personne_departement: {
                        include: {
                            departements: {
                                select: {
                                    nom: true,
                                    coded: true
                                }
                            }
                        }
                    }
                },
                skip,
                take: limit,
                orderBy: [
                    { nom: 'asc' },
                    { prenom: 'asc' }
                ]
            }),
            prisma.personne.count({
                where: whereClause
            })
        ]);

        // Convert photos to base64 for each personnel
        const personnelWithPhotos = personnel.map(person => {
            let photoBase64 = null;
            if (person.photo) {
                try {
                    photoBase64 = Buffer.from(person.photo).toString('base64');
                } catch (error) {
                    console.warn('Error converting photo to base64 for person:', person.idp, error);
                }
            }

            return {
                ...person,
                photo: photoBase64,
                isPersonnel: true,
                isStudent: false,
                type: 'personnel'
            };
        });

        return NextResponse.json({
            data: personnelWithPhotos,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('List fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
