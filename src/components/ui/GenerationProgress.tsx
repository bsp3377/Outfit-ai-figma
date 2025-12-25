import * as React from "react"
import { cn } from "./utils";
import { motion } from "motion/react";

export interface GenerationProgressProps {
    children?: React.ReactNode;
    duration?: number;
}

export const GenerationProgress = (
    ({ children, duration = 15000 }: GenerationProgressProps) => {
        const [progress, setProgress] = React.useState(0);
        const [loadingState, setLoadingState] = React.useState<
            "starting" | "generating" | "completed"
        >("starting");

        React.useEffect(() => {
            const startingTimeout = setTimeout(() => {
                setLoadingState("generating");

                const startTime = Date.now();

                const interval = setInterval(() => {
                    const elapsedTime = Date.now() - startTime;
                    const progressPercentage = Math.min(
                        100,
                        (elapsedTime / duration) * 100
                    );

                    setProgress(progressPercentage);

                    if (progressPercentage >= 100) {
                        clearInterval(interval);
                        setLoadingState("completed");
                    }
                }, 16);

                return () => clearInterval(interval);
            }, 1000); // Reduced start delay slightly for better responsiveness

            return () => clearTimeout(startingTimeout);
        }, [duration]);

        return (
            <div className="flex flex-col gap-4 items-center w-full max-w-md">
                <motion.div
                    className="bg-[linear-gradient(110deg,#9ca3af,45%,#1e293b,55%,#9ca3af)] dark:bg-[linear-gradient(110deg,#6b7280,45%,#f3f4f6,55%,#6b7280)] bg-[length:200%_100%] bg-clip-text text-transparent text-xl font-medium text-center"
                    initial={{ backgroundPosition: "200% 0" }}
                    animate={{
                        backgroundPosition:
                            loadingState === "completed" ? "0% 0" : "-200% 0",
                    }}
                    transition={{
                        repeat: loadingState === "completed" ? 0 : Infinity,
                        duration: 2,
                        ease: "linear",
                    }}
                >
                    {loadingState === "starting" && "Initializing AI..."}
                    {loadingState === "generating" && "Weaving your digital fabric..."}
                    {loadingState === "completed" && "Finishing touches..."}
                </motion.div>

                <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 w-full overflow-hidden shadow-2xl">
                    {/* Content Container */}
                    <div className="p-8 flex items-center justify-center min-h-[200px]">
                        {children}
                    </div>

                    {/* Beam Animation */}
                    <motion.div
                        className="absolute inset-0 w-full h-full pointer-events-none backdrop-blur-[2px] bg-gradient-to-b from-transparent via-purple-500/10 to-transparent"
                        initial={false}
                        animate={{
                            clipPath: `polygon(0 ${progress}%, 100% ${progress}%, 100% 100%, 0 100%)`,
                            opacity: loadingState === "completed" ? 0 : 1,
                        }}
                        style={{
                            clipPath: `polygon(0 ${progress}%, 100% ${progress}%, 100% 100%, 0 100%)`,
                        }}
                    />

                    {/* Progress Line */}
                    <motion.div
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                        style={{
                            top: `${progress}%`,
                            opacity: loadingState === "completed" ? 0 : 1,
                        }}
                    />
                </div>
            </div>
        );
    }
);

GenerationProgress.displayName = "GenerationProgress";
