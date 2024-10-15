"use server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Received Data:", body);

    const { projectName, lightSettings } = body;
    if (!lightSettings || !Array.isArray(lightSettings)) {
      throw new Error("lightSettings is missing or not an array.");
    }

    const sanitizedSettings = lightSettings.map((light) => ({
      lightType: light.type,
      intensity: light.intensity,
      position: light.position ? JSON.stringify(light.position) : null,
      targetPosition: light.targetPosition
        ? JSON.stringify(light.targetPosition)
        : null,
      angle: light.angle ?? null,
      decay: light.decay ?? null,
      castShadow: light.castShadow ?? false,
      name: light.name ?? null, //
    }));

    console.log("Sanitized Light Settings:", sanitizedSettings);

    const createdProject = await prisma.project.create({
      data: {
        name: projectName,
        lightSettings: {
          create: sanitizedSettings,
        },
      },
    });

    return new Response(
      JSON.stringify({
        status: "success",
        createdProject,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving light settings:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Failed to save light settings.",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
