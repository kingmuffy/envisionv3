import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const revalidate = 0;

export async function GET() {
  try {
    const defaultCameraProject = await prisma.cameraproject.findFirst({
      where: { isDefault: true },
      include: { cameraSettings: true },
    });

    console.log("Fetched default camera project:", defaultCameraProject);

    if (!defaultCameraProject) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "No default camera project found.",
        }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        status: "success",
        cameraSettings: defaultCameraProject.cameraSettings,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching default camera settings:", error);
    return new Response(
      JSON.stringify({ status: "error", message: "Failed to fetch cameras." }),
      { status: 500 }
    );
  }
}
