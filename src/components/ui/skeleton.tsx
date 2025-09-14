import { cn } from '@/lib/utils'

function Skeleton({
                    className,
                    ...props
                  }: React.HTMLAttributes<HTMLDivElement>) {
  return (
      <div
          className={cn(
              'animate-pulse rounded-base bg-bw',
              className,
          )}
          {...props}
      />
  )
}

export { Skeleton }