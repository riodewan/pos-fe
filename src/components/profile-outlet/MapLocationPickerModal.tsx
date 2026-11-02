'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin,
  Search,
  Crosshair,
  Loader2,
  Check,
  AlertCircle,
  X,
  Compass,
  Edit3,
  Building2,
  Navigation,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';

interface MapLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAddress?: string;
  initialMapsUrl?: string;
  onSelectLocation: (data: {
    address: string;
    mapsUrl: string;
    lat: number;
    lng: number;
    notes?: string;
  }) => void;
}

interface SearchSuggestion {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  type?: string;
}

// Default fallback coordinate: Jakarta Pusat / Senopati area
const DEFAULT_LAT = -6.2297;
const DEFAULT_LNG = 106.8099;

export function MapLocationPickerModal({
  isOpen,
  onClose,
  initialAddress = '',
  initialMapsUrl = '',
  onSelectLocation,
}: MapLocationPickerModalProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
  });

  // Shopee-style separated address details
  const [mainPlaceName, setMainPlaceName] = useState<string>('');
  const [detailedAddress, setDetailedAddress] = useState<string>(initialAddress);
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [isEditingAddressManually, setIsEditingAddressManually] = useState(false);

  // Search & Suggestions states
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);

  // Map state
  const [isDraggingMap, setIsDraggingMap] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Parse initial coordinates from mapsUrl or fallback
  useEffect(() => {
    if (!isOpen) return;

    let initLat = DEFAULT_LAT;
    let initLng = DEFAULT_LNG;

    if (initialMapsUrl) {
      const match = initialMapsUrl.match(/(?:q=|@|=)?(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
      if (match) {
        const parsedLat = parseFloat(match[1]);
        const parsedLng = parseFloat(match[2]);
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          initLat = parsedLat;
          initLng = parsedLng;
        }
      }
    }

    setCoords({ lat: initLat, lng: initLng });
    setDetailedAddress(initialAddress);
    setMainPlaceName(initialAddress ? initialAddress.split(',')[0] : 'Lokasi Terpilih');
    setLocationError(null);
    setShowSuggestionsDropdown(false);
    setSuggestions([]);
    setSearchQuery('');
    setAdditionalNotes('');
    setIsEditingAddressManually(false);
  }, [isOpen, initialMapsUrl, initialAddress]);

  // Load Leaflet dynamically via CDN scripts when modal is open
  useEffect(() => {
    if (!isOpen) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      setMapLoaded(false);
      return;
    }

    const loadLeaflet = async () => {
      // 1. Ensure CSS is loaded
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // 2. Ensure JS is loaded
      if (!(window as any).L) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.id = 'leaflet-js';
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Leaflet script'));
          document.head.appendChild(script);
        });
      }

      setMapLoaded(true);
    };

    loadLeaflet().catch((err) => {
      console.error(err);
      setLocationError('Gagal memuat modul peta. Periksa koneksi internet Anda.');
    });
  }, [isOpen]);

  // Reverse geocoding using Nominatim OpenStreetMap (Shopee style parsing)
  const fetchReverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      setIsReverseGeocoding(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'id-ID,id;q=0.9',
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.display_name) {
          const addr = data.address || {};
          const placeTitle =
            data.name ||
            addr.amenity ||
            addr.shop ||
            addr.building ||
            addr.road ||
            addr.suburb ||
            'Titik Lokasi Terpilih';

          setMainPlaceName(placeTitle);
          setDetailedAddress(data.display_name);
        }
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  // Initialize Leaflet map with fixed center pin UX (Shopee style)
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || !isOpen) return;

    const L = (window as any).L;
    if (!L) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 16,
        zoomControl: false, // Custom placed zoom controls
      });

      L.control
        .zoom({
          position: 'topright',
        })
        .addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap kontributor',
      }).addTo(map);

      // Shopee Map Behavior:
      // When dragging starts, elevate the center pin
      map.on('movestart', () => {
        setIsDraggingMap(true);
      });

      // When dragging finishes, settle center pin and reverse geocode
      map.on('moveend', () => {
        setIsDraggingMap(false);
        const center = map.getCenter();
        setCoords({ lat: center.lat, lng: center.lng });
        fetchReverseGeocode(center.lat, center.lng);
      });

      mapInstanceRef.current = map;

      // Invalidate size once modal has animated open
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    } else {
      mapInstanceRef.current.setView([coords.lat, coords.lng], 16);
    }
  }, [mapLoaded, isOpen, fetchReverseGeocode]);

  // Live Autocomplete Suggestions (Debounced)
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!val.trim() || val.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestionsDropdown(false);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      try {
        setIsSearchingSuggestions(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            val.trim()
          )}&countrycodes=id&limit=5&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'id-ID,id;q=0.9',
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setSuggestions(data);
            setShowSuggestionsDropdown(data.length > 0);
          }
        }
      } catch (err) {
        console.warn('Suggestions error:', err);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 350);
  };

  // Select a suggestion: fly map smoothly to the location
  const handleSelectSuggestion = (item: SearchSuggestion) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    setCoords({ lat, lng });
    setMainPlaceName(item.name || item.display_name.split(',')[0]);
    setDetailedAddress(item.display_name);
    setSearchQuery('');
    setShowSuggestionsDropdown(false);
    setSuggestions([]);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 17, {
        duration: 1.2,
      });
    }
  };

  // Submit manual search query (press Enter)
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearchingSuggestions(true);
      setLocationError(null);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim()
        )}&countrycodes=id&limit=1&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'id-ID,id;q=0.9',
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          handleSelectSuggestion(data[0]);
        } else {
          setLocationError('Lokasi tidak ditemukan. Coba ketik nama jalan, gedung, atau area lain.');
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setLocationError('Gagal mencari lokasi. Periksa koneksi internet Anda.');
    } finally {
      setIsSearchingSuggestions(false);
    }
  };

  // Get current device GPS location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Perangkat Anda tidak mendukung fitur lokasi GPS.');
      return;
    }

    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 17, {
            duration: 1.2,
          });
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocationError('Izin akses lokasi ditolak. Aktifkan izin lokasi browser Anda.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Confirm selection (combine address with optional landmark/patokan)
  const handleConfirm = () => {
    const generatedMapsUrl = `https://www.google.com/maps?q=${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;

    // Build final combined address
    let finalAddress = detailedAddress.trim() || initialAddress;
    if (additionalNotes.trim()) {
      finalAddress = `${finalAddress} (${additionalNotes.trim()})`;
    }

    onSelectLocation({
      address: finalAddress,
      mapsUrl: generatedMapsUrl,
      lat: coords.lat,
      lng: coords.lng,
      notes: additionalNotes.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      className="max-w-3xl"
      title="Tentukan Pinpoint Alamat Outlet"
      subtitle="Geser peta untuk mencocokkan pin tepat di lokasi outlet Anda (seperti di aplikasi Shopee)"
    >
      <div className="space-y-3.5 relative">
        {/* Shopee-style Search Bar with Dropdown Suggestions */}
        <div className="relative z-30">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestionsDropdown(true);
                }}
                placeholder="Cari nama jalan, gedung, perumahan, atau landmark..."
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-neutral-300 bg-white text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#FF5C38] focus:ring-2 focus:ring-[#FF5C38]/20 shadow-xs transition-all"
              />
              <Search className="size-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    setShowSuggestionsDropdown(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {isSearchingSuggestions && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2">
                <Loader2 className="size-4 animate-spin text-[#FF5C38]" />
              </div>
            )}
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestionsDropdown && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-neutral-200/90 shadow-xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-neutral-100 animate-in fade-in slide-in-from-top-1 duration-150">
              {suggestions.map((item) => {
                const parts = item.display_name.split(',');
                const title = item.name || parts[0];
                const subtitle = parts.slice(1).join(',').trim();

                return (
                  <button
                    key={item.place_id}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full p-3 text-left hover:bg-orange-50/50 flex items-start gap-3 transition-colors cursor-pointer group"
                  >
                    <div className="size-8 rounded-xl bg-orange-50 text-[#FF5C38] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#FF5C38] group-hover:text-white transition-colors">
                      <MapPin className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-neutral-900 group-hover:text-[#FF5C38] transition-colors truncate">
                        {title}
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                        {subtitle || item.display_name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Error message pill */}
        {locationError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span className="flex-1">{locationError}</span>
            <button
              type="button"
              onClick={() => setLocationError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {/* Shopee-style Interactive Map Viewport with Fixed Center Pin */}
        <div className="relative w-full h-[330px] sm:h-[370px] rounded-2xl border border-neutral-200 overflow-hidden bg-neutral-100 shadow-inner group">
          <div ref={mapContainerRef} className="size-full z-0 cursor-grab active:cursor-grabbing" />

          {/* Loader when Leaflet is initializing */}
          {!mapLoaded && (
            <div className="absolute inset-0 bg-white/85 backdrop-blur-2xs flex flex-col items-center justify-center gap-2 z-10">
              <Loader2 className="size-7 text-[#FF5C38] animate-spin" />
              <span className="text-xs text-neutral-500 font-medium">Memuat peta...</span>
            </div>
          )}

          {/* Top Instruction Pill (Shopee style) */}
          <div className="absolute top-3 inset-x-0 flex justify-center z-20 pointer-events-none">
            <div className="px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-xs font-semibold text-neutral-800 shadow-md border border-neutral-200/80 flex items-center gap-2">
              <Compass className="size-3.5 text-[#FF5C38] animate-pulse" />
              <span>Geser peta untuk menentukan titik lokasi</span>
            </div>
          </div>

          {/* Shopee-style Fixed Animated Center Pin */}
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div className="relative flex flex-col items-center">
              {/* Dynamic Speech Bubble Tooltip over Pin */}
              <div
                className={`mb-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-white shadow-lg whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                  isDraggingMap
                    ? 'bg-[#FF5C38] scale-105 -translate-y-2'
                    : 'bg-neutral-900/85 scale-100 translate-y-0'
                }`}
              >
                {isDraggingMap ? (
                  <span>Lepas untuk menandai titik</span>
                ) : isReverseGeocoding ? (
                  <>
                    <Loader2 className="size-3 animate-spin text-white" />
                    <span>Mendeteksi alamat...</span>
                  </>
                ) : (
                  <span>Titik Outlet Anda</span>
                )}
              </div>

              {/* Center Pin SVG Marker */}
              <div
                className={`transition-transform duration-200 ease-out origin-bottom ${
                  isDraggingMap ? '-translate-y-3 scale-110' : 'translate-y-0 scale-100'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <svg
                    width="40"
                    height="48"
                    viewBox="0 0 40 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-[0_8px_14px_rgba(255,92,56,0.45)]"
                  >
                    <path
                      d="M20 0C8.954 0 0 8.954 0 20C0 32.5 17.5 46.5 19.167 47.787C19.664 48.171 20.336 48.171 20.833 47.787C22.5 46.5 40 32.5 40 20C40 8.954 31.046 0 20 0Z"
                      fill="#FF5C38"
                    />
                    <circle cx="20" cy="19" r="8" fill="white" />
                    <circle cx="20" cy="19" r="4.5" fill="#FF5C38" />
                  </svg>
                </div>
              </div>

              {/* Pin Ground Shadow */}
              <div
                className={`w-4 h-1.5 bg-neutral-900/40 rounded-full blur-[1px] transition-all duration-200 ${
                  isDraggingMap
                    ? 'scale-75 opacity-25 translate-y-1'
                    : 'scale-100 opacity-70 translate-y-0'
                }`}
              />
            </div>
          </div>

          {/* Floating 'Lokasi Saya' (GPS) Button on Map */}
          <div className="absolute bottom-4 right-4 z-20">
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              title="Gunakan lokasi saya saat ini"
              className="px-3.5 py-2.5 rounded-full bg-white hover:bg-neutral-50 text-neutral-800 hover:text-[#FF5C38] font-bold text-xs shadow-lg border border-neutral-200 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Crosshair className="size-4 text-[#FF5C38]" />
              <span className="hidden sm:inline">Lokasi Saya</span>
            </button>
          </div>
        </div>

        {/* Shopee-style Bottom Address Detail Card */}
        <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs space-y-3">
          {/* Row 1: Location Pin Badge, Main Road/Place Name, and Subtitle */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="size-10 rounded-2xl bg-orange-50 border border-orange-100 text-[#FF5C38] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                    {mainPlaceName || 'Titik Lokasi Terpilih'}
                  </h4>
                  {isReverseGeocoding && (
                    <Loader2 className="size-3 animate-spin text-[#FF5C38] shrink-0" />
                  )}
                </div>

                {!isEditingAddressManually ? (
                  <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5 leading-relaxed">
                    {detailedAddress || 'Arahkan pin pada peta untuk mendapatkan alamat lengkap...'}
                  </p>
                ) : (
                  <textarea
                    rows={2}
                    value={detailedAddress}
                    onChange={(e) => setDetailedAddress(e.target.value)}
                    placeholder="Ketik alamat lengkap manual jika diperlukan..."
                    className="w-full mt-1.5 p-2 rounded-xl border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38] resize-none"
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-[10px] font-mono text-neutral-600">
                {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </span>
              <button
                type="button"
                onClick={() => setIsEditingAddressManually(!isEditingAddressManually)}
                className="text-[11px] font-semibold text-[#FF5C38] hover:text-[#E04B28] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Edit3 className="size-3" />
                <span>{isEditingAddressManually ? 'Selesai Edit' : 'Edit Manual'}</span>
              </button>
            </div>
          </div>

          {/* Row 2: Detail Tambahan / Patokan (Shopee Landmark Input) */}
          <div className="pt-2 border-t border-neutral-100">
            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
              Detail Tambahan / Patokan (Opsional)
            </label>
            <input
              type="text"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Contoh: Ruko Blok C No. 5, sebelah minimarket / seberang pom bensin..."
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50/60 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-[#FF5C38]"
            />
          </div>

          {/* Row 3: Prominent Full-Width Confirm Action Button (Shopee Orange) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full py-3 px-4 rounded-xl bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <Check className="size-4 stroke-[3]" />
              <span>Konfirmasi Lokasi Ini</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
