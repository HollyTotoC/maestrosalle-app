export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={`relative w-full h-2 bg-secondary rounded ${className}`}>
      <div
        className="absolute top-0 left-0 h-full bg-primary rounded"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
}