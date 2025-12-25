import { Loader2 } from "lucide-react";

export function PageLoader() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full p-8">
            <Loader2 className="w-8 h-8 md:w-12 md:h-12 text-blue-600 animate-spin mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse"></div>
        </div>
    );
}
