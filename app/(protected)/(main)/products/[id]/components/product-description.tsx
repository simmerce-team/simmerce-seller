type ProductDescriptionProps = {
  description: string | null;
};

export function ProductDescription({ description }: ProductDescriptionProps) {
  if (!description) return null;
  
  return (
    <div className="prose max-w-none text-muted-foreground">
      {description}
    </div>
  );
}
