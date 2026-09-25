import { useEffect, useRef, useState } from 'react'
import PhotoUploader from '../components/page/PhotoUploader'
import ImagePreview from '../components/page/ImagePreview'
import VibeResult from '../components/page/VibeResult'
import Loader from '../components/common/Loader'
import ErrorMessage from '../components/common/ErrorMessage'
import Button from '../components/common/Button'
import { validateFile } from '../utils/fileValidation'
import { analyzeImage } from '../lib/vibeApi'

const STATUS = {
  EMPTY: 'EMPTY',
  PHOTO_SELECTED: 'PHOTO_SELECTED',
  ANALYZING: 'ANALYZING',
  RESULT: 'RESULT',
  ERROR: 'ERROR',
}

const ANALYZING_MESSAGES = [
  'Reading colors and lighting...',
  'Interpreting the mood...',
  'Matching songs to your vibe...',
]

export default function UploadPage() {
  const [status, setStatus] = useState(STATUS.EMPTY)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [validationError, setValidationError] = useState(null)
  const [vibeData, setVibeData] = useState(null)
  const [messageIndex, setMessageIndex] = useState(0)
  const fileRef = useRef(null)

  useEffect(() => {
    if (status !== STATUS.ANALYZING) return
    const id = setInterval(
      () => setMessageIndex((i) => (i + 1) % ANALYZING_MESSAGES.length),
      2500,
    )
    return () => clearInterval(id)
  }, [status])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileSelect = (file) => {
    const error = validateFile(file)
    if (error) {
      setValidationError(error)
      return
    }
    fileRef.current = file
    setPreviewUrl(URL.createObjectURL(file))
    setValidationError(null)
    setVibeData(null)
    setStatus(STATUS.PHOTO_SELECTED)
  }

  const handleRemove = () => {
    fileRef.current = null
    setPreviewUrl(null)
    setValidationError(null)
    setVibeData(null)
    setStatus(STATUS.EMPTY)
  }

  const handleAnalyze = async () => {
    if (!fileRef.current || status === STATUS.ANALYZING) return
    setMessageIndex(0)
    setStatus(STATUS.ANALYZING)
    try {
      const data = await analyzeImage(fileRef.current)
      setVibeData(data)
      setStatus(STATUS.RESULT)
    } catch {
      setStatus(STATUS.ERROR)
    }
  }

  return (
    <div className={`mx-auto px-4 ${status === STATUS.RESULT ? 'max-w-6xl py-8 md:py-10' : 'max-w-3xl py-12 md:py-16'}`}>
      {status !== STATUS.RESULT && (
      <header className="mb-8">
        <h1 className="font-dell-display text-2xl text-black">Upload Your Photo</h1>
        <p className="mt-2 max-w-xl font-dell-body text-sm text-black">
          Drop in a photograph and we will read its colors, lighting, and mood to find songs that match.
        </p>
      </header>
      )}

      {status === STATUS.EMPTY && (
        <PhotoUploader onFileSelect={handleFileSelect} error={validationError} />
      )}

      {status === STATUS.PHOTO_SELECTED && previewUrl && (
        <div>
          <ImagePreview
            imageSrc={previewUrl}
            onReplace={handleFileSelect}
            onRemove={handleRemove}
            onAnalyze={handleAnalyze}
          />
          <ErrorMessage message={validationError} />
        </div>
      )}

      {status === STATUS.ANALYZING && (
        <Loader message={ANALYZING_MESSAGES[messageIndex]} />
      )}

      {status === STATUS.RESULT && vibeData && previewUrl && (
        <VibeResult
          imageSrc={previewUrl}
          vibeData={vibeData}
          onReset={handleRemove}
        />
      )}

      {status === STATUS.ERROR && (
        <div className="border border-black bg-white">
          <div className="border-b border-black p-3">
            <h2 className="font-dell-heading text-sm uppercase text-black">Something Went Wrong</h2>
          </div>
          <div className="p-6">
            <p className="font-dell-body text-sm text-black">
              The analysis could not be completed. Your photo is still here, so you can try again.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button variant="secondary" onClick={handleRemove}>Start Over</Button>
              <Button variant="primary" onClick={handleAnalyze}>Try Again</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
