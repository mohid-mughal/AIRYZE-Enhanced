export default function SkeletonLoader({ type = 'text', className = '' }) {
  const baseClasses = 'animate-pulse bg-gray-300 rounded';

  const variants = {
    text: 'h-4 w-full',
    'text-short': 'h-4 w-3/4',
    'text-medium': 'h-4 w-2/3',
    title: 'h-6 w-1/2',
    badge: 'h-32 w-full rounded-xl',
    quiz: 'h-48 w-full rounded-xl',
    button: 'h-12 w-full rounded-lg',
    avatar: 'h-16 w-16 rounded-full',
    card: 'h-64 w-full rounded-xl'
  };

  return (
    <div className={`${baseClasses} ${variants[type] || variants.text} ${className}`} aria-hidden="true" />
  );
}

export function BadgeGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="text-center mb-4">
            <SkeletonLoader type="avatar" className="mx-auto mb-4" />
            <SkeletonLoader type="title" className="mx-auto mb-2" />
            <SkeletonLoader type="text-short" className="mx-auto" />
          </div>
          <div className="space-y-2">
            <SkeletonLoader type="text" />
            <SkeletonLoader type="text-medium" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function QuizSelectorSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <SkeletonLoader type="avatar" className="mx-auto mb-4" />
          <SkeletonLoader type="title" className="mx-auto mb-3" />
          <SkeletonLoader type="text" className="mb-2" />
          <SkeletonLoader type="text-short" className="mb-4" />
          <SkeletonLoader type="button" />
        </div>
      ))}
    </div>
  );
}

export function GeminiMessageSkeleton() {
  return (
    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500 animate-pulse">
      <SkeletonLoader type="text" className="mb-2" />
      <SkeletonLoader type="text" className="mb-2" />
      <SkeletonLoader type="text-medium" />
    </div>
  );
}

export function BadgeSyncSpinner() {
  return (
    <div className="flex items-center justify-center gap-2 text-blue-600">
      <svg 
        className="animate-spin h-5 w-5" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="text-sm font-medium">Syncing badges...</span>
    </div>
  );
}

export function QuizLoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <svg 
        className="animate-spin h-12 w-12 text-blue-600 mb-4" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <p className="text-lg font-semibold text-gray-700">Loading quiz...</p>
      <p className="text-sm text-gray-500 mt-2">Preparing your questions</p>
    </div>
  );
}
