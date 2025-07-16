import { CheckCircle, Check } from 'lucide-react';

export function CompletionStep() {
  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      
      <div>
        <h3 
          className="text-2xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 600, letterSpacing: '-0.03em' }}
        >
          Welcome to Your Booking Platform!
        </h3>
        <p className="text-gray-600 text-lg">
          Your account has been created successfully. You'll be redirected to the success page in a moment.
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl">
        <h4 
          className="font-semibold text-gray-800 mb-3"
          style={{ fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 600, letterSpacing: '-0.03em' }}
        >
          What's Next?
        </h4>
        <ul className="text-left text-gray-600 space-y-2">
          <li className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3" />
            Check your email for verification link
          </li>
          <li className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3" />
            Set up your first trips and services
          </li>
          <li className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3" />
            Customize your booking platform
          </li>
          <li className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3" />
            Start accepting bookings!
          </li>
        </ul>
      </div>
    </div>
  );
} 