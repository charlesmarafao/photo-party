/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
				hostname: "randomuser.me"
			},
			{
				protocol: "https",
				hostname: "public.blob.vercel-storage.com"
            }
        ]
    }
};

export default nextConfig;
