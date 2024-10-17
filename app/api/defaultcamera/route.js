import { PrismaClient } from "@prisma/client";
import { revalidate } from "../cameralist/route";

const prisma = new PrismaClient();
revalidate = 0;

export async function POST(req) {
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

    await prisma.cameraproject.updateMany({
      data: { isDefault: false },
    });

    const updatedCameraProject = await prisma.cameraproject.update({
      where: { id },
      data: { isDefault: true },
    });

    return new Response(
      JSON.stringify({ status: "success", project: updatedCameraProject }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating default camera project:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Failed to update default camera project.",
      }),
      {
        status: 500,
      }
    );
  }
}
