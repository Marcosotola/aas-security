/** @type {import('next').NextConfig} */
const nextConfig = {
    // firebase-admin (usado en app/lib/firebaseAdmin.js) depende de jwks-rsa/jose,
    // que son ESM y rompen el bundling de webpack para el servidor si no se
    // marcan como externos: con esto Next.js los deja como require() nativo.
    serverExternalPackages: ['firebase-admin'],
    webpack: (config, { isServer }) => {
        if (isServer) {
            // @react-pdf/renderer usa APIs de canvas que no están disponibles en el servidor
            config.externals = [...(config.externals || []), '@react-pdf/renderer'];
        } else {
            // nodemailer es solo para Node.js, no debe incluirse en el bundle del cliente
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                child_process: false,
                dns: false,
            };
        }
        return config;
    },
};

export default nextConfig;
