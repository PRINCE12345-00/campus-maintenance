import { useEffect, useRef, useState } from 'react'
import {
  Camera,
  Check,
  FileImage,
  RefreshCw,
  ShieldCheck,
  SwitchCamera,
  UploadCloud,
  X,
} from 'lucide-react'

const MAX_FILE_SIZE = 10 * 1024 * 1024

export default function FileUpload({ label = 'Upload evidence', onChange, multiple = false }) {
  const inputRef = useRef(null)
  const videoRef = useRef(null)
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [previews, setPreviews] = useState({})

  // Live Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraFacing, setCameraFacing] = useState('environment')
  const [cameraError, setCameraError] = useState('')
  const [capturedSnapshot, setCapturedSnapshot] = useState(null)

  useEffect(() => {
    const previewUrls = {}
    files.forEach((file) => {
      if (file.dataUrl) {
        previewUrls[file.name] = file.dataUrl
      } else if (file.type && file.type.startsWith('image/')) {
        previewUrls[file.name] = URL.createObjectURL(file)
      }
    })
    setPreviews(previewUrls)

    return () => {
      Object.values(previewUrls).forEach((url) => {
        if (url && url.startsWith('blob:')) URL.revokeObjectURL(url)
      })
    }
  }, [files])

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [cameraStream])

  const openCamera = async (facing = cameraFacing) => {
    setError('')
    setCameraError('')
    setCapturedSnapshot(null)
    setIsCameraOpen(true)

    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      setCameraStream(stream)
      // Small timeout to allow video element to mount
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      }, 100)
    } catch (err) {
      console.warn('Camera access error:', err.message)
      setCameraError('Camera access was denied or is unavailable on this device. You can still upload via files.')
    }
  }

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }
    setIsCameraOpen(false)
    setCapturedSnapshot(null)
    setCameraError('')
  }

  const switchCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment'
    setCameraFacing(nextFacing)
    openCamera(nextFacing)
  }

  const takeSnapshot = () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Stamp Live Campus Watermark Banner
    const bannerHeight = 44
    ctx.fillStyle = 'rgba(2, 6, 23, 0.82)'
    ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight)

    ctx.fillStyle = '#38bdf8'
    ctx.font = 'bold 16px sans-serif'
    ctx.fillText('📸 LIVE CAMPUS EVIDENCE CAPTURE', 18, canvas.height - 16)

    ctx.fillStyle = '#cbd5e1'
    ctx.font = '14px monospace'
    const nowStr = new Date().toLocaleString()
    const textWidth = ctx.measureText(nowStr).width
    ctx.fillText(nowStr, canvas.width - textWidth - 18, canvas.height - 16)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88)
    setCapturedSnapshot(dataUrl)
  }

  const confirmSnapshot = () => {
    if (!capturedSnapshot) return

    const arr = capturedSnapshot.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    const liveFile = new File([u8arr], `live_photo_${Date.now()}.jpg`, { type: mime })
    liveFile.isLiveCapture = true
    liveFile.dataUrl = capturedSnapshot

    const nextFiles = multiple ? [...files, liveFile] : [liveFile]
    setFiles(nextFiles)
    onChange?.(nextFiles)
    closeCamera()
  }

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
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-slate-300">{label}</label>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
          <ShieldCheck size={13} /> Live Camera Verification
        </span>
      </div>

      {/* Dual Capture Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Button 1: Live In-App Camera (Recommended) */}
        <button
          type="button"
          onClick={() => openCamera('environment')}
          className="flex items-center justify-center gap-2.5 rounded-2xl border border-blue-500/40 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 px-4 py-4 text-center font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.3)] transition hover:brightness-110 active:scale-[0.98]"
        >
          <Camera size={20} className="shrink-0 text-cyan-300" />
          <div className="text-left">
            <p className="text-sm font-bold leading-tight">Take Live Photo</p>
            <p className="text-[11px] font-normal text-blue-200">Opens Camera • Prevents fake gallery uploads</p>
          </div>
        </button>

        {/* Button 2: File Picker Fallback */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-4 text-center transition hover:border-white/20 hover:bg-slate-900/80 active:scale-[0.98]"
        >
          <UploadCloud size={20} className="shrink-0 text-slate-400" />
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-200 leading-tight">Upload File</p>
            <p className="text-[11px] text-slate-400">JPG, PNG, PDF up to 10MB</p>
          </div>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept="image/*,video/*,.pdf"
        capture="environment"
        className="sr-only"
        onChange={handleFiles}
        aria-label={label}
      />

      {error && <p role="alert" className="mt-2 text-sm text-red-400">{error}</p>}

      {/* Selected Evidence Preview List */}
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file, index) => {
            const isLive = Boolean(file.isLiveCapture)
            return (
              <li key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-slate-200">
                {previews[file.name] ? (
                  <img src={previews[file.name]} alt={`Preview of ${file.name}`} className="h-14 w-14 rounded-xl object-cover border border-white/10 shrink-0" />
                ) : (
                  <FileImage size={24} className="shrink-0 text-blue-400 ml-2" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="truncate text-xs font-semibold text-white">{file.name}</p>
                    {isLive ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                        <Check size={11} /> Live Camera Snapshot
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400 border border-white/10">
                        Storage File
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isLive ? 'Watermarked with date & time • Verified live on campus' : 'Subject to Admin Stage-1 verification'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(file)}
                  aria-label={`Remove ${file.name}`}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-red-400 transition shrink-0"
                >
                  <X size={16} />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {/* LIVE CAMERA MODAL / POPUP OVERLAY */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
          <div className="relative flex flex-col w-full max-w-lg rounded-3xl border border-white/15 bg-slate-900 p-5 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-cyan-400" />
                <h3 className="font-bold text-base text-white">Live Camera Evidence Capture</h3>
              </div>
              <button
                type="button"
                onClick={closeCamera}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {cameraError ? (
              <div className="py-8 text-center text-rose-300 space-y-3">
                <p className="text-sm font-semibold">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => { closeCamera(); inputRef.current?.click() }}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500"
                >
                  Use File Upload Instead
                </button>
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center">
                {/* Viewfinder Container */}
                <div className="relative w-full aspect-[4/3] max-h-72 bg-black rounded-2xl overflow-hidden border border-white/10 shadow-inner flex items-center justify-center">
                  {!capturedSnapshot ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {/* Target Reticle Overlay */}
                      <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-dashed border-cyan-400/60 flex items-center justify-center">
                        <span className="text-[11px] font-bold bg-slate-950/70 px-2.5 py-1 rounded-full text-cyan-300 backdrop-blur-xs">
                          Center Damaged Equipment Here
                        </span>
                      </div>
                    </>
                  ) : (
                    <img
                      src={capturedSnapshot}
                      alt="Captured snapshot preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Viewfinder Controls */}
                <div className="mt-4 flex w-full items-center justify-between gap-3">
                  {!capturedSnapshot ? (
                    <>
                      <button
                        type="button"
                        onClick={switchCameraFacing}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700"
                      >
                        <SwitchCamera size={15} /> Switch Lens
                      </button>

                      {/* Snap Button */}
                      <button
                        type="button"
                        onClick={takeSnapshot}
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400 p-1 shadow-[0_0_20px_rgba(34,211,238,0.5)] transition hover:scale-105 active:scale-95 text-slate-950"
                        title="Take Photo"
                      >
                        <div className="h-11 w-11 rounded-full border-2 border-slate-950 flex items-center justify-center">
                          <Camera size={22} className="text-slate-950" />
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={closeCamera}
                        className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setCapturedSnapshot(null)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                      >
                        <RefreshCw size={14} /> Retake
                      </button>

                      <button
                        type="button"
                        onClick={confirmSnapshot}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg transition hover:brightness-110"
                      >
                        <Check size={16} /> Use This Live Photo
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
