import { cn } from "@/lib/utils";

interface AnimatedShinyTextProps {
    children: React.ReactNode;
    className?: string;
}

export function AnimatedShinyText({
    children,
    className,
}: AnimatedShinyTextProps) {
    return (
        <span
            style={{
                background: "linear-gradient(110deg, #9333ea, 45%, #ec4899, 55%, #9333ea)",
                backgroundSize: "250% 100%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
            }}
            className={cn(
                "inline-block animate-shimmer",
                className
            )}
        >
            {children}
        </span>
    );
}
