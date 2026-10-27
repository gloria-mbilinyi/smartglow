import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, CheckCircle2, Truck } from 'lucide-react';
import { CartItem } from '../types/store';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'confirmed'>('cart');
  const [formData, setFormData] = useState({
    name: 'Gloria Mbilinyi',
    phone: '+1 (555) 234-5678',
    address: '450 Sunset Boulevard, Suite 12',
    city: 'Los Angeles',
    postalCode: '90028',
    paymentMethod: 'Cash on Delivery / Direct Handover',
  });
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>('');

  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 60.0;
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = items.length === 0 || isFreeShipping ? 0.0 : 6.0;
  const total = subtotal + shippingCost;
  const progressToFreeShipping = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const orderNum = 'SG-' + Math.floor(100000 + Math.random() * 900000);
    setConfirmedOrderId(orderNum);
    setCheckoutStep('confirmed');
  };

  const handleReset = () => {
    onClearCart();
    setCheckoutStep('cart');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-title"
      className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className="w-screen max-w-md bg-[#faf9f6] shadow-2xl border-l border-stone-200 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-stone-800" />
              <h2 id="cart-title" className="font-display text-lg font-semibold text-stone-900">
                {checkoutStep === 'cart' && 'Your Shopping Bag'}
                {checkoutStep === 'checkout' && 'Express Checkout (Cash on Delivery)'}
                {checkoutStep === 'confirmed' && 'Order Confirmed'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          {checkoutStep === 'cart' && items.length > 0 && (
            <div className="bg-stone-100 px-5 py-3 border-b border-stone-200/70 text-xs">
              <div className="flex items-center justify-between mb-1 text-stone-700">
                <span className="flex items-center gap-1 font-medium">
                  <Truck className="w-3.5 h-3.5 text-stone-600" />
                  {isFreeShipping ? (
                    <span className="text-emerald-700 font-semibold">
                      You unlocked complimentary delivery!
                    </span>
                  ) : (
                    <span>
                      Add ${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free delivery
                    </span>
                  )}
                </span>
                <span className="font-mono-num font-semibold">{progressToFreeShipping.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    isFreeShipping ? 'bg-emerald-600' : 'bg-stone-800'
                  }`}
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>
          )}

          {/* Step 1: Cart Items List */}
          {checkoutStep === 'cart' && (
            <>
              <div className="flex-1 overflow-y-auto p-5 divide-y divide-stone-200">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-display text-lg font-medium text-stone-800">Your bag is empty</p>
                      <p className="text-xs text-stone-500 max-w-xs">
                        Explore our botanical formulations and find your personalized skincare match.
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="px-5 py-2.5 bg-stone-900 text-stone-50 rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.product.id} className="py-4 flex gap-4 items-start">
                      <div className="w-18 h-18 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                            aria-label={`Remove ${item.product.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-[11px] text-stone-500">{item.product.volume}</p>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center border border-stone-300 rounded bg-white">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 font-mono-num text-xs font-semibold text-stone-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                              disabled={item.quantity >= item.product.stockCount}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-mono-num text-xs font-bold text-stone-900">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Footer */}
              {items.length > 0 && (
                <div className="p-5 border-t border-stone-200 bg-white space-y-3">
                  <div className="space-y-1.5 text-xs text-stone-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono-num font-medium text-stone-900">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span className="font-mono-num font-medium text-stone-900">
                        {isFreeShipping ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-100">
                      <span>Estimated Total</span>
                      <span className="font-mono-num text-base">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCheckoutStep('checkout')}
                    className="w-full py-3.5 px-4 bg-stone-900 text-stone-50 rounded-lg text-xs font-semibold tracking-wider uppercase hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-[11px] text-stone-400 text-center">
                    Taxes calculated at delivery &middot; Safe demo checkout
                  </p>
                </div>
              )}
            </>
          )}

          {/* Step 2: Checkout Form (Cash On Delivery) */}
          {checkoutStep === 'checkout' && (
            <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-5 flex flex-col justify-between">
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-amber-900 leading-relaxed">
                  <strong>Cash on Delivery:</strong> Pay in person upon receiving your delivery parcel. Please confirm your delivery destination.
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Postal Code</label>
                      <input
                        type="text"
                        required
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200">
                  <div className="flex justify-between text-xs text-stone-600 mb-1">
                    <span>Items Total ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                    <span className="font-mono-num font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-stone-600 mb-1">
                    <span>Shipping</span>
                    <span className="font-mono-num font-medium">
                      {isFreeShipping ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-100">
                    <span>Amount Due on Delivery</span>
                    <span className="font-mono-num text-base">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-stone-200 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="px-4 py-3 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-stone-900 text-stone-50 rounded-lg text-xs font-semibold tracking-wider uppercase hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
                >
                  Confirm Order &middot; ${total.toFixed(2)}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Order Confirmation */}
          {checkoutStep === 'confirmed' && (
            <div className="flex-1 p-6 flex flex-col justify-between items-center text-center">
              <div className="space-y-4 my-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl font-bold text-stone-900">
                  Order Confirmed!
                </h3>
                <p className="text-xs text-stone-500">
                  Thank you, <strong className="text-stone-800">{formData.name}</strong>. Your SmartGlow formulation parcel has been scheduled for dispatch.
                </p>

                <div className="bg-stone-100 p-4 rounded-xl border border-stone-200 text-left text-xs space-y-2">
                  <div className="flex justify-between border-b border-stone-200 pb-2">
                    <span className="text-stone-500">Order Reference:</span>
                    <strong className="font-mono-num text-stone-900">{confirmedOrderId}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Payment:</span>
                    <span className="text-stone-800 font-medium">Cash on Delivery</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Total Payable:</span>
                    <strong className="font-mono-num text-stone-900">${total.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-stone-200 text-[11px] text-stone-500">
                    <span>Destination:</span>
                    <span className="text-right truncate max-w-[180px]">{formData.address}, {formData.city}</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-[11px] text-amber-900">
                  A verification SMS/call will be sent prior to delivery rider handover.
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-3 bg-stone-900 text-stone-50 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Continue Browsing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
