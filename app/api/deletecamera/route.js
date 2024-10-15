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
          message: "Camera project ID is required.",
        }),
        { status: 400 }
      );
    }

    const projectId = new ObjectId(id);

    await prisma.camera.deleteMany({
      where: { cameraprojectId: projectId },
    });

    await prisma.cameraproject.delete({
      where: { id: projectId },
    });

    return new Response(
      JSON.stringify({
        status: "success",
        message:
          "Camera project and related camera settings deleted successfully.",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Error deleting camera project and related camera settings:",
      error
    );
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Failed to delete camera project and related camera settings.",
      }),
      { status: 500 }
    );
  }
}
