/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: "50mb", // Adjust this size as needed
    },
  },
};

export default nextConfig;
