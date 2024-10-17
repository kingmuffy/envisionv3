"use server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { projectName, cameraSettings } = body;

    // Check if cameraSettings is present and valid
    if (!cameraSettings || !Array.isArray(cameraSettings)) {
      throw new Error("cameraSettings is missing or not an array.");
    }

    // Sanitize camera settings data
    const sanitizedSettings = cameraSettings.map((camera) => ({
      name: camera.name,
      cameraposition: camera.cameraposition
        ? JSON.stringify(camera.cameraposition)
        : null,
      near: camera.near,
      far: camera.far,
      fov: camera.fov,
      targetPosition: camera.targetPosition
        ? JSON.stringify(camera.targetPosition)
        : null,
    }));

    console.log("Sanitized Camera Settings:", sanitizedSettings);

    // Create a new Cameraproject with related Camera settings
    const createdProject = await prisma.cameraproject.create({
      data: {
        name: projectName,
        cameraSettings: {
          create: sanitizedSettings, // Link camera settings here
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
    console.error("Error saving camera settings:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Failed to save camera settings.",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
