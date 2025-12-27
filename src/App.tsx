import image_0ef793a5965fe79a80bdb0d1fd88d97304605580 from "figma:asset/0ef793a5965fe79a80bdb0d1fd88d97304605580.png";
import image_a3b4af98c90003c1c241e34732ad80a5631c9b37 from "figma:asset/a3b4af98c90003c1c241e34732ad80a5631c9b37.png";
import image_169288cf84b5497e363924fb9978b10a4b6352dd from "figma:asset/169288cf84b5497e363924fb9978b10a4b6352dd.png";
import image_b9cb16a4d4cac524e72286f4fd9a7a08e0a64d1b from "figma:asset/b9cb16a4d4cac524e72286f4fd9a7a08e0a64d1b.png";
import image_1ac3da18db9cf9a461af1c75316b1d71edf52cf1 from "figma:asset/1ac3da18db9cf9a461af1c75316b1d71edf52cf1.png";
import { Suspense, lazy, useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Link } from "react-router-dom";
// ... icons imports remain ...
import {
  Moon,
  Sun,
  Upload,
  Wand2,
  Download,
  User,
  Gem,
  LayoutGrid,
  Menu,
  X,
} from "lucide-react";
import { BeforeAfterSlider } from "./components/BeforeAfterSlider";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { Toaster } from "sonner";
import logoImage from "figma:asset/fa30442f6b440cc9bfcc8b76b43cb2346b823708.png";
import { supabase } from "./utils/supabase";
import { useBeforeAfterImages, useHeroImages, useFeatureImages, useLogoImage, useLandingContent, useTermsAndConditions, useTestimonials, usePartnerLogos, useStepsContent, useFooterContent, useSocialProofContent } from "./utils/useSiteContent";
import { PageLoader } from "./components/ui/PageLoader";
// MouseTrailBackground removed - cursor interaction disabled
import { AnimatedShinyText } from "./components/ui/animated-shiny-text";

