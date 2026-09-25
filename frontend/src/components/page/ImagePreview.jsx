import { useRef } from 'react'
import Button from '../common/Button'

export default function ImagePreview({ imageSrc, onReplace, onRemove, onAnalyze }) {
  const inputRef = useRef(null)

  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) onReplace(file)
    e.target.value = ''
  }

  return (
    <div>
      <div className="border border-black bg-white p-2">
        <img
          src={imageSrc}
          alt="Selected photo preview"
          className="mx-auto max-h-[420px] w-full object-contain"
        />
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onRemove}>Remove</Button>
        <Button variant="secondary" onClick={() => inputRef.current?.click()}>Replace</Button>
        <Button variant="primary" onClick={onAnalyze}>Find My Vibe</Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleInputChange}
        aria-label="Replace photo file input"
      />
    </div>
  )
}
