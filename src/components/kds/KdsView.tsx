'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  RotateCcw,
  Check,
  AlertTriangle,
  Play,
  Volume2,
  VolumeX,
  Bell,
  Inbox,
  ChefHat,
  Sparkles,
  ShoppingBag,
  Bike,
  Utensils,
  QrCode,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { posService } from '@/services/pos.service';

export type KdsItemStatus =
  | 'MENUNGGU'
  | 'SEDANG_DISIAPKAN'
  | 'SIAP_DIANTAR'
  | 'SUDAH_DIANTAR';

export type KdsOrderStatus = 'BARU' | 'DI_PROSES' | 'SUDAH_DIANTAR';

export interface KdsItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  status: KdsItemStatus;
}

export interface KdsOrder {
  id: string;
  orderNumber: string;
  channelType: 'Delivery' | 'Dine-in' | 'Takeaway' | 'QR Order';
  channelDetail: string;
  time: string;
  timestamp: number;
  status: KdsOrderStatus;
  items: KdsItem[];
}


// Browser Audio Synthesizer for Kitchen Alert Bell
function playKitchenChime(soundType: string, volume: number) {
  if (volume <= 0 || soundType === 'Mute' || typeof window === 'undefined') return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    const normVol = Math.max(0.01, (volume / 100) * 0.25);
    gainNode.gain.setValueAtTime(normVol, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    gainNode.connect(ctx.destination);

    if (soundType === 'Ding') {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1150, now);
      osc.connect(gainNode);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (soundType === 'Chime') {
      [587.33, 739.99, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        osc.connect(gainNode);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.45);
      });
    } else {
      // Bell
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.7);
      osc.connect(gainNode);
      osc.start(now);
      osc.stop(now + 0.85);
    }
  } catch (err) {
    // Audio Context restricted or unavailable
  }
}

