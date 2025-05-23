import prisma from "../../../lib/db";
import { NextRequest,NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(Request: NextRequest, { params }: { params: { id: string } }) {
    try {
            const user= await prisma.user.findUnique({
                    where: {
                        id: parseInt(params.id)
                    },
                }
            );
            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }
            return NextResponse.json(user);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { email, name, role,password} = await request.json();
        const exists= await prisma.user.findUnique({
            where: {
                email
            },
        });
        if (exists) {
            return NextResponse.json({ error: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                role,
                password: hashedPassword,
            },
        });
        return NextResponse.json(newUser);
    } catch (error) {
            console.error(error);
            return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
            await prisma.user.delete(
                {
                    where:{
                        id:parseInt(params.id)
                    },
                }
            );
            return NextResponse.json({ success: true });
    } catch (error) {
            console.error(error);
            return NextResponse.json({ error: "Failed to delete user" });
    }
}
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {   const data = await request.json();
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: parseInt(params.id)
            },
            data,});
        return NextResponse.json(updatedUser);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}
