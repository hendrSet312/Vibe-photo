export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Invalid image file' })
  }
  res.status(200).json({ message: 'Photo Vibe Backend is running', timestamp: new Date().toISOString() })
}
