import { Button } from '@/components/ui/button';
import { ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen  flex items-center">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
          <div className="text-blue-600 text-3xl font-bold">404</div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Page not found</h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go back home
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="gap-2">
            <Link href="/help">
              Get Help
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Think this is a mistake?{' '}
            <a 
              href="mailto:support@simmerce.com" 
              className="text-blue-600 hover:underline font-medium"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
