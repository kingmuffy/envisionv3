import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const revalidate = 0;

export async function GET(req) {
  try {
    const projects = await prisma.cameraproject.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        isDefault: true,
      },
    });
    return new Response(JSON.stringify({ status: "success", projects }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching camera projects:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Failed to fetch camera projects.",
      }),
      { status: 500 }
    );
  }
}
