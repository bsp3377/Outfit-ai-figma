import { useState } from 'react';
import { Layout, X, Check } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'motion/react';
import lifestyleJoggerImg from '../assets/lifestyle-jogger.png';

export interface Template {
    id: string;
    name: string;
    url: string;
    description: string;
    category: 'studio' | 'lifestyle' | 'outdoor' | 'creative';
    tab: 'fashion' | 'jewellery' | 'flatlay';
    prompt?: string;
}

const TEMPLATES: Template[] = [
    // FASHION TEMPLATES
    {
        id: 'lifestyle_jogger_park_waist_to_shoes',
        name: 'Lifestyle Park Jogger',
        url: lifestyleJoggerImg, // Jogger/sneaker lifestyle shot
        description: 'Waist-to-shoes, outdoor park setting, high-top sneakers',
        category: 'lifestyle',
        tab: 'fashion',
        prompt: JSON.stringify({
            "template_id": "lifestyle_jogger_park_waist_to_shoes",
            "template_name": "Lifestyle Park Jogger (Waist-to-Shoes)",
            "version": "1.0",
            "inputs": {
                "garment_image": "{{UPLOAD_GARMENT_IMAGE}}",
                "gender": "male",
                "age": 22,
                "ethnicity": "any",
                "fit_preference": "natural",
                "print_text": {
                    "enabled": false,
                    "text": "WANDERLUST",
                    "placement": "outer_right_leg_vertical",
                    "color_match": "slightly_darker_than_garment",
                    "style": "bold_sans_serif"
                },
                "extra_prompt": "{{OPTIONAL_USER_PROMPT}}"
            },
            "generation": {
                "mode": "garment_to_model",
                "preserve_garment": {
                    "strict": true,
                    "keep_color": true,
                    "keep_fabric_texture": true,
                    "keep_stitching_seams": true,
                    "keep_logos_prints": true,
                    "no_design_change": true
                },
                "model": {
                    "visible_parts": "waist_to_shoes_only",
                    "body_type": "average",
                    "skin_tone": "natural",
                    "face_visibility": "hidden_crop"
                },
                "styling": {
                    "top": "black_hoodie",
                    "inner_layer": "white_tshirt_peek",
                    "shoes": "clean_white_high_top_sneakers",
                    "socks": "minimal_or_hidden"
                },
                "pose": {
                    "description": "casual standing, one hand inside jogger pocket, slight bend in one knee, relaxed streetwear stance",
                    "hand_visibility": "natural",
                    "avoid": ["crossed_legs_extreme", "running_pose", "sitting_pose"]
                },
                "composition": {
                    "framing": "vertical",
                    "crop": "waist_to_shoes",
                    "subject_position": "center",
                    "background_blur": "strong_bokeh",
                    "keep_product_focus": true
                },
                "scene": {
                    "location": "outdoor_park",
                    "background_elements": ["green_grass", "trees", "distant_path"],
                    "background_style": "clean_minimal_no_clutter",
                    "time_of_day": "late_afternoon"
                },
                "lighting": {
                    "type": "natural_daylight",
                    "quality": "soft",
                    "direction": "side_front",
                    "shadow": "realistic_soft_shadows",
                    "avoid": ["harsh_flash", "overexposed_highlights", "flat_light"]
                },
                "camera": {
                    "look": "professional_ecommerce_lifestyle",
                    "lens_mm": 85,
                    "aperture": "f1.8",
                    "angle": "eye_level",
                    "depth_of_field": "shallow",
                    "sharpness": "high_on_garment"
                },
                "quality": {
                    "resolution": "high",
                    "detail": "high_fabric_texture",
                    "noise": "low",
                    "color_grading": "natural"
                }
            },
            "prompt_text": {
                "system": "You are a world-class e-commerce photographer and stylist. Use the uploaded garment image as the exact product reference. Do not change the garment design, seams, fabric, fit, color, or prints. Generate a photorealistic lifestyle product photo that looks like a premium brand shoot.",
                "user": "Create a photorealistic outdoor park lifestyle image. Show a male model cropped from waist to shoes wearing the uploaded garment exactly. Style with a black hoodie, a white t-shirt slightly visible at the hem, and clean white high-top sneakers. Pose: casual standing, one hand in pocket, slight knee bend. Background: sunny park with green grass and trees, strong bokeh blur. Lighting: soft natural daylight with realistic shadows. Camera look: 85mm, shallow depth of field, ultra sharp garment texture and stitching. {{OPTIONAL_USER_PROMPT}}"
            },
            "negative_prompt": "cartoon, CGI, illustration, low-res, blurry, extra limbs, distorted hands, deformed legs, wrong garment shape, changed design, changed color, incorrect logos, incorrect text, misspelled text, watermark, heavy noise, messy background, harsh flash, studio backdrop"
        })
    },
    // JEWELLERY TEMPLATES
    {
        id: 'jewellery_minimal_marble',
        name: 'Minimal Marble',
        url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80',
        description: 'Clean marble background for elegance',
        category: 'studio',
        tab: 'jewellery'
    },
    {
        id: 'jewellery_dark_luxury',
        name: 'Dark Luxury',
        url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500&q=80',
        description: 'Moody dark setting for gold/diamonds',
        category: 'studio',
        tab: 'jewellery'
    },
    // FLATLAY/CREATIVE TEMPLATES
    {
        id: 'flatlay_grid',
        name: 'Organized Grid',
        url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&q=80',
        description: 'Neatly arranged grid layout',
        category: 'creative',
        tab: 'flatlay'
    },
    {
        id: 'flatlay_botanical',
        name: 'Botanical Accent',
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=80',
        description: 'Natural light with plant shadows',
        category: 'outdoor',
        tab: 'flatlay'
    }
];

