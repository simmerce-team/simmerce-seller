import { AlertCircle } from "lucide-react"
import Link from "next/link"

type ErrorProps = {
  title?: string
  message: string
  reset?: () => void
  showReset?: boolean
  className?: string
}

export function ErrorMessage({ 
  title = "Something went wrong!", 
  message, 
  reset, 
  showReset = false,
  className = ""
}: ErrorProps) {
  return (
    <div className={`bg-red-50 border-l-4 border-red-500 p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
          {showReset && reset && (
            <div className="mt-4">
              <button
                onClick={reset}
                className="rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function PageError({
  title = "Something went wrong!",
  message = "We're having trouble loading this page. Please try again later.",
  reset,
  showReset = true
}: Omit<ErrorProps, 'className'>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showReset && reset && (
            <button
              onClick={reset}
              className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Try again
            </button>
          )}
          <Link
            href="/"
            className="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  )
}
