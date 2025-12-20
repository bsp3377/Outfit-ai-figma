import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

interface SiteContent {
    id: string;
    section: string;
    content_key: string;
    content_value: string | null;
    image_url: string | null;
    display_order: number;
    is_active: boolean;
}

type ContentMap = { [key: string]: SiteContent };

/**
 * Hook to fetch site content from Supabase
 * Returns content organized by section and content_key
 */
export function useSiteContent(section?: string) {
    const [content, setContent] = useState<ContentMap>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchContent() {
            if (!isSupabaseConfigured) {
                setIsLoading(false);
                return;
            }

            try {
                let query = supabase
                    .from('site_content')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true });

                if (section) {
                    query = query.eq('section', section);
                }

                const { data, error: fetchError } = await query;

                if (fetchError) {
                    console.error('Error fetching site content:', fetchError);
                    setError(fetchError.message);
                } else if (data) {
                    const contentMap: ContentMap = {};
                    data.forEach((item: SiteContent) => {
                        const key = section ? item.content_key : `${item.section}.${item.content_key}`;
                        contentMap[key] = item;
                    });
                    setContent(contentMap);
                }
            } catch (err) {
                console.error('Failed to fetch site content:', err);
                setError('Failed to load content');
            } finally {
                setIsLoading(false);
            }
        }

        fetchContent();
    }, [section]);

    // Helper to get text content
    const getText = (key: string, fallback: string = ''): string => {
        return content[key]?.content_value || fallback;
    };

    // Helper to get image URL
    const getImage = (key: string, fallback: string = ''): string => {
        return content[key]?.image_url || fallback;
    };

    return { content, isLoading, error, getText, getImage };
}

/**
 * Hook specifically for before/after gallery images
 */
export function useBeforeAfterImages() {
    const { content, isLoading, getImage } = useSiteContent('before_after');

    // Default fallback images (current hardcoded values)
    const defaults = {
        apparel_before: 'https://images.unsplash.com/photo-1758600587382-2d7da8b9e361?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
        apparel_after: 'https://images.unsplash.com/photo-1704775988759-16fdeb0a2235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
        jewelry_before: 'https://images.unsplash.com/photo-1717282924526-07a7373bb142?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
        jewelry_after: 'https://images.unsplash.com/photo-1708245917025-439f493d6571?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
        shoes_before: 'https://images.unsplash.com/photo-1726133731374-31f3ab7d29d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
        shoes_after: 'https://images.unsplash.com/photo-1684836341651-4b38c1c04d67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
        handbag_before: 'https://images.unsplash.com/photo-1537440437066-c585a62baf1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
        handbag_after: 'https://images.unsplash.com/photo-1630331384146-a8b2a79a9558?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
        watch_before: 'https://images.unsplash.com/photo-1548761013-616652707ab8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
        watch_after: 'https://images.unsplash.com/photo-1687078426457-89ce2b562eaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    };

    return {
        isLoading,
        apparel: {
            before: getImage('apparel_before', defaults.apparel_before),
            after: getImage('apparel_after', defaults.apparel_after),
        },
        jewelry: {
            before: getImage('jewelry_before', defaults.jewelry_before),
            after: getImage('jewelry_after', defaults.jewelry_after),
        },
        shoes: {
            before: getImage('shoes_before', defaults.shoes_before),
            after: getImage('shoes_after', defaults.shoes_after),
        },
        handbag: {
            before: getImage('handbag_before', defaults.handbag_before),
            after: getImage('handbag_after', defaults.handbag_after),
        },
        watch: {
            before: getImage('watch_before', defaults.watch_before),
            after: getImage('watch_after', defaults.watch_after),
        },
        fashion: {
            before: getImage('fashion_before', ''),
            after: getImage('fashion_after', ''),
        },
    };
}

/**
 * Hook specifically for hero section images
 */
export function useHeroImages() {
    const { content, isLoading } = useSiteContent('hero');

    const beforeUrl = content['hero_before']?.image_url || '';
    const afterUrl = content['hero_after']?.image_url || '';

    return {
        isLoading,
        hero: {
            before: beforeUrl,
            after: afterUrl,
        },
    };
}

/**
 * Hook for feature section card images
 */
export function useFeatureImages() {
    const { content, isLoading } = useSiteContent('features');

    // Default fallback images
    const defaults = {
        fashion_model: 'https://images.unsplash.com/photo-1704775988759-16fdeb0a2235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
        jewelry_closeup: 'https://images.unsplash.com/photo-1763120476143-3d8278fb3db3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
        flatlay_pro: 'https://images.unsplash.com/photo-1630331384146-a8b2a79a9558?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    };

    return {
        isLoading,
        fashionModel: content['fashion_model_image']?.image_url || defaults.fashion_model,
        jewelryCloseup: content['jewelry_closeup_image']?.image_url || defaults.jewelry_closeup,
        flatlayPro: content['flatlay_pro_image']?.image_url || defaults.flatlay_pro,
    };
}

/**
 * Hook for logo image
 */
export function useLogoImage() {
    const { content, isLoading } = useSiteContent('branding');

    return {
        isLoading,
        logo: content['logo']?.image_url || '',
    };
}
