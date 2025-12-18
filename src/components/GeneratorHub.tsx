import { useState } from 'react';
import { Upload, Wand2, Sparkles, Image as ImageIcon, Download, Heart, Trash2, X, Loader2, Check, RotateCcw, ChevronDown, ChevronUp, GripVertical, RefreshCw, User } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';
import { generateImageWithGemini, getGeminiApiKey } from '../utils/gemini-api';

type TabType = 'fashion' | 'jewellery' | 'flatlay';
type GenerationStep = 'uploading' | 'prompt' | 'generating' | 'saving' | null;

interface UploadedFile {
  id: string;
  url: string;
  name: string;
  size: number;
}

interface GeneratedImage {
  id: string;
  url: string;
  type: TabType;
  timestamp: Date;
  liked: boolean;
  autoSaved: boolean;
}

export function GeneratorHub() {
  const [activeTab, setActiveTab] = useState<TabType>('fashion');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<GenerationStep>(null);
  const [selectedResult, setSelectedResult] = useState<GeneratedImage | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<GeneratedImage | null>(null);
  const [logoFile, setLogoFile] = useState<UploadedFile | null>(null);
  const [inspiredTemplateFile, setInspiredTemplateFile] = useState<UploadedFile | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');

  const [formData, setFormData] = useState({
    // Shared field
    productDescription: '',
    // Fashion fields
    gender: 'Female',
    age: '',
    ethnicity: 'American',
    ethnicityDescription: '',
    hairstyle: 'sleek-straight-center',
    hairstyleDescription: '',
    pose: 'standing',
    poseDescription: '',
    background: 'studio',
    backgroundDescription: '',
    logoEnabled: false,
    logoPlacement: 'background',
    logoFocus: 'focused',
    logoLocation: '',
    camera: '50mm f/1.8 ISO 100',
    cameraDescription: '',
    lighting: 'softbox',
    lightingDescription: '',
    keyLight: '',
    advancedPrompt: '',
    // Jewellery/Accessories fields
    jewelryStyle: 'elegant',
    jewelryAngle: 'front',
    accessoriesShotStyle: 'clean-studio',
    accessoriesFraming: 'head-shoulders',
    accessoriesProductEmphasis: 'product-hero',
    accessoriesBackground: 'solid-light',
    accessoriesLighting: 'softbox-45',
    accessoriesCameraLook: 'macro-portrait-105mm',
    accessoriesDepth: 'shallow',
    accessoriesRetouch: 'clean-editorial',
    accessoriesPose: 'product-near-face',
    // Creative/Flatlay fields
    creativeProductCategory: 'apparel',
    creativeShotType: 'packshot',
    creativeAngle: '45-degree',
    creativeFraming: 'medium',
    creativeBackground: 'pure-white',
    creativeLighting: 'softbox-45',
    creativeShadow: 'soft-shadow',
    creativeReflection: 'matte-surface',
    creativeDepth: 'sharp-all',
    creativeColorMood: 'neutral-true',
    creativeProps: 'none',
    creativeComposition: 'centered-hero',
    creativeSceneTheme: 'luxury-studio',
    creativeEnvironment: 'kitchen',
    creativeMotion: 'none',
    flatlayTheme: 'minimal',
    flatlayLayout: 'centered',
  });

  // Mock generated images
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1684836341651-4b38c1c04d67?w=800',
      type: 'fashion',
      timestamp: new Date(Date.now() - 3600000),
      liked: false,
      autoSaved: true,
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1708245917025-439f493d6571?w=800',
      type: 'jewellery',
      timestamp: new Date(Date.now() - 7200000),
      liked: true,
      autoSaved: true,
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1630331384146-a8b2a79a9558?w=800',
      type: 'flatlay',
      timestamp: new Date(Date.now() - 10800000),
      liked: false,
      autoSaved: true,
    },
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (uploadedFiles.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newFile: UploadedFile = {
          id: Date.now().toString() + Math.random(),
          url: reader.result as string,
          name: file.name,
          size: file.size,
        };
        setUploadedFiles(prev => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });
    toast.success('Image(s) uploaded successfully!');
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    toast.success('Image removed');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Logo file is too large. Maximum size is 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newFile: UploadedFile = {
        id: Date.now().toString(),
        url: reader.result as string,
        name: file.name,
        size: file.size,
      };
      setLogoFile(newFile);
      toast.success('Logo uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    toast.success('Logo removed');
  };

  const handleInspiredTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Template file is too large. Maximum size is 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newFile: UploadedFile = {
        id: Date.now().toString(),
        url: reader.result as string,
        name: file.name,
        size: file.size,
      };
      setInspiredTemplateFile(newFile);
      toast.success('Inspired template uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const removeInspiredTemplate = () => {
    setInspiredTemplateFile(null);
    toast.success('Inspired template removed');
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFiles = [...uploadedFiles];
    const draggedFile = newFiles[draggedIndex];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedFile);

    setUploadedFiles(newFiles);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleGenerate = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    const hasApiKey = !!getGeminiApiKey();
    if (!hasApiKey) {
      toast.error('Gemini API Key missing', {
        description: 'Please go to Account Settings to configure your AI key.',
        action: {
          label: 'Settings',
          onClick: () => document.getElementById('account-tab-trigger')?.click()
        }
      });
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedPrompt('');

    try {
      // Step 1: Uploading/Processing
      setGenerationStep('uploading');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 2: Creating prompt
      setGenerationStep('prompt');

      // Use manual product description if provided, otherwise fall back to uploaded file names
      const productDescription = formData.productDescription.trim()
        ? formData.productDescription
        : uploadedFiles.map(f => f.name).join(', ');

      // Extract base64 data from the first uploaded image
      const firstImage = uploadedFiles[0];
      let productImageBase64 = '';
      let productImageMimeType = 'image/png';

      if (firstImage.url.startsWith('data:')) {
        // Extract mime type and base64 from data URL
        const matches = firstImage.url.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          productImageMimeType = matches[1];
          productImageBase64 = matches[2];
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Generating images with Gemini AI
      setGenerationStep('generating');

      console.log('🚀 Starting image generation with Gemini...');

      const result = await generateImageWithGemini({
        productDescription,
        tabType: activeTab,
        formData,
        productImageBase64,
        productImageMimeType,
      });

      console.log('✅ Image generated successfully!');
      setGeneratedPrompt(result.promptUsed);

      // Step 4: Saving
      setGenerationStep('saving');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create data URL from the generated image
      const generatedImageUrl = `data:${result.mimeType};base64,${result.imageBase64}`;

      // Add the generated image to the results
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: generatedImageUrl,
        type: activeTab,
        timestamp: new Date(),
        liked: false,
        autoSaved: true,
      };

      setGeneratedImages([newImage, ...generatedImages]);
      setSelectedResult(newImage); // Auto-select the new image
      setIsGenerating(false);
      setGenerationStep(null);

      toast.success('Image generated successfully!', {
        description: 'AI-generated image ready • 1 credit used',
      });

    } catch (error) {
      console.error('Generation error:', error);
      setIsGenerating(false);
      setGenerationStep(null);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setGenerationError(errorMessage);

      if (errorMessage.includes('API key')) {
        toast.error('Generation failed: API Key Issue', {
          description: 'Please check your Gemini API Key in Settings.',
        });
      } else if (errorMessage.includes('rate limit')) {
        toast.error('Rate limit exceeded', {
          description: 'Please wait a moment and try again.',
        });
      } else if (errorMessage.includes('not available') || errorMessage.includes('not supported')) {
        toast.error('Image generation not available', {
          description: 'Your API key may not have access to image generation. Please check your Google AI Studio settings.',
        });
      } else {
        toast.error('Generation failed', {
          description: errorMessage || 'Please try again or contact support',
        });
      }
    }
  };

  const handleReset = () => {
    setFormData({
      productDescription: '',
      gender: 'Female',
      age: '',
      ethnicity: 'American',
      ethnicityDescription: '',
      hairstyle: 'sleek-straight-center',
      hairstyleDescription: '',
      pose: 'standing',
      poseDescription: '',
      background: 'studio',
      backgroundDescription: '',
      logoEnabled: false,
      logoPlacement: 'background',
      logoFocus: 'focused',
      logoLocation: '',
      camera: '50mm f/1.8 ISO 100',
      cameraDescription: '',
      lighting: 'softbox',
      lightingDescription: '',
      keyLight: '',
      advancedPrompt: '',
      jewelryStyle: 'elegant',
      jewelryAngle: 'front',
      accessoriesShotStyle: 'clean-studio',
      accessoriesFraming: 'head-shoulders',
      accessoriesProductEmphasis: 'product-hero',
      accessoriesBackground: 'solid-light',
      accessoriesLighting: 'softbox-45',
      accessoriesCameraLook: 'macro-portrait-105mm',
      accessoriesDepth: 'shallow',
      accessoriesRetouch: 'clean-editorial',
      accessoriesPose: 'product-near-face',
      creativeProductCategory: 'apparel',
      creativeShotType: 'packshot',
      creativeAngle: '45-degree',
      creativeFraming: 'medium',
      creativeBackground: 'pure-white',
      creativeLighting: 'softbox-45',
      creativeShadow: 'soft-shadow',
      creativeReflection: 'matte-surface',
      creativeDepth: 'sharp-all',
      creativeColorMood: 'neutral-true',
      creativeProps: 'none',
      creativeComposition: 'centered-hero',
      creativeSceneTheme: 'luxury-studio',
      creativeEnvironment: 'kitchen',
      creativeMotion: 'none',
      flatlayTheme: 'minimal',
      flatlayLayout: 'centered',
    });
    setUploadedFiles([]);
    setInspiredTemplateFile(null);
    setShowAdvanced(false);
    toast.success('Form reset');
  };

  const toggleLike = (id: string) => {
    setGeneratedImages(prev =>
      prev.map(img => img.id === id ? { ...img, liked: !img.liked } : img)
    );
  };

  const deleteImage = (id: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== id));
    toast.success('Image deleted');
    if (selectedResult?.id === id) {
      setSelectedResult(null);
    }
  };

  const downloadImage = (url: string) => {
    toast.success('Download started', {
      description: 'Your image is being downloaded',
    });
  };

  const useAsReference = (id: string) => {
    const img = generatedImages.find(img => img.id === id);
    if (img) {
      setReferenceImage(img);
      toast.success('Set as reference model', {
        description: 'This model will be used for future generations',
      });
    }
  };

  const regenerateImage = (id: string) => {
    toast.info('Regenerating...', {
      description: 'Creating a new variation with the same settings',
    });
  };

  const tabs = [
    { id: 'fashion' as TabType, label: 'Apparel', badge: 'With model', icon: Wand2 },
    { id: 'jewellery' as TabType, label: 'Accessories', badge: 'With model', icon: Sparkles },
    { id: 'flatlay' as TabType, label: 'Creative', badge: 'No model', icon: ImageIcon },
  ];

  const generationSteps = [
    { id: 'uploading', label: 'Uploading image...' },
    { id: 'prompt', label: 'Creating prompt...' },
    { id: 'generating', label: 'Generating with AI...' },
    { id: 'saving', label: 'Saving result...' },
  ];

  const currentStepIndex = generationSteps.findIndex(s => s.id === generationStep);

  const filteredImages = generatedImages.filter(img => img.type === activeTab);

  // Get pose options based on gender
  const getPoseOptions = () => {
    if (formData.gender === 'Female' || formData.gender === 'Transgender') {
      return [
        { value: 'neutral-front', label: 'Neutral front (A-stance)' },
        { value: '3-4-angle', label: '3/4 angle' },
        { value: 'side-profile', label: 'Side profile' },
        { value: 'back-view', label: 'Back view' },
        { value: 'walking-in-place', label: 'Walking-in-place' },
        { value: 'hand-on-hip', label: 'Hand-on-hip' },
        { value: 'hand-touching-collar', label: 'One hand touching collar/strap' },
        { value: 'arms-crossed-soft', label: 'Arms crossed soft' },
        { value: 'sitting-straight', label: 'Sitting straight' },
        { value: 'half-turn-look-back', label: 'Half-turn look back' },
        { value: 'walking-toward-camera', label: 'Walking toward camera' },
        { value: 'walking-away-glance', label: 'Walking away (over-shoulder glance)' },
        { value: 'street-corner-pause', label: 'Street-corner pause' },
        { value: 'hair-tuck', label: 'Hair tuck / sunglasses adjust' },
        { value: 'holding-bag-coffee', label: 'Holding shopping bag / coffee' },
        { value: 'hand-on-railing', label: 'Hand on railing / wall touch' },
        { value: 'spin-twirl', label: 'Spin / slight twirl' },
        { value: 'sitting-steps-bench', label: 'Sitting on steps/bench' },
        { value: 'cross-walk-stride', label: 'Cross-walk stride' },
        { value: 'looking-off-camera', label: 'Looking off-camera' },
        { value: 'custom', label: 'Custom (describe below)' },
      ];
    } else if (formData.gender === 'Male') {
      return [
        { value: 'neutral-front', label: 'Neutral front (catalog stance)' },
        { value: '3-4-angle', label: '3/4 angle' },
        { value: 'side-profile', label: 'Side profile' },
        { value: 'back-view', label: 'Back view' },
        { value: 'hands-in-pockets', label: 'Hands in pockets (one or both)' },
        { value: 'adjusting-cuff', label: 'Adjusting cuff/watch' },
        { value: 'adjusting-blazer', label: 'Adjusting blazer button' },
        { value: 'arms-crossed-confident', label: 'Arms crossed confident' },
        { value: 'holding-lapel', label: 'Holding lapel lightly' },
        { value: 'seated-lean-forward', label: 'Seated lean forward slightly' },
        { value: 'confident-walk', label: 'Confident walk' },
        { value: 'lean-on-wall', label: 'Lean on wall' },
        { value: 'hands-in-pockets-walking', label: 'Hands in pockets while walking' },
        { value: 'adjust-collar-zip', label: 'Adjust collar / jacket zip' },
        { value: 'look-away-candid', label: 'Look-away candid' },
        { value: 'sitting-ledge-bench', label: 'Sitting on ledge/bench' },
        { value: 'cross-street-stop', label: 'Cross-street stop' },
        { value: 'holding-phone', label: 'Holding phone / watch check' },
        { value: 'car-door-stand', label: 'Car door / scooter stand' },
        { value: 'back-view-walking', label: 'Back view walking' },
        { value: 'custom', label: 'Custom (describe below)' },
      ];
    } else if (formData.gender === 'Boy' || formData.gender === 'Girl') {
      return [
        { value: 'standing-relaxed', label: 'Standing relaxed' },
        { value: 'standing-hands-behind', label: 'Standing hands behind back' },
        { value: 'hands-on-hips', label: 'Hands on hips (confident)' },
        { value: 'walking-forward', label: 'Walking forward' },
        { value: 'walking-side', label: 'Walking side profile' },
        { value: 'running-playful', label: 'Running / playful sprint' },
        { value: 'jumping', label: 'Jumping (mid-air fun)' },
        { value: 'sitting-stool', label: 'Sitting on stool (front)' },
        { value: 'sitting-floor', label: 'Sitting on floor (cross-legged)' },
        { value: 'sitting-sideways', label: 'Sitting sideways (casual)' },
        { value: 'crouching', label: 'Crouching / squat pose' },
        { value: 'leaning-wall', label: 'Leaning on wall' },
        { value: 'looking-back', label: 'Looking back over shoulder' },
        { value: 'turning-twirl', label: 'Turning / twirl (motion)' },
        { value: 'waving', label: 'Waving / greeting' },
        { value: 'pointing', label: 'Pointing (cute gesture)' },
        { value: 'holding-strap', label: 'Holding strap / holding collar' },
        { value: 'holding-prop', label: 'Holding a prop (balloon/toy/book)' },
        { value: 'custom', label: 'Custom (describe below)' },
      ];
    } else if (formData.gender === 'Infant') {
      return [
        { value: 'lying-back', label: 'Lying on back (top-down)' },
        { value: 'sitting-supported', label: 'Sitting supported' },
        { value: 'crawling', label: 'Crawling pose' },
        { value: 'holding-toy', label: 'Holding a soft toy' },
        { value: 'laughing-candid', label: 'Laughing candid (natural)' },
        { value: 'parent-support', label: 'Parent-hand support cropped out' },
        { value: 'custom', label: 'Custom (describe below)' },
      ];
    }
    return [];
  };

  const poseOptions = getPoseOptions();

  // Get hairstyle options based on gender
  const getHairstyleOptions = () => {
    if (formData.gender === 'Female' || formData.gender === 'Transgender') {
      return [
        { value: 'sleek-straight-center', label: 'Sleek straight, center part' },
        { value: 'sleek-straight-side', label: 'Sleek straight, side part' },
        { value: 'soft-waves-center', label: 'Soft natural waves, center part' },
        { value: 'low-ponytail-sleek', label: 'Low ponytail (sleek)' },
        { value: 'low-bun-clean', label: 'Low bun (clean)' },
        { value: 'half-up-half-down', label: 'Half-up half-down (simple)' },
        { value: 'tucked-behind-ears', label: 'Tucked behind ears (clean face)' },
        { value: 'short-bob-straight', label: 'Short bob, straight (neat)' },
        { value: 'other', label: 'Other (describe below)' },
      ];
    } else if (formData.gender === 'Male') {
      return [
        { value: 'clean-side-part', label: 'Clean side part' },
        { value: 'short-textured-crop', label: 'Short textured crop' },
        { value: 'crew-cut', label: 'Crew cut' },
        { value: 'fade-short-top', label: 'Fade + short top' },
        { value: 'slick-back-light', label: 'Slick back (light)' },
        { value: 'natural-curls-neat', label: 'Natural curls (neat)' },
        { value: 'buzz-cut-clean', label: 'Buzz cut (clean)' },
        { value: 'medium-combed-back', label: 'Medium combed back (simple)' },
        { value: 'other', label: 'Other (describe below)' },
      ];
    } else if (formData.gender === 'Girl') {
      return [
        { value: 'natural-open-hair', label: 'Natural open hair (neatly brushed)' },
        { value: 'center-part-half-up-clip', label: 'Center part + half-up clip' },
        { value: 'side-part-hair-clip', label: 'Side part + hair clip' },
        { value: 'high-ponytail', label: 'High ponytail' },
        { value: 'low-ponytail', label: 'Low ponytail' },
        { value: 'two-ponytails', label: 'Two ponytails (balanced)' },
        { value: 'single-braid', label: 'Single braid (simple)' },
        { value: 'two-braids', label: 'Two braids (neat)' },
        { value: 'low-bun-clean', label: 'Low bun (clean)' },
        { value: 'headband-style', label: 'Headband style (simple)' },
        { value: 'other', label: 'Other (describe below)' },
      ];
    } else if (formData.gender === 'Boy') {
      return [
        { value: 'classic-short-cut', label: 'Classic short cut (neat)' },
        { value: 'side-part-soft', label: 'Side part (soft)' },
        { value: 'crew-cut', label: 'Crew cut' },
        { value: 'buzz-cut', label: 'Buzz cut' },
        { value: 'short-textured-top', label: 'Short textured top' },
        { value: 'fade-short-top', label: 'Fade + short top' },
        { value: 'curly-top-neat', label: 'Curly top (neatly shaped)' },
        { value: 'combed-forward-fringe', label: 'Combed forward (simple fringe)' },
        { value: 'other', label: 'Other (describe below)' },
      ];
    } else if (formData.gender === 'Infant') {
      return [
        { value: 'natural-soft-brushed', label: 'Natural hair (soft brushed)' },
        { value: 'side-part', label: 'Side part (if hair length allows)' },
        { value: 'tiny-top-ponytail', label: 'Tiny top ponytail (single sprout)' },
        { value: 'two-tiny-ponytails', label: 'Two tiny ponytails (if hair allows)' },
        { value: 'soft-headband', label: 'Soft headband (girls/unisex)' },
        { value: 'simple-cap-bonnet', label: 'Simple cap/bonnet (neutral, clean)' },
        { value: 'hair-clip-small', label: 'Hair clip (small, safe, minimal)' },
        { value: 'other', label: 'Other (describe below)' },
      ];
    }
    return [];
  };

  const hairstyleOptions = getHairstyleOptions();

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
      {/* Left Column: Input Form */}
      <div className="w-full lg:w-1/2 space-y-6">
        {/* Tab Control - Pill Segmented */}
        <div className="bg-gray-50/50 dark:bg-gray-900/50 rounded-full border border-gray-200/60 dark:border-gray-800/60 p-1 overflow-x-auto backdrop-blur-sm">
          <div className="flex gap-1 min-w-max">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap relative ${isActive
                    ? 'text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                    }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: isActive ? 1 : 1
                  }}
                  transition={{
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  whileHover={{
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-purple-600 rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                      }}
                    />
                  )}
                  <div className="flex items-center gap-1.5 relative z-10">
                    <motion.div
                      animate={{
                        rotate: isActive ? [0, -10, 10, -10, 0] : 0,
                        scale: isActive ? [1, 1.1, 1] : 1
                      }}
                      transition={{
                        duration: 0.5,
                        ease: "easeInOut"
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.div>
                    <motion.span
                      className="text-sm font-medium"
                      animate={{
                        scale: isActive ? [1, 1.05, 1] : 1
                      }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut"
                      }}
                    >
                      {tab.label}
                    </motion.span>
                  </div>
                  <motion.span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium relative z-10 ${isActive
                      ? 'bg-white/20 text-white/90'
                      : 'bg-gray-200/70 dark:bg-gray-800/70 text-gray-500 dark:text-gray-500'
                      }`}
                    animate={{
                      y: isActive ? [0, -2, 0] : 0,
                      opacity: [1, 0.8, 1]
                    }}
                    transition={{
                      duration: 0.4,
                      delay: 0.1,
                      ease: "easeInOut"
                    }}
                  >
                    {tab.badge}
                  </motion.span>
                  {!isActive && (
                    <motion.div
                      className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 rounded-full"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3>Upload Product Images</h3>
            <span className="text-sm text-gray-500 dark:text-gray-500">
              {uploadedFiles.length}/5
            </span>
          </div>

          {uploadedFiles.length === 0 ? (
            <label className="block">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center cursor-pointer hover:border-purple-600 dark:hover:border-purple-600 transition-all">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  PNG, JPG or WEBP (max. 10MB per file)
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                  Upload up to 5 images
                </p>
              </div>
            </label>
          ) : (
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div
                  key={file.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-move hover:border-purple-600 dark:hover:border-purple-600 transition-all ${draggedIndex === index ? 'opacity-50' : ''
                    }`}
                >
                  <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {uploadedFiles.length < 5 && (
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-purple-600 dark:hover:border-purple-600 transition-all">
                    <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add more images ({5 - uploadedFiles.length} remaining)
                    </p>
                  </div>
                </label>
              )}
            </div>
          )}
        </div>

        {/* Settings Form */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3>Generation Settings</h3>
            {referenceImage && (
              <button
                onClick={() => {
                  setReferenceImage(null);
                  toast.info('Reference unlocked', {
                    description: 'All settings are now editable',
                  });
                }}
                className="text-xs px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Clear Reference</span>
              </button>
            )}
          </div>

          {referenceImage && activeTab === 'fashion' && (
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg mb-4">
              <div className="flex items-start gap-3">
                <img
                  src={referenceImage.url}
                  alt="Reference model"
                  className="w-16 h-16 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm mb-1">🔒 Reference Model Locked</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Gender, Age, Ethnicity, and Hairstyle are locked. You can only change Pose and Background.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fashion' && (
            <>
              <div>
                <label className="block text-sm mb-2">Product Description</label>
                <textarea
                  value={formData.productDescription}
                  onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                  placeholder="e.g., Red cotton t-shirt, Black leather jacket, Blue denim jeans..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Describe the product you want to generate a photo for.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    disabled={!!referenceImage}
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent ${referenceImage ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender</option>
                    <option value="Boy">Boy</option>
                    <option value="Girl">Girl</option>
                    <option value="Infant">Infant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2">Age</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g., 25"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    disabled={!!referenceImage}
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent ${referenceImage ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Ethnicity</label>
                <select
                  value={formData.ethnicity}
                  onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })}
                  disabled={!!referenceImage}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent ${referenceImage ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                >
                  <option value="American">American</option>
                  <option value="African">African</option>
                  <option value="Asian">Asian</option>
                  <option value="Indian">Indian</option>
                  <option value="Middle Eastern">Middle Eastern</option>
                  <option value="Latin">Latin</option>
                  <option value="European">European</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {formData.ethnicity === 'Other' && (
                <div>
                  <label className="block text-sm mb-2">Describe Ethnicity</label>
                  <input
                    type="text"
                    placeholder="e.g., Mixed heritage, Pacific Islander"
                    value={formData.ethnicityDescription}
                    onChange={(e) => setFormData({ ...formData, ethnicityDescription: e.target.value })}
                    disabled={!!referenceImage}
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent ${referenceImage ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm mb-2">Hairstyle</label>
                <select
                  value={formData.hairstyle}
                  onChange={(e) => setFormData({ ...formData, hairstyle: e.target.value })}
                  disabled={!!referenceImage}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent ${referenceImage ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                >
                  {hairstyleOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {formData.hairstyle === 'other' && (
                <div>
                  <label className="block text-sm mb-2">Describe Hairstyle</label>
                  <input
                    type="text"
                    placeholder="e.g., long wavy hair, short bob"
                    value={formData.hairstyleDescription}
                    onChange={(e) => setFormData({ ...formData, hairstyleDescription: e.target.value })}
                    disabled={!!referenceImage}
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent ${referenceImage ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm mb-2">Pose</label>
                <select
                  value={formData.pose}
                  onChange={(e) => setFormData({ ...formData, pose: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  {poseOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {formData.pose === 'custom' && (
                <div>
                  <label className="block text-sm mb-2">Describe Pose</label>
                  <input
                    type="text"
                    placeholder="e.g., leaning against a wall, arms crossed"
                    value={formData.poseDescription}
                    onChange={(e) => setFormData({ ...formData, poseDescription: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm mb-2">Background</label>
                <select
                  value={formData.background}
                  onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="studio">Studio White</option>
                  <option value="street">Street/Urban</option>
                  <option value="home">Home Interior</option>
                  <option value="plain">Plain Color</option>
                  <option value="outdoor">Outdoor/Nature</option>
                  <option value="custom">Custom (describe below)</option>
                </select>
              </div>

              {formData.background === 'custom' && (
                <div>
                  <label className="block text-sm mb-2">Describe Background</label>
                  <input
                    type="text"
                    placeholder="e.g., vintage brick wall with natural light"
                    value={formData.backgroundDescription}
                    onChange={(e) => setFormData({ ...formData, backgroundDescription: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>
              )}

              {/* Logo Upload Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm">Add Brand Logo</label>
                  <button
                    onClick={() => setFormData({ ...formData, logoEnabled: !formData.logoEnabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.logoEnabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.logoEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>

                {formData.logoEnabled && (
                  <div className="space-y-3 mt-3">
                    {!logoFile ? (
                      <label className="block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded p-1.5 text-center cursor-pointer hover:border-purple-600 dark:hover:border-purple-600 transition-all">
                          <Upload className="w-2.5 h-2.5 mx-auto mb-0.5 text-gray-400" />
                          <p className="text-[9px] text-gray-600 dark:text-gray-400">
                            Click to upload logo
                          </p>
                          <p className="text-[7px] text-gray-500 dark:text-gray-500 mt-0.5">
                            PNG or SVG (max. 10MB)
                          </p>
                        </div>
                      </label>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <img
                          src={logoFile.url}
                          alt={logoFile.name}
                          className="w-16 h-16 object-contain rounded bg-white dark:bg-gray-900 p-1"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{logoFile.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {formatFileSize(logoFile.size)}
                          </p>
                        </div>
                        <button
                          onClick={removeLogo}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {logoFile && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs mb-2">Logo Placement</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => setFormData({ ...formData, logoPlacement: 'background' })}
                                className={`px-3 py-2 text-xs rounded-lg border transition-all ${formData.logoPlacement === 'background'
                                  ? 'bg-purple-600 text-white border-purple-600'
                                  : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-purple-600 dark:hover:border-purple-600'
                                  }`}
                              >
                                On Background
                              </button>
                              <button
                                onClick={() => setFormData({ ...formData, logoPlacement: 'front' })}
                                className={`px-3 py-2 text-xs rounded-lg border transition-all ${formData.logoPlacement === 'front'
                                  ? 'bg-purple-600 text-white border-purple-600'
                                  : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-purple-600 dark:hover:border-purple-600'
                                  }`}
                              >
                                On Front
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs mb-2">Logo Focus</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => setFormData({ ...formData, logoFocus: 'focused' })}
                                className={`px-3 py-2 text-xs rounded-lg border transition-all ${formData.logoFocus === 'focused'
                                  ? 'bg-purple-600 text-white border-purple-600'
                                  : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-purple-600 dark:hover:border-purple-600'
                                  }`}
                              >
                                Focused
                              </button>
                              <button
                                onClick={() => setFormData({ ...formData, logoFocus: 'outoffocus' })}
                                className={`px-3 py-2 text-xs rounded-lg border transition-all ${formData.logoFocus === 'outoffocus'
                                  ? 'bg-purple-600 text-white border-purple-600'
                                  : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-purple-600 dark:hover:border-purple-600'
                                  }`}
                              >
                                Out of Focus
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs mb-2">Logo Location</label>
                          <input
                            type="text"
                            placeholder="e.g., top left corner, center of background, bottom right"
                            value={formData.logoLocation}
                            onChange={(e) => setFormData({ ...formData, logoLocation: e.target.value })}
                            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm mb-2">Camera Settings</label>
                <select
                  value={formData.camera}
                  onChange={(e) => setFormData({ ...formData, camera: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="35mm f/1.4 ISO 100">35mm f/1.4 ISO 100 (Wide angle)</option>
                  <option value="50mm f/1.8 ISO 100">50mm f/1.8 ISO 100 (Standard)</option>
                  <option value="85mm f/1.4 ISO 100">85mm f/1.4 ISO 100 (Portrait)</option>
                  <option value="50mm f/2.8 ISO 200">50mm f/2.8 ISO 200 (Balanced)</option>
                  <option value="85mm f/2.0 ISO 400">85mm f/2.0 ISO 400 (Low light)</option>
                  <option value="custom">Other (describe below)</option>
                </select>
              </div>

              {formData.camera === 'custom' && (
                <div>
                  <label className="block text-sm mb-2">Describe Camera Settings</label>
                  <input
                    type="text"
                    placeholder="e.g., 50mm f/1.8 ISO 100"
                    value={formData.cameraDescription}
                    onChange={(e) => setFormData({ ...formData, cameraDescription: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm mb-2">Lighting</label>
                <select
                  value={formData.lighting}
                  onChange={(e) => setFormData({ ...formData, lighting: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="softbox">Softbox (Studio soft light)</option>
                  <option value="daylight">Natural Daylight</option>
                  <option value="rim">Rim Light (Edge highlight)</option>
                  <option value="high-key">High Key (Bright & airy)</option>
                  <option value="low-key">Low Key (Dark & moody)</option>
                  <option value="dramatic">Dramatic (Strong shadows)</option>
                  <option value="flat">Flat (Even, no shadows)</option>
                  <option value="custom">Other (describe below)</option>
                </select>
              </div>

              {formData.lighting === 'custom' && (
                <div>
                  <label className="block text-sm mb-2">Describe Lighting</label>
                  <input
                    type="text"
                    placeholder="e.g., softbox"
                    value={formData.lightingDescription}
                    onChange={(e) => setFormData({ ...formData, lightingDescription: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm mb-2">Key Light</label>
                <input
                  type="text"
                  placeholder="e.g., front, back, lamp, natural, etc"
                  value={formData.keyLight}
                  onChange={(e) => setFormData({ ...formData, keyLight: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              {/* Advanced Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="text-sm">Advanced Options</span>
                  {showAdvanced ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {showAdvanced && (
                  <div className="mt-4">
                    <label className="block text-sm mb-2">Custom Prompt</label>
                    <textarea
                      rows={4}
                      placeholder="Add additional details to your generation prompt..."
                      value={formData.advancedPrompt}
                      onChange={(e) => setFormData({ ...formData, advancedPrompt: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      This will be added to the AI prompt for more control over the generation.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'jewellery' && (
            <>
              <div>
                <label className="block text-sm mb-2">Product Description</label>
                <textarea
                  value={formData.productDescription}
                  onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                  placeholder="e.g., Gold necklace, Silver watch, Diamond earrings, Designer sunglasses..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Describe the accessory/jewelry you want to generate a photo for.
                </p>
              </div>

              <div>
                <label className="block text-sm mb-2">Shot Style (Universal Presets)</label>
                <select
                  value={formData.accessoriesShotStyle}
                  onChange={(e) => setFormData({ ...formData, accessoriesShotStyle: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="clean-studio">Clean Studio (E-commerce)</option>
                  <option value="soft-editorial">Soft Editorial (Luxury)</option>
                  <option value="moody-editorial">Moody Editorial (Dramatic)</option>
                  <option value="warm-lifestyle">Warm Lifestyle (Natural)</option>
                  <option value="beauty-high-key">Beauty High-Key (Skincare)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Framing</label>
                <select
                  value={formData.accessoriesFraming}
                  onChange={(e) => setFormData({ ...formData, accessoriesFraming: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="tight-closeup">Tight Close-Up (face + product area)</option>
                  <option value="head-shoulders">Head & Shoulders</option>
                  <option value="hands-product">Hands + Product Hero (minimal face)</option>
                  <option value="half-body">Half Body</option>
                  <option value="full-body">Full Body (rare for accessories, but useful)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Product Emphasis</label>
                <select
                  value={formData.accessoriesProductEmphasis}
                  onChange={(e) => setFormData({ ...formData, accessoriesProductEmphasis: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="product-hero">Product Hero (80/20)</option>
                  <option value="balanced">Balanced (60/40)</option>
                  <option value="model-hero">Model Hero (40/60)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Background</label>
                <select
                  value={formData.accessoriesBackground}
                  onChange={(e) => setFormData({ ...formData, accessoriesBackground: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="solid-light">Solid Light (white / beige / light grey)</option>
                  <option value="solid-dark">Solid Dark (black / charcoal / deep tone)</option>
                  <option value="soft-gradient">Soft Gradient</option>
                  <option value="studio-seamless">Studio Seamless Paper</option>
                  <option value="real-minimal">Real Minimal Indoor (plain wall, no clutter)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Lighting</label>
                <select
                  value={formData.accessoriesLighting}
                  onChange={(e) => setFormData({ ...formData, accessoriesLighting: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="softbox-45">Softbox 45° (Soft)</option>
                  <option value="clamshell">Clamshell (Beauty)</option>
                  <option value="moody-key-rim">Moody Key + Rim</option>
                  <option value="window-light">Window Light (Warm)</option>
                  <option value="overcast-outdoor">Overcast Outdoor (Soft Natural)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Camera Look</label>
                <select
                  value={formData.accessoriesCameraLook}
                  onChange={(e) => setFormData({ ...formData, accessoriesCameraLook: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="portrait-85mm">Portrait 85mm</option>
                  <option value="macro-portrait-105mm">Macro Portrait 105mm (best for jewelry/watch)</option>
                  <option value="commercial-50mm">Commercial 50mm</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Depth</label>
                <select
                  value={formData.accessoriesDepth}
                  onChange={(e) => setFormData({ ...formData, accessoriesDepth: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="shallow">Shallow (Blur)</option>
                  <option value="medium">Medium (More detail)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Retouch</label>
                <select
                  value={formData.accessoriesRetouch}
                  onChange={(e) => setFormData({ ...formData, accessoriesRetouch: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="natural">Natural</option>
                  <option value="clean-editorial">Clean Editorial</option>
                  <option value="commercial-beauty">Commercial Beauty</option>
                  <option value="texture-preserved">Texture-Preserved (realistic skin)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Pose (Universal)</label>
                <select
                  value={formData.accessoriesPose}
                  onChange={(e) => setFormData({ ...formData, accessoriesPose: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="product-near-face">Product Near Face (watch/jewelry close-up)</option>
                  <option value="hand-touching">Hand Touching Product (necklace/earring/ring)</option>
                  <option value="relaxed-lean">Relaxed Lean (beauty + lifestyle)</option>
                  <option value="side-profile">Side Profile Focus (earrings/sunglasses)</option>
                  <option value="neutral-stand">Neutral Stand (Catalog)</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'flatlay' && (
            <>
              <div>
                <label className="block text-sm mb-2">Product Description</label>
                <textarea
                  value={formData.productDescription}
                  onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                  placeholder="e.g., Skincare products, Makeup set, Coffee beans, Stationery items..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Describe your product for more accurate AI-generated creative photos.
                </p>
              </div>

              {/* Inspired Template Upload */}
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-900/50">
                <label className="block text-sm mb-2">Inspired Template (Optional)</label>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                  Upload a reference photo to inspire the creative style and composition
                </p>

                {!inspiredTemplateFile ? (
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleInspiredTemplateUpload}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-purple-600 dark:hover:border-purple-600 transition-all">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Upload inspiration photo
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        PNG, JPG or WEBP (max. 10MB)
                      </p>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <img
                      src={inspiredTemplateFile.url}
                      alt="Template"
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{inspiredTemplateFile.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {formatFileSize(inspiredTemplateFile.size)}
                      </p>
                    </div>
                    <button
                      onClick={removeInspiredTemplate}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                )}
              </div>

              {/* Core Settings */}
              <div>
                <label className="block text-sm mb-2">Product Category</label>
                <select
                  value={formData.creativeProductCategory}
                  onChange={(e) => setFormData({ ...formData, creativeProductCategory: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="apparel">Apparel</option>
                  <option value="cosmetics">Cosmetics</option>
                  <option value="food-beverage">Food & Beverage</option>
                  <option value="jewelry">Jewelry</option>
                  <option value="electronics">Electronics</option>
                  <option value="home-decor">Home & Decor</option>
                  <option value="footwear">Footwear</option>
                  <option value="bags">Bags</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Shot Type</label>
                <select
                  value={formData.creativeShotType}
                  onChange={(e) => setFormData({ ...formData, creativeShotType: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="packshot">Packshot (Clean e-com)</option>
                  <option value="creative-ad">Creative Ad (hero + props)</option>
                  <option value="lifestyle-scene">Lifestyle Scene (in-use environment)</option>
                  <option value="flatlay">Flatlay (top view)</option>
                  <option value="macro-detail">Macro Detail</option>
                  <option value="360-turntable">360/Turntable look</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Angle</label>
                <select
                  value={formData.creativeAngle}
                  onChange={(e) => setFormData({ ...formData, creativeAngle: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="front">Front</option>
                  <option value="45-degree">45° (most common)</option>
                  <option value="top">Top (flatlay)</option>
                  <option value="side">Side</option>
                  <option value="low-angle-hero">Low-angle hero</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Framing</label>
                <select
                  value={formData.creativeFraming}
                  onChange={(e) => setFormData({ ...formData, creativeFraming: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="extra-close-up">Extra close-up</option>
                  <option value="close-up">Close-up</option>
                  <option value="medium">Medium</option>
                  <option value="wide">Wide (scene-heavy)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Background Style</label>
                <select
                  value={formData.creativeBackground}
                  onChange={(e) => setFormData({ ...formData, creativeBackground: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="pure-white">Pure white</option>
                  <option value="solid-color">Solid color</option>
                  <option value="soft-gradient">Soft gradient</option>
                  <option value="seamless-sweep">Seamless studio sweep</option>
                  <option value="textured-marble">Textured (marble)</option>
                  <option value="textured-wood">Textured (wood)</option>
                  <option value="textured-concrete">Textured (concrete)</option>
                  <option value="textured-fabric">Textured (fabric)</option>
                  <option value="environmental-kitchen">Environmental (kitchen)</option>
                  <option value="environmental-bathroom">Environmental (bathroom)</option>
                  <option value="environmental-desk">Environmental (desk)</option>
                  <option value="environmental-vanity">Environmental (vanity)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Lighting Setup</label>
                <select
                  value={formData.creativeLighting}
                  onChange={(e) => setFormData({ ...formData, creativeLighting: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="softbox-45">Softbox 45° (soft studio)</option>
                  <option value="high-key">High-key (bright, minimal shadows)</option>
                  <option value="low-key">Low-key (dark, dramatic)</option>
                  <option value="backlit">Backlit / Rim light (glow edges)</option>
                  <option value="top-light">Top light (flatlay)</option>
                  <option value="window-light">Window light (natural lifestyle)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Shadow Style</label>
                <select
                  value={formData.creativeShadow}
                  onChange={(e) => setFormData({ ...formData, creativeShadow: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="no-shadow">No shadow (cutout style)</option>
                  <option value="soft-shadow">Soft shadow (default pro)</option>
                  <option value="hard-shadow">Hard shadow (graphic look)</option>
                  <option value="drop-shadow">Drop shadow (catalog)</option>
                  <option value="natural-directional">Natural directional shadow</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Reflection / Surface</label>
                <select
                  value={formData.creativeReflection}
                  onChange={(e) => setFormData({ ...formData, creativeReflection: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="matte-surface">Matte surface</option>
                  <option value="glossy-reflection">Glossy reflection</option>
                  <option value="glass-reflection">Glass reflection</option>
                  <option value="water-reflection">Water reflection (creative)</option>
                  <option value="no-surface">No surface visible (floating)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Depth of Field</label>
                <select
                  value={formData.creativeDepth}
                  onChange={(e) => setFormData({ ...formData, creativeDepth: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="sharp-all">Sharp all (product fully clear)</option>
                  <option value="shallow">Shallow (hero blur)</option>
                  <option value="macro-shallow">Macro shallow (detail focus)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Color Mood / Grade</label>
                <select
                  value={formData.creativeColorMood}
                  onChange={(e) => setFormData({ ...formData, creativeColorMood: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="neutral-true">Neutral true-color (ecom accurate)</option>
                  <option value="warm-premium">Warm premium</option>
                  <option value="cool-tech">Cool tech</option>
                  <option value="pastel-soft">Pastel soft</option>
                  <option value="high-contrast">High-contrast punchy</option>
                  <option value="cinematic-dramatic">Cinematic dramatic</option>
                </select>
              </div>

              {/* Creative Controls */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <h4 className="text-sm mb-4">Creative Controls</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">Props & Styling</label>
                    <select
                      value={formData.creativeProps}
                      onChange={(e) => setFormData({ ...formData, creativeProps: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    >
                      <option value="none">None (minimal)</option>
                      <option value="minimal-props">Minimal props (1–3)</option>
                      <option value="story-props">Story props (scene building)</option>
                      <option value="seasonal-props">Seasonal props (festival/sale)</option>
                      <option value="ingredient-props">Ingredient props (for food/beauty)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Composition Layout</label>
                    <select
                      value={formData.creativeComposition}
                      onChange={(e) => setFormData({ ...formData, creativeComposition: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    >
                      <option value="centered-hero">Centered hero</option>
                      <option value="rule-of-thirds">Rule of thirds</option>
                      <option value="diagonal-dynamic">Diagonal dynamic</option>
                      <option value="symmetry">Symmetry</option>
                      <option value="negative-space">Negative space for text (ad-ready)</option>
                      <option value="pattern-repeat">Pattern/repeat (multi items)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Scene Theme</label>
                    <select
                      value={formData.creativeSceneTheme}
                      onChange={(e) => setFormData({ ...formData, creativeSceneTheme: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    >
                      <option value="luxury-studio">Luxury studio</option>
                      <option value="fresh-clean">Fresh & clean</option>
                      <option value="natural-organic">Natural organic</option>
                      <option value="tech-futuristic">Tech futuristic</option>
                      <option value="cozy-home">Cozy home</option>
                      <option value="festive-gifting">Festive / gifting</option>
                      <option value="minimal-monochrome">Minimal monochrome</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Environment (if Lifestyle Scene)</label>
                    <select
                      value={formData.creativeEnvironment}
                      onChange={(e) => setFormData({ ...formData, creativeEnvironment: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    >
                      <option value="kitchen">Kitchen</option>
                      <option value="bathroom">Bathroom</option>
                      <option value="bedroom">Bedroom</option>
                      <option value="desk-setup">Desk setup</option>
                      <option value="outdoor-patio">Outdoor patio</option>
                      <option value="cafe">Café</option>
                      <option value="retail-shelf">Retail shelf</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Motion / Effects (Optional)</label>
                    <select
                      value={formData.creativeMotion}
                      onChange={(e) => setFormData({ ...formData, creativeMotion: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    >
                      <option value="none">None</option>
                      <option value="splash">Splash</option>
                      <option value="smoke-fog">Smoke/fog</option>
                      <option value="dust-particles">Dust particles</option>
                      <option value="bokeh-light">Bokeh light</option>
                      <option value="floating-product">Floating product</option>
                      <option value="fabric-wave">Fabric wave / wind</option>
                      <option value="liquid-pour">Liquid pour / drip</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || uploadedFiles.length === 0}
            className={`flex-1 py-4 rounded-lg flex items-center justify-center gap-2 transition-all text-lg ${isGenerating || uploadedFiles.length === 0
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-105 hover:shadow-lg'
              }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                <span>Generate</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            disabled={isGenerating}
            className="px-6 py-4 border-2 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Right Column: Results & History */}
      <div className="w-full lg:w-1/2 space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="mb-4">Generated Results</h3>

          {/* Error State */}
          {generationError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{generationError}</p>
            </div>
          )}

          {/* Empty State */}
          {filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
              <p className="text-gray-500 dark:text-gray-500 mb-2">
                No images generated yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-600">
                Upload product images and click Generate to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredImages.map(img => (
                <div
                  key={img.id}
                  className="group relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-purple-600 dark:hover:border-purple-600 transition-all"
                >
                  <div className="aspect-square">
                    <img
                      src={img.url}
                      alt="Generated result"
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setSelectedResult(img)}
                    />
                  </div>

                  {/* Auto-saved Badge */}
                  {img.autoSaved && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                      <Check className="w-3 h-3" />
                      <span>Auto-saved</span>
                    </div>
                  )}

                  {/* Like Badge */}
                  {img.liked && (
                    <div className="absolute top-2 right-2">
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 p-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(img.url);
                      }}
                      className="w-full py-2 bg-white/95 dark:bg-gray-900/95 hover:bg-white dark:hover:bg-gray-900 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PNG</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        useAsReference(img.id);
                      }}
                      className="w-full py-2 bg-white/95 dark:bg-gray-900/95 hover:bg-white dark:hover:bg-gray-900 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <User className="w-4 h-4" />
                      <span>Use as Reference</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        regenerateImage(img.id);
                      }}
                      className="w-full py-2 bg-white/95 dark:bg-gray-900/95 hover:bg-white dark:hover:bg-gray-900 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Generation Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" />
              </div>
              <h3 className="mb-2">Generating your images</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This will take about 10-15 seconds
              </p>
            </div>

            <div className="space-y-4">
              {generationSteps.map((step, index) => {
                const isComplete = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 ${isComplete || isCurrent ? 'opacity-100' : 'opacity-40'
                      }`}
                  >
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isComplete
                        ? 'bg-green-500'
                        : isCurrent
                          ? 'bg-purple-600'
                          : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                    >
                      {isComplete ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <span className="text-xs text-white">{index + 1}</span>
                      )}
                    </div>
                    <span className="text-sm">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Image Detail Bottom Sheet (Mobile) */}
      {selectedResult && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center p-0 lg:p-4"
          onClick={() => setSelectedResult(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-t-2xl lg:rounded-2xl w-full lg:max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
              <h3>Image Details</h3>
              <button
                onClick={() => setSelectedResult(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <img
                src={selectedResult.url}
                alt="Generated result"
                className="w-full rounded-lg mb-6"
              />

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Type</span>
                  <span className="capitalize">{selectedResult.type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Created</span>
                  <span>{selectedResult.timestamp.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    Auto-saved
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => downloadImage(selectedResult.url)}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => {
                    toggleLike(selectedResult.id);
                    setSelectedResult({
                      ...selectedResult,
                      liked: !selectedResult.liked,
                    });
                  }}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Heart
                    className={`w-4 h-4 ${selectedResult.liked
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-700 dark:text-gray-300'
                      }`}
                  />
                  <span>{selectedResult.liked ? 'Liked' : 'Like'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}