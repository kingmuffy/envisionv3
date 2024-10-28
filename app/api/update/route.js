"use server";
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";

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

export async function PUT(request) {
  try {
    const formData = await request.formData();
    const fabricId = formData.get("fabricId");
    const mapType = formData.get("mapType");
    const file = formData.get("file");

    if (!fabricId || !mapType || !file) {
      return NextResponse.json(
        {
          status: "error",
          message: "fabricId, mapType, and file are required.",
        },
        { status: 400 }
      );
    }

    console.log("Received fabricId:", fabricId);
    console.log("Received mapType:", mapType);
    console.log("Received file:", file.name);

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${uuidv4()}-${file.name}`;
    const contentType = file.type;

    const fileUrl = await uploadFileToS3(fileBuffer, fileName, contentType);

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

    const fieldToUpdate =
      mapTypeMappings[
        mapType.charAt(0).toUpperCase() + mapType.slice(1).toLowerCase()
      ];
    if (!fieldToUpdate) {
      return NextResponse.json(
        { status: "error", message: `Invalid map type: ${mapType}` },
        { status: 400 }
      );
    }

    const updatedFabric = await prisma.fabricMap.upsert({
      where: { id: fabricId },
      update: { [fieldToUpdate]: fileUrl },
      create: { id: fabricId, [fieldToUpdate]: fileUrl },
    });

    console.log("Updated fabric data:", updatedFabric);

    await revalidatePath(`/edit/${fabricId}`);

    return NextResponse.json(
      {
        status: "success",
        message: `${fieldToUpdate} updated successfully`,
        fabric: updatedFabric,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Prisma error:", error.message);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to update fabric map.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
