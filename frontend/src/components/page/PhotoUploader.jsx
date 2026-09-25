import { useRef, useState } from 'react'
import ErrorMessage from '../common/ErrorMessage'

export default function PhotoUploader({ onFileSelect, error }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const openPicker = () => inputRef.current?.click()

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) onFileSelect(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
    e.target.value = ''
  }

  return (
    <div>
      <button
        type="button"
        onClick={openPicker}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        aria-label="Upload a photo: click to browse or drop a file here"
        className={`w-full border border-black p-6 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#000000] focus-visible:ring-offset-2 ${isDragging ? 'bg-[#b3bd95]' : 'bg-white hover:bg-neutral-100'}`}
      >
        <span className="block py-10">
          <span className="block font-dell-heading text-base uppercase text-black">Drop your photo here</span>
          <span className="mt-2 block font-dell-body text-sm text-neutral-700">
            or click to browse. JPG, PNG, or WEBP up to 10MB.
          </span>
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleInputChange}
        aria-label="Photo file input"
      />
      <ErrorMessage message={error} />
    </div>
  )
}
