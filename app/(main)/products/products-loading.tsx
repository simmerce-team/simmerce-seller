import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsLoading() {
  return (
    <div className="space-y-6">
      {/* Add Product Button Skeleton */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Filters Skeleton */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4">
            {/* Search Skeleton */}
            <div className="flex-1">
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Filters Row Skeleton */}
            <div className="flex gap-2 sm:gap-4">
              <Skeleton className="h-10 w-full sm:w-48" />
              <Skeleton className="h-10 w-full sm:w-32" />
              <Skeleton className="h-10 w-full sm:w-40" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products List Skeleton */}
      <div className="space-y-3 sm:space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                <Skeleton className="w-full h-48 sm:w-32 sm:h-32 lg:w-40 lg:h-40" />
                <div className="flex-1 p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <Skeleton className="h-5 sm:h-6 w-3/4" />
                  <Skeleton className="h-3 sm:h-4 w-1/2" />
                  <div className="flex flex-wrap gap-2 sm:gap-4">
                    <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                    <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                    <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                  </div>
                  <div className="flex justify-between items-center pt-1 sm:pt-2">
                    <Skeleton className="h-5 sm:h-6 w-20 sm:w-24" />
                    <Skeleton className="h-6 sm:h-8 w-6 sm:w-8 rounded" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
