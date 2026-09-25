export const ERROR_CODES = {
  INVALID_IMAGE: { code: 'INVALID_IMAGE', status: 400, message: 'Invalid image file' },
  INVALID_ANALYSIS: { code: 'INVALID_ANALYSIS', status: 502, message: 'Invalid analysis response' },
  TIMEOUT: { code: 'TIMEOUT', status: 504, message: 'Image analysis failed' },
  NO_RESULTS: { code: 'NO_RESULTS', status: 503, message: 'Image analysis failed' },
  VISION_FAILED: { code: 'VISION_FAILED', status: 503, message: 'Image analysis failed' },
  UPSTREAM_ERROR: { code: 'UPSTREAM_ERROR', status: 503, message: 'Image analysis failed' },
}

export class AppError extends Error {
  constructor(code) {
    const error = ERROR_CODES[code] || ERROR_CODES.UPSTREAM_ERROR
    super(error.message)
    this.name = 'AppError'
    this.code = error.code
    this.status = error.status
  }
}

export function toErrorResponse(err) {
  if (err instanceof AppError) {
    return { error: { code: err.code, message: err.message }, status: err.status }
  }
  return { error: { code: 'UPSTREAM_ERROR', message: 'Image analysis failed' }, status: 503 }
}

// Backend-spec error shape: { success: false, error: "<string>" }.
export function toSpecErrorResponse(err) {
  const { error, status } = toErrorResponse(err)
  return { body: { success: false, error: error.message }, status }
}