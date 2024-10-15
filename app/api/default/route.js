import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { id } = await req.json();

    await prisma.project.updateMany({
      data: { isDefault: false },
    });

    const updatedProject = await prisma.project.update({
      where: { id },
      data: { isDefault: true },
    });

    return new Response(
      JSON.stringify({ status: "success", project: updatedProject }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating default project:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Failed to update default project.",
      }),
      {
        status: 500,
      }
    );
  }
}
