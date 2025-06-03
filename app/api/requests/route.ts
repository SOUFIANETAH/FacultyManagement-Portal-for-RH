//api/requests/route.ts
import prisma from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const requests = await prisma.requests.findMany({
      include: {
        user: true,
      },
    });
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Failed to fetch requests:", error);
    return NextResponse.json(
        { error: "Failed to fetch requests" },
        { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const {
      title,
      description,
      type,
      userId,
      department,
      status_user,
      userData,
      personData,
    } = await request.json();

    const validTypes = ["register", "adduser", "deleteuser", "updateuser", "announcement"];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
          { error: "Invalid request type" },
          { status: 400 }
      );
    }

    const newRequest = await prisma.requests.create({
      data: {
        title,
        description,
        type,
        userId,
        department,
        status_user,
        userData,
        personData,
        status: "pending",
        status_doyen: "pending",
        status_admin: "pending",
      },
    });

    return NextResponse.json(newRequest);
  } catch (error) {
    console.error("Failed to create request:", error);
    return NextResponse.json(
        { error: "Failed to create request" },
        { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    await prisma.requests.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete request:", error);
    return NextResponse.json(
        { error: "Failed to delete request" },
        { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, approverRole, status, action } = await request.json();

    const accountRequest = await prisma.requests.findUnique({
      where: { id },
    });

    if (!accountRequest) {
      return NextResponse.json(
          { error: "Request not found" },
          { status: 404 }
      );
    }

    let updateData: any = {};

    // Handle dean approval
    if (approverRole === "dean") {
      if (!["dean_approved", "dean_rejected"].includes(status)) {
        return NextResponse.json(
            { error: "Invalid status for dean" },
            { status: 400 }
        );
      }

      updateData = {
        status_doyen: status,
        status: status === "dean_approved" ? "dean_approved" : "dean_rejected"
      };
    }

    // Handle admin approval
    if (approverRole === "admin") {
      if (!["admin_approved", "admin_rejected"].includes(status)) {
        return NextResponse.json(
            { error: "Invalid status for admin" },
            { status: 400 }
        );
      }

      // For admin approval, require dean approval first for adduser requests
      if (status === "admin_approved" &&
          accountRequest.type === "adduser" &&
          accountRequest.status_doyen !== "dean_approved") {
        return NextResponse.json(
            { error: "Request needs dean approval first" },
            { status: 400 }
        );
      }

      updateData = {
        status_admin: status,
        status: status,
        status_user: status === "admin_approved" ? "ACTIVE" : "REJECTED"
      };

      // Handle user creation if this is an adduser request
      if (status === "admin_approved" &&
          accountRequest.type === "adduser" &&
          action === "create_user") {

        const userData = accountRequest.userData as any;
        const personData = accountRequest.personData as any;

        if (!userData || !personData) {
          return NextResponse.json(
              { error: "Missing user or person data" },
              { status: 400 }
          );
        }

        // Create person record
        const newPerson = await prisma.personne.create({
          data: {
            nom: personData.nom,
            prenom: personData.prenom,
            cin: personData.cin,
            date_nai: personData.date_nai ? new Date(personData.date_nai) : null,
            email: personData.email,
            adr: personData.adr,
            ville: personData.ville,
            tele: personData.tele,
            photo: personData.photo ? Buffer.from(personData.photo, 'base64') : null,
          }
        });

        // Create user record
        const newUser = await prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: userData.role,
            department: userData.department,
            status: "ACTIVE",
            personneId: newPerson.idp
          },
        });

        // Update request with user ID
        updateData.userId = newUser.id;
      }

      // Handle user deletion if this is a deleteuser request
      if (status === "admin_approved" &&
          accountRequest.type === "deleteuser" &&
          action === "delete_user") {

        if (accountRequest.userId) {
          const userToDelete = await prisma.user.findUnique({
            where: { id: accountRequest.userId },
            include: { personne: true }
          });

          if (userToDelete) {
            // Delete user first (due to foreign key constraints)
            await prisma.user.delete({
              where: { id: accountRequest.userId }
            });

            // Delete associated person record if exists
            if (userToDelete.personneId) {
              await prisma.personne.delete({
                where: { idp: userToDelete.personneId }
              });
            }
          }
        }
      }

      // Handle user update if this is an updateuser request
      if (status === "admin_approved" &&
          accountRequest.type === "updateuser" &&
          action === "update_user") {

        const userData = accountRequest.userData as any;
        const personData = accountRequest.personData as any;

        if (accountRequest.userId) {
          const userToUpdate = await prisma.user.findUnique({
            where: { id: accountRequest.userId },
            include: { personne: true }
          });

          if (userToUpdate) {
            // Update user record
            await prisma.user.update({
              where: { id: accountRequest.userId },
              data: {
                name: userData?.name || userToUpdate.name,
                email: userData?.email || userToUpdate.email,
                role: userData?.role || userToUpdate.role,
                department: userData?.department || userToUpdate.department,
                ...(userData?.password && { password: userData.password })
              }
            });

            // Update person record if exists
            if (userToUpdate.personneId && personData) {
              await prisma.personne.update({
                where: { idp: userToUpdate.personneId },
                data: {
                  nom: personData.nom || userToUpdate.personne?.nom,
                  prenom: personData.prenom || userToUpdate.personne?.prenom,
                  cin: personData.cin || userToUpdate.personne?.cin,
                  date_nai: personData.date_nai ? new Date(personData.date_nai) : userToUpdate.personne?.date_nai,
                  email: personData.email || userToUpdate.personne?.email,
                  adr: personData.adr || userToUpdate.personne?.adr,
                  ville: personData.ville || userToUpdate.personne?.ville,
                  tele: personData.tele || userToUpdate.personne?.tele,
                  ...(personData.photo && { photo: Buffer.from(personData.photo, 'base64') })
                }
              });
            }
          }
        }
      }
    }

    const updatedRequest = await prisma.requests.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedRequest);

  } catch (error) {
    console.error("Failed to update request:", error);
    return NextResponse.json(
        { error: "Failed to update request" },
        { status: 500 }
    );
  }
}