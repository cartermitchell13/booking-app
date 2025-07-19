'use client'

interface BookingStep {
  id: string
  label: string
  completed: boolean
}

interface BookingProgressBarProps {
  steps: BookingStep[]
  currentStep: string
  branding: any
}

export default function BookingProgressBar({ steps, currentStep, branding }: BookingProgressBarProps) {
  return (
    <div className="border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2"
                style={{
                  backgroundColor: step.completed || step.id === currentStep 
                    ? (branding.primary_color || '#21452e') 
                    : 'transparent',
                  borderColor: step.completed || step.id === currentStep 
                    ? (branding.primary_color || '#21452e') 
                    : '#D1D5DB',
                  color: step.completed || step.id === currentStep 
                    ? 'white' 
                    : (branding.textOnBackground || '#6B7280')
                }}
              >
                {step.completed ? '✓' : index + 1}
              </div>
              <span 
                className="ml-2 text-sm font-medium"
                style={{
                  color: step.id === currentStep 
                    ? (branding.primary_color || '#21452e')
                    : step.completed 
                    ? (branding.primary_color || '#21452e')
                    : (branding.textOnBackground || '#6B7280')
                }}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div 
                  className="w-12 h-px mx-4"
                  style={{ backgroundColor: branding.accent_color || '#D1D5DB' }}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
