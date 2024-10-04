import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const projects = await prisma.fabricMap.findMany({
      select: {
        id: true,
        materialName: true,
        createdAt: true,
        diffuseMapUrl: true,
      },
    });
    return new Response(JSON.stringify({ status: "success", projects }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Failed to fetch material list.",
      }),
      {
        status: 500,
      }
    );
  }
}

export const revalidate = 0;
