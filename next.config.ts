import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      /**
       * Server Action gövde sınırı varsayılan olarak **1 MB**'dir; görsel
       * yükleme bunu kolayca aşar ve "Body exceeded 1mb limit" hatası verir.
       *
       * ⚠️ Bu değer `lib/uploads.ts` içindeki `MAX_UPLOAD_BYTES` (5 MB) ile
       * uyumlu olmalı ve ondan bir tık yüksek kalmalı — çok parçalı gövde ek
       * yükü de sınıra dahildir. Yükleme sınırını değiştirirsen burayı da güncelle.
       */
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
