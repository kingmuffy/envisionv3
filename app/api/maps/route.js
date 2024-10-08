import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { status: "error", message: "Fabric ID is required." },
        { status: 400 }
      );
    }

    const map = await prisma.fabricMap.findUnique({
      where: { id },
      select: {
        id: true,
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

    if (!map) {
      return NextResponse.json(
        { status: "error", message: `Map with id ${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: "success", map }, { status: 200 });
  } catch (error) {
    console.error("Error fetching fabric map:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch fabric map." },
      { status: 500 }
    );
  }
}
