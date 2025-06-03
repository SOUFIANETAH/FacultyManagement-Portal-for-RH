// app/api/personnel/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        console.log('Received request for personnel ID:', params.id);

        const id = parseInt(params.id);

        if (isNaN(id)) {
            console.error('Invalid ID parameter:', params.id);
            return NextResponse.json(
                { error: 'Invalid ID parameter' },
                { status: 400 }
            );
        }

        console.log('Querying database for personnel with ID:', id);

        // Get person information - only personnel, not students
        const person = await prisma.personne.findFirst({
            where: {
                idp: id,
                // Ensure they have a personnel record
                personnels: {
                    some: {}
                }
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
                                coded: true,
                                description: true
                            }
                        }
                    }
                },
                personne_document: {
                    include: {
                        documents: {
                            select: {
                                titre: true,
                                type: true,
                                date_creat: true
                            }
                        }
                    },
                    take: 5
                }
            }
        });

        console.log('Database query result:', person ? 'Found' : 'Not found');

        if (!person) {
            console.log('Personnel not found for ID:', id);
            return NextResponse.json(
                { error: 'Personnel not found' },
                { status: 404 }
            );
        }

        // Convert photo (Bytes) to base64 string if it exists
        let photoBase64 = null;
        if (person.photo) {
            try {
                photoBase64 = Buffer.from(person.photo).toString('base64');
            } catch (error) {
                console.warn('Error converting photo to base64:', error);
            }
        }

        // Add type information and photo
        const result = {
            ...person,
            photo: photoBase64, // Replace raw bytes with base64 string
            isPersonnel: true,
            isStudent: false,
            type: 'personnel'
        };

        console.log('Returning personnel data for:', person.nom, person.prenom);
        return NextResponse.json(result);

    } catch (error) {
        console.error('Detail fetch error:', error);

        // More detailed error information
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorDetails = {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            name: error instanceof Error ? error.name : undefined
        };

        console.error('Error details:', errorDetails);

        return NextResponse.json(
            {
                error: 'Internal server error',
                details: errorMessage,
                debug: process.env.NODE_ENV === 'development' ? errorDetails : undefined
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}