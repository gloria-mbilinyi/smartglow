import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  LogOut,
  AlertCircle,
  CheckCircle,
  PackageCheck,
  Sliders,
  ChevronRight,
  Clock,
  Heart,
} from 'lucide-react';
import {
  UserProfile,
  OrderRecord,
  loginCustomer,
  registerCustomer,
  updateSkinPreferences,
  getUserOrders,
  getPersonalizedRecommendations,
} from '../services/api';
import { Product } from '../types/store';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  authToken: string | null;
  onAuthSuccess: (token: string, user: UserProfile) => void;
  onLogout: () => void;
  onAddToCart: (product: Product) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  authToken,
  onAuthSuccess,
  onLogout,
  onAddToCart,
}) => {
  // Tabs: auth (when logged out), profile, orders, recommendations (when logged in)
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'recommendations' | 'auth'>('profile');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login / Register Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Skin Profile Form State
  const [skinType, setSkinType] = useState('All');
  const [skinConcerns, setSkinConcerns] = useState<string[]>([]);
  const [sensitivityLevel, setSensitivityLevel] = useState('Moderate');
  const [allergenInput, setAllergenInput] = useState('');
  const [knownAllergens, setKnownAllergens] = useState<string[]>([]);
  const [preferredRoutine, setPreferredRoutine] = useState('Clean Botanical');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSavedNotice, setProfileSavedNotice] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Recommendations State
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  // Sync current user state into local form
  useEffect(() => {
    if (currentUser) {
      setSkinType(currentUser.skinType || 'All');
      setSkinConcerns(currentUser.skinConcerns || []);
      setSensitivityLevel(currentUser.sensitivityLevel || 'Moderate');
      setKnownAllergens(currentUser.knownAllergens || []);
      setPreferredRoutine(currentUser.preferredRoutine || 'Clean Botanical');
    }
  }, [currentUser]);

  // Load orders and recommendations when tab changes and token exists
  useEffect(() => {
    if (!authToken || !currentUser) return;

    if (activeTab === 'orders') {
      setOrdersLoading(true);
      getUserOrders(authToken)
        .then((data) => setOrders(data))
        .finally(() => setOrdersLoading(false));
    } else if (activeTab === 'recommendations') {
      setRecommendationsLoading(true);
      getPersonalizedRecommendations(authToken)
        .then((data) => setRecommendations(data))
        .finally(() => setRecommendationsLoading(false));
    }
  }, [activeTab, authToken, currentUser]);

  if (!isOpen) return null;

  // Handle Login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const result = await loginCustomer(email, password);
      onAuthSuccess(result.accessToken, result.user);
      setActiveTab('profile');
    } catch (err: any) {
      setAuthError(err.message || 'Login failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Registration submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const result = await registerCustomer(email, password, fullName, phone || undefined);
      onAuthSuccess(result.accessToken, result.user);
      setActiveTab('profile');
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Quick Demo Logins
  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setAuthError(null);
    setAuthLoading(true);
    loginCustomer(demoEmail, demoPass)
      .then((res) => {
        onAuthSuccess(res.accessToken, res.user);
        setActiveTab('profile');
      })
      .catch((err) => {
        setAuthError(err.message || 'Demo login failed.');
      })
      .finally(() => setAuthLoading(false));
  };

  // Toggle skin concern
  const toggleConcern = (concern: string) => {
    setSkinConcerns((prev) =>
      prev.includes(concern) ? prev.filter((c) => c !== concern) : [...prev, concern]
    );
  };

  // Allergen management
  const handleAddAllergen = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (allergenInput.trim() && !knownAllergens.includes(allergenInput.trim())) {
      setKnownAllergens([...knownAllergens, allergenInput.trim()]);
      setAllergenInput('');
    }
  };

  const handleRemoveAllergen = (item: string) => {
    setKnownAllergens(knownAllergens.filter((a) => a !== item));
  };

  // Save Skin Preferences
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    setProfileSaving(true);
    setProfileSavedNotice(false);
    try {
      const updated = await updateSkinPreferences(authToken, {
        skinType,
        skinConcerns,
        sensitivityLevel,
        knownAllergens,
        preferredRoutine,
      });
      onAuthSuccess(authToken, updated);
      setProfileSavedNotice(true);
      setTimeout(() => setProfileSavedNotice(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Could not save preferences');
    } finally {
      setProfileSaving(false);
    }
  };

  const AVAILABLE_CONCERNS = [
    'Acne & Blemishes',
    'Fine Lines & Aging',
    'Dark Spots & Hyperpigmentation',
    'Dryness & Dehydration',
    'Redness & Sensitivity',
    'Dullness',
    'Uneven Texture',
    'Enlarged Pores',
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#faf9f6] rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200/80 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-800">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 id="account-modal-title" className="font-display text-lg font-bold text-stone-900 leading-tight">
                {currentUser ? `Account: ${currentUser.fullName}` : 'SmartGlow Customer Account'}
              </h2>
              <p className="text-[11px] text-stone-500">
                {currentUser
                  ? `${currentUser.email} · ${currentUser.role === 'admin' ? 'Administrator' : 'Verified Customer'}`
                  : 'Sign in to access your skin profile, order history, and formulations'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (If logged in) */}
        {currentUser ? (
          <div className="flex border-b border-stone-200 bg-stone-100/70 text-xs font-semibold px-4 pt-2 gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-2.5 px-3 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-stone-900 text-stone-950'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Skin Profile & Preferences</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-2.5 px-3 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'border-stone-900 text-stone-950'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Order History</span>
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`pb-2.5 px-3 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'recommendations'
                  ? 'border-stone-900 text-stone-950'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Matches</span>
            </button>
            <div className="ml-auto flex items-center pb-2">
              <button
                onClick={onLogout}
                className="text-stone-500 hover:text-rose-700 text-[11px] font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Body Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* LOGGED OUT VIEW: SIGN IN / REGISTER */}
          {!currentUser && (
            <div className="space-y-6">
              {/* Quick Demo Logins Bar */}
              <div className="p-4 bg-stone-100 rounded-xl border border-stone-200">
                <p className="text-xs font-semibold text-stone-800 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>One-Click Verified Demo Access:</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => handleQuickLogin('customer@smartglow.com', 'Password123!')}
                    disabled={authLoading}
                    className="p-2.5 bg-white border border-stone-300 rounded-lg text-left hover:border-stone-500 hover:bg-stone-50 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <div className="font-semibold text-stone-900">Demo Customer</div>
                    <div className="text-[11px] text-stone-500 font-mono">customer@smartglow.com</div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">Preset skin profile & active orders</div>
                  </button>
                  <button
                    onClick={() => handleQuickLogin('admin@smartglow-admin.internal', 'AdminPassword123!')}
                    disabled={authLoading}
                    className="p-2.5 bg-white border border-stone-300 rounded-lg text-left hover:border-stone-500 hover:bg-stone-50 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <div className="font-semibold text-stone-900">Demo Administrator</div>
                    <div className="text-[11px] text-stone-500 font-mono">admin@smartglow-admin.internal</div>
                    <div className="text-[10px] text-amber-700 mt-0.5">Inventory stock controls & orders</div>
                  </button>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="flex border-b border-stone-200 pb-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError(null);
                  }}
                  className={`text-sm font-semibold cursor-pointer ${
                    authMode === 'login' ? 'text-stone-900 border-b-2 border-stone-900 pb-1' : 'text-stone-500'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError(null);
                  }}
                  className={`text-sm font-semibold cursor-pointer ${
                    authMode === 'register' ? 'text-stone-900 border-b-2 border-stone-900 pb-1' : 'text-stone-500'
                  }`}
                >
                  Create New Account
                </button>
              </div>

              {/* Error Alert */}
              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Form */}
              {authMode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. customer@smartglow.com"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-stone-900 text-stone-50 rounded-lg font-semibold tracking-wider uppercase hover:bg-stone-800 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {authLoading ? 'Authenticating...' : 'Sign In to SmartGlow'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. maya.lin@example.com"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Create Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-stone-900 text-stone-50 rounded-lg font-semibold tracking-wider uppercase hover:bg-stone-800 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {authLoading ? 'Registering Account...' : 'Create Account'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 1: SKIN PROFILE & PREFERENCES */}
          {currentUser && activeTab === 'profile' && (
            <form onSubmit={handleSavePreferences} className="space-y-6 text-xs">
              {profileSavedNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Skin profile preferences saved successfully.</span>
                </div>
              )}

              {/* Skin Type */}
              <div>
                <label className="block font-semibold text-stone-800 mb-2">Primary Skin Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {['All', 'Dry', 'Oily', 'Combination', 'Sensitive'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSkinType(type)}
                      className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer font-medium ${
                        skinType === type
                          ? 'border-stone-900 bg-stone-900 text-stone-50'
                          : 'border-stone-300 bg-white text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skin Concerns */}
              <div>
                <label className="block font-semibold text-stone-800 mb-2">Target Skin Concerns</label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_CONCERNS.map((concern) => {
                    const isChecked = skinConcerns.includes(concern);
                    return (
                      <button
                        key={concern}
                        type="button"
                        onClick={() => toggleConcern(concern)}
                        className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'border-stone-800 bg-stone-100 text-stone-900 font-semibold'
                            : 'border-stone-300 bg-white text-stone-600 hover:border-stone-400'
                        }`}
                      >
                        <span>{concern}</span>
                        {isChecked && <CheckCircle className="w-3.5 h-3.5 text-stone-900" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sensitivity & Preferred Routine */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Sensitivity Tolerance</label>
                  <select
                    value={sensitivityLevel}
                    onChange={(e) => setSensitivityLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500"
                  >
                    <option value="Low">Low (Tolerates strong actives)</option>
                    <option value="Moderate">Moderate (Balanced)</option>
                    <option value="High">High (Reactive, prone to redness)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Preferred Routine</label>
                  <select
                    value={preferredRoutine}
                    onChange={(e) => setPreferredRoutine(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500"
                  >
                    <option value="Clean Botanical">Clean Botanical & Gentle</option>
                    <option value="Minimalist Hydration">Minimalist Hydration (2-3 steps)</option>
                    <option value="Active Anti-Aging">Active High-Performance Anti-Aging</option>
                    <option value="Barrier Repair">Barrier Recovery & Soothing</option>
                  </select>
                </div>
              </div>

              {/* Known Allergens */}
              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Known Allergens or Excluded Ingredients
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={allergenInput}
                    onChange={(e) => setAllergenInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAllergen(e);
                      }
                    }}
                    placeholder="e.g. Fragrance, Essential Oils, Gluten"
                    className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddAllergen}
                    className="px-4 py-2 bg-stone-200 text-stone-800 rounded-lg hover:bg-stone-300 transition-colors cursor-pointer font-medium"
                  >
                    Add
                  </button>
                </div>
                {knownAllergens.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {knownAllergens.map((allergen) => (
                      <span
                        key={allergen}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-800 rounded-md text-[11px]"
                      >
                        <span>{allergen}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAllergen(allergen)}
                          className="hover:text-rose-950 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={profileSaving}
                className="w-full py-3 bg-stone-900 text-stone-50 rounded-lg font-semibold tracking-wider uppercase hover:bg-stone-800 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {profileSaving ? 'Saving Preferences...' : 'Save Profile Preferences'}
              </button>
            </form>
          )}

          {/* TAB 2: ORDER HISTORY */}
          {currentUser && activeTab === 'orders' && (
            <div className="space-y-4">
              {ordersLoading ? (
                <div className="py-12 text-center text-stone-500 text-xs">Loading order history...</div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <PackageCheck className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="text-sm font-semibold text-stone-800">No previous orders</p>
                  <p className="text-xs text-stone-500">
                    Your completed orders and delivery tracking will appear here.
                  </p>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <div>
                        <span className="font-mono-num font-bold text-xs text-stone-900">
                          {order.orderNumber}
                        </span>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                            order.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'processing'
                              ? 'bg-amber-100 text-amber-800'
                              : order.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-stone-200 text-stone-800'
                          }`}
                        >
                          {order.status}
                        </span>
                        <div className="font-mono-num font-bold text-xs text-stone-900 mt-1">
                          ${order.totalAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-1.5 text-xs">
                      {order.items.map((it) => (
                        <div key={it.id} className="flex justify-between text-stone-700">
                          <span className="truncate pr-2">
                            {it.productName} <span className="text-stone-400">×{it.quantity}</span>
                          </span>
                          <span className="font-mono-num font-medium text-stone-900 shrink-0">
                            ${it.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-100 flex justify-between">
                      <span>Delivery: {order.deliveryAddress}, {order.city}</span>
                      <span className="font-medium text-stone-700">{order.paymentMethod}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: PERSONALIZED RECOMMENDATIONS */}
          {currentUser && activeTab === 'recommendations' && (
            <div className="space-y-4">
              <div className="p-3 bg-stone-100 rounded-lg text-xs text-stone-700">
                <span>Recommendations calibrated for: </span>
                <strong className="text-stone-900">
                  {currentUser.skinType} skin &middot;{' '}
                  {currentUser.skinConcerns.length > 0
                    ? currentUser.skinConcerns.join(', ')
                    : 'Universal Hydration'}
                </strong>
              </div>

              {recommendationsLoading ? (
                <div className="py-12 text-center text-stone-500 text-xs">
                  Analyzing formulation compatibility...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendations.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white border border-stone-200 rounded-xl p-3 flex gap-3 items-center hover:border-stone-400 transition-colors"
                    >
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-14 h-14 rounded-lg object-cover shrink-0 bg-stone-100"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs text-stone-900 truncate">
                          {prod.name}
                        </div>
                        <div className="text-[11px] text-stone-500 line-clamp-1">
                          {prod.subtitle}
                        </div>
                        <div className="font-mono-num font-bold text-xs text-stone-900 mt-1">
                          ${prod.price.toFixed(2)}
                        </div>
                      </div>
                      <button
                        onClick={() => onAddToCart(prod)}
                        className="px-3 py-1.5 bg-stone-900 text-stone-50 text-[11px] font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
