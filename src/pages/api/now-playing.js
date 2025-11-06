export default function handler(req, res) {
  const variants = ['card', 'dvd'];
  const randomVariant = variants[Math.floor(Math.random() * variants.length)];

  // Dapatkan host dari header, atau gunakan fallback jika tidak tersedia
  const host = req.headers.host || 'https://thirapi-now-playing.vercel.app/';
  // Tentukan protokol berdasarkan lingkungan
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

  const redirectUrl = `${protocol}://${host}/api/now-playing/${randomVariant}`;

  // Set header agar redirect tidak di-cache
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  // Lakukan temporary redirect
  res.redirect(302, redirectUrl);
}