interface TemplateSelectorProps {
    onSelect: (template: Template, base64: string) => void;
    selectedTemplateId?: string | null;
    activeTab: 'fashion' | 'jewellery' | 'flatlay';
}

export function TemplateSelector({ onSelect, selectedTemplateId, activeTab }: TemplateSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const filteredTemplates = TEMPLATES.filter(t => t.tab === activeTab);

    const handleSelect = async (template: Template) => {
        setLoadingId(template.id);
        try {
            // Fetch image and convert to base64
            const response = await fetch(template.url);
            const blob = await response.blob();

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                onSelect(template, base64);
                setLoadingId(null);
                setIsOpen(false);
            };
            reader.readAsDataURL(blob);
        } catch (error) {
            console.error('Error fetching template:', error);
            setLoadingId(null);
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
            <Dialog.Trigger asChild>
                <button
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all"
                >
                    <Layout className="w-4 h-4" />
                    <span>Browse Templates</span>
                </button>
            </Dialog.Trigger>

            <AnimatePresence>
                {isOpen && (
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild>
                            <motion.div
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />
                        </Dialog.Overlay>
                        <Dialog.Content asChild>
                            <motion.div
                                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[85vh] overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 flex flex-col"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                                    <div>
                                        <Dialog.Title className="text-xl font-semibold">Choose a Style Template</Dialog.Title>
                                        <Dialog.Description className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Select a reference style for your generation. The AI will mimic the lighting, composition, and mood.
                                        </Dialog.Description>
                                    </div>
                                    <Dialog.Close className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                        <X className="w-5 h-5" />
                                    </Dialog.Close>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6">
                                    {filteredTemplates.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <p className="text-gray-500 dark:text-gray-400">No templates available for this category yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {filteredTemplates.map((template) => {
                                                const isSelected = selectedTemplateId === template.id;
                                                const isLoading = loadingId === template.id;

                                                return (
                                                    <div
                                                        key={template.id}
                                                        onClick={() => !isLoading && handleSelect(template)}
                                                        className={`group relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${isSelected
                                                            ? 'border-purple-600 ring-2 ring-purple-600/20'
                                                            : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                                                            }`}
                                                    >
                                                        <div className="aspect-[3/4] relative">
                                                            <img
                                                                src={template.url}
                                                                alt={template.name}
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                                                <p className="text-white font-medium text-sm">{template.name}</p>
                                                                <p className="text-white/80 text-xs">{template.description}</p>
                                                            </div>

                                                            {/* Selected Indicator */}
                                                            {isSelected && (
                                                                <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                                                    <Check className="w-3.5 h-3.5 text-white" />
                                                                </div>
                                                            )}

                                                            {/* Loading Indicator */}
                                                            {isLoading && (
                                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
}
