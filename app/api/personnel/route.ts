// app/api/personnel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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
                isNot: null // Ensure they are personnel
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
                            specialite: true
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
                    // Removed etudiants include
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

        return NextResponse.json({
            data: personnel,
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