"use server";
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const s3Client = new S3Client({
  region: process.env.NEXT_AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_AWS_S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_AWS_S3_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    console.log("Form Data received:", formData);

    const fabricData = {
      materialName: formData.get("materialName") || null,
      diffuseMapUrl: formData.get("Diffuse") || null,
      refractionMapUrl: formData.get("Refraction") || null,
      normalMapUrl: formData.get("Normal") || null,
      displacementMapUrl: formData.get("Displacement") || null,
      bumpMapUrl: formData.get("Bump") || null,
      envMapUrl: formData.get("EnvMap") || null,
      clearcoatMapUrl: formData.get("Clearcoat") || null,
      emissiveMapUrl: formData.get("Emissive") || null,
      sheenMapUrl: formData.get("Sheen") || null,
      aoMapUrl: formData.get("AO") || null,
      metalnessMapUrl: formData.get("Metalness") || null,
      roughnessMapUrl: formData.get("Roughness") || null,
      anisotropyMapUrl: formData.get("Anisotropy") || null,
      diffuseMapUrll: formData.get("Diffuse") || null, // Backup fields initialized as null
      envMapUrll: formData.get("EnvMap") || null,
      refractionMapUrll: formData.get("Refraction") || null,
      bumpMapUrll: formData.get("Bump") || null,
      normalMapUrll: formData.get("Normal") || null,
      displacementMapUrll: null,
      clearcoatMapUrll: null,
      emissiveMapUrll: null,
      sheenMapUrll: null,
      aoMapUrll: null,
      metalnessMapUrll: null,
      roughnessMapUrll: null,
      anisotropyMapUrll: null,
      // Other numeric and Boolean fields
      bumpScale: parseFloat(formData.get("bumpScale")) || null,
      displacementScale: parseFloat(formData.get("displacementScale")) || null,
      emissiveIntensity: parseFloat(formData.get("emissiveIntensity")) || null,
      metalness: parseFloat(formData.get("metalness")) || null,
      roughness: parseFloat(formData.get("roughness")) || null,
      displacementBias: parseFloat(formData.get("displacementBias")) || null,
      flatShading: formData.get("flatShading") === "true",
      aoMapIntensity: parseFloat(formData.get("aoMapIntensity")) || null,
      clearcoat: parseFloat(formData.get("clearcoat")) || null,
      normalScaleX: parseFloat(formData.get("normalScaleX")) || null,
      normalScaleY: parseFloat(formData.get("normalScaleY")) || null,
      fabricName: formData.get("fabricName") || null,
      fabricColor: formData.get("fabricColor") || null,
      envMapIntensity: parseFloat(formData.get("envMapIntensity")) || null,
      sheenRoughness: parseFloat(formData.get("sheenRoughness")) || null,
      anisotropy: parseFloat(formData.get("anisotropy")) || null,
      scaleX: parseFloat(formData.get("scaleX")) || null,
      scaleY: parseFloat(formData.get("scaleY")) || null,
    };

    console.log("Final fabric data before saving to DB:", fabricData);

    // Save the fabric data in Prisma
    const savedFabric = await prisma.fabricMap.create({
      data: fabricData,
    });

    console.log("Saved Fabric Data:", savedFabric);

    return NextResponse.json({ status: "success", fabric: savedFabric });
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to upload fabric data." },
      { status: 500 }
    );
  }
}
