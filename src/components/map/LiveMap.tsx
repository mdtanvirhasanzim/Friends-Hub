import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Radio,
  Navigation,
  Battery,
  Zap,
  MapPin,
  Clock,
  Layers,
  Search,
  Users,
  Compass,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocationContext } from '../../context/LocationContext';
import { store } from '../../lib/storage';
import { UserLocation, CommunityEvent } from '../../types';
import {
  calculateDistanceKm,
  formatDistance,
  timeAgo,
  formatSpeed,
  formatCoordinates,
} from '../../lib/geoUtils';

interface LiveMapProps {
  onOpenProfile?: (userId: string) => void;
  selectedEventId?: string | null;
}

export const LiveMap: React.FC<LiveMapProps> = ({ onOpenProfile, selectedEventId }) => {
  const { currentUser } = useAuth();
  const {
    isSharing,
    userCoords,
    locationError,
    permissionStatus,
    isLocating,
    friendsLocations,
    toggleLocationSharing,
    refreshLocation,
    isSimulatingMovement,
    toggleSimulationMovement,
    updateCustomLocation,
  } = useLocationContext();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const circleRef = useRef<L.Circle | null>(null);
  const eventMarkersRef = useRef<Map<string, L.Marker>>(new Map());

  const [selectedFriend, setSelectedFriend] = useState<UserLocation | null>(null);
  const [filterSharingOnly, setFilterSharingOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapLayer, setMapLayer] = useState<'osm' | 'dark' | 'topo'>('dark');
  const [showEventsOnMap, setShowEventsOnMap] = useState(true);
  const [events, setEvents] = useState<CommunityEvent[]>([]);

  // Load events
  useEffect(() => {
    setEvents(store.getEvents());
    const unsub = store.subscribe(() => setEvents(store.getEvents()));
    return () => unsub();
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center: Dhaka coordinates or user coords if already available
      const initialLat = userCoords?.latitude || 23.7771;
      const initialLng = userCoords?.longitude || 90.3994;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: false,
      });

      // Add Zoom Control to top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Default dark tile layer for Sophisticated Dark theme
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO &copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Change Map Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing tile layers
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; OpenStreetMap contributors';

    if (mapLayer === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      attribution = '&copy; CARTO';
    } else if (mapLayer === 'topo') {
      tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenTopoMap';
    }

    L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(mapInstanceRef.current);
  }, [mapLayer]);

  // Update Event Pins on Map
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear old event markers
    eventMarkersRef.current.forEach((marker) => marker.remove());
    eventMarkersRef.current.clear();

    if (!showEventsOnMap) return;

    events.forEach((evt) => {
      if (!evt.latitude || !evt.longitude) return;

      const eventIcon = L.divIcon({
        className: 'custom-event-marker',
        html: `
          <div class="relative group cursor-pointer">
            <div class="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 ring-2 ring-white transform transition-transform group-hover:scale-110">
              <span class="text-sm">📅</span>
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap border border-amber-500/30 shadow-md">
              ${evt.title.slice(0, 14)}...
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([evt.latitude, evt.longitude], { icon: eventIcon }).addTo(map);

      marker.bindPopup(`
        <div class="p-3 text-slate-900 font-sans min-w-[200px]">
          <div class="text-[10px] font-bold uppercase tracking-wider text-amber-600">Upcoming Meetup</div>
          <div class="font-bold text-sm text-slate-900 mb-1">${evt.title}</div>
          <div class="text-xs text-slate-600 mb-2">📍 ${evt.location_name}</div>
          <div class="text-xs font-semibold text-slate-700">📅 ${evt.date} at ${evt.time}</div>
          <div class="text-xs text-emerald-600 font-medium mt-1">${evt.attendees?.length || 0} attending</div>
        </div>
      `);

      eventMarkersRef.current.set(evt.id, marker);

      // If this event was explicitly focused
      if (selectedEventId === evt.id) {
        map.flyTo([evt.latitude, evt.longitude], 15);
        marker.openPopup();
      }
    });
  }, [events, showEventsOnMap, selectedEventId]);

  // Update Friend & User Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Track active marker IDs
    const activeIds = new Set<string>();

    friendsLocations.forEach((loc) => {
      // Respect privacy: skip if not sharing and not current user
      if (!loc.is_sharing && loc.user_id !== currentUser?.id) {
        return;
      }

      if (filterSharingOnly && !loc.is_sharing) {
        return;
      }

      const profile = loc.profile || store.getProfile(loc.user_id);
      if (!profile) return;

      // Filter by search query
      if (
        searchQuery &&
        !profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !profile.username.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return;
      }

      const isMe = loc.user_id === currentUser?.id;
      const isOnline = profile.online_status === 'online';
      const markerId = loc.user_id;
      activeIds.add(markerId);

      // Custom animated HTML Marker
      const avatarSrc =
        profile.avatar_url ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.username)}`;

      const html = `
        <div class="relative group cursor-pointer">
          ${
            isMe
              ? `
            <div class="absolute -inset-2 bg-emerald-500/20 rounded-full animate-ping pointer-events-none"></div>
            <div class="w-11 h-11 rounded-full bg-emerald-500 p-0.5 shadow-xl shadow-emerald-500/40 ring-2 ring-white">
              <img src="${avatarSrc}" class="w-full h-full rounded-full object-cover" />
            </div>
            <div class="absolute -top-2 -right-1 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-white">
              YOU
            </div>
          `
              : `
            <div class="w-10 h-10 rounded-full ${
              loc.is_sharing
                ? 'bg-emerald-500 ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/30'
                : 'bg-slate-600 ring-2 ring-slate-400'
            } p-0.5 transform transition-transform group-hover:scale-110">
              <img src="${avatarSrc}" class="w-full h-full rounded-full object-cover" />
            </div>
            <div class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ${
              isOnline ? 'bg-emerald-400' : 'bg-slate-400'
            } border-2 border-white"></div>
          `
          }
          <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap border border-slate-700 shadow-md">
            ${profile.full_name.split(' ')[0]}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-friend-marker',
        html,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      if (markersRef.current.has(markerId)) {
        // Update existing marker position
        const existingMarker = markersRef.current.get(markerId)!;
        existingMarker.setLatLng([loc.latitude, loc.longitude]);
        existingMarker.setIcon(customIcon);
      } else {
        // Create new marker
        const newMarker = L.marker([loc.latitude, loc.longitude], { icon: customIcon }).addTo(map);

        newMarker.on('click', () => {
          setSelectedFriend(loc);
          map.flyTo([loc.latitude, loc.longitude], 15);
        });

        markersRef.current.set(markerId, newMarker);
      }

      // Draw accuracy circle for current user
      if (isMe && loc.accuracy && loc.accuracy > 0) {
        if (!circleRef.current) {
          circleRef.current = L.circle([loc.latitude, loc.longitude], {
            radius: Math.min(loc.accuracy, 200),
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.12,
            weight: 1.5,
          }).addTo(map);
        } else {
          circleRef.current.setLatLng([loc.latitude, loc.longitude]);
          circleRef.current.setRadius(Math.min(loc.accuracy, 200));
        }
      }
    });

    // Cleanup markers that are no longer active
    markersRef.current.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });
  }, [friendsLocations, filterSharingOnly, searchQuery, currentUser?.id]);

  // Center on user position
  const handleLocateMe = () => {
    if (!mapInstanceRef.current) return;
    if (userCoords) {
      mapInstanceRef.current.flyTo([userCoords.latitude, userCoords.longitude], 15, {
        animate: true,
        duration: 1.2,
      });
    } else {
      toggleLocationSharing(true);
    }
  };

  // Center on specific friend
  const handleFocusFriend = (loc: UserLocation) => {
    setSelectedFriend(loc);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.latitude, loc.longitude], 15, {
        animate: true,
        duration: 1.2,
      });
    }
  };

  const sharingFriends = friendsLocations.filter((l) => l.is_sharing);

  return (
    <div id="live-map-view" className="relative w-full h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden bg-[#050505]">
      {/* Top Map Control Bar */}
      <div className="absolute top-4 left-4 right-4 md:left-4 md:right-auto md:w-96 z-[1000] space-y-2 pointer-events-none">
        {/* Main Master Location Toggle Card */}
        <div className="p-4 rounded-2xl bg-[#080808]/95 backdrop-blur-md border border-white/10 shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isSharing
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-pulse'
                    : 'bg-zinc-900 text-zinc-400 border border-white/5'
                }`}
              >
                <Radio className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-xs sm:text-sm text-white">Live Radar</span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      isSharing
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-900 text-zinc-400 border border-white/5'
                    }`}
                  >
                    {isSharing ? 'Live Active' : 'Hidden'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate">
                  {isLocating
                    ? 'Acquiring GPS fix...'
                    : isSharing
                    ? `${sharingFriends.length} friends sharing live`
                    : 'Turn on to share with friends'}
                </p>
              </div>
            </div>

            {/* Master Toggle Switch */}
            <button
              id="master-location-switch"
              onClick={() => toggleLocationSharing()}
              disabled={isLocating}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isSharing ? 'bg-indigo-600' : 'bg-zinc-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isSharing ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Location Error Warning if permission denied */}
          {locationError && (
            <div className="mt-2.5 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{locationError}</span>
            </div>
          )}

          {/* User Coordinates display */}
          {userCoords && isSharing && (
            <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
              <span>📍 {formatCoordinates(userCoords.latitude, userCoords.longitude)}</span>
              <span className="text-indigo-400">±{Math.round(userCoords.accuracy || 10)}m accuracy</span>
            </div>
          )}
        </div>

        {/* Search & Layer Selector Bar */}
        <div className="p-2 rounded-2xl bg-[#080808]/95 backdrop-blur-md border border-white/10 shadow-xl flex items-center gap-2 pointer-events-auto">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search friends..."
              className="w-full pl-8 pr-2 py-1.5 bg-zinc-900 border border-white/5 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Layer switcher */}
          <select
            value={mapLayer}
            onChange={(e) => setMapLayer(e.target.value as any)}
            className="bg-zinc-900 border border-white/5 text-zinc-300 text-xs rounded-xl px-2 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="dark">Dark Theme</option>
            <option value="osm">Standard</option>
            <option value="topo">Topography</option>
          </select>

          {/* Live Movement Simulation Button (Demo tool) */}
          <button
            onClick={toggleSimulationMovement}
            title={isSimulatingMovement ? 'Pause Live Movement Simulation' : 'Simulate Live Friend Movement'}
            className={`p-1.5 rounded-xl border transition-colors ${
              isSimulatingMovement
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                : 'bg-zinc-900 text-zinc-400 border-white/5 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Action Buttons (Locate Me, Refresh, Events Toggle) */}
      <div className="absolute right-4 bottom-24 md:bottom-6 z-[1000] flex flex-col gap-2 pointer-events-auto">
        <button
          id="locate-me-btn"
          onClick={handleLocateMe}
          className="w-11 h-11 rounded-2xl bg-[#080808] hover:bg-zinc-900 text-indigo-400 border border-white/10 shadow-2xl flex items-center justify-center transition-all hover:scale-105"
          title="Center on My Location"
        >
          <Navigation className="w-5 h-5" />
        </button>

        <button
          onClick={refreshLocation}
          className="w-11 h-11 rounded-2xl bg-[#080808] hover:bg-zinc-900 text-zinc-300 hover:text-white border border-white/10 shadow-2xl flex items-center justify-center transition-all"
          title="Refresh GPS Fix"
        >
          <RefreshCw className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowEventsOnMap(!showEventsOnMap)}
          className={`w-11 h-11 rounded-2xl border shadow-2xl flex items-center justify-center transition-all ${
            showEventsOnMap
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              : 'bg-[#080808] text-zinc-400 border-white/10'
          }`}
          title="Toggle Meetup Pins on Map"
        >
          <MapPin className="w-5 h-5" />
        </button>
      </div>

      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Right / Bottom Friends Radar Sidebar Drawer */}
      <div
        id="friends-radar-drawer"
        className="w-full md:w-80 h-48 md:h-full shrink-0 bg-[#080808]/95 backdrop-blur-md border-t md:border-t-0 md:border-l border-[#1a1a1a] flex flex-col z-20"
      >
        {/* Radar Header */}
        <div className="p-3.5 border-b border-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span className="font-medium text-xs text-zinc-200">Friends Distance Radar</span>
          </div>
          <button
            onClick={() => setFilterSharingOnly(!filterSharingOnly)}
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
              filterSharingOnly
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-white/5'
            }`}
          >
            {filterSharingOnly ? 'Live Only' : 'All'}
          </button>
        </div>

        {/* Friends List with Distances */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {friendsLocations.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 text-xs">
              No friends are sharing their location right now.
            </div>
          ) : (
            friendsLocations
              .filter((loc) => {
                if (filterSharingOnly && !loc.is_sharing) return false;
                if (!loc.is_sharing && loc.user_id !== currentUser?.id) return false;
                return true;
              })
              .map((loc) => {
                const profile = loc.profile || store.getProfile(loc.user_id);
                if (!profile) return null;

                const isMe = loc.user_id === currentUser?.id;
                const isSelected = selectedFriend?.user_id === loc.user_id;

                // Calculate distance from current user
                let distanceText = 'Sharing live';
                if (userCoords && !isMe) {
                  const distKm = calculateDistanceKm(
                    userCoords.latitude,
                    userCoords.longitude,
                    loc.latitude,
                    loc.longitude
                  );
                  distanceText = formatDistance(distKm);
                }

                return (
                  <div
                    key={loc.user_id}
                    onClick={() => handleFocusFriend(loc)}
                    className={`p-2.5 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-zinc-900 border-indigo-500/40 text-white shadow-md'
                        : 'bg-zinc-950/60 hover:bg-zinc-900/80 border-white/5 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={profile.avatar_url}
                            alt={profile.full_name}
                            className="w-8 h-8 rounded-full object-cover border border-white/10"
                          />
                          <span
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-1 ring-black ${
                              loc.is_sharing ? 'bg-indigo-400' : 'bg-zinc-600'
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-xs text-zinc-100 flex items-center gap-1 truncate">
                            <span>{profile.full_name}</span>
                            {isMe && (
                              <span className="text-[9px] px-1 bg-indigo-500/20 text-indigo-300 rounded">
                                (You)
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-500 truncate">
                            {loc.address_hint || `${loc.latitude.toFixed(3)}, ${loc.longitude.toFixed(3)}`}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[11px] font-medium text-indigo-400">{distanceText}</div>
                        <div className="text-[9px] text-zinc-500">{timeAgo(loc.updated_at)}</div>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Selected Friend Profile Popup Card Modal */}
      {selectedFriend && (
        <div className="absolute left-4 right-4 md:left-auto md:right-88 bottom-24 md:bottom-6 z-[1001] md:w-84 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {(() => {
            const profile = selectedFriend.profile || store.getProfile(selectedFriend.user_id);
            if (!profile) return null;
            const isMe = selectedFriend.user_id === currentUser?.id;

            let distanceFormatted = 'Current device location';
            if (userCoords && !isMe) {
              const d = calculateDistanceKm(
                userCoords.latitude,
                userCoords.longitude,
                selectedFriend.latitude,
                selectedFriend.longitude
              );
              distanceFormatted = formatDistance(d);
            }

            return (
              <div className="p-5 rounded-3xl bg-[#0c0c0c]/98 backdrop-blur-xl border border-white/10 shadow-2xl text-zinc-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-lg"
                    />
                    <div>
                      <h4 className="font-semibold text-sm text-white flex items-center gap-1.5">
                        <span>{profile.full_name}</span>
                        {profile.role === 'admin' && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded font-medium">
                            Admin
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-zinc-400">@{profile.username}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-indigo-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                        <span>{selectedFriend.is_sharing ? 'Sharing Live' : 'Offline'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedFriend(null)}
                    className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {profile.bio && (
                  <p className="text-xs text-zinc-300 mb-3 bg-zinc-900/60 p-2.5 rounded-xl border border-white/5">
                    {profile.bio}
                  </p>
                )}

                {/* Location Telemetry Stats */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/5">
                    <span className="text-[10px] text-zinc-400 block mb-0.5">Distance</span>
                    <span className="font-medium text-indigo-400">{distanceFormatted}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/5">
                    <span className="text-[10px] text-zinc-400 block mb-0.5">Speed / Activity</span>
                    <span className="font-medium text-zinc-200">
                      {formatSpeed(selectedFriend.speed)}
                    </span>
                  </div>
                </div>

                {/* Last updated & Battery */}
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-4 px-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Updated {timeAgo(selectedFriend.updated_at)}</span>
                  </div>
                  {selectedFriend.battery_level !== undefined && (
                    <div className="flex items-center gap-1">
                      <Battery className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{selectedFriend.battery_level}% battery</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFriend.latitude},${selectedFriend.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-indigo-500/20"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Directions
                  </a>

                  {onOpenProfile && (
                    <button
                      onClick={() => {
                        onOpenProfile(profile.id);
                        setSelectedFriend(null);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-white/5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      View Profile
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
