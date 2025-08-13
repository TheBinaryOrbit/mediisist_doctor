import { View, Text, TextInput, TouchableOpacity, Platform, ScrollView, Alert, PermissionsAndroid, Modal, Dimensions, ToastAndroid } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import Steps from './StepsIndicator'
import Icons from 'react-native-vector-icons/Feather'
import MapView, { Marker } from 'react-native-maps'
import Geolocation from '@react-native-community/geolocation'
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler'

const Singup3 = ({ details, handleChange, setSteps }) => {
    const navigation = useNavigation();
    const [clinicName, setClinicName] = useState(details?.clinicName || '');
    const [clinicAddress, setClinicAddress] = useState(details?.clinicAddress || '');


    useEffect(()=>{
        handleChange('clinicAddress', clinicAddress);
    },[clinicAddress])



    // Default location set to Patna, Bihar, India
    const [currentLocation, setCurrentLocation] = useState({
        latitude: details?.latitude || 25.5941,
        longitude: details?.longitude || 85.1376,
    });
    const [mapRegion, setMapRegion] = useState({
        latitude: details?.latitude || 25.5941,
        longitude: details?.longitude || 85.1376,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });



    useEffect(()=>{
        handleChange('latitude', mapRegion.latitude);
    },[mapRegion.latitude])



    const [locationLoading, setLocationLoading] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);
    const [tempLocation, setTempLocation] = useState(null);
    const [permissionStatus, setPermissionStatus] = useState({
        locationEnabled: false,
        permissionGranted: false,
        checked: false
    });

    const screenHeight = Dimensions.get('window').height;

    // Show toast message
    const showToast = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            // Fallback for iOS - you could use a toast library like react-native-toast-message
            Alert.alert('Info', message);
        }
    };

    // Check location services and permissions efficiently
    const checkLocationStatus = async () => {
        if (Platform.OS === 'android') {
            try {
                // Check if location services are enabled
                const enableResult = await promptForEnableLocationIfNeeded();
                const locationEnabled = enableResult.enabled;

                // Check if permission is already granted
                const permissionGranted = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );

                setPermissionStatus({
                    locationEnabled,
                    permissionGranted,
                    checked: true
                });

                if (!locationEnabled) {
                    showToast('Location services are disabled. Please enable them to use location features.');
                    return false;
                }

                if (!permissionGranted) {
                    showToast('Location permission required for clinic location features.');
                    return false;
                }

                return true;
            } catch (error) {
                console.warn('Location status check error:', error);
                setPermissionStatus({
                    locationEnabled: false,
                    permissionGranted: false,
                    checked: true
                });
                showToast('Unable to check location status.');
                return false;
            }
        }

        // For iOS, assume location services are available
        setPermissionStatus({
            locationEnabled: true,
            permissionGranted: true,
            checked: true
        });
        return true;
    };

    // Request location permission and enable location services
    const requestLocationPermission = async (showPrompts = true) => {
        if (Platform.OS === 'android') {
            try {
                // First check/enable location services
                const enableResult = await promptForEnableLocationIfNeeded();
                if (!enableResult.enabled) {
                    if (showPrompts) {
                        showToast('Location services must be enabled to use this feature.');
                    }
                    setPermissionStatus(prev => ({ ...prev, locationEnabled: false }));
                    return false;
                }

                // Then request location permission
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                );



                const permissionGranted = granted === PermissionsAndroid.RESULTS.GRANTED;

                setPermissionStatus({
                    locationEnabled: true,
                    permissionGranted,
                    checked: true
                });

                if (!permissionGranted && showPrompts) {
                    showToast('Location permission denied. You can manually enter your clinic address.');
                }

                return permissionGranted;
            } catch (err) {
                console.warn('Location permission error:', err);
                if (showPrompts) {
                    showToast('Unable to access location services. Please check your settings.');
                }
                setPermissionStatus({
                    locationEnabled: false,
                    permissionGranted: false,
                    checked: true
                });
                return false;
            }
        }
        return true;
    };

    // Get current location
    const getCurrentLocation = async () => {
        const hasPermission = await requestLocationPermission(true);
        if (!hasPermission) {
            return;
        }

        setLocationLoading(true);
        showToast('Getting your current location...');

        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const newLocation = { latitude, longitude };
                const newRegion = {
                    latitude,
                    longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                };

                setCurrentLocation(newLocation);
                setMapRegion(newRegion);
                handleChange('latitude', latitude);
                handleChange('longitude', longitude);
                setLocationLoading(false);

                showToast('Location updated successfully!');

                // Reverse geocoding to get address
                reverseGeocode(latitude, longitude);
            },
            (error) => {
                console.log('Location error:', error);
                setLocationLoading(false);

                let errorMessage = 'Unable to get your current location.';
                switch (error.code) {
                    case 1:
                        errorMessage = 'Location permission denied.';
                        break;
                    case 2:
                        errorMessage = 'Location not available.';
                        break;
                    case 3:
                        errorMessage = 'Location request timed out.';
                        break;
                }
                showToast(errorMessage);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    // Reverse geocoding to get address from coordinates
    const reverseGeocode = async (latitude, longitude) => {
        try {
            // Using a free geocoding service (you can replace with your preferred service)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            const data = await response.json();
            if (data && data.display_name) {
                const address = data.display_name;
                setClinicAddress(address);
                handleChange('clinicAddress', address);
            }
        } catch (error) {
            console.log('Reverse geocoding error:', error);
            // Fallback: just set coordinates as address
            const fallbackAddress = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
            setClinicAddress(fallbackAddress);
            handleChange('clinicAddress', fallbackAddress);
        }
    };

    // Handle map press to select location in modal
    const handleMapPressInModal = (event) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        const newLocation = { latitude, longitude };
        setTempLocation(newLocation);
    };

    // Confirm location selection from modal
    const confirmLocationSelection = () => {
        if (tempLocation) {
            setCurrentLocation(tempLocation);
            setMapRegion({
                ...tempLocation,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });
            handleChange('latitude', tempLocation.latitude);
            handleChange('longitude', tempLocation.longitude);

            // Reverse geocoding for selected location
            reverseGeocode(tempLocation.latitude, tempLocation.longitude);
        }
        setShowMapModal(false);
        setTempLocation(null);
    };

    // Cancel location selection
    const cancelLocationSelection = () => {
        setShowMapModal(false);
        setTempLocation(null);
    };

    // Open map modal with current location
    const openMapModal = () => {
        setTempLocation(currentLocation);
        setShowMapModal(true);
    };

    // Center map on current location in modal
    const centerOnCurrentLocation = async () => {
        try {
            const hasPermission = await requestLocationPermission(true);
            if (!hasPermission) {
                return;
            }

            setLocationLoading(true);
            Geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newLocation = { latitude, longitude };
                    setTempLocation(newLocation);
                    setMapRegion({
                        latitude,
                        longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    });
                    setLocationLoading(false);
                    showToast('Centered on your current location');
                },
                (error) => {
                    console.log('Location error:', error);
                    setLocationLoading(false);

                    let errorMessage = 'Unable to get your current location.';
                    switch (error.code) {
                        case 1:
                            errorMessage = 'Location permission denied.';
                            break;
                        case 2:
                            errorMessage = 'Location not available.';
                            break;
                        case 3:
                            errorMessage = 'Location request timed out.';
                            break;
                    }
                    showToast(errorMessage);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        } catch (error) {
            console.log('Center location error:', error);
            setLocationLoading(false);
            showToast('Unable to access location services.');
        }
    };

    // Handle input changes
    const handleClinicNameChange = (text) => {
        setClinicName(text);
        handleChange('clinicName', text);
    };

    const handleClinicAddressChange = (text) => {
        setClinicAddress(text);
        handleChange('clinicAddress', text);
    };

    useEffect(() => {
        // Set default address for Patna if no address is provided
        if (!clinicAddress && !details?.clinicAddress) {
            setClinicAddress('Patna, Bihar, India');
            handleChange('clinicAddress', 'Patna, Bihar, India');
        }

        // Set default coordinates if not provided
        if (!details?.latitude || !details?.longitude) {
            handleChange('latitude', 25.5941);
            handleChange('longitude', 85.1376);
        }

        // Check location permissions when component loads
        const initializeLocationStatus = async () => {
            await checkLocationStatus();
        };

        initializeLocationStatus();
    }, []);
    return (
        <ScrollView className="flex-1 bg-white">

            <View className="absolute top-5 left-5 z-10">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icons name="arrow-left" size={24} color="#164972" />
                </TouchableOpacity>
            </View>




            <View className="flex-1 mt-14 p-5">

                <Text className="text-2xl font-bold text-primary mb-1">Create Account</Text>
                <Text className="text-gray-500 mb-8">Please fill in the details to create your account.</Text>

                <Steps active={3} steps={4} />

                {/* Clinic Name Input */}
                <View className="mb-4">
                    <Text className="text-gray-700 mb-2 font-medium">Clinic Name</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-4 text-base text-gray-900"
                        placeholder="Enter your clinic name"
                        value={clinicName}
                        onChangeText={handleClinicNameChange}
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                {/* Clinic Address Input */}
                <View className="mb-4">
                    <Text className="text-gray-700 mb-2 font-medium">Clinic Address</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-4 text-base text-gray-900"
                        placeholder="Enter your clinic address"
                        value={clinicAddress}
                        onChangeText={handleClinicAddressChange}
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={2}
                    />
                </View>

                {/* Current Location Button */}
                <TouchableOpacity
                    className={`${permissionStatus.permissionGranted && permissionStatus.locationEnabled
                        ? 'bg-blue-500' : 'bg-gray-400'} rounded-xl py-3 px-4 flex-row items-center justify-center mb-2`}
                    onPress={getCurrentLocation}
                    disabled={locationLoading}
                >
                    <Icons
                        name={locationLoading ? "loader" : "map-pin"}
                        size={18}
                        color="white"
                        style={{ marginRight: 8 }}
                    />
                    <Text className="text-white font-medium">
                        {locationLoading ? 'Getting Location...' : 'Use Current Location'}
                    </Text>
                </TouchableOpacity>

                {/* Permission Status Indicator */}
                {permissionStatus.checked && (
                    <View className="mb-4 p-2 rounded-xl" style={{
                        backgroundColor: permissionStatus.permissionGranted && permissionStatus.locationEnabled
                            ? '#E8F5E8' : '#FFF3CD'
                    }}>
                        <View className="flex-row items-center">
                            <Icons
                                name={permissionStatus.permissionGranted && permissionStatus.locationEnabled
                                    ? "check-circle" : "alert-triangle"}
                                size={16}
                                color={permissionStatus.permissionGranted && permissionStatus.locationEnabled
                                    ? "#059669" : "#D97706"}
                                style={{ marginRight: 6 }}
                            />
                            <Text className={`text-sm ${permissionStatus.permissionGranted && permissionStatus.locationEnabled
                                ? 'text-green-700' : 'text-yellow-700'}`}>
                                {permissionStatus.permissionGranted && permissionStatus.locationEnabled
                                    ? 'Location services ready'
                                    : !permissionStatus.locationEnabled
                                        ? 'Location services disabled'
                                        : 'Location permission not granted'
                                }
                            </Text>
                            {(!permissionStatus.permissionGranted || !permissionStatus.locationEnabled) && (
                                <TouchableOpacity
                                    className="ml-auto"
                                    onPress={() => requestLocationPermission(true)}
                                >
                                    <Text className="text-blue-600 text-sm font-medium">Enable</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}

                {/* Location Coordinates Display */}
                <View className="mb-4 p-3 bg-gray-50 rounded-xl">
                    <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                            <Text className="text-gray-600 text-sm">Latitude</Text>
                            <Text className="text-gray-900 font-medium">{currentLocation.latitude.toFixed(6)}</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-600 text-sm">Longitude</Text>
                            <Text className="text-gray-900 font-medium">{currentLocation.longitude.toFixed(6)}</Text>
                        </View>
                    </View>
                </View>

                {/* Map Preview - Click to Open Modal */}
                <View className="mb-6">
                    <Text className="text-gray-700 mb-2 font-medium">Clinic Location</Text>
                    <TouchableOpacity
                        className="h-48 rounded-xl overflow-hidden border border-gray-300 bg-gray-100"
                        onPress={openMapModal}
                    >
                        <MapView
                            style={{ flex: 1 }}
                            region={mapRegion}
                            scrollEnabled={false}
                            zoomEnabled={false}
                            rotateEnabled={false}
                            pitchEnabled={false}
                            pointerEvents="none"
                        >
                            <Marker
                                coordinate={currentLocation}
                                title="Clinic Location"
                                pinColor="#164972"
                            />
                        </MapView>
                        <View className="absolute top-3 right-3 rounded-full overflow-hidden w-8 h-8 justify-center items-center bg-opacity-20 bg-white">
                            <Icons name="maximize-2" size={18} color="#164972" />
                        </View>
                    </TouchableOpacity>
                    <Text className="text-gray-500 text-sm mt-2 text-center">
                        Current coordinates: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                    </Text>
                </View>

                {/* Map Modal */}
                <Modal
                    visible={showMapModal}
                    animationType="slide"
                    onRequestClose={cancelLocationSelection}
                >
                    <View className="flex-1 bg-white">
                        {/* Modal Header */}
                        <View className="bg-primary px-4 py-3 flex-row items-center justify-between" style={{ paddingTop: Platform.OS === 'ios' ? 50 : 20 }}>
                            <TouchableOpacity onPress={cancelLocationSelection}>
                                <Icons name="x" size={24} color="white" />
                            </TouchableOpacity>
                            <Text className="text-white text-lg font-bold">Select Clinic Location</Text>
                            <TouchableOpacity onPress={confirmLocationSelection}>
                                <Icons name="check" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Full Screen Map */}
                        <View className="flex-1">
                            <MapView
                                style={{ flex: 1 }}
                                region={mapRegion}
                                onPress={handleMapPressInModal}
                                showsUserLocation={true}
                                showsMyLocationButton={false}
                                onRegionChangeComplete={setMapRegion}
                            >
                                {tempLocation && (
                                    <Marker
                                        coordinate={tempLocation}
                                        title="Selected Clinic Location"
                                        description="This will be your clinic location"
                                        pinColor="#164972"
                                        draggable={true}
                                        onDragEnd={(e) => setTempLocation(e.nativeEvent.coordinate)}
                                    />
                                )}
                            </MapView>
                        </View>

                        {/* Map Controls */}
                        <View className="absolute bottom-20 right-4 flex-col">
                            <TouchableOpacity
                                className="bg-white rounded-full p-3 mb-3 shadow-lg"
                                onPress={centerOnCurrentLocation}
                            >
                                <Icons name="navigation" size={24} color="#164972" />
                            </TouchableOpacity>
                        </View>

                        {/* Bottom Info Panel */}
                        <View className="bg-white border-t border-gray-200 px-4 py-4">
                            {tempLocation && (
                                <View className="mb-3">
                                    <Text className="text-gray-600 text-sm">Selected Location:</Text>
                                    <Text className="text-gray-900 font-medium">
                                        Lat: {tempLocation.latitude.toFixed(6)}, Lng: {tempLocation.longitude.toFixed(6)}
                                    </Text>
                                </View>
                            )}
                            <View className="flex-row justify-between">
                                <TouchableOpacity
                                    className="flex-1 bg-gray-200 rounded-xl py-3 mr-2 items-center"
                                    onPress={cancelLocationSelection}
                                >
                                    <Text className="text-gray-700 font-medium">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="flex-1 bg-primary rounded-xl py-3 ml-2 items-center"
                                    onPress={confirmLocationSelection}
                                    disabled={!tempLocation}
                                >
                                    <Text className="text-white font-medium">
                                        {tempLocation ? 'Confirm Location' : 'Select Location'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>


                <View className={`flex flex-row items-center justify-between py-1 rounded-2xl mb-4 `}>
                    <TouchableOpacity
                        className={`max-w-1/2 px-4 py-3 rounded-2xl flex-row items-center justify-center mb-4 bg-white border-2 border-primary`}
                        onPress={() => setSteps(2)}
                    >
                        <Icons name="arrow-left" size={18} color={'#164972'} style={{ marginRight: 5 }} />
                        <Text className="text-md text-primary font-bold tracking-widest">Previous</Text>


                    </TouchableOpacity>

                    <TouchableOpacity
                        className={`max-w-1/2 px-6 py-3 rounded-2xl flex-row items-center justify-center mb-4 bg-primary`}
                        onPress={() => handleChange('clinicName', clinicName) || handleChange('clinicAddress', clinicAddress) ||  handleChange('latitude', mapRegion.latitude) || handleChange('longitude', mapRegion.longitude) || setSteps(4)}
                    >

                        <Text className="text-md text-white font-bold tracking-widest">Next</Text>
                        <Icons name="arrow-right" size={18} color={'white'} style={{ marginLeft: 5 }} />

                    </TouchableOpacity>
                </View>
            </View>

        </ScrollView>
    )
}

export default Singup3