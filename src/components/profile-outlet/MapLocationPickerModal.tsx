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
  ChevronRight,
  ChevronDown,
  Store,
  MapPinned,
  Sparkles,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';

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

export interface LocationOption {
  id: string;
  title: string;
  subtitle: string;
  fullAddress: string;
  lat: number;
  lng: number;
  type?: string;
  category: 'place' | 'road' | 'building' | 'city';
}

// Popular quick Indonesian city / area chips like Google Maps quick exploration
const POPULAR_AREAS = [
  'Jakarta Selatan',
  'Jakarta Pusat',
  'Bandung',
  'Surabaya',
  'Tangerang',
  'Bekasi',
  'Semarang',
  'Bali',
];

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

  // Selected address state
  const [mainPlaceName, setMainPlaceName] = useState<string>('');
  const [detailedAddress, setDetailedAddress] = useState<string>(initialAddress);
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [isEditingAddressManually, setIsEditingAddressManually] = useState(false);

  // Search & Google Maps-style Options state
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState<LocationOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);

  // Map drag & geocode states
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
    setShowOptionsPanel(false);
    setOptions([]);
    setSearchQuery('');
    setAdditionalNotes('');
    setIsEditingAddressManually(false);
    setSelectedOptionId(null);
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
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

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

  // Reverse geocoding using Nominatim OpenStreetMap
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

  // Initialize Leaflet map with fixed center pin UX (Google Maps / Shopee style)
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || !isOpen) return;

    const L = (window as any).L;
    if (!L) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 16,
        zoomControl: false,
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

      // Map move listeners for center pin UX
      map.on('movestart', () => {
        setIsDraggingMap(true);
      });

      map.on('moveend', () => {
        setIsDraggingMap(false);
        const center = map.getCenter();
        setCoords({ lat: center.lat, lng: center.lng });
        fetchReverseGeocode(center.lat, center.lng);
      });

      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    } else {
      mapInstanceRef.current.setView([coords.lat, coords.lng], 16);
    }
  }, [mapLoaded, isOpen, fetchReverseGeocode]);

  // Fetch search options from Nominatim with Photon fallback
  const fetchLocationOptions = async (query: string): Promise<LocationOption[]> => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const results: LocationOption[] = [];

    // 1. Primary: Nominatim OpenStreetMap (formatted Indonesian address details)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          trimmed
        )}&countrycodes=id&limit=8&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'id-ID,id;q=0.9',
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          data.forEach((item: any, idx: number) => {
            const addr = item.address || {};
            const parts = item.display_name.split(',');
            const title =
              item.name ||
              addr.amenity ||
              addr.shop ||
              addr.building ||
              addr.road ||
              parts[0];
            const subtitle = parts.slice(1, 4).join(',').trim();

            let category: 'place' | 'road' | 'building' | 'city' = 'place';
            if (item.class === 'highway' || item.type === 'residential') category = 'road';
            else if (item.class === 'building' || addr.building) category = 'building';
            else if (item.class === 'place' || item.type === 'city') category = 'city';

            results.push({
              id: `nom-${item.place_id || idx}`,
              title,
              subtitle: subtitle || item.display_name,
              fullAddress: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              type: item.type || item.class,
              category,
            });
          });
          return results;
        }
      }
    } catch (err) {
      console.warn('Nominatim options query failed, trying Photon...', err);
    }

    // 2. Fallback: Photon Komoot API (fast autocomplete engine)
    try {
      const resPhoton = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=8`
      );

      if (resPhoton.ok) {
        const dataPhoton = await resPhoton.json();
        if (dataPhoton?.features && Array.isArray(dataPhoton.features)) {
          dataPhoton.features.forEach((feat: any, idx: number) => {
            const p = feat.properties || {};
            const [lng, lat] = feat.geometry?.coordinates || [DEFAULT_LNG, DEFAULT_LAT];
            const title = p.name || p.street || p.city || 'Titik Lokasi';
            const subtitleParts = [p.district, p.city, p.state, p.country].filter(Boolean);

            results.push({
              id: `pho-${p.osm_id || idx}`,
              title,
              subtitle: subtitleParts.join(', ') || title,
              fullAddress: `${title}, ${subtitleParts.join(', ')}`,
              lat,
              lng,
              type: p.osm_value || p.osm_key,
              category: p.osm_key === 'highway' ? 'road' : 'building',
            });
          });
        }
      }
    } catch (err) {
      console.warn('Photon options query failed:', err);
    }

    return results;
  };

  // Live Autocomplete on typing (debounced 350ms)
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setLocationError(null);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!val.trim() || val.trim().length < 2) {
      setOptions([]);
      setShowOptionsPanel(false);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      const found = await fetchLocationOptions(val);
      setOptions(found);
      setShowOptionsPanel(found.length > 0);
      setIsSearching(false);
    }, 350);
  };

  // Submit search query (e.g., press Enter or click button)
  const handleSearchSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = customQuery || searchQuery;
    if (!query.trim()) return;

    try {
      setIsSearching(true);
      setLocationError(null);
      const found = await fetchLocationOptions(query);
      setOptions(found);

      if (found.length > 0) {
        setShowOptionsPanel(true);
        // Automatically focus map on the first top match as default
        handleSelectOption(found[0], false);
      } else {
        setLocationError(
          'Tidak ditemukan pilihan alamat yang cocok. Coba ketik nama jalan, kota, atau perumahan lain.'
        );
      }
    } catch (err) {
      console.error('Search submit error:', err);
      setLocationError('Gagal mencari opsi alamat. Periksa koneksi internet Anda.');
    } finally {
      setIsSearching(false);
    }
  };

  // Select one of the Google Maps-style options
  const handleSelectOption = (item: LocationOption, closePanel: boolean = true) => {
    setSelectedOptionId(item.id);
    setCoords({ lat: item.lat, lng: item.lng });
    setMainPlaceName(item.title);
    setDetailedAddress(item.fullAddress);

    if (closePanel) {
      setShowOptionsPanel(false);
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([item.lat, item.lng], 17, {
        duration: 1.2,
      });
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

  // Confirm selection
  const handleConfirm = () => {
    const generatedMapsUrl = `https://www.google.com/maps?q=${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;

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

  // Helper icon for each option category
  const renderOptionIcon = (category: LocationOption['category']) => {
    switch (category) {
      case 'building':
        return <Building2 className="size-4" />;
      case 'road':
        return <Navigation className="size-4" />;
      case 'city':
        return <Compass className="size-4" />;
      default:
        return <Store className="size-4" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      className="max-w-3xl"
      title="Tentukan Pinpoint Alamat Outlet"
      subtitle="Cari dan pilih opsi lokasi seperti Google Maps, lalu geser peta untuk mencocokkan pin tepat di outlet Anda"
    >
      <div className="space-y-3.5 relative">
        {/* Google Maps-style Search Bar */}
        <div className="relative z-30 space-y-2">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={() => {
                  if (options.length > 0) setShowOptionsPanel(true);
                }}
                placeholder="Cari jalan, gedung, perumahan, atau landmark (contoh: Senopati, Grand Indonesia)..."
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-neutral-300 bg-white text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#FF5C38] focus:ring-2 focus:ring-[#FF5C38]/20 shadow-xs transition-all"
              />
              <Search className="size-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setOptions([]);
                    setShowOptionsPanel(false);
                    setSelectedOptionId(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2.5 rounded-2xl bg-[#FF5C38] hover:bg-[#E04B28] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isSearching ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Search className="size-3.5" />
              )}
              <span>Cari</span>
            </button>
          </form>

          {/* Quick Popular City Chips (Shown when search is empty) */}
          {!searchQuery && options.length === 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none text-neutral-500">
              <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1 shrink-0">
                <Sparkles className="size-3 text-[#FF5C38]" />
                Area Populer:
              </span>
              {POPULAR_AREAS.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setSearchQuery(city);
                    handleSearchSubmit(undefined, city);
                  }}
                  className="px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-orange-50 hover:text-[#FF5C38] text-[11px] font-medium text-neutral-700 transition-colors shrink-0 cursor-pointer border border-neutral-200/60"
                >
                  {city}
                </button>
              ))}
            </div>
          )}

          {/* Google Maps-style Options Tray / Dropdown Card */}
          {showOptionsPanel && options.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden z-40 max-h-[290px] flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header: Option Count & Dismiss */}
              <div className="px-3.5 py-2.5 bg-neutral-50/80 border-b border-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-800">
                <div className="flex items-center gap-1.5">
                  <MapPinned className="size-3.5 text-[#FF5C38]" />
                  <span>Pilihan Lokasi Ditemukan ({options.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOptionsPanel(false)}
                  className="text-[11px] text-neutral-400 hover:text-neutral-700 flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Tutup</span>
                  <ChevronDown className="size-3" />
                </button>
              </div>

              {/* Options List */}
              <div className="overflow-y-auto divide-y divide-neutral-100 p-1">
                {options.map((item) => {
                  const isSelected = selectedOptionId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectOption(item, true)}
                      className={`w-full p-2.5 rounded-xl text-left flex items-start justify-between gap-3 transition-colors cursor-pointer group ${
                        isSelected ? 'bg-orange-50/90' : 'hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className={`size-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isSelected
                              ? 'bg-[#FF5C38] text-white shadow-xs'
                              : 'bg-orange-50 text-[#FF5C38] group-hover:bg-[#FF5C38] group-hover:text-white'
                          }`}
                        >
                          {renderOptionIcon(item.category)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p
                              className={`text-xs font-bold truncate transition-colors ${
                                isSelected
                                  ? 'text-[#FF5C38]'
                                  : 'text-neutral-900 group-hover:text-[#FF5C38]'
                              }`}
                            >
                              {item.title}
                            </p>
                            <span className="px-1.5 py-0.2 rounded-md bg-neutral-100 text-[9.5px] font-medium text-neutral-500 uppercase tracking-wide">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[#FF5C38] text-xs font-bold shrink-0 self-center pl-2">
                        <span className="text-[11px] hidden sm:inline">Pilih</span>
                        <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Floating Quick Action Pill if Options exist but panel is closed */}
        {!showOptionsPanel && options.length > 0 && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-orange-50/70 border border-orange-200/80 text-xs text-[#FF5C38]">
            <div className="flex items-center gap-1.5 font-bold truncate">
              <Check className="size-3.5 stroke-[3]" />
              <span className="truncate">Opsi Terpilih: {mainPlaceName}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowOptionsPanel(true)}
              className="text-[11px] font-bold text-[#FF5C38] hover:text-[#E04B28] hover:underline cursor-pointer shrink-0 ml-2"
            >
              Ganti Pilihan ({options.length} opsi)
            </button>
          </div>
        )}

        {/* Error message banner */}
        {locationError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span className="flex-1">{locationError}</span>
            <button
              type="button"
              onClick={() => setLocationError(null)}
              className="text-red-500 hover:text-red-700 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {/* Interactive Map Viewport with Center Pin UX */}
        <div className="relative w-full h-[320px] sm:h-[360px] rounded-2xl border border-neutral-200 overflow-hidden bg-neutral-100 shadow-inner group">
          <div ref={mapContainerRef} className="size-full z-0 cursor-grab active:cursor-grabbing" />

          {/* Loader when Leaflet is initializing */}
          {!mapLoaded && (
            <div className="absolute inset-0 bg-white/85 backdrop-blur-2xs flex flex-col items-center justify-center gap-2 z-10">
              <Loader2 className="size-7 text-[#FF5C38] animate-spin" />
              <span className="text-xs text-neutral-500 font-medium">Memuat peta...</span>
            </div>
          )}

          {/* Top Instruction Pill */}
          <div className="absolute top-3 inset-x-0 flex justify-center z-20 pointer-events-none">
            <div className="px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-xs font-semibold text-neutral-800 shadow-md border border-neutral-200/80 flex items-center gap-2">
              <Compass className="size-3.5 text-[#FF5C38] animate-pulse" />
              <span>Geser peta untuk menyesuaikan titik lokasi</span>
            </div>
          </div>

          {/* Animated Center Pin */}
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div className="relative flex flex-col items-center">
              {/* Tooltip bubble above Pin */}
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

              {/* Pin SVG Marker */}
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

          {/* Floating 'Lokasi Saya' GPS Button */}
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

        {/* Bottom Address Detail Card */}
        <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs space-y-3">
          {/* Row 1: Location Badge & Address */}
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

          {/* Row 2: Detail Tambahan / Patokan */}
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

          {/* Row 3: Prominent Confirm Action Button */}
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
