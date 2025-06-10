import { NextResponse } from 'next/server';
import prisma from "../../lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const departments = await prisma.departements.findMany({
      include: {
        etablissements: true,
        filieres: true,
      },
      orderBy: {
        nom: 'asc',
      },
    });

    return NextResponse.json(departments);
  } catch (error: any) {
    console.error('Error fetching departments:', error.message, error.stack);
    return NextResponse.json(
        { error: error.message || 'Failed to fetch departments' },
        { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { coded, nom, description, codee } = body;

    if (!coded || !nom || !codee) {
      return NextResponse.json(
          { error: 'Department code, name, and establishment code are required' },
          { status: 400 }
      );
    }

    // Check if establishment exists
    const establishment = await prisma.etablissements.findUnique({
      where: { codee },
    });

    if (!establishment) {
      return NextResponse.json(
          { error: 'Establishment not found' },
          { status: 404 }
      );
    }

    // Check if department already exists
    const existingDepartment = await prisma.departements.findUnique({
      where: { coded },
    });

    if (existingDepartment) {
      return NextResponse.json(
          { error: 'Department with this code already exists' },
          { status: 409 }
      );
    }

    // Create the department
    const newDepartment = await prisma.departements.create({
      data: {
        coded,
        nom,
        description,
        codee,
        date_creat: new Date(),
      },
      include: {
        etablissements: true,
      },
    });

    return NextResponse.json(newDepartment, { status: 201 });
  } catch (error: any) {
    console.error('Error creating department:', error.message, error.stack);
    return NextResponse.json(
        { error: error.message || 'Failed to create department' },
        { status: 500 }
    );
  }
}
