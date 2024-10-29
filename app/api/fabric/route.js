"use server";
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();
const s3Client = new S3Client({
  region: process.env.NEXT_AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_AWS_S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_AWS_S3_SECRET_ACCESS_KEY || "",
  },
});

// Helper function for uploading file to S3
async function uploadFileToS3(fileBuffer, fileName, contentType) {
  const params = {
    Bucket: process.env.NEXT_AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  };

  const command = new PutObjectCommand(params);
  try {
    await s3Client.send(command);
    return `https://${process.env.NEXT_AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
}

// Main API function for handling the POST request
export async function POST(request) {
  try {
    const formData = await request.formData();
    console.log("Form Data received:", formData);

    const fabricData = {
      materialName: formData.get("materialName") || null,
      diffuseMapUrl: formData.get("Diffuse") || null,
      envMapUrl: formData.get("envMapUrl") || null,
      refractionMapUrl: formData.get("refractionMapUrl") || null,
      bumpMapUrl: formData.get("bumpMapUrl") || null,
      normalMapUrl: formData.get("normalMapUrl") || null,
      displacementMapUrl: formData.get("displacementMapUrl") || null,
      clearcoatMapUrl: formData.get("clearcoatMapUrl") || null,
      emissiveMapUrl: formData.get("emissiveMapUrl") || null,
      sheenMapUrl: formData.get("sheenMapUrl") || null,
      aoMapUrl: formData.get("aoMapUrl") || null,
      metalnessMapUrl: formData.get("metalnessMapUrl") || null,
      roughnessMapUrl: formData.get("roughnessMapUrl") || null,
      anisotropyMapUrl: formData.get("anisotropyMapUrl") || null,
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
      // sheen: formData.get("sheen") === "true",
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
