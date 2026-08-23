import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { UserLocation } from '../types';
import { useAuth } from './AuthContext';
import { store } from '../lib/storage';

interface LocationContextType {
  isSharing: boolean;
  userCoords: { latitude: number; longitude: number; accuracy?: number } | null;
  locationError: string | null;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported';
  isLocating: boolean;
  friendsLocations: UserLocation[];
  toggleLocationSharing: (enable?: boolean) => Promise<boolean>;
  refreshLocation: () => Promise<void>;
  isSimulatingMovement: boolean;
  toggleSimulationMovement: () => void;
  updateCustomLocation: (lat: number, lng: number, addressHint?: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, updateCurrentUser } = useAuth();
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [friendsLocations, setFriendsLocations] = useState<UserLocation[]>([]);
  const [isSimulatingMovement, setIsSimulatingMovement] = useState<boolean>(false);

  const watchIdRef = useRef<number | null>(null);
  const simulationIntervalRef = useRef<any>(null);

  // Sync isSharing state from currentUser
  useEffect(() => {
    if (currentUser) {
      setIsSharing(currentUser.location_sharing_enabled ?? false);
      const myLoc = store.getUserLocation(currentUser.id);
      if (myLoc && (currentUser.location_sharing_enabled || myLoc.is_sharing)) {
        setUserCoords({
          latitude: myLoc.latitude,
          longitude: myLoc.longitude,
          accuracy: myLoc.accuracy,
        });
      }
    } else {
      setIsSharing(false);
      setUserCoords(null);
    }
  }, [currentUser?.id, currentUser?.location_sharing_enabled]);

  // Load friends locations and keep reactive
  useEffect(() => {
    const updateLocations = () => {
      const all = store.getLocations();
      setFriendsLocations(all);
    };

    updateLocations();
    const unsub = store.subscribe(updateLocations);
    return () => unsub();
  }, []);

  // Check initial permission status if possible
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setPermissionStatus('unsupported');
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          setPermissionStatus(result.state as any);
          result.onchange = () => {
            setPermissionStatus(result.state as any);
          };
        })
        .catch(() => {
          // Ignore permissions query failure
        });
    }
  }, []);

  // Live Location Watcher
  useEffect(() => {
    if (!isSharing || !currentUser) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy, heading, speed } = position.coords;
      setUserCoords({ latitude, longitude, accuracy });
      setLocationError(null);
      setIsLocating(false);
      setPermissionStatus('granted');

      // Update in storage
      store.updateLocation(currentUser.id, {
        latitude,
        longitude,
        accuracy,
        heading: heading || null,
        speed: speed || null,
        is_sharing: true,
        activity: speed && speed > 2 ? (speed > 7 ? 'driving' : 'walking') : 'stationary',
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      setIsLocating(false);
      let msg = 'Unable to retrieve location.';
      if (error.code === error.PERMISSION_DENIED) {
        msg = 'Location permission was denied. Please allow location access in your browser settings.';
        setPermissionStatus('denied');
        setIsSharing(false);
        updateCurrentUser({ location_sharing_enabled: false });
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        msg = 'Location information is currently unavailable.';
      } else if (error.code === error.TIMEOUT) {
        msg = 'Location request timed out. Please try again.';
      }
      setLocationError(msg);
    };

    // First do a direct get
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    // Then start watching
    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 20000,
    });

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isSharing, currentUser?.id]);

  // Simulated Friend Movement Engine (for demonstration and testing live map radar in preview)
  useEffect(() => {
    if (!isSimulatingMovement) {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      return;
    }

    simulationIntervalRef.current = setInterval(() => {
      const activeLocations = store.getLocations().filter((l) => l.is_sharing);
      if (activeLocations.length === 0) return;

      // Pick a random friend (not current user) and move them slightly
      const nonUserFriends = activeLocations.filter((l) => l.user_id !== currentUser?.id);
      if (nonUserFriends.length === 0) return;

      const target = nonUserFriends[Math.floor(Math.random() * nonUserFriends.length)];
      const latDelta = (Math.random() - 0.5) * 0.0012; // ~50-100m
      const lngDelta = (Math.random() - 0.5) * 0.0012;
      const speeds = [0, 1.4, 3.8, 8.2];
      const speed = speeds[Math.floor(Math.random() * speeds.length)];

      store.updateLocation(target.user_id, {
        latitude: target.latitude + latDelta,
        longitude: target.longitude + lngDelta,
        speed,
        heading: Math.floor(Math.random() * 360),
        activity: speed === 0 ? 'stationary' : speed < 3 ? 'walking' : 'driving',
        battery_level: Math.max(10, (target.battery_level || 80) - (Math.random() > 0.8 ? 1 : 0)),
        updated_at: new Date().toISOString(),
      });
    }, 4000);

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
    };
  }, [isSimulatingMovement, currentUser?.id]);

  const toggleLocationSharing = async (enable?: boolean): Promise<boolean> => {
    const nextState = enable !== undefined ? enable : !isSharing;

    if (!nextState) {
      // Disabling
      setIsSharing(false);
      if (currentUser) {
        updateCurrentUser({ location_sharing_enabled: false });
        store.updateLocation(currentUser.id, { is_sharing: false });
      }
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return false;
    }

    // Enabling
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported on this browser.');
      return false;
    }

    setIsLocating(true);
    setLocationError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy, heading, speed } = position.coords;
          setUserCoords({ latitude, longitude, accuracy });
          setIsSharing(true);
          setIsLocating(false);
          setPermissionStatus('granted');

          if (currentUser) {
            updateCurrentUser({ location_sharing_enabled: true });
            store.updateLocation(currentUser.id, {
              latitude,
              longitude,
              accuracy,
              heading: heading || null,
              speed: speed || null,
              is_sharing: true,
              address_hint: 'Current GPS Location',
            });
          }
          resolve(true);
        },
        (error) => {
          setIsLocating(false);
          let msg = 'Failed to obtain your location.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Permission denied. Please enable location permissions in browser settings.';
            setPermissionStatus('denied');
          }
          setLocationError(msg);
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const refreshLocation = async () => {
    if (!isSharing || !currentUser) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setUserCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        store.updateLocation(currentUser.id, {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          is_sharing: true,
        });
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const updateCustomLocation = (lat: number, lng: number, addressHint?: string) => {
    if (!currentUser) return;
    setUserCoords({ latitude: lat, longitude: lng, accuracy: 10 });
    setIsSharing(true);
    updateCurrentUser({ location_sharing_enabled: true });
    store.updateLocation(currentUser.id, {
      latitude: lat,
      longitude: lng,
      accuracy: 10,
      is_sharing: true,
      address_hint: addressHint || 'Pinned Location',
    });
  };

  const toggleSimulationMovement = () => {
    setIsSimulatingMovement((prev) => !prev);
  };

  return (
    <LocationContext.Provider
      value={{
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
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};
