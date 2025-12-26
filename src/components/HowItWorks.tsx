import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Play, CheckCircle2, Clock, Users } from 'lucide-react';
import { useVideoTutorials } from '../utils/useVideoTutorials';

interface HowItWorksProps {
  onNavigate: (page: 'home' | 'pricing' | 'auth' | 'howItWorks') => void;
}

export function HowItWorks({ onNavigate }: HowItWorksProps) {
  const { tutorials, featuredVideo, isLoading } = useVideoTutorials();
  const location = useLocation();

  // Scroll to section based on hash (e.g., #video-tutorials)
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        // Small delay to ensure page is rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location.hash]);
  const quickSteps = [
    {
      step: 1,
      title: 'Upload Your Product',
      description: 'Simply upload a photo of your product on a plain background',
    },
    {
      step: 2,
      title: 'Choose Your Style',
      description: 'Select model type, pose, or flatlay composition',
    },
    {
      step: 3,
      title: 'Generate & Download',
      description: 'AI generates studio-quality photos in seconds',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl mb-6">
              How Outfit AI Works
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Transform your product photos into studio-quality images with AI.
              Watch our step-by-step tutorials and start creating professional content today.
            </p>
          </div>

          {/* Quick Steps */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {quickSteps.map((item) => (
              <div
                key={item.step}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                  {item.step}
                </div>
                <h3 className="mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => onNavigate('auth')}
              className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all text-lg"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section id="video-tutorials" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl mb-4">Video Tutorials</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to know to master Outfit AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tutorials.map((tutorial) => (
              <div
                key={tutorial.id}
                className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-all group"
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-video bg-gray-900 overflow-hidden cursor-pointer">
                  <img
                    src={`https://img.youtube.com/vi/${tutorial.videoId}/maxresdefault.jpg`}
                    alt={tutorial.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-all">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {tutorial.duration}
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-6">
                  <h3 className="mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {tutorial.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {tutorial.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {tutorial.views} views
                    </span>
                    <a
                      href={`https://www.youtube.com/watch?v=${tutorial.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                    >
                      Watch Now
                      <Play className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Video Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl mb-4">{featuredVideo.title}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {featuredVideo.description}
            </p>
          </div>

          {/* Embedded YouTube Video */}
          <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${featuredVideo.videoId}`}
              title={featuredVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ready to create stunning product photos?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('auth')}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => onNavigate('pricing')}
                className="px-8 py-4 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg hover:scale-105 transition-all"
              >
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl mb-4">Common Questions</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'What file formats do you accept?',
                a: 'We accept JPG, PNG, and WEBP formats. For best results, use high-resolution images with plain backgrounds.',
              },
              {
                q: 'How long does it take to generate images?',
                a: 'Most images are generated in 10-30 seconds. Batch processing may take longer depending on the number of products.',
              },
              {
                q: 'Can I use the images commercially?',
                a: 'Yes! All generated images are yours to use for commercial purposes, including e-commerce, marketing, and social media.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'We offer a 10-generation free trial so you can test the service. Paid credits are non-refundable but never expire.',
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-6"
              >
                <div className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="mb-2">{faq.q}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Still have questions?{' '}
              <a href="#contact" className="text-purple-600 dark:text-purple-400 hover:underline">
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
