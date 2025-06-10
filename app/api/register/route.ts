//api/register/route.ts
import prisma from "../../lib/db";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
export const dynamic = "force-dynamic";
export async function GET() {
    try {
        const requests = await prisma.requests.findMany({
            include: {
                user: true,
            },
        });
        return NextResponse.json(requests || []);
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
            userData,
            personData,
        } = await request.json();

        const validTypes = ["register", "adduser", "deleteuser", "updateuser"];

        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: "Invalid request type" },
                { status: 400 }
            );
        }

        if (type === "adduser" && userData?.password) {
            userData.password = await hash(userData.password, 10);
        }

        const newRequest = await prisma.requests.create({
            data: {
                title,
                description,
                type,
                userId,
                department,
                status: "pending",
                status_user: "PENDING",
                status_doyen: "pending",
                status_admin: "pending",
                userData,
                personData,
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
            where: { id },
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

        let updateData = {};

        if (approverRole === "dean") {
            if (!["dean_approved", "dean_rejected"].includes(status)) {
                return NextResponse.json(
                    { error: "Invalid status for dean" },
                    { status: 400 }
                );
            }

            updateData = {
                status_doyen: status,
                ...(status === "dean_approved" ? {
                    status: "dean_approved",
                    status_user: "APPROVED_BY_DEAN"
                } : {
                    status: "dean_rejected",
                    status_user: "REJECTED"
                })
            };

        } else if (approverRole === "admin") {
            if (!["admin_approved", "admin_rejected"].includes(status)) {
                return NextResponse.json(
                    { error: "Invalid status for admin" },
                    { status: 400 }
                );
            }

            if (status === "admin_approved" && accountRequest.status_doyen !== "dean_approved") {
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
        } else {
            return NextResponse.json(
                { error: "Invalid approver role" },
                { status: 400 }
            );
        }

        const updatedRequest = await prisma.requests.update({
            where: { id },
            data: updateData,
        });

        if (status === "admin_approved" && action === "create_user" && accountRequest.type === "adduser") {
            const userData = accountRequest.userData as any;
            const personData = accountRequest.personData as any;

            try {
                // Create person record first
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

                const personId = newPerson.idp;

                // Create user record
                const newUser = await prisma.user.create({
                    data: {
                        name: userData.name,
                        email: userData.email,
                        password: userData.password,
                        role: userData.role,
                        department: userData.department,
                        status: "ACTIVE",
                        personneId: personId
                    },
                });

                // Create personnel record if the role is not 'user' (assuming non-users are personnel)
                if (userData.role !== 'user') {
                    await prisma.personnels.create({
                        data: {
                            idp: personId,
                            fonction: getFunctionFromRole(userData.role),
                            specialite: userData.department || null,
                        }
                    });
                }

                // Create person-department relationship
                if (userData.department) {
                    const departmentCode = getDepartmentCode(userData.department);
                    if (departmentCode) {
                        try {
                            await prisma.personne_departement.create({
                                data: {
                                    idp: personId,
                                    coded: departmentCode
                                }
                            });
                        } catch (deptError) {
                            console.warn("Could not create department relationship:", deptError);
                        }
                    }
                }

                // Create person-role relationship
                await prisma.personne_role.create({
                    data: {
                        idp: personId,
                        role: userData.role
                    }
                });

                // Update request with user ID
                await prisma.requests.update({
                    where: { id },
                    data: {
                        userId: newUser.id,
                    },
                });

                return NextResponse.json({
                    message: "Account approved and user created successfully",
                    request: updatedRequest,
                    user: {
                        id: newUser.id,
                        email: newUser.email,
                        role: newUser.role,
                        personId: personId
                    },
                });

            } catch (creationError) {
                console.error("Error creating user records:", creationError);

                // Rollback the request status update
                await prisma.requests.update({
                    where: { id },
                    data: {
                        status_admin: "pending",
                        status: "dean_approved",
                        UserStatus: "APPROVED_BY_DEAN"
                    },
                });

                return NextResponse.json(
                    { error: "Failed to create user account. Please try again." },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json(updatedRequest);
    } catch (error) {
        console.error("Failed to update request:", error);
        return NextResponse.json(
            { error: "Failed to update request" },
            { status: 500 }
        );
    }
}


function getFunctionFromRole(role: string): string {
    const roleMap: { [key: string]: string } = {
        'doyen': 'Doyen',
        'vice-doyen': 'Vice-Doyen',
        'administration': 'Personnel Administratif',
    };
    return roleMap[role] || 'Personnel';
}

// Helper function to map department names to codes
function getDepartmentCode(department: string): string | null {
    const deptMap: { [key: string]: string } = {
        'Info': 'INFO',
        'Mathematics': 'MATH',
        'Physics': 'PHYS',
        'Administration': 'ADMIN'
    };
    return deptMap[department] || null;
}
