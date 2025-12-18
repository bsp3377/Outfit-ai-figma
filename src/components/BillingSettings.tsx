import { CreditCard, Coins, Download, Calendar, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function BillingSettings() {
  const currentPlan = {
    name: 'Pro',
    price: '₹999',
    credits: 100,
    creditsUsed: 13,
    creditsRemaining: 87,
    renewalDate: new Date(2025, 0, 15),
  };

  const plans = [
    {
      id: 'free',
      name: 'Free Trial',
      price: '₹0',
      credits: 10,
      features: ['10 generations', 'Basic models', 'Standard quality'],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '₹999',
      credits: 100,
      features: ['100 generations', 'All models', 'Ultra quality', 'Priority support', 'Batch processing'],
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
      id: 'pack-10',
      credits: 10,
      price: '₹100',
      pricePerCredit: '₹10',
    },
    {
      id: 'pack-25',
      credits: 25,
      price: '₹200',
      pricePerCredit: '₹8',
      popular: true,
    },
  ];

  const transactions = [
    { id: '1', date: new Date(2024, 11, 15), description: 'Pro Plan Purchase', amount: '₹999', credits: 100 },
    { id: '2', date: new Date(2024, 10, 15), description: 'Pro Plan Purchase', amount: '₹999', credits: 100 },
    { id: '3', date: new Date(2024, 9, 15), description: 'Free Trial', amount: '₹0', credits: 10 },
  ];

  const handleUpgrade = (planId: string) => {
    toast.success('Redirecting to payment...', {
      description: 'You will be redirected to secure payment page',
    });
  };

  const downloadInvoice = (id: string) => {
    toast.success('Invoice downloaded');
  };

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-8">
      {/* Current Plan */}
      <div>
        <h1 className="text-2xl sm:text-3xl mb-6">Billing & Credits</h1>
        
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <div>
              <p className="text-sm text-purple-100 mb-1">Current Plan</p>
              <h2 className="text-2xl">{currentPlan.name}</h2>
            </div>
            <div className="mt-4 sm:mt-0">
              <p className="text-3xl">{currentPlan.price}</p>
              <p className="text-sm text-purple-100">per month</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-5 h-5" />
                <p className="text-sm">Credits Remaining</p>
              </div>
              <p className="text-2xl">{currentPlan.creditsRemaining}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5" />
                <p className="text-sm">Renewal Date</p>
              </div>
              <p className="text-lg">{currentPlan.renewalDate.toLocaleDateString()}</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Usage: {currentPlan.creditsUsed} / {currentPlan.credits} credits</span>
              <span>{Math.round((currentPlan.creditsUsed / currentPlan.credits) * 100)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${(currentPlan.creditsUsed / currentPlan.credits) * 100}%` }}
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
              className={`relative bg-white dark:bg-gray-900 border rounded-xl p-6 transition-all ${
                plan.popular
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
                disabled={plan.id === 'pro'}
                className={`w-full py-3 rounded-lg transition-all ${
                  plan.id === 'pro'
                    ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg'
                }`}
              >
                {plan.id === 'pro' ? 'Current Plan' : plan.isContactPlan ? 'Contact Us' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Credit Packs */}
      <div>
        <h2 className="text-xl sm:text-2xl mb-4">Credit Packs</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Add more credits to your account
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {creditPacks.map(pack => (
            <div
              key={pack.id}
              className={`relative bg-white dark:bg-gray-900 border rounded-xl p-6 transition-all ${
                pack.popular
                  ? 'border-purple-600 dark:border-purple-600 shadow-xl'
                  : 'border-gray-200 dark:border-gray-800 hover:border-purple-600 dark:hover:border-purple-600'
              }`}
            >
              {pack.popular && (
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
                onClick={() => handleUpgrade(pack.id)}
                className={`w-full py-3 rounded-lg transition-all ${
                  'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg'
                }`}
              >
                Add Credits
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <h2 className="text-xl sm:text-2xl mb-4">Payment Method</h2>
        
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="mb-1">•••• •••• •••• 4242</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expires 12/25</p>
            </div>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all text-sm">
              Update
            </button>
          </div>
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