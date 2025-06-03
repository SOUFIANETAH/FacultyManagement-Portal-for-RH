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

        console.log('Searching personnel with query:', trimmedQuery);

        // Search for personnel with multiple strategies
        const personnel = await prisma.personne.findMany({
            where: {
                AND: [
                    // Must have personnel record
                    {
                        personnels: {
                            some: {}
                        }
                    },
                    // Search criteria
                    {
                        OR: [
                            // Exact matches (higher priority)
                            {
                                cin: {
                                    equals: trimmedQuery,
                                    mode: 'insensitive'
                                }
                            },
                            {
                                email: {
                                    equals: trimmedQuery,
                                    mode: 'insensitive'
                                }
                            },
                            // Partial matches
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
                        ]
                    }
                ]
            },
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
            take: 20,
            orderBy: [
                { nom: 'asc' },
                { prenom: 'asc' }
            ]
        });

        console.log(`Found ${personnel.length} personnel records`);

        if (personnel.length === 0) {
            return NextResponse.json([]);
        }

        // Sort results to prioritize exact matches
        const sortedPersonnel = personnel.sort((a, b) => {
            const aExactMatch =
                a.cin?.toLowerCase() === trimmedQuery.toLowerCase() ||
                a.email?.toLowerCase() === trimmedQuery.toLowerCase();
            const bExactMatch =
                b.cin?.toLowerCase() === trimmedQuery.toLowerCase() ||
                b.email?.toLowerCase() === trimmedQuery.toLowerCase();

            if (aExactMatch && !bExactMatch) return -1;
            if (!aExactMatch && bExactMatch) return 1;

            // If both or neither are exact matches, sort by name
            const aName = `${a.nom} ${a.prenom}`.toLowerCase();
            const bName = `${b.nom} ${b.prenom}`.toLowerCase();
            return aName.localeCompare(bName);
        });

        // Add type info to each result
        const results = sortedPersonnel.map(person => ({
            ...person,
            isPersonnel: true,
            isStudent: false,
            type: 'personnel'
        }));

        return NextResponse.json(results);
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