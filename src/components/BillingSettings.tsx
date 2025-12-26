import { useState, useEffect } from 'react';
import { Coins, Download, Calendar, Check, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useCredits } from '../hooks/useCredits';
import { initiateCreditPackPayment, initiateRazorpayPayment, isRazorpayConfigured, CREDIT_PACKS } from '../utils/razorpay';
import { supabase } from '../utils/supabase';

interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: string;
  credits: number;
}

export function BillingSettings() {
  const credits = useCredits();
  const [isPaymentLoading, setIsPaymentLoading] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');
  const [promoCode, setPromoCode] = useState<string>('');
  const [isRedeemingCode, setIsRedeemingCode] = useState<boolean>(false);

  // Fetch user email for Razorpay prefill
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    fetchUser();
  }, []);

  // Fetch transaction history
  useEffect(() => {
    const fetchTransactions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setTransactions(data.map((t: any) => ({
          id: t.id,
          date: new Date(t.created_at),
          description: t.description,
          amount: t.amount_display,
          credits: t.credits_added,
        })));
      }
    };
    fetchTransactions();
  }, [credits.creditsTotal]);

  // Lock body scroll when payment modal is open
  useEffect(() => {
    if (isPaymentLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPaymentLoading]);

  const plans = [
    {
      id: 'free',
      name: 'Free Trial',
      price: '₹0',
      credits: 10,
      features: ['10 generations', 'Basic models', 'Standard quality', 'No ref model support'],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '₹999',
      credits: 100,
      features: ['100 generations', 'All models', 'Ultra quality (4x details)', 'Priority support', 'Batch processing'],
      popular: true,
    },
    {
      id: 'corporate',
      name: 'Corporate',
      price: 'Contact Us',
      credits: 'Custom',
      features: ['Unlimited generations', 'All models', 'Ultra quality', 'Dedicated support', 'Batch processing', 'Custom integrations', 'Team management'],
      isContactPlan: true,
    },
  ];

  const creditPacks = [
    {
      id: 'pack-10' as const,
      credits: 10,
      price: '₹100',
      pricePerCredit: '₹10',
    },
    {
      id: 'pack-25' as const,
      credits: 25,
      price: '₹200',
      pricePerCredit: '₹8',
      popular: true,
    },
  ];

  const handleUpgrade = (planId: string) => {
    if (planId === 'pro') {
      if (!isRazorpayConfigured) {
        toast.error('Payment gateway not configured');
        return;
      }

      setIsPaymentLoading('pro');

      initiateRazorpayPayment({
        planId: 'pro',
        userEmail,
        onSuccess: async (response) => {
          // Upgrade user to Pro
          const success = await credits.upgradeToPro();
          if (success) {
            await credits.logTransaction('subscription', '₹999', 100, 'Pro Plan Subscription');
            toast.success('Welcome to Pro! Your subscription is active.', {
              description: `Payment ID: ${response.razorpay_payment_id}`,
            });
          }
          setIsPaymentLoading(null);
        },
        onFailure: (error) => {
          toast.error('Payment failed', { description: error });
          setIsPaymentLoading(null);
        },
        onDismiss: () => setIsPaymentLoading(null),
      });
    } else if (planId === 'corporate') {
      window.location.href = 'mailto:support@outfitai.studio?subject=Corporate%20Plan%20Inquiry';
    }
  };

  const handleBuyCredits = (packId: 'pack-10' | 'pack-25') => {
    if (!credits.canPurchaseCredits) {
      toast.error('Upgrade to Pro to purchase extra credits');
      return;
    }

    if (!isRazorpayConfigured) {
      toast.error('Payment gateway not configured');
      return;
    }

    setIsPaymentLoading(packId);

    initiateCreditPackPayment({
      packId,
      userEmail,
      onSuccess: async (response, creditsToAdd) => {
        const success = await credits.addCredits(creditsToAdd);
        if (success) {
          const pack = CREDIT_PACKS[packId];
          await credits.logTransaction(
            'credit_pack',
            `₹${pack.amount / 100}`,
            creditsToAdd,
            `${creditsToAdd} Credits Pack`
          );
          toast.success(`${creditsToAdd} credits added to your account!`, {
            description: `Payment ID: ${response.razorpay_payment_id}`,
          });
        }
        setIsPaymentLoading(null);
      },
      onFailure: (error) => {
        toast.error('Payment failed', { description: error });
        setIsPaymentLoading(null);
      },
      onDismiss: () => setIsPaymentLoading(null),
    });
  };

  const downloadInvoice = (id: string) => {
    toast.success('Invoice downloaded');
  };

  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleRedeemCode = async () => {
    console.log('🎟️ Promo code button clicked, code:', promoCode);
    setFeedbackMessage(null); // Clear previous message

    if (!promoCode.trim()) {
      console.log('❌ Empty code, returning');
      return;
    }

    setIsRedeemingCode(true);
    console.log('🔄 Calling redeemPromoCode...');
    const result = await credits.redeemPromoCode(promoCode);
    console.log('📦 Result:', result);
    setIsRedeemingCode(false);

    if (result.success) {
      console.log('✅ Success, showing toast');
      toast.success(result.message);
      setFeedbackMessage({ type: 'success', text: result.message });
      setPromoCode(''); // Clear input on success
    } else {
      console.log('❌ Failed, showing error toast');
      toast.error(result.message);
      setFeedbackMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-8">
      {/* Current Plan */}
      <div>
        <h1 className="text-2xl sm:text-3xl mb-6">Billing & Credits</h1>

        <div className={`rounded-2xl p-6 ${credits.planTier === 'pro'
          ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
          : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 text-gray-900 dark:text-white'
          }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <div>
              <p className={`text-sm mb-1 ${credits.planTier === 'pro' ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}`}>Current Plan</p>
              <h2 className={`text-2xl font-bold capitalize ${credits.planTier === 'pro' ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{credits.planTier}</h2>
            </div>
            <div className="mt-4 sm:mt-0 text-right">
              <p className={`text-3xl font-bold ${credits.planTier === 'pro' ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{credits.planTier === 'pro' ? '₹999' : '₹0'}</p>
              <p className={`text-sm ${credits.planTier === 'pro' ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}`}>{credits.planTier === 'pro' ? 'per month' : 'Free tier'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`backdrop-blur-sm rounded-lg p-4 ${credits.planTier === 'pro'
              ? 'bg-white/10'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}>
              <div className="flex items-center gap-2 mb-2">
                <Coins className={`w-5 h-5 ${credits.planTier === 'pro' ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
                <p className={`text-sm ${credits.planTier === 'pro' ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}`}>Credits Remaining</p>
              </div>
              <p className={`text-2xl font-bold ${credits.planTier === 'pro' ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{credits.creditsRemaining}</p>
            </div>
            <div className={`backdrop-blur-sm rounded-lg p-4 ${credits.planTier === 'pro'
              ? 'bg-white/10'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className={`w-5 h-5 ${credits.planTier === 'pro' ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
                <p className={`text-sm ${credits.planTier === 'pro' ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}`}>{credits.planTier === 'pro' ? 'Renewal Date' : 'Plan Type'}</p>
              </div>
              <p className={`text-lg font-semibold ${credits.planTier === 'pro' ? 'text-white' : 'text-gray-800 dark:text-white'}`}>
                {credits.renewalDate
                  ? credits.renewalDate.toLocaleDateString()
                  : credits.planTier === 'free' ? 'One-time credits' : 'N/A'}
              </p>
            </div>
          </div>

          <div className={`backdrop-blur-sm rounded-lg p-3 ${credits.planTier === 'pro'
            ? 'bg-white/10'
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            }`}>
            <div className={`flex items-center justify-between text-sm mb-2 ${credits.planTier === 'pro' ? 'text-white/80' : 'text-gray-700 dark:text-gray-300'}`}>
              <span>Usage: {credits.creditsUsed} / {credits.creditsTotal} credits</span>
              <span className={`font-medium ${credits.planTier === 'pro' ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`}>{credits.creditsTotal > 0 ? Math.round((credits.creditsUsed / credits.creditsTotal) * 100) : 0}%</span>
            </div>
            <div className={`w-full rounded-full h-2 ${credits.planTier === 'pro'
              ? 'bg-white/20'
              : 'bg-gray-900/10 dark:bg-white/20'
              }`}>
              <div
                className={`rounded-full h-2 transition-all ${credits.planTier === 'pro'
                  ? 'bg-white'
                  : 'bg-purple-600'
                  }`}
                style={{ width: `${credits.creditsTotal > 0 ? (credits.creditsUsed / credits.creditsTotal) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h2 className="text-xl sm:text-2xl mb-4">Upgrade Your Plan</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Choose the plan that works best for you
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-gray-900 border rounded-xl p-6 transition-all ${plan.popular
                ? 'border-purple-600 dark:border-purple-600 shadow-xl'
                : 'border-gray-200 dark:border-gray-800 hover:border-purple-600 dark:hover:border-purple-600'
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="mb-2">{plan.name}</h3>
                <div className="mb-1">
                  <span className="text-3xl">{plan.price}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {plan.credits} generations
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={plan.id === credits.planTier || isPaymentLoading === 'pro'}
                className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${plan.id === credits.planTier
                  ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg disabled:opacity-70'
                  }`}
              >
                {isPaymentLoading === 'pro' && plan.id === 'pro' && <Loader2 className="w-4 h-4 animate-spin" />}
                {plan.id === credits.planTier ? 'Current Plan' : plan.isContactPlan ? 'Contact Us' : isPaymentLoading === 'pro' && plan.id === 'pro' ? 'Processing...' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Credit Packs - Only for Pro subscribers */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl sm:text-2xl">Add More Credits</h2>
          {!credits.canPurchaseCredits && (
            <span className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-600 dark:text-gray-400">
              <Lock className="w-3 h-3" />
              Pro Only
            </span>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {credits.canPurchaseCredits
            ? 'Purchase additional credits for your account'
            : 'Upgrade to Pro to purchase extra generation credits'}
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {creditPacks.map(pack => (
            <div
              key={pack.id}
              className={`relative bg-white dark:bg-gray-900 border rounded-xl p-6 transition-all ${!credits.canPurchaseCredits
                ? 'opacity-60 border-gray-200 dark:border-gray-800'
                : pack.popular
                  ? 'border-purple-600 dark:border-purple-600 shadow-xl'
                  : 'border-gray-200 dark:border-gray-800 hover:border-purple-600 dark:hover:border-purple-600'
                }`}
            >
              {pack.popular && credits.canPurchaseCredits && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="mb-2">{pack.credits} Credits</h3>
                <div className="mb-1">
                  <span className="text-3xl">{pack.price}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {pack.pricePerCredit} per credit
                </p>
              </div>

              <button
                onClick={() => handleBuyCredits(pack.id)}
                disabled={!credits.canPurchaseCredits || isPaymentLoading === pack.id}
                className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${!credits.canPurchaseCredits
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg disabled:opacity-70'
                  }`}
              >
                {isPaymentLoading === pack.id && <Loader2 className="w-4 h-4 animate-spin" />}
                {!credits.canPurchaseCredits ? 'Upgrade to Pro' : isPaymentLoading === pack.id ? 'Processing...' : 'Add Credits'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Promo Code */}
      <div>
        <h2 className="text-xl sm:text-2xl mb-4">Redeem Promo Code</h2>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Have a promo code? Enter it below to get free credits.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Enter code (e.g., LAUNCH50)"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all uppercase"
              disabled={isRedeemingCode}
            />
            <button
              onClick={handleRedeemCode}
              disabled={!promoCode.trim() || isRedeemingCode}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isRedeemingCode && <Loader2 className="w-4 h-4 animate-spin" />}
              {isRedeemingCode ? 'Applying...' : 'Apply Code'}
            </button>
          </div>
          {feedbackMessage && (
            <div className={`mt-3 text-sm flex items-center gap-2 ${feedbackMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
              {feedbackMessage.type === 'success' ? (
                <Check className="w-4 h-4" />
              ) : (
                <div className="w-4 h-4 flex items-center justify-center font-bold">!</div>
              )}
              {feedbackMessage.text}
            </div>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-xl sm:text-2xl mb-4">Transaction History</h2>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm">Date</th>
                  <th className="px-6 py-3 text-left text-sm">Description</th>
                  <th className="px-6 py-3 text-left text-sm">Credits</th>
                  <th className="px-6 py-3 text-left text-sm">Amount</th>
                  <th className="px-6 py-3 text-left text-sm">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {transactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm">
                      {transaction.date.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      +{transaction.credits}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {transaction.amount}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => downloadInvoice(transaction.id)}
                        className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}