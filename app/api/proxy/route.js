import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json(
        { status: "error", message: "Image URL is required" },
        { status: 400 }
      );
    }

    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const contentType = response.headers["content-type"] || "image/jpeg";

    return new Response(response.data, {
      status: 200,
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    console.error("Error proxying image:", error);
    return new Response(
      JSON.stringify({ status: "error", message: "Error fetching image" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
