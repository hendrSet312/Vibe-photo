const API_URL = '/api/analyze'
const API_KEY = import.meta.env.VITE_API_KEY

export async function analyzeImage(file) {
  if (!file) {
    return Promise.reject(new Error('No photo was provided for analysis.'))
  }

  const formData = new FormData()
  formData.append('image', file)

  const headers = {}
  if (API_KEY) {
    headers['x-api-key'] = API_KEY
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    body: formData,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `Analysis failed with status ${response.status}`)
  }

  return response.json()
}