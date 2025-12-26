import { useState, useEffect } from 'react';
import { Check, X, ChevronDown, ChevronUp, Zap, Images, BookmarkCheck, Gauge, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { initiateRazorpayPayment, isRazorpayConfigured } from '../utils/razorpay';

interface PricingCardProps {
  name: string;
  price: string;
  generations: string;
  description: string;
  features: { name: string; included: boolean }[];
  highlighted?: boolean;
  isFree?: boolean;
  isContactPlan?: boolean;
  onSubscribe?: () => void;
  isLoading?: boolean;
}

function PricingCard({ name, price, generations, description, features, highlighted, isFree, isContactPlan, onSubscribe, isLoading }: PricingCardProps) {
  return (
    <div className={`relative bg-white dark:bg-gray-900 border-2 ${highlighted
      ? 'border-purple-600 shadow-xl scale-105'
      : 'border-gray-200 dark:border-gray-800'
      } rounded-2xl p-8 flex flex-col`}>
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm">
          Most Popular
        </div>
      )}

      <div className="mb-6">
        <h3 className="mb-2">{name}</h3>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl">{price}</span>
          {!isFree && !isContactPlan && <span className="text-gray-500 dark:text-gray-400">/ month</span>}
        </div>
        <p className="text-purple-600 dark:text-purple-400">{generations}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{description}</p>
      </div>

      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            {feature.included ? (
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 text-gray-300 dark:text-gray-700 flex-shrink-0 mt-0.5" />
            )}
            <span className={feature.included ? '' : 'text-gray-400 dark:text-gray-600'}>
              {feature.name}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={!isFree && !isContactPlan ? onSubscribe : undefined}
        disabled={isLoading}
        className={`w-full py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 ${highlighted
          ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl disabled:opacity-70'
          : isFree
            ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
            : 'border-2 border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 disabled:opacity-70'
          }`}>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isFree ? 'Start Free' : isContactPlan ? 'Contact Us' : isLoading ? 'Processing...' : 'Subscribe with Razorpay'}
      </button>
    </div>
  );
}

function ComparisonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            <th className="text-left py-4 px-4">Feature</th>
            <th className="text-center py-4 px-4">Free Trial</th>
            <th className="text-center py-4 px-4 bg-purple-50 dark:bg-purple-900/10">Pro</th>
            <th className="text-center py-4 px-4">Corporate</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            <td className="py-4 px-4">Monthly generations</td>
            <td className="text-center py-4 px-4">10</td>
            <td className="text-center py-4 px-4 bg-purple-50 dark:bg-purple-900/10">100</td>
            <td className="text-center py-4 px-4">Custom</td>
          </tr>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            <td className="py-4 px-4">PNG downloads</td>
            <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
            <td className="text-center py-4 px-4 bg-purple-50 dark:bg-purple-900/10"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
            <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
          </tr>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            <td className="py-4 px-4">Auto-save library</td>
            <td className="text-center py-4 px-4"><X className="w-5 h-5 text-gray-300 dark:text-gray-700 mx-auto" /></td>
            <td className="text-center py-4 px-4 bg-purple-50 dark:bg-purple-900/10"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
            <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
          </tr>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            <td className="py-4 px-4">Reference model reuse</td>
            <td className="text-center py-4 px-4"><X className="w-5 h-5 text-gray-300 dark:text-gray-700 mx-auto" /></td>
            <td className="text-center py-4 px-4 bg-purple-50 dark:bg-purple-900/10"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
            <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
          </tr>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            <td className="py-4 px-4">Batch processing</td>
            <td className="text-center py-4 px-4"><X className="w-5 h-5 text-gray-300 dark:text-gray-700 mx-auto" /></td>
            <td className="text-center py-4 px-4 bg-purple-50 dark:bg-purple-900/10"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
            <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
          </tr>
          <tr>
            <td className="py-4 px-4">Priority speed</td>
            <td className="text-center py-4 px-4"><X className="w-5 h-5 text-gray-300 dark:text-gray-700 mx-auto" /></td>
            <td className="text-center py-4 px-4 bg-purple-50 dark:bg-purple-900/10"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
            <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 px-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
      >
        <span className="pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-5 text-gray-600 dark:text-gray-400">
          {answer}
        </div>
      )}
    </div>
  );
}

