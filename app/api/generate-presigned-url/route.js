import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.NEXT_AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_AWS_S3_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    const { fileType, mapType } = await request.json();

    const fileName = `${uuidv4()}-${mapType}`;

    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_AWS_S3_BUCKET_NAME,
      Key: fileName,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60 * 5,
    });

    return NextResponse.json({ uploadUrl, fileName });
  } catch (error) {
    console.error("Error generating pre-signed URL", error);
    return NextResponse.json(
      { error: "Failed to generate pre-signed URL" },
      { status: 500 }
    );
  }
}
