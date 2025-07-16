import React from 'react';
import { useTenantBranding } from '@/lib/tenant-context';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'pulse' | 'dots' | 'skeleton';
  className?: string;
  showMessage?: boolean;
}

export function LoadingState({ 
  message = "Loading...", 
  size = 'md',
  variant = 'spinner',
  className = '',
  showMessage = true
}: LoadingStateProps) {
  const branding = useTenantBranding();

  const sizeClasses = {
    sm: 'py-6',
    md: 'py-8 sm:py-12',
    lg: 'py-12 sm:py-16'
  };

  const spinnerSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8 sm:h-10 sm:w-10',
    lg: 'h-12 w-12 sm:h-16 sm:w-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl'
  };

  const renderSpinner = () => (
    <div 
      className={`animate-spin rounded-full border-b-2 border-t-2 mx-auto mb-4 ${spinnerSizes[size]}`}
      style={{ borderColor: branding.primary_color || '#10B981' }}
    />
  );

  const renderPulse = () => (
    <div className="flex justify-center space-x-2 mb-4">
      <div 
        className={`rounded-full animate-pulse ${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'}`}
        style={{ backgroundColor: branding.primary_color || '#10B981' }}
      />
      <div 
        className={`rounded-full animate-pulse ${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'}`}
        style={{ backgroundColor: branding.primary_color || '#10B981', animationDelay: '0.2s' }}
      />
      <div 
        className={`rounded-full animate-pulse ${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'}`}
        style={{ backgroundColor: branding.primary_color || '#10B981', animationDelay: '0.4s' }}
      />
    </div>
  );

  const renderDots = () => (
    <div className="flex justify-center space-x-1 mb-4">
      <div 
        className={`rounded-full animate-bounce ${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'}`}
        style={{ backgroundColor: branding.primary_color || '#10B981' }}
      />
      <div 
        className={`rounded-full animate-bounce ${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'}`}
        style={{ backgroundColor: branding.primary_color || '#10B981', animationDelay: '0.1s' }}
      />
      <div 
        className={`rounded-full animate-bounce ${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'}`}
        style={{ backgroundColor: branding.primary_color || '#10B981', animationDelay: '0.2s' }}
      />
    </div>
  );

  const renderSkeleton = () => (
    <div className="space-y-4 mb-4">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
      </div>
    </div>
  );

  const renderLoadingIndicator = () => {
    switch (variant) {
      case 'pulse':
        return renderPulse();
      case 'dots':
        return renderDots();
      case 'skeleton':
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={`text-center ${sizeClasses[size]} ${className}`}>
      {renderLoadingIndicator()}
      {showMessage && (
        <p className={`text-gray-600 ${textSizes[size]} font-medium`}>
          {message}
        </p>
      )}
    </div>
  );
}

// Mobile-optimized button loading state
interface ButtonLoadingProps {
  loading?: boolean;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function ButtonLoading({ 
  loading = false, 
  children, 
  size = 'md',
  variant = 'primary',
  className = '',
  onClick,
  disabled = false,
  type = 'button'
}: ButtonLoadingProps) {
  const branding = useTenantBranding();

  const sizeClasses = {
    sm: 'min-h-[40px] px-4 py-2 text-sm',
    md: 'min-h-[48px] px-6 py-3 text-base',
    lg: 'min-h-[56px] px-8 py-4 text-lg'
  };

  const baseClasses = 'relative inline-flex items-center justify-center font-semibold rounded-lg border-2 transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'text-white border-transparent hover:shadow-lg',
    secondary: 'text-gray-900 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400',
    outline: 'bg-transparent border-2 hover:bg-opacity-10'
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: loading ? `${branding.primary_color || '#10B981'}CC` : branding.primary_color || '#10B981',
          borderColor: branding.primary_color || '#10B981',
          '--tw-ring-color': branding.primary_color || '#10B981'
        };
      case 'outline':
        return {
          borderColor: branding.primary_color || '#10B981',
          color: branding.primary_color || '#10B981',
          '--tw-ring-color': branding.primary_color || '#10B981'
        };
      default:
        return {};
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      style={getVariantStyles() as React.CSSProperties}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className={`animate-spin rounded-full border-b-2 border-t-2 ${size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6'}`}
            style={{ borderColor: variant === 'primary' ? '#ffffff' : branding.primary_color || '#10B981' }}
          />
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
}

// Mobile-optimized form loading overlay
interface FormLoadingProps {
  loading?: boolean;
  message?: string;
  children: React.ReactNode;
}

export function FormLoading({ loading = false, message = "Processing...", children }: FormLoadingProps) {
  const branding = useTenantBranding();

  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg z-10">
          <div className="text-center">
            <div 
              className="animate-spin rounded-full h-8 w-8 border-b-2 border-t-2 mx-auto mb-3"
              style={{ borderColor: branding.primary_color || '#10B981' }}
            />
            <p className="text-sm font-medium text-gray-700">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Mobile-optimized search loading
interface SearchLoadingProps {
  loading?: boolean;
  message?: string;
}

export function SearchLoading({ loading = false, message = "Searching..." }: SearchLoadingProps) {
  const branding = useTenantBranding();

  if (!loading) return null;

  return (
    <div className="flex items-center justify-center py-4">
      <div className="flex items-center space-x-3">
        <div 
          className="animate-spin rounded-full h-5 w-5 border-b-2 border-t-2"
          style={{ borderColor: branding.primary_color || '#10B981' }}
        />
        <span className="text-sm font-medium text-gray-700">{message}</span>
      </div>
    </div>
  );
}

// Mobile-optimized page loading
interface PageLoadingProps {
  message?: string;
  showLogo?: boolean;
}

export function PageLoading({ message = "Loading...", showLogo = true }: PageLoadingProps) {
  const branding = useTenantBranding();

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: branding.background_color || '#FFFFFF' }}
    >
      <div className="text-center max-w-sm w-full">
        {showLogo && (
          <div className="mb-8">
            <div 
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: branding.primary_color || '#10B981' }}
            >
              Loading...
            </div>
          </div>
        )}
        <div 
          className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-t-4 mx-auto mb-6"
          style={{ borderColor: branding.primary_color || '#10B981' }}
        />
        <p 
          className="text-base sm:text-lg font-medium"
          style={{ color: branding.textOnBackground || '#374151' }}
        >
          {message}
        </p>
      </div>
    </div>
  );
} 