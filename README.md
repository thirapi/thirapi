# thirapi

`thirapi` adalah layanan integrasi Spotify Now Playing yang menghasilkan widget SVG dinamis dan data JSON secara real-time berdasarkan lagu yang sedang Anda dengarkan di Spotify. Proyek ini sangat cocok digunakan untuk mempercantik profil GitHub (GitHub Readme) atau diintegrasikan ke dalam website pribadi.

## Fitur Utama
- **Integrasi Spotify API**: Mengambil data putaran musik secara real-time dengan pembaruan token akses otomatis.
- **Widget SVG Dinamis**:
  - **Music Card**: Tampilan kartu pemutar musik modern dan minimalis (`/api/now-playing/music-card`).
  - **Vinyl Disc**: Animasi piringan hitam (piringan CD) berputar yang elegan (`/api/now-playing/disc`).
  - **Random Redirect**: Endpoint yang secara acak mengalihkan (redirect) ke salah satu tampilan SVG di atas (`/api/now-playing`).
- **Next.js API Routes**: Performa rendering cepat dengan dukungan caching yang dioptimalkan.

## API Endpoints
- `GET /api/get-playing` - Mengembalikan data lagu yang sedang diputar dalam format JSON.
- `GET /api/now-playing` - Mengalihkan secara acak (307 Redirect) ke salah satu widget SVG.
- `GET /api/now-playing/music-card` - Menghasilkan gambar SVG dengan tampilan kartu pemutar musik.
- `GET /api/now-playing/disc` - Menghasilkan gambar SVG dengan tampilan piringan hitam berputar.
