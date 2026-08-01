import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@copilotkit/runtime"],
  devIndicators: false,

  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;



// import type { NextConfig } from "next";
// import path from "path";
 
// const nextConfig: NextConfig = {
//   serverExternalPackages: ["@copilotkit/runtime"],
//   devIndicators: false,
//   experimental: {
//     turbopack: {
//       root: path.resolve(__dirname),
//     },
//   },
// };
 
// export default nextConfig;