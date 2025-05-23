import { NextResponse } from 'next/server';
import prisma from '../../lib/db';
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                personne: {
                    select: {
                        nom: true,
                        prenom: true,
                        cin: true,
                    }
                }
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // First create the Personne
        const newPersonne = await prisma.personne.create({
            data: {
                nom: data.nom,
                prenom: data.prenom,
                cin: data.cin,
                adr: data.adr,
                ville: data.ville,
                date_nai: data.date_nai ? new Date(data.date_nai) : null,
                email: data.email,
                tele: data.tele,
            }
        });

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create user linked to the Personne
        const newUser = await prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                role: data.role,
                password: hashedPassword,
                personneId: newPersonne.idp,
                department: data.department,
            },
        });

        return NextResponse.json({
            user: newUser,
            personne: newPersonne
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}