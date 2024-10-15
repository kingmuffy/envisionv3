import { PrismaClient } from "@prisma/client";
import { ObjectId } from "mongodb";
const prisma = new PrismaClient();

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!id) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Project ID is required.",
        }),
        { status: 400 }
      );
    }

    const projectId = new ObjectId(id);

    await prisma.lightSettings.deleteMany({
      where: { projectId: projectId },
    });

    await prisma.project.delete({
      where: { id: projectId },
    });

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Project and related light settings deleted successfully.",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting project and related light settings:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Failed to delete project and related light settings.",
      }),
      { status: 500 }
    );
  }
}
