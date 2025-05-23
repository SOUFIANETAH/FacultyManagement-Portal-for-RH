import { NextRequest, NextResponse } from "next/server";
import db, { queryWithRetries } from "@/app/lib/db";
import { randomBytes } from "crypto";
import { hash } from "bcryptjs";

// This would typically be sent via email
// For this implementation, we'll just generate a token and update the user record
export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, cin, dateOfBirth } = await req.json();

    if (!firstName || !lastName || !cin || !dateOfBirth) {
      return NextResponse.json(
          { message: "Tous les champs sont requis" },
          { status: 400 }
      );
    }

    // Trim input values to avoid whitespace issues
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedCin = cin.trim();

    // Format the date to match the database format (YYYY-MM-DD)
    const inputDate = new Date(dateOfBirth);

    // Convert to local date string for debugging
    console.log("Input date:", inputDate.toISOString().split('T')[0]);

    // Create start and end of the day for date comparison with a 1-day buffer
    const startOfDay = new Date(inputDate);
    startOfDay.setHours(0, 0, 0, 0);
    startOfDay.setDate(startOfDay.getDate() - 1); // 1 day before

    const endOfDay = new Date(inputDate);
    endOfDay.setHours(23, 59, 59, 999);
    endOfDay.setDate(endOfDay.getDate() + 1); // 1 day after

    console.log("Looking for person with:", {
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      cin: trimmedCin,
      dateRange: {
        start: startOfDay.toISOString(),
        end: endOfDay.toISOString()
      }
    });


    let personne = await queryWithRetries(() => db.personne.findFirst({
      where: {
        prenom: {
          mode: 'insensitive',
          equals: trimmedFirstName,
        },
        nom: {
          mode: 'insensitive',
          equals: trimmedLastName,
        },
        cin: trimmedCin,
        date_nai: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    }));

    if (!personne) {

      personne = await queryWithRetries(() => db.personne.findUnique({
        where: {
          cin: trimmedCin,
        },
      }));


      console.log("Found by CIN:", personne);


      if (!personne) {
        console.log("No person found with the provided CIN");
      }
    }

    if (!personne) {
      // For security reasons, don't reveal specific details about what doesn't match
      console.log("No person found with the provided information");
      return NextResponse.json(
          { message: "Les informations fournies ne correspondent à aucun compte. Veuillez vérifier votre CIN et réessayer." },
          { status: 400 }
      );
    }

    console.log("Person found:", { id: personne.idp, cin: personne.cin, nom: personne.nom, prenom: personne.prenom });

    // Find the user associated with this person
    const user = await queryWithRetries(() => db.user.findFirst({
      where: {
        personneId: personne.idp,
      },
    }));

    console.log("Found user:", user ? "Yes" : "No");

    if (!user) {
      console.log("No user found for person with ID:", personne.idp);
      return NextResponse.json(
          { message: "Aucun compte utilisateur n'est associé à ces informations. Veuillez contacter l'administrateur." },
          { status: 400 }
      );
    }

    console.log("User found:", { id: user.id, email: user.email, role: user.role });

    // Generate a reset token
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store the reset token in the database
    await queryWithRetries(() => db.user.update({
      where: {
        id: user.id,
      },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    }));

    // In a real application, you would send an email with a link to reset the password
    return NextResponse.json(
        {
          message: "Vos informations ont été vérifiées avec succès. Vous pouvez maintenant réinitialiser votre mot de passe.",
          resetToken
        },
        { status: 200 }
    );
  } catch (error) {
    console.error("Error in forgot-password API:", error);

    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      // Check for database connection errors
      if (
        error.message.includes("database") || 
        error.message.includes("prisma") ||
        error.message.includes("connection") || 
        error.message.includes("timeout") || 
        error.message.includes("Connection") ||
        error.message.includes("ECONNREFUSED") ||
        (error as any).code === 'P1001' || // Prisma error code for can't reach database server
        (error as any).code === 'P1002'    // Prisma error code for database server timeout
      ) {
        console.error("Database connection error:", error);
        return NextResponse.json(
          { message: "Erreur de connexion à la base de données. Veuillez réessayer plus tard." },
          { status: 500 }
        );
      } else if (error.message.includes("date") || error.message.includes("Date")) {
        return NextResponse.json(
          { message: "Format de date invalide. Veuillez vérifier la date de naissance." },
          { status: 400 }
        );
      }
    }

    // Default error message
    return NextResponse.json(
        { message: "Une erreur s'est produite lors du traitement de votre demande. Veuillez vérifier vos informations et réessayer." },
        { status: 500 }
    );
  }
}

// PUT method for actual password reset remains unchanged
export async function PUT(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
          { message: "Le jeton et le mot de passe sont requis" },
          { status: 400 }
      );
    }

    // Find user with this reset token and check if it's still valid
    const user = await queryWithRetries(() => db.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    }));

    if (!user) {
      return NextResponse.json(
          { message: "Jeton de réinitialisation invalide ou expiré" },
          { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hash(password, 10);

    // Update the user's password and clear the reset token
    await queryWithRetries(() => db.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    }));

    return NextResponse.json(
        { message: "Le mot de passe a été réinitialisé avec succès" },
        { status: 200 }
    );
  } catch (error) {
    console.error("Error in reset-password API:", error);

    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      // Check for database connection errors
      if (
        error.message.includes("database") || 
        error.message.includes("prisma") ||
        error.message.includes("connection") || 
        error.message.includes("timeout") || 
        error.message.includes("Connection") ||
        error.message.includes("ECONNREFUSED") ||
        (error as any).code === 'P1001' || // Prisma error code for can't reach database server
        (error as any).code === 'P1002'    // Prisma error code for database server timeout
      ) {
        console.error("Database connection error:", error);
        return NextResponse.json(
          { message: "Erreur de connexion à la base de données. Veuillez réessayer plus tard." },
          { status: 500 }
        );
      } else if (error.message.includes("password") || error.message.includes("hash")) {
        return NextResponse.json(
          { message: "Erreur lors du traitement du mot de passe. Veuillez choisir un mot de passe différent." },
          { status: 400 }
        );
      }
    }

    // Default error message
    return NextResponse.json(
        { message: "Une erreur s'est produite lors de la réinitialisation de votre mot de passe. Veuillez réessayer." },
        { status: 500 }
    );
  }
}
