import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function GET() {
  try {
    const defaultProject = await prisma.project.findFirst({
      where: { isDefault: true },
      include: { lightSettings: true },
    });

    console.log("Fetched default project:", defaultProject);

    if (!defaultProject) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "No default project found.",
        }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        status: "success",
        lightSettings: defaultProject.lightSettings,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching default light settings:", error);
    return new Response(
      JSON.stringify({ status: "error", message: "Failed to fetch lights." }),
      { status: 500 }
    );
  }
}
