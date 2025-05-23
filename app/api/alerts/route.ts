import prisma from "../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const alerts = await prisma.alert.findMany({
      include: {
        user: true,
      },
    });
    return NextResponse.json(alerts || []);
  } catch (error) {
    console.error("Failed to fetch alerts:", error);
    return NextResponse.json(
        { error: "Failed to fetch alerts" },
        { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title, description, type, userId } = await request.json();
    const validTypes = ["error", "warning", "info"];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
          { error: "Invalid alert type" },
          { status: 400 }
      );
    }

    const newAlert = await prisma.alert.create({
      data: {
        title,
        description,
        type,
        userId,
      },
    });
    return NextResponse.json(newAlert);
  } catch (error) {
    console.error("Failed to create alert:", error);
    return NextResponse.json(
        { error: "Failed to create alert" },
        { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.alert.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete alert:", error);
    return NextResponse.json(
        { error: "Failed to delete alert" },
        { status: 500 }
    );
  }
}
export async function PUT(request: Request) {
  try {
    const { id, title, description, type } = await request.json();

    const validTypes = ["error", "warning", "info"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
          { error: "Invalid alert type" },
          { status: 400 }
      );
    }

    await prisma.alert.update({
      where: { id },
      data: {
        title,
        description,
        type,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to process alert:", error);
    return NextResponse.json(
        { error: "Failed to process alert" },
        { status: 500 }
    );
  }
}
