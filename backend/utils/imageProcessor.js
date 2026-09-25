import sharp from 'sharp'
import { AppError } from './errors.js'

const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024
const MAX_DIMENSION = 1024

export async function processImage(buffer, mimeType) {

  
  if (!ACCEPTED_MIME.includes(mimeType)) {
    throw new AppError('INVALID_IMAGE')
  }
  if (buffer.length > MAX_SIZE) {
    throw new AppError('INVALID_IMAGE')
  }

  const image = sharp(buffer)
  const metadata = await image.metadata()

  if (!metadata.width || !metadata.height) {
    throw new AppError('INVALID_IMAGE')
  }

  const { data, info } = await image
    .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
    .rotate()
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer({ resolveWithObject: true })

  return {
    buffer: data,
    mimeType: 'image/jpeg',
    width: info.width,
    height: info.height,
  }
}