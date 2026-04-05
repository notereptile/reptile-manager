/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // 타입 에러가 있어도 빌드를 성공시킵니다.
    ignoreBuildErrors: true,
  },
  eslint: {
    // 린트 에러가 있어도 빌드를 성공시킵니다.
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig