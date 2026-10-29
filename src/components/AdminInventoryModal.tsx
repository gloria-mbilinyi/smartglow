import React, { useState, useEffect } from 'react';
import {
  X,
  Warehouse,
  AlertTriangle,
  RefreshCw,
  Save,
  CheckCircle,
  Package,
  Check,
} from 'lucide-react';
import {
  InventoryOverview,
  InventoryItem,
  getAdminInventory,
  updateAdminStock,
} from '../services/api';

interface AdminInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminToken: string;
}

export const AdminInventoryModal: React.FC<AdminInventoryModalProps> = ({
  isOpen,
  onClose,
  adminToken,
}) => {
  const [overview, setOverview] = useState<InventoryOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Local draft values for edited stock and price
  const [drafts, setDrafts] = useState<
    Record<string, { stockCount: number; price: number; isActive: boolean }>
  >({});

  const loadInventory = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await getAdminInventory(adminToken);
      setOverview(data);
      const initialDrafts: Record<
        string,
        { stockCount: number; price: number; isActive: boolean }
      > = {};
      data.items.forEach((item) => {
        initialDrafts[item.id] = {
          stockCount: item.stockCount,
          price: item.price,
          isActive: item.isActive,
        };
      });
      setDrafts(initialDrafts);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load administrator inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && adminToken) {
      loadInventory();
    }
  }, [isOpen, adminToken]);

  if (!isOpen) return null;

  const handleDraftChange = (
    id: string,
    field: 'stockCount' | 'price' | 'isActive',
    val: any
  ) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: val,
      },
    }));
  };

  const handleSaveItem = async (item: InventoryItem) => {
    const draft = drafts[item.id];
    if (!draft) return;
    setSavingId(item.id);
    setErrorMsg(null);
    try {
      const updated = await updateAdminStock(
        adminToken,
        item.id,
        draft.stockCount,
        draft.price,
        draft.isActive
      );
      setOverview((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          items: prev.items.map((i) => (i.id === item.id ? updated : i)),
          lowStockCount: prev.items.reduce(
            (acc, i) =>
              acc + (i.id === item.id ? (updated.isLowStock ? 1 : 0) : i.isLowStock ? 1 : 0),
            0
          ),
        };
      });
      setSuccessId(item.id);
      setTimeout(() => setSuccessId(null), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not update item stock');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#faf9f6] rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200/80 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <h2 id="admin-modal-title" className="font-display text-lg font-bold text-stone-900">
                Warehouse & Inventory Control
              </h2>
              <p className="text-[11px] text-stone-500">
                Live FastAPI backend catalog management &middot; Real-time replenishment controls
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadInventory}
              disabled={loading}
              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              title="Refresh inventory"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        {overview && (
          <div className="grid grid-cols-3 border-b border-stone-200 bg-stone-100/70 p-4 gap-4 text-center">
            <div className="bg-white p-3 rounded-xl border border-stone-200">
              <div className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                Total SKUs
              </div>
              <div className="font-mono-num text-xl font-bold text-stone-900 mt-1">
                {overview.totalProducts}
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-stone-200">
              <div className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                Active Listed
              </div>
              <div className="font-mono-num text-xl font-bold text-emerald-700 mt-1">
                {overview.activeProducts}
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-stone-200">
              <div className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                Low Stock Alerts (&lt; 25)
              </div>
              <div
                className={`font-mono-num text-xl font-bold mt-1 ${
                  overview.lowStockCount > 0 ? 'text-amber-700' : 'text-stone-700'
                }`}
              >
                {overview.lowStockCount}
              </div>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading && !overview ? (
            <div className="py-16 text-center text-xs text-stone-500">
              Querying warehouse inventory...
            </div>
          ) : overview && overview.items.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-500">
              No products found in warehouse.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Product Name</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Stock Units</th>
                    <th className="pb-3 font-semibold">Price ($)</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {overview?.items.map((item) => {
                    const draft = drafts[item.id] || {
                      stockCount: item.stockCount,
                      price: item.price,
                      isActive: item.isActive,
                    };
                    const isSaving = savingId === item.id;
                    const isSuccess = successId === item.id;

                    return (
                      <tr key={item.id} className="hover:bg-white/60 transition-colors">
                        <td className="py-3 pr-2">
                          <div className="font-semibold text-stone-900">{item.name}</div>
                          <div className="text-[10px] text-stone-400 font-mono">{item.id}</div>
                        </td>
                        <td className="py-3 pr-2 text-stone-600">{item.categoryName}</td>
                        <td className="py-3 pr-2">
                          <input
                            type="number"
                            min={0}
                            value={draft.stockCount}
                            onChange={(e) =>
                              handleDraftChange(
                                item.id,
                                'stockCount',
                                Math.max(0, parseInt(e.target.value) || 0)
                              )
                            }
                            className="w-20 px-2 py-1 bg-white border border-stone-300 rounded font-mono-num font-medium text-stone-900 focus:outline-none focus:border-stone-500"
                          />
                        </td>
                        <td className="py-3 pr-2">
                          <div className="flex items-center">
                            <span className="text-stone-400 mr-1">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min={0}
                              value={draft.price}
                              onChange={(e) =>
                                handleDraftChange(
                                  item.id,
                                  'price',
                                  Math.max(0, parseFloat(e.target.value) || 0)
                                )
                              }
                              className="w-20 px-2 py-1 bg-white border border-stone-300 rounded font-mono-num font-medium text-stone-900 focus:outline-none focus:border-stone-500"
                            />
                          </div>
                        </td>
                        <td className="py-3 pr-2">
                          {draft.stockCount === 0 ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                              Out of Stock
                            </span>
                          ) : draft.stockCount < 25 ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                              Low Stock ({draft.stockCount})
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleSaveItem(item)}
                            disabled={isSaving}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shadow-xs ${
                              isSuccess
                                ? 'bg-emerald-600 text-white'
                                : 'bg-stone-900 text-stone-50 hover:bg-stone-800'
                            }`}
                          >
                            {isSaving ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : isSuccess ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Save className="w-3 h-3" />
                            )}
                            <span>{isSuccess ? 'Updated' : 'Save'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
