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

    // Return empty strings as fallbacks - UI should show loading skeleton until images load
    return {
        isLoading,
        apparel: {
            before: getImage('apparel_before', ''),
            after: getImage('apparel_after', ''),
        },
        jewelry: {
            before: getImage('jewelry_before', ''),
            after: getImage('jewelry_after', ''),
        },
        shoes: {
            before: getImage('shoes_before', ''),
            after: getImage('shoes_after', ''),
        },
        handbag: {
            before: getImage('handbag_before', ''),
            after: getImage('handbag_after', ''),
        },
        watch: {
            before: getImage('watch_before', ''),
            after: getImage('watch_after', ''),
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

    // Return empty strings as fallbacks - UI should show loading skeleton until images load
    return {
        isLoading,
        fashionModel: content['fashion_model_image']?.image_url || '',
        jewelryCloseup: content['jewelry_closeup_image']?.image_url || '',
        flatlayPro: content['flatlay_pro_image']?.image_url || '',
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

/**
 * Interface for terms and conditions document
 */
interface TermsDocument {
    id: string;
    title: string;
    slug: string;
    content: string;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

/**
 * Hook for fetching terms and conditions, privacy policy, and other legal documents
 */
export function useTermsAndConditions() {
    const [documents, setDocuments] = useState<TermsDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTerms() {
            if (!isSupabaseConfigured) {
                setIsLoading(false);
                return;
            }

            try {
                const { data, error: fetchError } = await supabase
                    .from('terms_and_conditions')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true });

                if (fetchError) {
                    console.error('Error fetching terms and conditions:', fetchError);
                    setError(fetchError.message);
                } else if (data) {
                    console.log('Fetched documents from Supabase:', data);
                    console.log('Document slugs:', data.map((d: any) => d.slug));
                    setDocuments(data as TermsDocument[]);
                }
            } catch (err) {
                console.error('Failed to fetch terms and conditions:', err);
                setError('Failed to load legal documents');
            } finally {
                setIsLoading(false);
            }
        }

        fetchTerms();
    }, []);

    // Helper to get a document by slug
    const getDocument = (slug: string): TermsDocument | undefined => {
        return documents.find(doc => doc.slug === slug);
    };

    // Get specific documents
    const terms = getDocument('terms') || getDocument('terms-of-service');
    const privacy = getDocument('privacy') || getDocument('privacy-policy') || getDocument('Privacy Policy');
    const support = getDocument('support') || getDocument('contact');
    const refund = getDocument('refund') || getDocument('refund-policy') || getDocument('Refund Policy');

    return {
        documents,
        isLoading,
        error,
        getDocument,
        terms,
        privacy,
        support,
        refund,
    };
}

/**
 * Interface for testimonial
 */
interface Testimonial {
    id: string;
    author_name: string;
    author_title: string | null;
    author_company: string | null;
    content: string;
    rating: number;
    avatar_url: string | null;
    display_order: number;
}

/**
 * Hook for fetching testimonials
 */
export function useTestimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTestimonials() {
            if (!isSupabaseConfigured) {
                setIsLoading(false);
                return;
            }

            try {
                const { data, error: fetchError } = await supabase
                    .from('testimonials')
                    .select('*')
                    .eq('is_active', true)
                    .eq('is_featured', true)
                    .order('display_order', { ascending: true });

                if (fetchError) {
                    console.error('Error fetching testimonials:', fetchError);
                    setError(fetchError.message);
                } else if (data) {
                    setTestimonials(data as Testimonial[]);
                }
            } catch (err) {
                console.error('Failed to fetch testimonials:', err);
                setError('Failed to load testimonials');
            } finally {
                setIsLoading(false);
            }
        }

        fetchTestimonials();
    }, []);

    // Default testimonials as fallback
    const defaultTestimonials: Testimonial[] = [
        {
            id: '1',
            author_name: 'Sarah Chen',
            author_title: 'Head of E-commerce',
            author_company: 'StyleCo',
            content: 'Cut our product photography costs by 80%. The AI models look incredibly realistic and our conversion rate actually improved.',
            rating: 5,
            avatar_url: null,
            display_order: 1,
        },
        {
            id: '2',
            author_name: 'Marcus Rodriguez',
            author_title: 'Founder',
            author_company: 'LuxeGems',
            content: 'Game changer for our jewelry line. The close-ups capture details our photographer struggled with. Export quality is print-ready.',
            rating: 5,
            avatar_url: null,
            display_order: 2,
        },
    ];

    return {
        testimonials: testimonials.length > 0 ? testimonials : defaultTestimonials,
        isLoading,
        error,
    };
}

/**
 * Interface for partner logo
 */
interface PartnerLogo {
    id: string;
    name: string;
    logo_url: string | null;
    website_url: string | null;
    display_order: number;
}

/**
 * Hook for fetching partner logos
 */
export function usePartnerLogos() {
    const [logos, setLogos] = useState<PartnerLogo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchLogos() {
            if (!isSupabaseConfigured) {
                setIsLoading(false);
                return;
            }

            try {
                const { data, error: fetchError } = await supabase
                    .from('partner_logos')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true });

                if (fetchError) {
                    console.error('Error fetching partner logos:', fetchError);
                    setError(fetchError.message);
                } else if (data) {
                    setLogos(data as PartnerLogo[]);
                }
            } catch (err) {
                console.error('Failed to fetch partner logos:', err);
                setError('Failed to load partner logos');
            } finally {
                setIsLoading(false);
            }
        }

        fetchLogos();
    }, []);

    return {
        logos,
        isLoading,
        error,
    };
}

/**
 * Hook for steps section content
 */
export function useStepsContent() {
    const { content, isLoading, getText } = useSiteContent('steps');

    const defaults = {
        step1_title: 'Upload your product',
        step1_desc: 'Drop your product image or paste a URL',
        step2_title: 'Choose your style',
        step2_desc: 'Select model, flatlay, or close-up preset',
        step3_title: 'Generate & download',
        step3_desc: 'Get your high-res PNG in seconds',
    };

    return {
        isLoading,
        step1Title: getText('step1_title', defaults.step1_title),
        step1Desc: getText('step1_desc', defaults.step1_desc),
        step2Title: getText('step2_title', defaults.step2_title),
        step2Desc: getText('step2_desc', defaults.step2_desc),
        step3Title: getText('step3_title', defaults.step3_title),
        step3Desc: getText('step3_desc', defaults.step3_desc),
    };
}

/**
 * Hook for footer content
 */
export function useFooterContent() {
    const { content, isLoading, getText } = useSiteContent('footer');

    return {
        isLoading,
        copyright: getText('copyright', '© 2024 Outfit AI. All rights reserved.'),
    };
}

/**
 * Hook for social proof section
 */
export function useSocialProofContent() {
    const { content, isLoading, getText } = useSiteContent('social_proof');

    return {
        isLoading,
        brandsTagline: getText('brands_tagline', 'Trusted by leading e-commerce brands'),
    };
}

