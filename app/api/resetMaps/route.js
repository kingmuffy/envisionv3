"use server";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

const backupMappings = {
  diffuseMapUrl: "diffuseMapUrll",
  envMapUrl: "envMapUrll",
  refractionMapUrl: "refractionMapUrll",
  bumpMapUrl: "bumpMapUrll",
  normalMapUrl: "normalMapUrll",
  displacementMapUrl: "displacementMapUrll",
  clearcoatMapUrl: "clearcoatMapUrll",
  emissiveMapUrl: "emissiveMapUrll",
  sheenMapUrl: "sheenMapUrll",
  aoMapUrl: "aoMapUrll",
  metalnessMapUrl: "metalnessMapUrll",
  roughnessMapUrl: "roughnessMapUrll",
  anisotropyMapUrl: "anisotropyMapUrll",
};
export async function PUT(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { status: "error", message: "fabricId is required." },
        { status: 400 }
      );
    }

    // 1. Fetch the current map backup values to apply with explicitly selected fields
    const fabricMap = await prisma.fabricMap.findUnique({
      where: { id },
      select: {
        diffuseMapUrll: true,
        envMapUrll: true,
        refractionMapUrll: true,
        bumpMapUrll: true,
        normalMapUrll: true,
        displacementMapUrll: true,
        clearcoatMapUrll: true,
        emissiveMapUrll: true,
        sheenMapUrll: true,
        aoMapUrll: true,
        metalnessMapUrll: true,
        roughnessMapUrll: true,
        anisotropyMapUrll: true,
      },
    });

    if (!fabricMap) {
      return NextResponse.json(
        { status: "error", message: "Fabric map not found." },
        { status: 404 }
      );
    }

    // 2. Build the updateData object with backup values, including nulls
    const updateData = {};
    for (const [field, backupField] of Object.entries(backupMappings)) {
      updateData[field] = fabricMap[backupField]; // This will include null values
    }

    console.log("Mapped update data:", updateData); // Debug to verify mapping

    // 3. Update the fabric map with backup values
    const updatedFabric = await prisma.fabricMap.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Fabric maps reset to backup values successfully",
        fabric: updatedFabric,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /api/resetMaps:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to reset fabric maps.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