// Lazy load heavy components
const Pricing = lazy(() => import("./components/Pricing").then(module => ({ default: module.Pricing })));
const Auth = lazy(() => import("./components/Auth").then(module => ({ default: module.Auth })));
const HowItWorks = lazy(() => import("./components/HowItWorks").then(module => ({ default: module.HowItWorks })));
const AuthenticatedLayout = lazy(() => import("./components/AuthenticatedLayout").then(module => ({ default: module.AuthenticatedLayout })));
const GeneratorHub = lazy(() => import("./components/GeneratorHub").then(module => ({ default: module.GeneratorHub })));
const Library = lazy(() => import("./components/Library").then(module => ({ default: module.Library })));
const BillingSettings = lazy(() => import("./components/BillingSettings").then(module => ({ default: module.BillingSettings })));
const AccountSettings = lazy(() => import("./components/AccountSettings").then(module => ({ default: module.AccountSettings })));
const LegalPage = lazy(() => import("./components/LegalPage").then(module => ({ default: module.LegalPage })));

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedView, setAuthenticatedView] = useState<
    "generate" | "library" | "billing" | "settings" | "account"
  >("generate");

  // Fetch dynamic before/after images from Supabase CMS
  const beforeAfterImages = useBeforeAfterImages();
  const heroImages = useHeroImages();
  const featureImages = useFeatureImages();
  const logoData = useLogoImage();
  const landingContent = useLandingContent();
  const legalDocs = useTermsAndConditions();
  const { testimonials } = useTestimonials();
  const { logos: partnerLogos } = usePartnerLogos();
  const stepsContent = useStepsContent();
  const footerContent = useFooterContent();
  const socialProofContent = useSocialProofContent();

  console.log('Legal Docs Hook State:', legalDocs);
  console.log('Supabase Configured:', !!import.meta.env.VITE_SUPABASE_URL);

  useEffect(() => {
    // Check active session - wrapped in try-catch to handle missing Supabase config
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setIsAuthenticated(!!session);
        if (session) {
          setAuthenticatedView("generate");
        }
      }).catch(err => {
        console.warn('Supabase getSession failed:', err.message);
      });

      // Listen for changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
        if (!session) {
          navigate("/");
        }
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      console.warn('Supabase auth not configured:', error);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <Suspense fallback={<PageLoader />}>
        {/* Toast Notifications */}
        <Toaster
          position="top-center"
          richColors
          theme={isDark ? "dark" : "light"}
          closeButton
        />

        {/* Render authenticated app or public pages */}
        {isAuthenticated ? (
          <AuthenticatedLayout
            currentView={authenticatedView}
            onViewChange={setAuthenticatedView}
            onLogout={handleLogout}
            isDark={isDark}
            onToggleDark={() => setIsDark(!isDark)}
          >
            {authenticatedView === "generate" ? (
              <GeneratorHub />
            ) : authenticatedView === "library" ? (
              <Library />
            ) : authenticatedView === "billing" ? (
              <BillingSettings />
            ) : authenticatedView === "settings" ||
              authenticatedView === "account" ? (
              <AccountSettings
                isDark={isDark}
                onToggleDark={() => setIsDark(!isDark)}
                onLogout={handleLogout}
              />
            ) : null}
          </AuthenticatedLayout>
        ) : (
          <>
            {/* Sticky Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  {/* Logo */}
                  <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 hover:opacity-80 transition-all"
                  >
                    <img
                      src={logoImage}
                      alt="Outfit AI Studio"
                      className="h-32 w-auto dark:invert dark:hue-rotate-180 transition-all"
                    />
                  </button>

                  {/* Desktop Navigation */}
                  <div className="hidden md:flex items-center gap-6">
                    <button
                      onClick={() => navigate("/how-it-works")}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:scale-105 transition-all"
                    >
                      How It Works
                    </button>
                    <button
                      onClick={() => navigate("/pricing")}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:scale-105 transition-all"
                    >
                      Pricing
                    </button>
                    <button
                      onClick={() => navigate("/auth")}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:scale-105 transition-all"
                    >
                      Sign in
                    </button>
                    <button
                      onClick={() => setIsDark(!isDark)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-110 transition-all"
                      aria-label="Toggle theme"
                    >
                      {isDark ? (
                        <Sun className="w-5 h-5" />
                      ) : (
                        <Moon className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => navigate("/auth")}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all"
                    >
                      Start Free
                    </button>
                  </div>

                  {/* Mobile Menu Button */}
                  <div className="md:hidden flex items-center gap-2">
                    <button
                      onClick={() => setIsDark(!isDark)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-110 transition-all"
                      aria-label="Toggle theme"
                    >
                      {isDark ? (
                        <Sun className="w-5 h-5" />
                      ) : (
                        <Moon className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        setMobileMenuOpen(!mobileMenuOpen)
                      }
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-110 transition-all"
                      aria-label="Toggle menu"
                    >
                      {mobileMenuOpen ? (
                        <X className="w-6 h-6" />
                      ) : (
                        <Menu className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                  <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => {
                          navigate("/how-it-works");
                          setMobileMenuOpen(false);
                        }}
                        className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                      >
                        How It Works
                      </button>
                      <button
                        onClick={() => {
                          navigate("/pricing");
                          setMobileMenuOpen(false);
                        }}
                        className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                      >
                        Pricing
                      </button>
                      <button
                        onClick={() => {
                          navigate("/auth");
                          setMobileMenuOpen(false);
                        }}
                        className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                      >
                        Sign in
                      </button>
                      <button
                        onClick={() => {
                          navigate("/auth");
                          setMobileMenuOpen(false);
                        }}
                        className="px-3 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-center"
                      >
                        Start Free
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Conditional Page Rendering */}
            {location.pathname === "/" ? (
              <>
                {/* Hero Section */}
                <section className="relative overflow-hidden">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                      {/* Hero Content */}
                      <div className="text-center lg:text-left">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-6">
                          {landingContent.heroTitle}{" "}
                          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {landingContent.heroTitleHighlight || 'instantly'}
                          </span>
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
                          {landingContent.heroSubtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                          <button
                            onClick={() => navigate("/auth")}
                            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all text-lg"
                          >
                            {landingContent.heroCtaPrimary}
                          </button>
                          <button
                            onClick={() => navigate("/how-it-works#video-tutorials")}
                            className="px-8 py-4 border-2 border-gray-300 dark:border-gray-700 hover:border-purple-600 dark:hover:border-purple-600 rounded-lg hover:scale-105 hover:shadow-md transition-all text-lg"
                          >
                            {landingContent.heroCtaSecondary}
                          </button>
                        </div>
                      </div>

                      {/* Hero Demo */}
                      <div className="w-full aspect-[4/3] lg:aspect-auto lg:h-[500px]">
                        {heroImages.isLoading || !heroImages.hero.before ? (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg animate-pulse flex items-center justify-center">
                            <div className="text-gray-400 dark:text-gray-500">Loading...</div>
                          </div>
                        ) : (
                          <BeforeAfterSlider
                            beforeImage={heroImages.hero.before}
                            afterImage={heroImages.hero.after}
                            beforeAlt="Product on plain background"
                            afterAlt="Product on fashion model"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* 3 Steps Strip */}
                <section className="bg-gray-50 dark:bg-gray-900 py-12">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <Upload className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">
                            Step 1
                          </div>
                          <h3 className="mb-2">
                            {stepsContent.step1Title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {stepsContent.step1Desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <Wand2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">
                            Step 2
                          </div>
                          <h3 className="mb-2">
                            {stepsContent.step2Title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {stepsContent.step2Desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <Download className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">
                            Step 3
                          </div>
                          <h3 className="mb-2">
                            {stepsContent.step3Title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {stepsContent.step3Desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Before/After Gallery Section */}
                <section className="py-20 bg-gray-50 dark:bg-gray-900">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                      <h2 className="text-3xl sm:text-4xl mb-4">
                        {landingContent.galleryTitle}
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {landingContent.gallerySubtitle}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {/* Apparel */}
                      <div className="bg-white dark:bg-gray-950 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                        <div className="aspect-[3/4] mb-4 rounded-lg overflow-hidden">
                          {beforeAfterImages.isLoading || !beforeAfterImages.apparel.before ? (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse flex items-center justify-center">
                              <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
                            </div>
                          ) : (
                            <BeforeAfterSlider
                              beforeImage={beforeAfterImages.apparel.before}
                              afterImage={beforeAfterImages.apparel.after}
                              beforeAlt="Clothing product plain"
                              afterAlt="Model wearing clothing"
                            />
                          )}
                        </div>
                        <h3 className="text-center mb-1">
                          {landingContent.apparelTitle}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                          {landingContent.apparelDesc}
                        </p>
                      </div>

                      {/* Jewelry */}
                      <div className="bg-white dark:bg-gray-950 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                        <div className="aspect-[3/4] mb-4 rounded-lg overflow-hidden">
                          {beforeAfterImages.isLoading || !beforeAfterImages.jewelry.before ? (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse flex items-center justify-center">
                              <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
                            </div>
                          ) : (
                            <BeforeAfterSlider
                              beforeImage={beforeAfterImages.jewelry.before}
                              afterImage={beforeAfterImages.jewelry.after}
                              beforeAlt="Jewelry product"
                              afterAlt="Model wearing jewelry"
                            />
                          )}
                        </div>
                        <h3 className="text-center mb-1">
                          {landingContent.jewelryTitle}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                          {landingContent.jewelryDesc}
                        </p>
                      </div>

                      {/* Footwear */}
                      <div className="bg-white dark:bg-gray-950 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                        <div className="aspect-[3/4] mb-4 rounded-lg overflow-hidden">
                          {beforeAfterImages.isLoading || !beforeAfterImages.shoes.before ? (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse flex items-center justify-center">
                              <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
                            </div>
                          ) : (
                            <BeforeAfterSlider
                              beforeImage={beforeAfterImages.shoes.before}
                              afterImage={beforeAfterImages.shoes.after}
                              beforeAlt="Shoes product"
                              afterAlt="Model wearing shoes"
                            />
                          )}
                        </div>
                        <h3 className="text-center mb-1">
                          Footwear
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                          Step up your product presentation
                        </p>
                      </div>

                      {/* Accessories */}
                      <div className="bg-white dark:bg-gray-950 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                        <div className="aspect-[3/4] mb-4 rounded-lg overflow-hidden">
                          {beforeAfterImages.isLoading || !beforeAfterImages.handbag.before ? (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse flex items-center justify-center">
                              <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
                            </div>
                          ) : (
                            <BeforeAfterSlider
                              beforeImage={beforeAfterImages.handbag.before}
                              afterImage={beforeAfterImages.handbag.after}
                              beforeAlt="Handbag product"
                              afterAlt="Styled handbag"
                            />
                          )}
                        </div>
                        <h3 className="text-center mb-1">
                          Accessories
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                          Bags and accessories in context
                        </p>
                      </div>

                      {/* Watches */}
                      <div className="bg-white dark:bg-gray-950 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                        <div className="aspect-[3/4] mb-4 rounded-lg overflow-hidden">
                          {beforeAfterImages.isLoading || !beforeAfterImages.watch.before ? (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse flex items-center justify-center">
                              <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
                            </div>
                          ) : (
                            <BeforeAfterSlider
                              beforeImage={beforeAfterImages.watch.before}
                              afterImage={beforeAfterImages.watch.after}
                              beforeAlt="Watch product"
                              afterAlt="Watch lifestyle"
                            />
                          )}
                        </div>
                        <h3 className="text-center mb-1">
                          Watches
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                          Luxury timepieces in lifestyle settings
                        </p>
                      </div>

                      {/* Fashion */}
                      <div className="bg-white dark:bg-gray-950 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                        <div className="aspect-[3/4] mb-4 rounded-lg overflow-hidden">
                          {beforeAfterImages.isLoading || !beforeAfterImages.fashion.before ? (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse flex items-center justify-center">
                              <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
                            </div>
                          ) : (
                            <BeforeAfterSlider
                              beforeImage={beforeAfterImages.fashion.before}
                              afterImage={beforeAfterImages.fashion.after}
                              beforeAlt="Product on plain background"
                              afterAlt="Product on fashion model"
                            />
                          )}
                        </div>
                        <h3 className="text-center mb-1">
                          Fashion
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                          Professional studio quality instantly
                        </p>
                      </div>
                    </div>

                    <div className="text-center mt-12">
                      <button
                        onClick={() => navigate("/auth")}
                        className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all text-lg"
                      >
                        Try It Free Now
                      </button>
                    </div>
                  </div>
                </section>

                {/* Feature Cards */}
                <section className="py-20">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                      <h2 className="text-3xl sm:text-4xl mb-4">
                        Transform any product, any style
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Professional photography made accessible
                        with AI-powered generation
                      </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                      {/* Fashion Model Card */}
                      <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-purple-600 dark:hover:border-purple-600 transition-all hover:shadow-xl">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                          <User className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="mb-2">Fashion Model</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Place your apparel on diverse AI models
                          with studio lighting
                        </p>
                        <div className="aspect-[3/4] rounded-lg overflow-hidden">
                          {featureImages.isLoading || !featureImages.fashionModel ? (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse flex items-center justify-center">
                              <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
                            </div>
                          ) : (
                            <img
                              src={featureImages.fashionModel}
                              alt="Fashion model example"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                        </div>
                      </div>

                      {/* Jewelry Close-up Card */}
                      <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-purple-600 dark:hover:border-purple-600 transition-all hover:shadow-xl">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                          <Gem className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="mb-2">Jewelry Close-up</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Macro shots with perfect reflections and
                          premium aesthetics
                        </p>
                        <div className="aspect-[3/4] rounded-lg overflow-hidden">
                          {featureImages.isLoading || !featureImages.jewelryCloseup ? (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse flex items-center justify-center">
                              <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
                            </div>
                          ) : (
                            <img
                              src={featureImages.jewelryCloseup}
                              alt="Jewelry close-up example"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                        </div>
                      </div>

                      {/* Flatlay Pro Card */}
                      <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-purple-600 dark:hover:border-purple-600 transition-all hover:shadow-xl">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                          <LayoutGrid className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="mb-2">Flatlay Pro</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Styled overhead compositions for social
                          media impact
                        </p>
                        <div className="aspect-[3/4] rounded-lg overflow-hidden">
                          {featureImages.isLoading || !featureImages.flatlayPro ? (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse flex items-center justify-center">
                              <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
                            </div>
                          ) : (
                            <img
                              src={featureImages.flatlayPro}
                              alt="Flatlay example"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Social Proof */}
                <section className="bg-gray-50 dark:bg-gray-900 py-16">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Logo Strip */}
                    <div className="mb-12">
                      <p className="text-center text-sm text-gray-500 dark:text-gray-500 mb-6">
                        {socialProofContent.brandsTagline}
                      </p>
                      <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 opacity-40">
                        {partnerLogos.length > 0 ? (
                          partnerLogos.map((logo) => (
                            <div key={logo.id} className="h-8 w-24 bg-gray-400 dark:bg-gray-600 rounded flex items-center justify-center">
                              {logo.logo_url ? (
                                <img src={logo.logo_url} alt={logo.name} className="h-full w-auto object-contain" />
                              ) : (
                                <span className="text-xs text-gray-600 dark:text-gray-400">{logo.name}</span>
                              )}
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="h-8 w-24 bg-gray-400 dark:bg-gray-600 rounded"></div>
                            <div className="h-8 w-28 bg-gray-400 dark:bg-gray-600 rounded"></div>
                            <div className="h-8 w-20 bg-gray-400 dark:bg-gray-600 rounded"></div>
                            <div className="h-8 w-32 bg-gray-400 dark:bg-gray-600 rounded"></div>
                            <div className="h-8 w-24 bg-gray-400 dark:bg-gray-600 rounded"></div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Testimonials */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                      {testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                          <div className="flex gap-1 mb-4">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <svg
                                key={i}
                                className="w-5 h-5 text-yellow-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            "{testimonial.content}"
                          </p>
                          <div>
                            <div>{testimonial.author_name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-500">
                              {testimonial.author_title}{testimonial.author_company ? `, ${testimonial.author_company}` : ''}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-200 dark:border-gray-800 py-12">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                      <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 hover:opacity-80 transition-all"
                      >
                        <img
                          src={logoImage}
                          alt="Outfit AI Studio"
                          className="h-60 w-auto dark:invert dark:hue-rotate-180 transition-all"
                        />
                      </button>

                      <div className="flex flex-wrap justify-center gap-6 text-sm">
                        <button
                          onClick={() =>
                            navigate("/pricing")
                          }
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:scale-105 transition-all"
                        >
                          Pricing
                        </button>

                        {/* Terms & Conditions Link */}
                        <button
                          onClick={() => navigate("/terms")}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:scale-105 transition-all"
                        >
                          Terms and Conditions
                        </button>

                        {/* Privacy Policy Link */}
                        <button
                          onClick={() => navigate("/privacy-policy")}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:scale-105 transition-all"
                        >
                          Privacy Policy
                        </button>

                        {/* Support Link */}
                        <button
                          onClick={() => navigate("/support")}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:scale-105 transition-all"
                        >
                          Support
                        </button>

                        {/* Refund Policy Link */}
                        <button
                          onClick={() => navigate("/refund-policy")}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:scale-105 transition-all"
                        >
                          Refund Policy
                        </button>
                      </div>

                      <div className="text-sm text-gray-500 dark:text-gray-500">
                        © 2024 Outfit AI. All rights reserved.
                      </div>
                    </div>
                  </div>
                </footer>
              </>
            ) : location.pathname === "/pricing" ? (
              <Pricing />
            ) : location.pathname === "/how-it-works" ? (
              <HowItWorks onNavigate={(page: string) => {
                if (page === 'home') navigate('/');
                else if (page === 'pricing') navigate('/pricing');
                else if (page === 'auth') navigate('/auth');
                else if (page === 'howItWorks') navigate('/how-it-works');
                else navigate(`/${page}`);
              }} />
            ) : ["/terms", "/privacy-policy", "/support", "/refund-policy"].includes(location.pathname) ? (
              <LegalPage
                type={
                  location.pathname === '/terms' ? 'terms' :
                    location.pathname === '/privacy-policy' ? 'privacy' :
                      location.pathname === '/support' ? 'support' : 'refund'
                }
                onBack={() => navigate("/")}
              />
            ) : (
              <Auth
                onLoginSuccess={() => {
                  setIsAuthenticated(true);
                  setAuthenticatedView("generate");
                }}
              />
            )}
          </>
        )
        }
      </Suspense>
    </div >
  );
}