export function KdsView() {
  const [orders, setOrders] = useState<KdsOrder[]>([]);
  const [channelFilter, setChannelFilter] = useState('Semua channel');
  const [sortOrder, setSortOrder] = useState('Waktu Masuk Terbaru');
  const [volume, setVolume] = useState<number>(75);
  const [soundType, setSoundType] = useState<string>('Bell');

  // Fetch live KDS orders from backend on mount
  React.useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await posService.getKdsQueue();
        if (res?.data) {
          const mapped: KdsOrder[] = res.data.map((o: any) => ({
            id: o.id,
            orderNumber: o.order_number || `#ORD-${o.id.slice(-4)}`,
            channelType: (o.channel === 'DELIVERY'
              ? 'Delivery'
              : o.channel === 'TAKEAWAY'
              ? 'Takeaway'
              : o.channel === 'QR_ORDER'
              ? 'QR Order'
              : 'Dine-in') as any,
            channelDetail: o.table_name || o.customer_name || 'Kasir',
            time: o.created_at
              ? new Date(o.created_at).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '10:00',
            timestamp: o.created_at ? new Date(o.created_at).getTime() : Date.now(),
            status:
              o.status === 'READY'
                ? 'DI_PROSES'
                : o.status === 'PREPARING'
                ? 'DI_PROSES'
                : o.status === 'COMPLETED'
                ? 'SUDAH_DIANTAR'
                : 'BARU',
            items: (o.items || []).map((it: any) => ({
              id: it.id,
              name: it.product_name,
              quantity: it.quantity,
              notes: it.notes || '',
              status: (o.status === 'READY'
                ? 'SIAP_DIANTAR'
                : o.status === 'PREPARING'
                ? 'SEDANG_DISIAPKAN'
                : o.status === 'COMPLETED'
                ? 'SUDAH_DIANTAR'
                : 'MENUNGGU') as any,
            })),
          }));
          setOrders(mapped);
        }
      } catch {
        // Keep empty queue when the API is unreachable
      }
    };

    fetchQueue();
  }, []);

  // Interactive item status transition
  const handleItemAction = async (orderId: string, itemId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const updatedItems = order.items.map((item) => {
          if (item.id !== itemId) return item;

          if (item.status === 'MENUNGGU') {
            return { ...item, status: 'SEDANG_DISIAPKAN' as KdsItemStatus };
          }
          if (item.status === 'SEDANG_DISIAPKAN') {
            playKitchenChime(soundType, volume);
            return { ...item, status: 'SIAP_DIANTAR' as KdsItemStatus };
          }
          if (item.status === 'SIAP_DIANTAR') {
            return { ...item, status: 'SUDAH_DIANTAR' as KdsItemStatus };
          }
          return item;
        });

        // Derive overall order status
        const allDelivered = updatedItems.every(
          (i) => i.status === 'SUDAH_DIANTAR'
        );
        const anyActive = updatedItems.some(
          (i) => i.status === 'SEDANG_DISIAPKAN' || i.status === 'SIAP_DIANTAR'
        );

        let newStatus: KdsOrderStatus = order.status;
        if (allDelivered) {
          newStatus = 'SUDAH_DIANTAR';
          posService.updateKdsOrderStatus(orderId, 'COMPLETED').catch(() => {});
        } else if (anyActive) {
          newStatus = 'DI_PROSES';
          const anyReady = updatedItems.some((i) => i.status === 'SIAP_DIANTAR');
          posService.updateKdsOrderStatus(orderId, anyReady ? 'READY' : 'PREPARING').catch(() => {});
        }

        return {
          ...order,
          status: newStatus,
          items: updatedItems,
        };
      })
    );
  };

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (channelFilter !== 'Semua channel') {
      result = result.filter((o) => {
        if (channelFilter === 'Dine-in') return o.channelType === 'Dine-in';
        if (channelFilter === 'Takeaway') return o.channelType === 'Takeaway';
        if (channelFilter === 'ShopeeFood')
          return o.channelDetail.toLowerCase().includes('shopee');
        if (channelFilter === 'GrabFood')
          return o.channelDetail.toLowerCase().includes('grab');
        if (channelFilter === 'GoFood')
          return o.channelDetail.toLowerCase().includes('gofood');
        if (channelFilter === 'QR Order') return o.channelType === 'QR Order';
        return true;
      });
    }

    if (sortOrder === 'Waktu Masuk Terbaru') {
      result.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortOrder === 'Waktu Masuk Terlama') {
      result.sort((a, b) => a.timestamp - b.timestamp);
    }

    return result;
  }, [orders, channelFilter, sortOrder]);

  const handleTestChime = () => {
    playKitchenChime(soundType, volume);
  };



  const handleClearAll = () => {
    setOrders([]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] pb-24">
      {/* Top Page Header matching Screenshot 1 & 2 */}
      <div className="px-6 pt-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Kitchen Display System (KDS)
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Proses pesanan dengan cepat dan mudah.
          </p>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2.5">


          {/* Button: "Daftar Pesanan" matching Screenshot 1 */}
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-neutral-200/90 hover:bg-neutral-50 text-xs font-bold text-neutral-800 shadow-2xs transition-all cursor-pointer group"
          >
            {/* NEMU 4-squares icon matching Screenshot 1 */}
            <div className="grid grid-cols-2 gap-0.5 size-3.5 shrink-0">
              <span className="size-1.5 bg-[#FF5C38] rounded-xs" />
              <span className="size-1.5 bg-[#FF5C38] rounded-xs" />
              <span className="size-1.5 bg-[#FF5C38] rounded-xs" />
              <span className="size-1.5 bg-neutral-800 rounded-xs" />
            </div>
            <span>Daftar Pesanan</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-6 flex-1">
        {/* CASE 1: POPULATED ORDERS GRID (Matching Screenshot 1) */}
        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 animate-in fade-in duration-200">
            {filteredOrders.map((order) => {
              // Calculate prepared items
              const totalItems = order.items.length;
              const readyOrDelivered = order.items.filter(
                (i) => i.status === 'SIAP_DIANTAR' || i.status === 'SUDAH_DIANTAR'
              ).length;
              const progressPct =
                totalItems > 0
                  ? Math.round((readyOrDelivered / totalItems) * 100)
                  : 0;

              // Top border color based on status
              const topBorderClass =
                order.status === 'BARU'
                  ? 'border-t-4 border-t-blue-500'
                  : order.status === 'SUDAH_DIANTAR'
                  ? 'border-t-4 border-t-emerald-500'
                  : 'border-t-4 border-t-amber-400';

              const statusBadgeText =
                order.status === 'BARU'
                  ? 'Baru'
                  : order.status === 'SUDAH_DIANTAR'
                  ? 'Sudah Diantar'
                  : 'Di Proses';

              const statusBadgeColor =
                order.status === 'BARU'
                  ? 'text-blue-600'
                  : order.status === 'SUDAH_DIANTAR'
                  ? 'text-emerald-600'
                  : 'text-amber-700';

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden flex flex-col justify-between transition-all hover:shadow-xs ${topBorderClass}`}
                >
                  {/* Card Header matching Screenshot 1 */}
                  <div className="p-3.5 border-b border-neutral-100">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-neutral-900 tracking-tight">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-neutral-400 font-medium">
                        {order.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-neutral-500 font-medium truncate">
                        {order.channelType} • {order.channelDetail}
                      </span>
                      <span
                        className={`text-xs font-bold shrink-0 ${statusBadgeColor}`}
                      >
                        {statusBadgeText}
                      </span>
                    </div>
                  </div>

                  {/* Card Items List matching Screenshot 1 */}
                  <div className="p-3.5 space-y-3 flex-1">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2.5"
                      >
                        {/* Quantity Pill + Title & Notes */}
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <span className="size-6 rounded-md bg-neutral-100 text-neutral-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {item.quantity}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-neutral-900 truncate leading-snug">
                              {item.name}
                            </p>
                            {item.notes && (
                              <p className="text-[11px] text-neutral-400 truncate leading-tight">
                                {item.notes}
                              </p>
                            )}

                            {/* Status Line underneath */}
                            <div className="flex items-center gap-1.5 mt-1">
                              {item.status === 'SEDANG_DISIAPKAN' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600">
                                  <RotateCcw className="size-3 animate-spin text-sky-500" />
                                  Sedang disiapkan
                                </span>
                              )}
                              {item.status === 'MENUNGGU' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400">
                                  <Clock className="size-3 text-neutral-400" />
                                  Menunggu
                                </span>
                              )}
                              {item.status === 'SIAP_DIANTAR' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                                  <AlertTriangle className="size-3 text-amber-500" />
                                  Siap diantar
                                </span>
                              )}
                              {item.status === 'SUDAH_DIANTAR' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                                  <Check className="size-3 text-emerald-500" />
                                  Sudah Diantar
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Button matching Screenshot 1 */}
                        <div className="shrink-0">
                          {item.status === 'MENUNGGU' && (
                            <button
                              type="button"
                              onClick={() => handleItemAction(order.id, item.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-600 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                            >
                              <Play className="size-3 fill-blue-600" />
                              <span>Mulai</span>
                            </button>
                          )}

                          {item.status === 'SEDANG_DISIAPKAN' && (
                            <button
                              type="button"
                              onClick={() => handleItemAction(order.id, item.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                            >
                              <Bell className="size-3 text-amber-600" />
                              <span>Siap Diantar</span>
                            </button>
                          )}

                          {item.status === 'SIAP_DIANTAR' && (
                            <button
                              type="button"
                              onClick={() => handleItemAction(order.id, item.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                            >
                              <Check className="size-3.5 text-emerald-600 stroke-[2.5]" />
                              <span>Sudah Diantar</span>
                            </button>
                          )}

                          {item.status === 'SUDAH_DIANTAR' && (
                            <div className="size-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <Check className="size-3.5 stroke-[2.5]" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Card Bottom Progress Bar matching Screenshot 1 */}
                  <div className="px-3.5 py-3 border-t border-neutral-100 bg-white">
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium mb-1.5">
                      <span>
                        {readyOrDelivered} dari {totalItems} siap
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          progressPct === 100
                            ? 'bg-emerald-500'
                            : progressPct > 0
                            ? 'bg-amber-400'
                            : 'bg-transparent'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* CASE 2: EMPTY STATE (Matching Screenshot 2) */
          <div className="w-full bg-white rounded-2xl border border-neutral-200/90 shadow-2xs min-h-[520px] flex flex-col items-center justify-center p-8 animate-in fade-in duration-200">
            <div className="size-20 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-center text-neutral-300 mb-4 shadow-2xs">
              <Inbox className="size-10 stroke-[1.25] text-neutral-300" />
            </div>

            <h2 className="text-xs font-bold tracking-wider text-neutral-600 uppercase">
              DAPUR BELUM MENERIMA PESANAN
            </h2>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm text-center">
              Pesanan baru akan muncul di sini saat diteruskan dari kasir.
            </p>


          </div>
        )}
      </div>

      {/* Floating Bottom Control Bar matching Screenshot 1 & 2 */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        {/* Left Side: Channel Filter & Sort Dropdown */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-44 sm:w-48">
            <Select
              size="sm"
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="text-xs font-semibold bg-white"
            >
              <option value="Semua channel">Semua channel</option>
              <option value="Dine-in">Dine-in</option>
              <option value="Takeaway">Takeaway</option>
              <option value="ShopeeFood">ShopeeFood</option>
              <option value="GrabFood">GrabFood</option>
              <option value="GoFood">GoFood</option>
              <option value="QR Order">QR Order</option>
            </Select>
          </div>

          <div className="w-64 sm:w-72">
            <Select
              size="sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="text-xs font-semibold bg-white"
            >
              <option value="Waktu Masuk Terbaru">
                Urutan Masuk: Waktu Masuk Terbaru
              </option>
              <option value="Waktu Masuk Terlama">
                Urutan Masuk: Waktu Masuk Terlama
              </option>
            </Select>
          </div>
        </div>

        {/* Right Side: Volume Icon + Slider + Sound Dropdown matching Screenshot 1 */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Volume icon & slider */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setVolume(volume > 0 ? 0 : 75)}
              className="text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
              title={volume > 0 ? 'Mute' : 'Unmute'}
            >
              {volume > 0 ? (
                <Volume2 className="size-4 text-red-500" />
              ) : (
                <VolumeX className="size-4 text-neutral-400" />
              )}
            </button>

            {/* Custom Red Volume Track matching Screenshot 1 */}
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20 sm:w-24 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#FF5C38]"
            />
          </div>

          {/* Sound selector dropdown matching Screenshot 1 */}
          <div className="w-28">
            <Select
              size="sm"
              value={soundType}
              onChange={(e) => {
                setSoundType(e.target.value);
                playKitchenChime(e.target.value, volume);
              }}
              className="text-xs font-semibold bg-white"
            >
              <option value="Bell">Bell</option>
              <option value="Ding">Ding</option>
              <option value="Chime">Chime</option>
              <option value="Mute">Mute</option>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
