import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { AlertType } from "@prisma/client";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, email, type } = body;

    // Validate required fields
    if (!title || !description || !email) {
      return NextResponse.json(
        { message: "Titre, description et email sont requis" },
        { status: 400 }
      );
    }

    // Create an alert that will be visible to admin
    const alert = await prisma.alert.create({
      data: {
        title: `Message de ${email}: ${title}`,
        description: description,
        type: AlertType.info,
      },
    });

    return NextResponse.json(
      { message: "Message envoyé avec succès", alertId: alert.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de l'envoi du message" },
      { status: 500 }
    );
  }
}
