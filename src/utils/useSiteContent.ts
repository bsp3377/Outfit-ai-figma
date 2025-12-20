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

/**
 * Hook for all landing page text content
 */
export function useLandingContent() {
    const { content, isLoading, getText } = useSiteContent('landing');

    // Default text content (current hardcoded values)
    const defaults = {
        // Hero section
        hero_title: 'Generate studio-quality product photos',
        hero_title_highlight: 'instantly',
        hero_subtitle: 'Transform your product images into professional model shots, jewelry close-ups, and stylish flatlays with AI. No photoshoot required.',
        hero_cta_primary: 'Start Free',
        hero_cta_secondary: 'View Demo',

        // 3 Steps section
        step1_title: 'Upload',
        step1_desc: 'Drop your product image',
        step2_title: 'Choose Style',
        step2_desc: 'Select model & background',
        step3_title: 'Generate',
        step3_desc: 'AI creates your photo',

        // See the transformation section
        gallery_title: 'See the transformation',
        gallery_subtitle: 'Drag the slider to compare before and after results across different product categories',

        // Category labels
        apparel_title: 'Apparel',
        apparel_desc: 'From flat product to runway ready',
        jewelry_title: 'Jewelry',
        jewelry_desc: 'Showcase elegance on real models',
        shoes_title: 'Footwear',
        shoes_desc: 'Step into professional styling',
        handbag_title: 'Accessories',
        handbag_desc: 'Elevate your accessories line',
        watch_title: 'Watches',
        watch_desc: 'Timeless pieces, perfect shots',
        fashion_title: 'Fashion',
        fashion_desc: 'Professional studio quality instantly',

        // Transform section
        transform_title: 'Transform any product, any style',
        transform_subtitle: 'Professional photography made accessible with AI-powered generation',

        // Feature cards
        feature_model_title: 'Fashion Model',
        feature_model_desc: 'Place your apparel on diverse AI models with studio lighting',
        feature_jewelry_title: 'Jewelry Close-up',
        feature_jewelry_desc: 'Macro shots with perfect reflections and premium aesthetics',
        feature_flatlay_title: 'Flatlay Pro',
        feature_flatlay_desc: 'Styled overhead compositions for social media impact',

        // CTA section
        cta_title: 'Ready to transform your product photos?',
        cta_subtitle: 'Join thousands of brands using AI to create stunning visuals',
        cta_button: 'Start Creating for Free',
        cta_note: 'No credit card required • 10 free generations',
    };

    return {
        isLoading,
        // Hero
        heroTitle: getText('hero_title', defaults.hero_title),
        heroTitleHighlight: getText('hero_title_highlight', defaults.hero_title_highlight),
        heroSubtitle: getText('hero_subtitle', defaults.hero_subtitle),
        heroCtaPrimary: getText('hero_cta_primary', defaults.hero_cta_primary),
        heroCtaSecondary: getText('hero_cta_secondary', defaults.hero_cta_secondary),

        // Steps
        step1Title: getText('step1_title', defaults.step1_title),
        step1Desc: getText('step1_desc', defaults.step1_desc),
        step2Title: getText('step2_title', defaults.step2_title),
        step2Desc: getText('step2_desc', defaults.step2_desc),
        step3Title: getText('step3_title', defaults.step3_title),
        step3Desc: getText('step3_desc', defaults.step3_desc),

        // Gallery
        galleryTitle: getText('gallery_title', defaults.gallery_title),
        gallerySubtitle: getText('gallery_subtitle', defaults.gallery_subtitle),

        // Categories
        apparelTitle: getText('apparel_title', defaults.apparel_title),
        apparelDesc: getText('apparel_desc', defaults.apparel_desc),
        jewelryTitle: getText('jewelry_title', defaults.jewelry_title),
        jewelryDesc: getText('jewelry_desc', defaults.jewelry_desc),
        shoesTitle: getText('shoes_title', defaults.shoes_title),
        shoesDesc: getText('shoes_desc', defaults.shoes_desc),
        handbagTitle: getText('handbag_title', defaults.handbag_title),
        handbagDesc: getText('handbag_desc', defaults.handbag_desc),
        watchTitle: getText('watch_title', defaults.watch_title),
        watchDesc: getText('watch_desc', defaults.watch_desc),
        fashionTitle: getText('fashion_title', defaults.fashion_title),
        fashionDesc: getText('fashion_desc', defaults.fashion_desc),

        // Transform section
        transformTitle: getText('transform_title', defaults.transform_title),
        transformSubtitle: getText('transform_subtitle', defaults.transform_subtitle),

        // Feature cards
        featureModelTitle: getText('feature_model_title', defaults.feature_model_title),
        featureModelDesc: getText('feature_model_desc', defaults.feature_model_desc),
        featureJewelryTitle: getText('feature_jewelry_title', defaults.feature_jewelry_title),
        featureJewelryDesc: getText('feature_jewelry_desc', defaults.feature_jewelry_desc),
        featureFlatlayTitle: getText('feature_flatlay_title', defaults.feature_flatlay_title),
        featureFlatlayDesc: getText('feature_flatlay_desc', defaults.feature_flatlay_desc),

        // CTA
        ctaTitle: getText('cta_title', defaults.cta_title),
        ctaSubtitle: getText('cta_subtitle', defaults.cta_subtitle),
        ctaButton: getText('cta_button', defaults.cta_button),
        ctaNote: getText('cta_note', defaults.cta_note),
    };
}
