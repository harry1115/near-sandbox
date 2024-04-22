/** @type {import('next').NextConfig} */
const nextConfig = {
    redirects:()=>[
        { source: '/', destination: '/multi-chain', permanent: true}
    ]
};

export default nextConfig;
