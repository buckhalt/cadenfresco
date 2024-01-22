import { cn } from '~/utils/shadcn';

export default function Banner({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative isolate z-50 flex w-full items-center justify-center gap-x-6 overflow-hidden bg-gray-50 px-6 py-2 sm:px-3.5',
        className,
      )}
    >
      {children}
    </div>
  );
}
