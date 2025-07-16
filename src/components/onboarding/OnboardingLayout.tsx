import { AlertCircle, ArrowLeft, ArrowRight, Rocket } from 'lucide-react';
import Link from 'next/link';
import { GeistSans } from 'geist/font/sans';
import { Card } from '@/components/ui/card';
import { ProgressStepper } from './ProgressStepper';
import { steps } from '@/lib/onboarding-constants';

interface OnboardingLayoutProps {
  currentStep: number;
  error?: string | null;
  isLoading?: boolean;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
}

export function OnboardingLayout({
  currentStep,
  error,
  isLoading,
  onPrevStep,
  onNextStep,
  onSubmit,
  children
}: OnboardingLayoutProps) {
  return (
          <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 geist-admin ${GeistSans.className}`}>
        <div className={`max-w-4xl mx-auto px-4 py-12 geist-admin ${GeistSans.className}`}>
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/onboard" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            ← Back to overview
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-2">
            Create Your Booking Platform
          </h1>
          <p className="text-lg text-gray-600">
            Let's get you set up with your own booking website in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <ProgressStepper steps={steps} currentStep={currentStep} />

        {/* Form */}
        <Card className={`p-8 shadow-xl geist-admin ${GeistSans.className}`}>
          {error && (
            <div className="rounded-xl bg-red-50 p-4 border border-red-200 mb-6">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep - 1].title}
            </h2>
          </div>

          {children}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-200">
            <button
              onClick={onPrevStep}
              disabled={currentStep === 1}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Previous
            </button>

            {currentStep < 5 ? (
              <button
                onClick={onNextStep}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Next
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            ) : currentStep === 5 ? (
              <button
                onClick={onSubmit}
                disabled={isLoading}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    Create My Platform
                    <Rocket className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
} 