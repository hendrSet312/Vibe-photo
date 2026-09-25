export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_FILE_SIZE_MB = 10
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024

export function validateFile(file) {
  if (!file) return 'Please select a photo.'
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'That file type is not supported. Please use a JPG, PNG, or WEBP image.'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'That photo is too large. Please use an image under 10MB.'
  }
  return null
}
