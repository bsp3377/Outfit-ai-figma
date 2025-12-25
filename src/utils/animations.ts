import { Variants } from 'framer-motion';

// Optimized animation variants that respect reduced motion preferences
// and simplify animations on mobile devices

export const optimizeAnimation = (variants: Variants, isMobile: boolean) => {
    if (isMobile) {
        // Return simplified versions or reduced motion versions
        const optimized: Variants = {};
        Object.keys(variants).forEach(key => {
            const variant = variants[key];
            // Strip complex transitions, keep basic opacity/transform
            if (typeof variant === 'object') {
                optimized[key] = {
                    opacity: variant.opacity ?? 1,
                    // Simplify transforms to prevent layout thrashing
                    x: 0,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.3 }
                };
            }
        });
        return optimized;
    }
    return variants;
};

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.4 }
    }
};

export const staggerContainer: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1
        }
    }
};
