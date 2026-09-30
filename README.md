# Ruang QR

Generator QR tautan dengan rotasi setiap 20 detik.

## GitHub Pages

1. Push repository ke branch `main` atau `master`.
2. Di **Settings > Pages**, pilih **GitHub Actions** sebagai sumber deployment.
3. Buka tab **Actions** dan tunggu workflow **Deploy GitHub Pages** selesai.

GitHub Pages hanya menjalankan file statis. Pada Pages, waktu kedaluwarsa diperiksa di browser dan bukan mekanisme keamanan server-side. Untuk token yang benar-benar diverifikasi server, jalankan `npm start` pada host yang mendukung Node.js.

## Lokal

```sh
npm start
```

Buka `http://localhost:3000`.
