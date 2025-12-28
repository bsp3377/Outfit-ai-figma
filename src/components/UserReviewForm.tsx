import { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase';

export function UserReviewForm() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [review, setReview] = useState<{
        content: string;
        rating: number;
        id?: string;
        status: 'published' | 'pending';
    } | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        company: '',
        content: '',
        rating: 5
    });

    useEffect(() => {
        fetchReview();
    }, []);

    const fetchReview = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Pre-fill name from auth if not loaded
            setFormData(prev => ({
                ...prev,
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || ''
            }));

            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (data) {
                setReview({
                    content: data.content,
                    rating: data.rating,
                    id: data.id,
                    status: data.is_featured ? 'published' : 'pending'
                });
                setFormData({
                    name: data.author_name || user.user_metadata?.full_name || '',
                    company: data.company_name || '',
                    content: data.content,
                    rating: data.rating
                });
            }
        } catch (error) {
            console.error('Error fetching review:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const payload = {
                user_id: user.id,
                author_name: formData.name || user.user_metadata?.full_name || 'User',
                company_name: formData.company,
                content: formData.content,
                rating: formData.rating,
                is_active: true,
                is_featured: false, // Always requires approval
                is_published: true
            };

            let error;

            if (review?.id) {
                // Update existing
                const { error: updateError } = await supabase
                    .from('testimonials')
                    .update(payload)
                    .eq('id', review.id);
                error = updateError;
            } else {
                // Insert new
                const { error: insertError } = await supabase
                    .from('testimonials')
                    .insert([payload]);
                error = insertError;
            }

            if (error) throw error;

            toast.success(review ? 'Review updated!' : 'Review submitted successfully!');
            fetchReview(); // Refresh state

        } catch (error: any) {
            toast.error('Failed to submit review', { description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-xl">My Review</h2>
            </div>

            {review && (
                <div className={`mb-6 p-4 rounded-lg border ${review.status === 'published'
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30'
                    : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-900/30'
                    }`}>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium ${review.status === 'published' ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'
                            }`}>
                            Status: {review.status === 'published' ? 'Published' : 'Pending Approval'}
                        </span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm mb-2">Name (Optional)</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                            placeholder="Your name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-2">Company (Optional)</label>
                        <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                            placeholder="Your company"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm mb-2">Rating</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setFormData({ ...formData, rating: star })}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`w-8 h-8 ${star <= formData.rating
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300 dark:text-gray-600'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm mb-2">Review</label>
                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent min-h-[120px]"
                        placeholder="Share your experience..."
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Submitting...' : (review ? 'Update Review' : 'Submit Review')}
                </button>
            </form>
        </div>
    );
}
