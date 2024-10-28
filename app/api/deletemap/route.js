"use server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client"; // Assuming Prisma is set up for MongoDB
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function DELETE(request) {
  try {
    const formData = await request.formData();
    const fabricId = formData.get("fabricId");
    const mapType = formData.get("mapType");

    if (!fabricId || !mapType) {
      console.log("Invalid request data:", { fabricId, mapType });
      return NextResponse.json(
        {
          status: "error",
          message: "fabricId and mapType are required.",
        },
        { status: 400 }
      );
    }

    console.log("Received fabricId:", fabricId);
    console.log("Received mapType:", mapType);

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
    };

    const fieldToDelete = mapTypeMappings[mapType];
    if (!fieldToDelete) {
      return NextResponse.json(
        { status: "error", message: `Invalid map type: ${mapType}` },
        { status: 400 }
      );
    }

    // Fetch the fabric to verify if the map exists
    const fabric = await prisma.fabricMap.findUnique({
      where: { id: fabricId },
      select: { [fieldToDelete]: true },
    });

    if (!fabric || !fabric[fieldToDelete]) {
      return NextResponse.json(
        { status: "error", message: "Map not found for deletion." },
        { status: 404 }
      );
    }

    // Update the fabric map to remove the file URL reference (setting the field to null)
    const updatedFabric = await prisma.fabricMap.update({
      where: { id: fabricId },
      data: { [fieldToDelete]: null }, // Set the field to null to remove the map reference
    });

    console.log("Updated fabric data after deletion:", updatedFabric);

    // Revalidate the path for any related updates
    await revalidatePath(`/edit/${fabricId}`);

    return NextResponse.json(
      {
        status: "success",
        message: `${fieldToDelete} map deleted successfully`,
        fabric: updatedFabric,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /api/delete:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to delete fabric map.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
