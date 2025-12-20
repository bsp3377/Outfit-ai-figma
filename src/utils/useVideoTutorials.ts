import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

interface VideoTutorial {
    id: string;
    title: string;
    description: string;
    youtube_url: string;
    duration: string;
    views: string;
    display_order: number;
    is_featured: boolean;
    is_active: boolean;
}

interface ParsedVideoTutorial {
    id: string;
    title: string;
    description: string;
    videoId: string;
    duration: string;
    views: string;
}

// Helper function to extract YouTube video ID from URL
function extractYouTubeId(url: string): string {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return 'dQw4w9WgXcQ'; // Fallback placeholder
}

// Default tutorials (used as fallback)
const defaultTutorials: ParsedVideoTutorial[] = [
    {
        id: '1',
        title: 'Getting Started with Outfit AI',
        description: 'Learn the basics of uploading your products and generating your first AI model photo in under 5 minutes.',
        videoId: 'dQw4w9WgXcQ',
        duration: '4:32',
        views: '12K',
    },
    {
        id: '2',
        title: 'Advanced Model Selection',
        description: 'Discover how to choose the perfect model type, pose, and styling for your product category.',
        videoId: 'dQw4w9WgXcQ',
        duration: '6:15',
        views: '8.5K',
    },
    {
        id: '3',
        title: 'Creating Perfect Flatlay Compositions',
        description: 'Master the art of flatlay photography with AI. Learn composition tips and background selection.',
        videoId: 'dQw4w9WgXcQ',
        duration: '5:48',
        views: '10K',
    },
    {
        id: '4',
        title: 'Batch Processing & Workflow Optimization',
        description: 'Process multiple products efficiently and integrate Outfit AI into your existing e-commerce workflow.',
        videoId: 'dQw4w9WgXcQ',
        duration: '7:20',
        views: '6.2K',
    },
    {
        id: '5',
        title: 'Export & Integration Best Practices',
        description: 'Learn how to export your images in the right format and integrate them with Shopify, WooCommerce, and more.',
        videoId: 'dQw4w9WgXcQ',
        duration: '5:10',
        views: '9.1K',
    },
    {
        id: '6',
        title: 'Tips from Professional Users',
        description: 'Real success stories and tips from brands using Outfit AI to scale their product photography.',
        videoId: 'dQw4w9WgXcQ',
        duration: '8:45',
        views: '15K',
    },
];

const defaultFeaturedVideo: ParsedVideoTutorial = {
    id: 'featured',
    title: 'Complete Outfit AI Walkthrough',
    description: 'Watch our comprehensive guide to Outfit AI (15 minutes)',
    videoId: 'dQw4w9WgXcQ',
    duration: '15:00',
    views: '25K',
};

/**
 * Hook to fetch video tutorials from Supabase
 */
export function useVideoTutorials() {
    const [tutorials, setTutorials] = useState<ParsedVideoTutorial[]>(defaultTutorials);
    const [featuredVideo, setFeaturedVideo] = useState<ParsedVideoTutorial>(defaultFeaturedVideo);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchVideos() {
            if (!isSupabaseConfigured) {
                setIsLoading(false);
                return;
            }

            try {
                const { data, error: fetchError } = await supabase
                    .from('video_tutorials')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true });

                if (fetchError) {
                    console.error('Error fetching video tutorials:', fetchError);
                    setError(fetchError.message);
                    setIsLoading(false);
                    return;
                }

                if (data && data.length > 0) {
                    const parsedVideos: ParsedVideoTutorial[] = [];
                    let featured: ParsedVideoTutorial | null = null;

                    data.forEach((video: VideoTutorial) => {
                        const parsed: ParsedVideoTutorial = {
                            id: video.id,
                            title: video.title,
                            description: video.description || '',
                            videoId: extractYouTubeId(video.youtube_url),
                            duration: video.duration || '',
                            views: video.views || '',
                        };

                        if (video.is_featured) {
                            featured = parsed;
                        } else {
                            parsedVideos.push(parsed);
                        }
                    });

                    if (parsedVideos.length > 0) {
                        setTutorials(parsedVideos);
                    }

                    if (featured) {
                        setFeaturedVideo(featured);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch video tutorials:', err);
                setError('Failed to load videos');
            } finally {
                setIsLoading(false);
            }
        }

        fetchVideos();
    }, []);

    return {
        tutorials,
        featuredVideo,
        isLoading,
        error,
    };
}
