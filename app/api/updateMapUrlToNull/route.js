"use server";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
const mapTypeMappings = {
  Diffuse: "diffuseMapUrl",
  Bump: "bumpMapUrl",
  Normal: "normalMapUrl",
  Displacement: "displacementMapUrl",
  Reflection: "reflectionMapUrl",
  Refraction: "refractionMapUrl",
  Clearcoat: "clearcoatMapUrl",
  Emissive: "emissiveMapUrl",
  Sheen: "sheenMapUrl",
  AO: "aoMapUrl",
  Metalness: "metalnessMapUrl",
  Roughness: "roughnessMapUrl",
  Anisotropy: "anisotropyMapUrl",
  Nulle: "nullMapUrl",
};

export async function PUT(request) {
  try {
    const formData = await request.formData();
    const fabricId = formData.get("fabricId");
    let mapType = formData.get("mapType");

    console.log("Received fabricId:", fabricId);
    console.log("Received mapType:", mapType);

    if (
      !fabricId ||
      typeof fabricId !== "string" ||
      !mapType ||
      typeof mapType !== "string"
    ) {
      console.error("Invalid input for fabricId or mapType:", {
        fabricId,
        mapType,
      });
      return NextResponse.json(
        {
          status: "error",
          message: "Valid fabricId and mapType are required.",
        },
        { status: 400 }
      );
    }

    mapType = mapType.charAt(0).toUpperCase() + mapType.slice(1).toLowerCase();
    const fieldToUpdate = mapTypeMappings[mapType];

    if (!fieldToUpdate) {
      console.error(`Invalid map type received: ${mapType}`);
      return NextResponse.json(
        { status: "error", message: `Invalid map type: ${mapType}` },
        { status: 400 }
      );
    }

    const existingFabric = await prisma.fabricMap.findUnique({
      where: { id: fabricId },
      select: { [fieldToUpdate]: true },
    });

    if (existingFabric && existingFabric[fieldToUpdate] === null) {
      console.log(`${fieldToUpdate} is already null for fabricId: ${fabricId}`);
      return NextResponse.json(
        { status: "success", message: `${fieldToUpdate} is already null.` },
        { status: 200 }
      );
    }

    const updatedFabric = await prisma.fabricMap.update({
      where: { id: fabricId },
      data: { [fieldToUpdate]: null },
    });

    return NextResponse.json(
      {
        status: "success",
        message: `${fieldToUpdate} map URL set to null successfully.`,
        fabric: updatedFabric,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /api/updateMapUrlToNull:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to update fabric map URL to null.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
