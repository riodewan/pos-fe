'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Search,
  Crosshair,
  Loader2,
  Check,
  AlertCircle,
  ExternalLink,
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
  }) => void;
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
  const markerInstanceRef = useRef<any>(null);

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
  });
  const [resolvedAddress, setResolvedAddress] = useState(initialAddress);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Parse initial coordinates from mapsUrl if present
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
    setResolvedAddress(initialAddress);
    setLocationError(null);
  }, [isOpen, initialMapsUrl, initialAddress]);

  // Load Leaflet dynamically via CDN scripts when modal is open
  useEffect(() => {
    if (!isOpen) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
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

  // Initialize or update Leaflet map once loaded and container is ready
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || !isOpen) return;

    const L = (window as any).L;
    if (!L) return;

    // Custom orange marker icon matching NemuHUB branding
    const customIcon = L.divIcon({
      className: 'custom-pin-marker',
      html: `
        <div style="position: relative; width: 36px; height: 36px; transform: translate(-18px, -36px);">
          <div style="background-color: #FF5C38; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid #FFFFFF;">
            <div style="width: 12px; height: 12px; background-color: #FFFFFF; border-radius: 50%; transform: rotate(45deg);"></div>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 16,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap kontributor',
      }).addTo(map);

      const marker = L.marker([coords.lat, coords.lng], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      // Drag marker event
      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        setCoords({ lat: pos.lat, lng: pos.lng });
        await fetchReverseGeocode(pos.lat, pos.lng);
      });

      // Click on map to move marker
      map.on('click', async (e: any) => {
        marker.setLatLng(e.latlng);
        setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        await fetchReverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;

      // Invalidate size after modal animation
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    } else {
      mapInstanceRef.current.setView([coords.lat, coords.lng], 16);
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setLatLng([coords.lat, coords.lng]);
      }
    }
  }, [mapLoaded, isOpen]);

  // Reverse geocoding using Nominatim OpenStreetMap
  const fetchReverseGeocode = async (lat: number, lng: number) => {
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
          setResolvedAddress(data.display_name);
        }
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Search location by query
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      setLocationError(null);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim()
        )}&countrycodes=id&limit=1`,
        {
          headers: {
            'Accept-Language': 'id-ID,id;q=0.9',
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          setCoords({ lat, lng });
          setResolvedAddress(data[0].display_name);

          if (mapInstanceRef.current && markerInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 16);
            markerInstanceRef.current.setLatLng([lat, lng]);
          }
        } else {
          setLocationError('Lokasi tidak ditemukan. Coba ketik nama jalan, kota, atau area yang lebih spesifik.');
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setLocationError('Gagal mencari lokasi. Periksa koneksi internet Anda.');
    } finally {
      setIsSearching(false);
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
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });

        if (mapInstanceRef.current && markerInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 17);
          markerInstanceRef.current.setLatLng([lat, lng]);
        }
        await fetchReverseGeocode(lat, lng);
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
    onSelectLocation({
      address: resolvedAddress || initialAddress,
      mapsUrl: generatedMapsUrl,
      lat: coords.lat,
      lng: coords.lng,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pilih Titik Lokasi Outlet di Peta"
      subtitle="Klik pada peta atau geser pin merah untuk menandai posisi tepat outlet Anda."
      size="lg"
      footer={
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
            <span>Koordinat:</span>
            <span className="font-semibold text-neutral-800">
              {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </span>
          </div>
          <div className="flex items-center justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirm}
              className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold"
              leftIcon={<Check className="size-3.5" />}
            >
              Gunakan Titik Lokasi Ini
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3.5">
        {/* Search Bar & Current Location Button */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama jalan, gedung, atau area (contoh: Senopati, Jakarta Selatan)..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-[#FF5C38]"
            />
            <Search className="size-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <Button
            type="submit"
            size="sm"
            variant="outline"
            disabled={isSearching || !searchQuery.trim()}
            className="text-xs shrink-0"
          >
            {isSearching ? <Loader2 className="size-3.5 animate-spin" /> : 'Cari'}
          </Button>

          <button
            type="button"
            onClick={handleGetCurrentLocation}
            title="Gunakan lokasi saya saat ini"
            className="px-3 py-2 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <Crosshair className="size-3.5 text-[#FF5C38]" />
            <span className="hidden sm:inline">Lokasi Saya</span>
          </button>
        </form>

        {/* Error message */}
        {locationError && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{locationError}</span>
          </div>
        )}

        {/* Interactive Map Box */}
        <div className="relative w-full h-[330px] rounded-xl border border-neutral-200 overflow-hidden bg-neutral-100 shadow-inner">
          <div ref={mapContainerRef} className="size-full z-0" />

          {!mapLoaded && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-2xs flex flex-col items-center justify-center gap-2 z-10">
              <Loader2 className="size-6 text-[#FF5C38] animate-spin" />
              <span className="text-xs text-neutral-500 font-medium">Memuat peta...</span>
            </div>
          )}

          {/* Floating hint pill */}
          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
            <span className="px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[10.5px] font-semibold text-neutral-700 shadow-xs border border-neutral-200 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#FF5C38]" />
              Klik atau geser pin merah ke titik outlet
            </span>
          </div>
        </div>

        {/* Resolved Address Input / Preview */}
        <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/90 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-neutral-700 flex items-center gap-1">
              <MapPin className="size-3 text-[#FF5C38]" />
              <span>Alamat Hasil Pilihan Titik Peta</span>
            </label>
            {isReverseGeocoding && (
              <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                <Loader2 className="size-3 animate-spin text-[#FF5C38]" />
                Mendeteksi nama jalan...
              </span>
            )}
          </div>
          <textarea
            rows={2}
            value={resolvedAddress}
            onChange={(e) => setResolvedAddress(e.target.value)}
            placeholder="Alamat akan otomatis terisi saat pin digeser, atau Anda dapat melengkapinya di sini..."
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38] resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}
