"use server";
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import formidable from "formidable";
import fs from "fs";

const prisma = new PrismaClient();

const s3Client = new S3Client({
  region: process.env.NEXT_AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_AWS_S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_AWS_S3_SECRET_ACCESS_KEY || "",
  },
});

async function uploadFileToS3(fileStream, fileName, contentType) {
  const params = {
    Bucket: process.env.NEXT_AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: fileStream,
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

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  try {
    const form = formidable({
      multiples: true,
      maxFileSize: 100 * 1024 * 1024,
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(request, (err, fields, files) => {
        if (err) {
          return reject(err);
        }
        resolve([fields, files]);
      });
    });

    console.log("Form Data Fields:", fields);
    console.log("Form Data Files:", files);

    // Initial fabric data from form fields
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
      bumpScale: parseFloat(fields.bumpScale),
      displacementScale: parseFloat(fields.displacementScale),
      emissiveIntensity: parseFloat(fields.emissiveIntensity),
      metalness: parseFloat(fields.metalness),
      roughness: parseFloat(fields.roughness),
      displacementBias: parseFloat(fields.displacementBias),
      flatShading: fields.flatShading === "true",
      aoMapIntensity: parseFloat(fields.aoMapIntensity),
      clearcoat: parseFloat(fields.clearcoat),
      normalScaleX: parseFloat(fields.normalScaleX),
      normalScaleY: parseFloat(fields.normalScaleY),
      sheen: parseFloat(fields.sheen),
      fabricName: fields.fabricName,
      fabricColor: fields.fabricColor,
      envMapIntensity: parseFloat(fields.envMapIntensity),
      sheenRoughness: parseFloat(fields.sheenRoughness),
      anisotropy: parseFloat(fields.anisotropy),
      scaleX: parseFloat(fields.scaleX),
      scaleY: parseFloat(fields.scaleY),
      materialName: fields.materialName,
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

    // Process each file and upload to S3
    for (const mapType of mapTypes) {
      const file = files[mapType];
      if (file && file.size > 0) {
        console.log(`Processing file for ${mapType}:`, file.originalFilename);
        const fileStream = fs.createReadStream(file.filepath);
        const fileName = `${uuidv4()}-${file.originalFilename}`;
        const contentType = file.mimetype;

        const fileUrl = await uploadFileToS3(fileStream, fileName, contentType);
        fabricData[mapType] = fileUrl;
      } else {
        console.log(`No file uploaded for ${mapType}`);
      }
    }

    console.log("Final fabric data before saving to DB:", fabricData);

    // Save the fabric data to the database
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
