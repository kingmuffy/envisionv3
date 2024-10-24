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

async function uploadFileToS3(fileBuffer, fileName, contentType) {
  const params = {
    Bucket: process.env.NEXT_AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  };

  const command = new PutObjectCommand(params);

  try {
    console.log("Uploading to S3:", fileName);
    await s3Client.send(command);
    const fileUrl = `https://${process.env.NEXT_AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
    console.log("Upload successful. File URL:", fileUrl);
    return fileUrl;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();

    const fabricData = {
      // Set all maps to null initially
      diffuseMapUrl: null,
      envMapUrl: null,
      refractionMapUrl: null,
      bumpMapUrl: null,
      normalMapUrl: null,
      displacementMapUrl: null,
      clearcoatMapUrl: null,
      emissiveMapUrl: null,
      sheenMapUrl: null,
      aoMapUrl: null,
      metalnessMapUrl: null,
      roughnessMapUrl: null,
      anisotropyMapUrl: null,
      // Other material properties
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
    };

    const mapTypes = [
      "diffuseMapUrl",
      "envMapUrl",
      "refractionMapUrl",
      "bumpMapUrl",
      "normalMapUrl",
      "displacementMapUrl",
      "clearcoatMapUrl",
      "emissiveMapUrl",
      "sheenMapUrl",
      "aoMapUrl",
      "metalnessMapUrl",
      "roughnessMapUrl",
      "anisotropyMapUrl",
    ];

    for (const mapType of mapTypes) {
      const file = formData.get(mapType);

      if (file && file.size > 0) {
        // If it's a file, upload it to S3
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${uuidv4()}-${file.name}`;
        const contentType = file.type;

        const fileUrl = await uploadFileToS3(fileBuffer, fileName, contentType);
        fabricData[mapType] = fileUrl; // Store the uploaded file URL
      } else if (typeof file === "string") {
        // If it's a URL, save the URL directly
        fabricData[mapType] = file;
      }
    }

    const savedFabric = await prisma.fabricMap.create({
      data: fabricData,
    });

    return NextResponse.json({ status: "success", fabric: savedFabric });
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to upload fabric data." },
      { status: 500 }
    );
  }
}
