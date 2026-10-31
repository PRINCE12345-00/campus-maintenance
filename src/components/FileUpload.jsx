import { useEffect, useRef, useState } from 'react'
import { FileImage, UploadCloud, X } from 'lucide-react'

const MAX_FILE_SIZE = 10 * 1024 * 1024

export default function FileUpload({ label = 'Upload evidence', onChange, multiple = false }) {
  const inputRef = useRef(null)
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [previews, setPreviews] = useState({})

  useEffect(() => {
    const previewUrls = {}
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        previewUrls[file.name] = URL.createObjectURL(file)
      }
    })
    setPreviews(previewUrls)

    return () => Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url))
  }, [files])

  const handleFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || [])
    if (!selectedFiles.length) return

    const invalidFile = selectedFiles.find((file) => {
      const allowedType = file.type.startsWith('image/') || file.type.startsWith('video/') || file.type === 'application/pdf'
      return !allowedType || file.size > MAX_FILE_SIZE
    })

    if (invalidFile) {
      setError(invalidFile.size > MAX_FILE_SIZE
        ? `${invalidFile.name} exceeds the 10MB limit.`
        : `${invalidFile.name} is not a supported image, video, or PDF.`)
      event.target.value = ''
      return
    }

    const nextFiles = multiple ? [...files, ...selectedFiles] : selectedFiles.slice(0, 1)
    setFiles(nextFiles)
    setError('')
    onChange?.(nextFiles)
    event.target.value = ''
  }

  const removeFile = (fileToRemove) => {
    const nextFiles = files.filter((file) => file !== fileToRemove)
    setFiles(nextFiles)
    onChange?.(nextFiles)
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <UploadCloud size={26} className="mb-3 text-blue-600" />
        <span className="text-sm font-medium text-slate-700">{files.length ? 'Add or replace evidence' : label}</span>
        <span className="mt-1 text-xs text-slate-500">Images, videos, or PDF files up to 10MB</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept="image/*,video/*,.pdf"
        className="sr-only"
        onChange={handleFiles}
        aria-label={label}
      />

      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
              {previews[file.name] ? (
                <img src={previews[file.name]} alt={`Preview of ${file.name}`} className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <FileImage size={22} className="shrink-0 text-blue-600" />
              )}
              <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{file.name}</span>
              <button type="button" onClick={() => removeFile(file)} aria-label={`Remove ${file.name}`} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-red-600">
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
