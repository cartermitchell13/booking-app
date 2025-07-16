interface ErrorStateProps {
  error: string
  className?: string
}

export function ErrorState({ error, className = "mb-8" }: ErrorStateProps) {
  return (
    <div className={className}>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    </div>
  )
} 