"use server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { projectName, cameraSettings } = body;

    if (!cameraSettings || !Array.isArray(cameraSettings)) {
      throw new Error("cameraSettings is missing or not an array.");
    }

    const sanitizedSettings = cameraSettings.map((camera) => ({
      name: camera.name,
      cameraposition: JSON.stringify(camera.cameraposition),
      near: camera.near,
      far: camera.far,
      fov: camera.fov,
      minZoom: camera.minZoom,
      maxZoom: camera.maxZoom,
      minPolarAngle: camera.minPolarAngle,
      maxPolarAngle: camera.maxPolarAngle,
      targetPosition: JSON.stringify(camera.targetPosition),
    }));

    console.log("Sanitized Camera Settings:", sanitizedSettings);

    const createdProject = await prisma.cameraproject.create({
      data: {
        name: projectName,
        cameraSettings: {
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
