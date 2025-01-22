import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Phone, Clock, Star, ChevronRight, Search,
  Filter, Stethoscope, Building, Heart, Users,
  X, ArrowRight, AlertCircle, Loader2, Sun, Moon,
  Bed, Ambulance, Cross, Hospital as HospitalIcon,
  Navigation, Info
} from 'lucide-react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const DISTANCE_OPTIONS = [
  { value: 1, label: '1 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 50, label: '50 km' }
];

const SPECIALTY_OPTIONS = [
  'All',
  'Emergency',
  'Cardiology',
  'Pediatrics',
  'Orthopedics',
  'Neurology',
  'General Medicine',
  'Gynecology',
  'Oncology',
  'Dermatology',
  'Psychiatry'
];

const RATING_OPTIONS = [
  { value: 0, label: 'Any Rating' },
  { value: 3, label: '3+ Rating' },
  { value: 4, label: '4+ Rating' }
];

const AMENITIES_OPTIONS = [
  { icon: Bed, label: '24/7 Beds' },
  { icon: Ambulance, label: 'Emergency' },
  { icon: Cross, label: 'ICU' },
  { icon: HospitalIcon, label: 'OPD' }
];

const HospitalCard = memo(({ hospital, isSelected, onClick }) => {
  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'bg-green-100 text-green-700';
    if (rating >= 4) return 'bg-teal-100 text-teal-700';
    if (rating >= 3) return 'bg-blue-100 text-blue-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 300 }
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden
        border dark:border-gray-700 transition-all duration-300 cursor-pointer
        ${isSelected ? 'ring-4 ring-teal-500/30 shadow-2xl' : 'hover:shadow-xl hover:border-gray-200'}
      `}
    >
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {hospital.name}
            </h3>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MapPin className="w-5 h-5 text-teal-500 shrink-0" />
              <span className="text-sm line-clamp-2">{hospital.address}</span>
            </div>
          </div>
          <div className={`
            px-3 py-1 rounded-full text-sm font-medium shrink-0
            ${hospital.is_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
          `}>
            {hospital.is_open ? 'Open' : 'Closed'}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className={`${getRatingColor(hospital.rating)} 
            px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1`}>
            <Star className="w-4 h-4 fill-current" />
            {hospital.rating.toFixed(1)}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Navigation className="w-4 h-4" />
            {hospital.distance.toFixed(1)} km away
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-3 border-t dark:border-gray-700">
          {hospital.has_emergency && (
            <div className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium flex items-center gap-1">
              <Ambulance className="w-4 h-4" />
              Emergency
            </div>
          )}
          {hospital.specialties?.slice(0, 3).map((specialty, index) => (
            <div key={index} className="px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-sm">
              {specialty}
            </div>
          ))}
        </div>

        {isSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-4 mt-4 border-t dark:border-gray-700"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{hospital.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">24/7 Service</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});

const MapComponent = memo(({ hospitals, selectedHospital, onHospitalSelect, userLocation }) => {
  const [map, setMap] = React.useState(null);
  const [infoWindow, setInfoWindow] = React.useState(null);

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
    minHeight: '600px'
  };

  const center = selectedHospital
    ? {
      lat: parseFloat(selectedHospital.location.latitude),
      lng: parseFloat(selectedHospital.location.longitude)
    }
    : userLocation
      ? {
        lat: parseFloat(userLocation.latitude),
        lng: parseFloat(userLocation.longitude)
      }
      : { lat: 26.122000, lng: 85.379303 };

  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false,
    gestureHandling: 'greedy',
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'transit',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  };

  const handleMarkerClick = useCallback((hospital) => {
    if (infoWindow) {
      infoWindow.close();
    }

    const content = `
      <div class="p-4 min-w-[200px]">
        <h3 class="font-bold text-lg mb-2">${hospital.name}</h3>
        <p class="text-sm text-gray-600 mb-2">${hospital.address}</p>
        <div class="flex items-center gap-2">
          <span class="text-yellow-500">★</span>
          <span class="font-medium">${hospital.rating.toFixed(1)}</span>
        </div>
      </div>
    `;

    const newInfoWindow = new window.google.maps.InfoWindow({
      content,
      pixelOffset: new window.google.maps.Size(0, -30)
    });

    const position = {
      lat: parseFloat(hospital.location.latitude),
      lng: parseFloat(hospital.location.longitude)
    };

    newInfoWindow.setPosition(position);
    newInfoWindow.open(map);
    setInfoWindow(newInfoWindow);
    onHospitalSelect(hospital);
  }, [map, infoWindow, onHospitalSelect]);

  useEffect(() => {
    if (!map || !hospitals.length) return;

    const bounds = new window.google.maps.LatLngBounds();

    if (userLocation) {
      bounds.extend({
        lat: parseFloat(userLocation.latitude),
        lng: parseFloat(userLocation.longitude)
      });
    }

    hospitals.forEach(hospital => {
      bounds.extend({
        lat: parseFloat(hospital.location.latitude),
        lng: parseFloat(hospital.location.longitude)
      });
    });

    map.fitBounds(bounds, {
      padding: { top: 50, right: 50, bottom: 50, left: 50 }
    });
  }, [map, hospitals, userLocation]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={14}
        options={mapOptions}
        onLoad={setMap}
      >
        {userLocation && (
          <Marker
            position={{
              lat: parseFloat(userLocation.latitude),
              lng: parseFloat(userLocation.longitude)
            }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4F46E5',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            }}
          />
        )}

        {hospitals.map((hospital) => (
          <Marker
            key={hospital.google_place_id}
            position={{
              lat: parseFloat(hospital.location.latitude),
              lng: parseFloat(hospital.location.longitude)
            }}
            onClick={() => handleMarkerClick(hospital)}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: selectedHospital?.google_place_id === hospital.google_place_id ? 9 : 7,
              fillColor: selectedHospital?.google_place_id === hospital.google_place_id ? '#059669' : '#10B981',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
});

const NearbyHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDistance, setSelectedDistance] = useState(10);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedMinRating, setSelectedMinRating] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'geometry']
  });

  const getUserLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const defaultLocation = {
          latitude: 26.122000,
          longitude: 85.379303
        };
        setUserLocation(defaultLocation);
        resolve(defaultLocation);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(location);
          resolve(location);
        },
        (error) => {
          console.error('Location error:', error);
          const fallbackLocation = {
            latitude: 26.122000,
            longitude: 85.379303
          };
          setUserLocation(fallbackLocation);
          resolve(fallbackLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    });
  }, []);

  const fetchHospitals = async (isSearch = false) => {
    setLoading(true);
    setError(null);

    try {
      const location = await getUserLocation();
      const endpointUrl = isSearch
        ? 'https://anochat.in/v1/hospitals/search'
        : 'https://anochat.in/v1/hospitals/nearby';

      const payload = {
        location,
        filters: {
          radius: selectedDistance * 1000,
          hasEmergency: selectedAmenities.includes('Emergency'),
          specialities: selectedSpecialty === 'All' ? [] : [selectedSpecialty],
          minRating: selectedMinRating
        },
        ...(isSearch && { query: searchQuery })
      };

      const accessToken = localStorage.getItem('access_token');
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to fetch hospitals');

      const data = await response.json();
      const sortedHospitals = data.sort((a, b) => a.distance - b.distance);

      setHospitals(sortedHospitals);
      setFilteredHospitals(sortedHospitals);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
    document.documentElement.classList.add('dark');
  }, [selectedDistance, selectedSpecialty, selectedMinRating, selectedAmenities]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (!isLoaded) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-16 h-16 text-teal-500" />
      </motion.div>
    </div>
  );

  if (loadError) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center gap-4">
      <AlertCircle className="w-16 h-16 text-red-500" />
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">Failed to load map</h2>
      <p className="text-gray-600 dark:text-gray-400">Please check your internet connection</p>
    </div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-[1920px] mx-auto p-4 lg:p-8 space-y-8">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white">
              Nearby Hospitals
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Find and connect with healthcare facilities in your area
            </p>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-[400px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchHospitals(true)}
                placeholder="Search hospitals..."
                className="w-full px-12 py-3 rounded-xl text-lg
                  bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                  focus:ring-2 focus:ring-teal-500/30 text-gray-800 dark:text-white
                  placeholder-gray-400 dark:placeholder-gray-500"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchHospitals(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2
                  bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200
                dark:border-gray-700 text-gray-700 dark:text-white
                hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Filter className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200
                dark:border-gray-700 text-gray-700 dark:text-white
                hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
          </div>
        </header>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Distance
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {DISTANCE_OPTIONS.map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedDistance(option.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium
                          ${selectedDistance === option.value
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Specialty
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTY_OPTIONS.map((specialty) => (
                      <motion.button
                        key={specialty}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedSpecialty(specialty)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium
                          ${selectedSpecialty === specialty
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                      >
                        {specialty}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Minimum Rating
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {RATING_OPTIONS.map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedMinRating(option.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium
                          ${selectedMinRating === option.value
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES_OPTIONS.map((amenity) => {
                      const Icon = amenity.icon;
                      return (
                        <motion.button
                          key={amenity.label}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            const newAmenities = selectedAmenities.includes(amenity.label)
                              ? selectedAmenities.filter(a => a !== amenity.label)
                              : [...selectedAmenities, amenity.label];
                            setSelectedAmenities(newAmenities);
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2
                            ${selectedAmenities.includes(amenity.label)
                              ? 'bg-teal-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                          <Icon className="w-4 h-4" />
                          {amenity.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="h-[calc(100vh-12rem)] overflow-y-auto pr-4 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
              </div>
            ) : filteredHospitals.length > 0 ? (
              <AnimatePresence>
                {filteredHospitals.map((hospital) => (
                  <HospitalCard
                    key={hospital.google_place_id}
                    hospital={hospital}
                    isSelected={selectedHospital?.google_place_id === hospital.google_place_id}
                    onClick={() => setSelectedHospital(hospital)}
                  />
                ))}
              </AnimatePresence>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  No hospitals found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search or filter options
                </p>
              </motion.div>
            )}
          </div>

          <div className="h-[calc(100vh-12rem)]">
            <MapComponent
              hospitals={filteredHospitals}
              selectedHospital={selectedHospital}
              onHospitalSelect={setSelectedHospital}
              userLocation={userLocation}
            />
          </div>
        </div>

        <div className="text-center text-gray-600 dark:text-gray-400">
          Showing {filteredHospitals.length} hospital{filteredHospitals.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default memo(NearbyHospitals);