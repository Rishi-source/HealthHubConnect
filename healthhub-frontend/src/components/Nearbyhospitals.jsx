import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Phone, Clock, Star, ChevronRight, Search,
  Filter, Stethoscope, Building, Heart, Users,
  X, ArrowRight, AlertCircle, Loader2, Sun, Moon,
  Bed, Ambulance, Cross, Hospital as HospitalIcon
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
        scale: 1.03,
        transition: { duration: 0.2 }
      }}
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden 
        border dark:border-gray-700 transition-all duration-300
        ${isSelected
          ? 'ring-4 ring-teal-500/30 shadow-2xl'
          : 'hover:shadow-xl hover:border-gray-200'}
      `}
    >
      <div className="p-6 space-y-6">
        { }
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            {hospital.name}
          </h3>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <MapPin className="w-5 h-5 text-teal-500" />
            <span className="text-sm truncate">
              {hospital.address || 'Address not available'}
            </span>
          </div>
        </div>

        { }
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div
              className={`
                ${getRatingColor(hospital.rating)} 
                px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1
              `}
            >
              <Star className="w-4 h-4 fill-current" />
              {hospital.rating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {hospital.distance.toFixed(1)} km away
            </div>
          </div>

          { }
          <div className={`
            px-3 py-1 rounded-full text-sm font-medium
            ${hospital.is_open
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'}
          `}>
            {hospital.is_open ? 'Open' : 'Closed'}
          </div>
        </div>

        { }
        <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {hospital.has_emergency ? 'Emergency' : 'Regular Care'}
            </span>
          </div>

        </div>
      </div>
    </motion.div>
  );
});



const MapComponent = memo(({ hospitals, selectedHospital, onHospitalSelect, userLocation }) => {
  const mapRef = React.useRef(null);
  const [map, setMap] = React.useState(null);
  const [markers, setMarkers] = React.useState([]);

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

  const markerStyles = {
    userMarker: {
      path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
      fillColor: '#4F46E5',
      fillOpacity: 1,
      scale: 8,
      strokeColor: '#FFFFFF',
      strokeWeight: 2
    },
    hospitalMarker: {
      path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
      fillColor: '#10B981',
      fillOpacity: 1,
      scale: 7,
      strokeColor: '#FFFFFF',
      strokeWeight: 2
    },
    selectedHospitalMarker: {
      path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
      fillColor: '#059669',
      fillOpacity: 1,
      scale: 9,
      strokeColor: '#FFFFFF',
      strokeWeight: 2
    }
  };
  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false,
    gestureHandling: 'greedy',
  };

  useEffect(() => {
    if (!map || !window.google) return;

    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    const newMarkers = [];

    if (userLocation) {
      const userMarker = new window.google.maps.Marker({
        position: {
          lat: parseFloat(userLocation.latitude),
          lng: parseFloat(userLocation.longitude)
        },
        map: map,
        icon: markerStyles.userMarker,
        title: "Your Location"
      });
      newMarkers.push(userMarker);
    }

    hospitals.forEach(hospital => {
      const isSelected = selectedHospital?.google_place_id === hospital.google_place_id;
      const hospitalMarker = new window.google.maps.Marker({
        position: {
          lat: parseFloat(hospital.location.latitude),
          lng: parseFloat(hospital.location.longitude)
        },
        map: map,
        icon: isSelected ? markerStyles.selectedHospitalMarker : markerStyles.hospitalMarker,
        title: hospital.name
      });

      hospitalMarker.addListener('click', () => {
        onHospitalSelect(hospital);
      });

      if (isSelected) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-bold">${hospital.name}</h3>
              <p class="text-sm">${hospital.address}</p>
              <div class="flex items-center gap-2 mt-2">
                <span>★</span>
                <span>${hospital.rating.toFixed(1)}</span>
              </div>
            </div>
          `
        });
        infoWindow.open(map, hospitalMarker);
      }

      newMarkers.push(hospitalMarker);
    });

    setMarkers(newMarkers);

    const bounds = new window.google.maps.LatLngBounds();
    newMarkers.forEach(marker => bounds.extend(marker.getPosition()));
    map.fitBounds(bounds, {
      padding: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
      }
    });
  }, [map, hospitals, selectedHospital, userLocation]);

  const handleMapLoad = React.useCallback((map) => {
    mapRef.current = map;
    setMap(map);
  }, []);

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={selectedHospital ? 15 : 12}
        options={mapOptions}
        onLoad={handleMapLoad}
      >
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


  const getUserLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser.');
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
          console.error('Error getting location:', error);

          const fallbackLocation = {
            latitude: 26.122000,
            longitude: 85.379303
          };
          setUserLocation(fallbackLocation);

          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.warn('User denied geolocation request. Using default location.');
              break;
            case error.POSITION_UNAVAILABLE:
              console.warn('Location information is unavailable. Using default location.');
              break;
            case error.TIMEOUT:
              console.warn('Location request timed out. Using default location.');
              break;
            default:
              console.warn('Unknown geolocation error. Using default location.');
          }

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
      const payload = isSearch
        ? {
          query: searchQuery,
          location: location,
          filters: {
            radius: selectedDistance * 1000,
            hasEmergency: false
          }
        }
        : {
          location: location,
          filters: {
            radius: selectedDistance * 1000,
            isOpen: true,
            hasEmergency: selectedAmenities.includes('Emergency'),
            specialities: selectedSpecialty === 'All' ? [] : [selectedSpecialty],
            minRating: selectedMinRating
          }
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

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
  }, [selectedDistance, selectedSpecialty, selectedMinRating, selectedAmenities]);


  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
  };


  const handleSearch = () => {
    fetchHospitals(true);
  };


  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'geometry']
  });


  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-16 h-16 text-teal-500 animate-spin" />
      </div>
    );
  }

  { }

  if (loadError) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <p>Error loading maps</p>
      </div>
    );
  }


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "linear"
          }}
        >
          <Loader2 className="w-16 h-16 text-teal-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-teal-50 to-white'}`}>
      <div className="max-w-7xl mx-auto space-y-8 p-4">
        { }
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Nearby Hospitals
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Find and connect with healthcare facilities in your area
            </p>
          </div>

          { }
          <div className="flex flex-wrap items-center gap-4">
            { }
            <div className="flex-grow flex items-center gap-4">
              { }
              <div className="relative flex-1 max-w-12xl">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hospitals..."
                  className="
                  w-full px-12 py-4 pl-12 rounded-lg text-lg
                  bg-white dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  focus:ring-2 focus:ring-teal-500/30
                  text-gray-800 dark:text-white
                "
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                { }
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSearch}
                  className="
                  absolute right-1 top-1/2 -translate-y-1/2
                  bg-teal-500 text-white 
                  px-4 py-2 rounded-lg
                  hover:bg-teal-600
                  transition-colors
                "
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>

              { }
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="
                p-3 rounded-lg 
                bg-white dark:bg-gray-800 
                border border-gray-200 dark:border-gray-700
                text-gray-700 dark:text-white
                hover:bg-gray-50 dark:hover:bg-gray-700
              "
              >
                <Filter className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        { }
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6"
            >
              <div className="grid md:grid-cols-4 gap-6">
                { }
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                    Distance
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {DISTANCE_OPTIONS.map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedDistance(option.value)}
                        className={`
                        px-4 py-2 rounded-lg text-sm
                        ${selectedDistance === option.value
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}
                      `}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                { }
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                    Specialty
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTY_OPTIONS.map((specialty) => (
                      <motion.button
                        key={specialty}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedSpecialty(specialty)}
                        className={`
                        px-4 py-2 rounded-lg text-sm
                        ${selectedSpecialty === specialty
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}
                      `}
                      >
                        {specialty}
                      </motion.button>
                    ))}
                  </div>
                </div>

                { }
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                    Minimum Rating
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {RATING_OPTIONS.map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedMinRating(option.value)}
                        className={`
                        px-4 py-2 rounded-lg text-sm
                        ${selectedMinRating === option.value
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}
                      `}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                { }
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
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
                          onClick={() => toggleAmenity(amenity.label)}
                          className={`
                          px-4 py-2 rounded-lg text-sm flex items-center gap-2
                          ${selectedAmenities.includes(amenity.label)
                              ? 'bg-teal-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}
                        `}
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

        { }
        <div className="grid lg:grid-cols-2 gap-8">
          { }
          <div className="space-y-6 lg:col-span-1">
            <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-6">
              {filteredHospitals.length > 0 ? (
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
                  className="col-span-full text-center py-12"
                >
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    No hospitals found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search or filter options
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          { }
          <div className="lg:col-span-1">
            <MapComponent
              hospitals={filteredHospitals}
              selectedHospital={selectedHospital}
              onHospitalSelect={setSelectedHospital}
              userLocation={userLocation}
            />
          </div>
        </div>

        { }
        <div className="text-center text-gray-600 dark:text-gray-400 mt-6">
          Showing {filteredHospitals.length} hospital{filteredHospitals.length !== 1 && 's'}
        </div>
      </div>
    </div>
  );
};

export default memo(NearbyHospitals);
