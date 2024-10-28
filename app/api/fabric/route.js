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
    console.log("Form Data received:", formData);

    const fabricData = {
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
      diffuseMapUrll: null, // Backup fields initialized as null
      envMapUrll: null,
      refractionMapUrll: null,
      bumpMapUrll: null,
      normalMapUrll: null,
      displacementMapUrll: null,
      clearcoatMapUrll: null,
      emissiveMapUrll: null,
      sheenMapUrll: null,
      aoMapUrll: null,
      metalnessMapUrll: null,
      roughnessMapUrll: null,
      anisotropyMapUrll: null,
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

    console.log("Initial fabric data:", fabricData);

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

    const backupMapTypes = {
      diffuseMapUrll: "diffuseMapUrl",
      envMapUrll: "envMapUrl",
      refractionMapUrll: "refractionMapUrl",
      bumpMapUrll: "bumpMapUrl",
      normalMapUrll: "normalMapUrl",
      displacementMapUrll: "displacementMapUrl",
      clearcoatMapUrll: "clearcoatMapUrl",
      emissiveMapUrll: "emissiveMapUrl",
      sheenMapUrll: "sheenMapUrl",
      aoMapUrll: "aoMapUrl",
      metalnessMapUrll: "metalnessMapUrl",
      roughnessMapUrll: "roughnessMapUrl",
      anisotropyMapUrll: "anisotropyMapUrl",
    };

    for (const mapType of mapTypes) {
      const file = formData.get(mapType);
      if (file && file.size > 0) {
        console.log(`Processing file for ${mapType}:`, file.name);
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${uuidv4()}-${file.name}`;
        const contentType = file.type;

        const fileUrl = await uploadFileToS3(fileBuffer, fileName, contentType);
        fabricData[mapType] = fileUrl;
        const backupField = Object.keys(backupMapTypes).find(
          (backupField) => backupMapTypes[backupField] === mapType
        );
        if (backupField) fabricData[backupField] = fileUrl;
      } else {
        console.log(`No file uploaded for ${mapType}`);
      }
    }

    console.log("Final fabric data before saving to DB:", fabricData);

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
