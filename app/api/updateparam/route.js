import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request) {
  try {
    const formData = await request.formData();
    const fabricId = formData.get("id");

    if (!fabricId) {
      return NextResponse.json(
        {
          status: "error",
          message: "fabricId is required.",
        },
        { status: 400 }
      );
    }

    const fabricData = {
      bumpScale: parseFloat(formData.get("bumpScale")),
      displacementScale: parseFloat(formData.get("displacementScale")),
      emissiveIntensity: parseFloat(formData.get("emissiveIntensity")),
      metalness: parseFloat(formData.get("metalness")),
      roughness: parseFloat(formData.get("roughness")),
      displacementBias: parseFloat(formData.get("displacementBias")),
      flatShading: formData.get("flatShading") === "true",
      aoMapIntensity: parseFloat(formData.get("aoMapIntensity")),
      clearcoat: parseFloat(formData.get("clearcoat")),
      normalScaleX: parseFloat(formData.get("normalScaleX")),
      normalScaleY: parseFloat(formData.get("normalScaleY")),
      sheen: parseFloat(formData.get("sheen")),
      fabricName: formData.get("fabricName"),
      fabricColor: formData.get("fabricColor"),
      envMapIntensity: parseFloat(formData.get("envMapIntensity")),
      sheenRoughness: parseFloat(formData.get("sheenRoughness")),
      anisotropy: parseFloat(formData.get("anisotropy")),
      scaleX: parseFloat(formData.get("scaleX")),
      scaleY: parseFloat(formData.get("scaleY")),
      materialName: formData.get("materialName"),
      diffuseColorEnabled: formData.get("diffuseColorEnabled"),
      diffuseColor: formData.get("diffuseColor"),
    };

    const updatedFabric = await prisma.fabricMap.update({
      where: { id: fabricId },
      data: fabricData,
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Fabric data updated successfully",
        fabric: updatedFabric,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating fabric:", error.message);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to update fabric data.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
