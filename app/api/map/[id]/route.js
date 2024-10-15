import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const id = "670535713fcc49b60414fabf";
  console.log("iduguiguyfß", id);

  try {
    const project = await prisma.fabricMap.findUnique({
      where: { id: id },
      select: {
        diffuseMapUrl: true,
        envMapUrl: true,
        refractionMapUrl: true,
        bumpMapUrl: true,
        normalMapUrl: true,
        displacementMapUrl: true,
        clearcoatMapUrl: true,
        emissiveMapUrl: true,
        sheenMapUrl: true,
        aoMapUrl: true,
        metalnessMapUrl: true,
        roughnessMapUrl: true,
        anisotropyMapUrl: true,
        bumpScale: true,
        displacementScale: true,
        emissiveIntensity: true,
        metalness: true,
        roughness: true,
        displacementBias: true,
        flatShading: true,
        aoMapIntensity: true,
        clearcoat: true,
        normalScaleX: true,
        normalScaleY: true,
        envMapIntensity: true,
        sheen: true,
        fabricName: true,
        fabricColor: true,
        scaleX: true,
        scaleY: true,
        sheenRoughness: true,
        anisotropy: true,
        envvMapUrl: true,
        materialName: true,
        createdAt: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { status: "error", message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: "success", project });
  } catch (error) {
    console.error("Error loading project:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to load project" },
      { status: 500 }
    );
  }
}
export const revalidate = 0;
