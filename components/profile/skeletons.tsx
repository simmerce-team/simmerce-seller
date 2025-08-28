export function CardSkeleton() {
  return (
    <div className="rounded-lg border p-6">
      <div className="space-y-2 mb-4">
        <div className="h-5 w-40 bg-muted rounded" />
        <div className="h-4 w-64 bg-muted/70 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-9 w-full bg-muted/70 rounded" />
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-6">
        <div className="h-9 w-28 bg-muted/70 rounded" />
      </div>
    </div>
  );
}

export function BusinessCardSkeleton() {
  return <CardSkeleton />;
}

export function ContactCardSkeleton() {
  return <CardSkeleton />;
}
