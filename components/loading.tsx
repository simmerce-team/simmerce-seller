import { Loader2 } from "lucide-react"

export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      <p className="text-gray-600">Loading...</p>
    </div>
  )
}

export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <Loader2 className={`h-5 w-5 animate-spin text-blue-600 ${className}`} />
  )
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800">Loading Simmerce</h2>
        <p className="text-gray-600 mt-2">Please wait while we load your experience</p>
      </div>
    </div>
  )
}
