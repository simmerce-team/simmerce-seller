'use client'

import { PageError } from '@/components/error'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <PageError 
      title="Something went wrong!"
      message={error.message || 'An unexpected error occurred'}
      reset={reset}
    />
  )
}
