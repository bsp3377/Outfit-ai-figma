import { cn } from "@/lib/utils";

interface AnimatedShinyTextProps {
    children: React.ReactNode;
    className?: string;
    shimmerWidth?: number;
}

export function AnimatedShinyText({
    children,
    className,
    shimmerWidth = 100,
}: AnimatedShinyTextProps) {
    return (
        <span
            style={
                {
                    "--shimmer-width": `${shimmerWidth}px`,
                } as React.CSSProperties
            }
            className={cn(
                "inline-block",
                // Shimmer effect
                "animate-shimmer bg-clip-text bg-no-repeat",
                // Gradient colors (purple → pink → purple)
                "bg-[linear-gradient(110deg,#9333ea,45%,#ec4899,55%,#9333ea)]",
                "bg-[length:250%_100%]",
                // Text color
                "text-transparent",
                className
            )}
        >
            {children}
        </span>
    );
}
