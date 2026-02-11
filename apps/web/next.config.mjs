/** @type {import('next').NextConfig} */
import path from "path"
import { fileURLToPath } from "url"
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  output :'standalone',
  experimental:
  {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  }
}

export default nextConfig
