import { useState, useEffect, ReactNode } from 'react';
import { 
  Wand2, 
  Image as ImageIcon, 
  CreditCard, 
  Settings, 
  User, 
  LogOut, 
  Moon, 
  Sun,
  Menu,
  X,
  Coins
} from 'lucide-react';
import logoImage from 'figma:asset/fa30442f6b440cc9bfcc8b76b43cb2346b823708.png';

interface AuthenticatedLayoutProps {
  children: ReactNode;
  currentView: 'generate' | 'library' | 'billing' | 'settings' | 'account';
  onViewChange: (view: 'generate' | 'library' | 'billing' | 'settings' | 'account') => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export function AuthenticatedLayout({
  children,
  currentView,
  onViewChange,
  onLogout,
  isDark,
  onToggleDark,
}: AuthenticatedLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const creditsRemaining = 87;

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const sidebarItems = [
    { id: 'generate' as const, label: 'Generate', icon: Wand2 },
    { id: 'library' as const, label: 'Library', icon: ImageIcon },
    { id: 'billing' as const, label: 'Billing', icon: CreditCard },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  const mobileNavItems = [
    { id: 'generate' as const, label: 'Generate', icon: Wand2 },
    { id: 'library' as const, label: 'Library', icon: ImageIcon },
    { id: 'account' as const, label: 'Account', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
      {/* Desktop: Top Bar */}
      <div className="hidden lg:block sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src={logoImage} 
              alt="Outfit AI Studio"
              className="h-24 w-auto dark:invert dark:hue-rotate-180 transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Credits Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Coins className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm">
                <span className="text-purple-600 dark:text-purple-400">{creditsRemaining}</span>
                {' '}credits
              </span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={onToggleDark}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl py-2">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                    <p className="text-sm">Sarah Johnson</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">sarah@example.com</p>
                  </div>
                  <button
                    onClick={() => {
                      onViewChange('settings');
                      setProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-2 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Top Bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 h-14 flex items-center justify-between">
          <img 
            src={logoImage} 
            alt="Outfit AI Studio"
            className="h-16 w-auto dark:invert dark:hue-rotate-180 transition-all"
          />

          <div className="flex items-center gap-2">
            {/* Credits Badge */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Coins className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span className="text-xs">
                <span className="text-purple-600 dark:text-purple-400">{creditsRemaining}</span>
              </span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={onToggleDark}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Desktop: Left Sidebar */}
        <aside className="hidden lg:block w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
          <nav className="p-4 space-y-2">
            {sidebarItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile: Bottom Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-3">
          {mobileNavItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex flex-col items-center gap-1 py-3 transition-all ${
                  isActive
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