export function Pricing() {
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  // Lock body scroll when payment modal is open
  useEffect(() => {
    if (isPaymentLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isPaymentLoading]);

  const plans = [
    {
      name: 'Free Trial',
      price: '₹0',
      generations: '10 generations',
      description: 'Perfect for testing the platform',
      features: [
        { name: 'PNG downloads', included: true },
        { name: 'Auto-save library', included: false },
        { name: 'Reference model reuse', included: false },
        { name: 'Priority speed', included: false },
        { name: 'Batch processing', included: false },
      ],
      isFree: true,
    },
    {
      name: 'Pro',
      price: '₹999',
      generations: '100 generations/month',
      description: 'For high-volume e-commerce',
      features: [
        { name: 'PNG downloads', included: true },
        { name: 'Auto-save library', included: true },
        { name: 'Reference model reuse', included: true },
        { name: 'Priority speed', included: true },
        { name: 'Batch processing', included: true },
      ],
      highlighted: true,
    },
    {
      name: 'Corporate',
      price: 'Contact Us',
      generations: 'Custom generations',
      description: 'Tailored solutions for large enterprises',
      features: [
        { name: 'Unlimited generations', included: true },
        { name: 'Dedicated support', included: true },
        { name: 'Custom integrations', included: true },
        { name: 'Team management', included: true },
        { name: 'Priority processing', included: true },
      ],
      isContactPlan: true,
    },
  ];

  const faqs = [
    {
      question: 'How do generation credits work?',
      answer: 'Each time you generate a product photo, one credit is deducted from your monthly allowance. Credits reset on your billing date and do not roll over to the next month.',
    },
    {
      question: 'Can I use generated images commercially?',
      answer: 'Yes! All images generated with a paid plan (Pro) come with full commercial usage rights. You own the outputs and can use them in your e-commerce listings, marketing, and advertisements.',
    },
    {
      question: 'What is your refund policy?',
      answer: 'We offer a 7-day money-back guarantee on your first subscription. If you are not satisfied with the results, contact our support team within 7 days of purchase for a full refund. Subsequent months are non-refundable.',
    },
    {
      question: 'What image quality and resolution do I get?',
      answer: 'All plans provide high-resolution PNG exports at 2048x2048 pixels, perfect for e-commerce platforms, print materials, and social media. Images are optimized for web use while maintaining studio-quality detail.',
    },
    {
      question: 'How does reference model reuse work?',
      answer: 'With the Pro plan, you can save your favorite AI models and reuse them across multiple products. This ensures consistency in your product catalog and speeds up your workflow significantly.',
    },
    {
      question: 'What is included in the Corporate plan?',
      answer: 'The Corporate plan is designed for enterprises with high-volume needs. It includes unlimited generations, dedicated support, custom integrations, and team management features. Contact us for a custom quote tailored to your specific requirements.',
    },
  ];

  // Handle Razorpay payment for Pro plan
  const handleProSubscription = () => {
    if (!isRazorpayConfigured) {
      toast.error('Payment gateway not configured. Please contact support.');
      return;
    }

    setIsPaymentLoading(true);

    initiateRazorpayPayment({
      planId: 'pro',
      onSuccess: (response) => {
        setIsPaymentLoading(false);
        toast.success('Payment successful! Activating your Pro subscription...', {
          description: `Payment ID: ${response.razorpay_payment_id}`,
        });
        // TODO: Call backend to verify payment and activate subscription
        console.log('Payment successful:', response);
      },
      onFailure: (error) => {
        setIsPaymentLoading(false);
        toast.error('Payment failed', {
          description: error,
        });
      },
      onDismiss: () => {
        setIsPaymentLoading(false);
      },
    });
  };
  return (
    <div>
      {/* Pricing Hero */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the plan that fits your business. All plans include PNG downloads and studio-quality outputs.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <PricingCard
                key={index}
                {...plan}
                onSubscribe={plan.highlighted ? handleProSubscription : undefined}
                isLoading={plan.highlighted ? isPaymentLoading : false}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Images className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mb-2">PNG Downloads</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                High-res 2048px exports
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookmarkCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-2">Auto-save Library</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All generations backed up
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mb-2">Model Reuse</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Save and reuse favorites
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Gauge className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="mb-2">Priority Speed</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                3x faster on Pro plan
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-4">Compare plans</h2>
            <p className="text-gray-600 dark:text-gray-400">
              See what's included in each plan
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
            <ComparisonTable />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-4">Frequently asked questions</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Everything you need to know about our pricing
            </p>
          </div>
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA - Sticky on Mobile */}
      <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 p-4 lg:hidden shadow-lg z-40">
        <div className="flex gap-3">
          <button className="flex-1 py-3 px-6 border-2 border-purple-600 text-purple-600 dark:text-purple-400 rounded-lg">
            Start Free
          </button>
          <button className="flex-1 py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}