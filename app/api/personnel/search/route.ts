// app/api/personnel/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');

        if (!query) {
            return NextResponse.json(
                { error: 'Query parameter is required' },
                { status: 400 }
            );
        }

        const trimmedQuery = query.trim();

        let person = null;

        console.log('Searching personnel by CIN:', trimmedQuery);
        // 1. Try exact match by CIN (only personnel)
        person = await prisma.personne.findFirst({
            where: {
                cin: trimmedQuery,
                personnels: {
                    some: {} // Must have at least one personnel relation
                }
            },
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
            }
        });

        if (!person) {
            console.log('Searching personnel by Email:', trimmedQuery);
            // 2. Try exact match by email (only personnel)
            person = await prisma.personne.findFirst({
                where: {
                    email: trimmedQuery,
                    personnels: {
                        some: {}
                    }
                },
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
                }
            });
        }

        if (!person) {
            console.log('Searching personnel by partial matches:', trimmedQuery);
            // 3. Partial match on several fields (only personnel)
            const partialMatches = await prisma.personne.findMany({
                where: {
                    OR: [
                        {
                            nom: {
                                contains: trimmedQuery,
                                mode: 'insensitive'
                            }
                        },
                        {
                            prenom: {
                                contains: trimmedQuery,
                                mode: 'insensitive'
                            }
                        },
                        {
                            cin: {
                                contains: trimmedQuery,
                                mode: 'insensitive'
                            }
                        },
                        {
                            email: {
                                contains: trimmedQuery,
                                mode: 'insensitive'
                            }
                        }
                    ],
                    personnels: {
                        some: {}
                    }
                },
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
                },
                take: 1,
                orderBy: [
                    { nom: 'asc' },
                    { prenom: 'asc' }
                ]
            });

            if (partialMatches.length > 0) {
                person = partialMatches[0];
            }
        }

        if (!person) {
            return NextResponse.json([]);
        }

        // Add type info and return as array for compatibility
        const result = {
            ...person,
            isPersonnel: true,
            isStudent: false,
            type: 'personnel'
        };

        return NextResponse.json([result]);
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
