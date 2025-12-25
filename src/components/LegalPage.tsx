import { ArrowLeft } from "lucide-react";
import { useTermsAndConditions } from "../utils/useSiteContent";

interface LegalPageProps {
    type: 'terms' | 'privacy' | 'support' | 'refund';
    onBack: () => void;
}

export function LegalPage({ type, onBack }: LegalPageProps) {
    const { terms, privacy, support, refund, isLoading } = useTermsAndConditions();

    const getContent = () => {
        switch (type) {
            case 'terms': return terms;
            case 'privacy': return privacy;
            case 'support': return support;
            case 'refund': return refund;
            default: return null;
        }
    };

    const doc = getContent();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </button>

                {isLoading ? (
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
                    </div>
                ) : doc ? (
                    <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 sm:p-12">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-900 dark:text-white">
                            {doc.title}
                        </h1>
                        <div
                            className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: doc.content }}
                        />
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Document not found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
