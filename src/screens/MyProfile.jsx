import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, ActivityIndicator, ToastAndroid, Image, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import Icons from 'react-native-vector-icons/Feather';
import { useGetDoctor } from '../hooks/useGetDoctor';
import axios from 'axios';
import baseUrl from '../utils/baseUrl';
import { launchImageLibrary } from 'react-native-image-picker';
import imageBaseUrl from '../utils/ImageBaseUrl';
import { MMKV } from 'react-native-mmkv';

const MyProfile = ({ navigation }) => {
    const doctor = useGetDoctor();
    const [doctorDetails, setDoctorDetails] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState(''); // 'doctor' or 'clinic'
    const [isUpdating, setIsUpdating] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const storage = new MMKV();
    
    // Form states
    const [doctorForm, setDoctorForm] = useState({
        fName: '',
        lName: '',
        displayName: '',
        email: ''
    });
    
    const [clinicForm, setClinicForm] = useState({
        clinicName: '',
        clinicAddress: ''
    });


    useEffect(() => {
        if (doctor?.id) {
            fetchDoctorDetails();
        }
    }, [doctor?.id]);

    const fetchDoctorDetails = async () => {
        setIsFetching(true);
        setError('');
        try {
            const res = await axios.get(`${baseUrl}/doctor/get/${doctor.id}`);
            if (res.status === 200 || res.status === 201) {
                setDoctorDetails(res.data);
                // Initialize forms with current data
                setDoctorForm({
                    fName: res.data.fName || '',
                    lName: res.data.lName || '',
                    displayName: res.data.displayName || '',
                    email: res.data.email || ''
                });
                setClinicForm({
                    clinicName: res.data.clinicName || '',
                    clinicAddress: res.data.clinicAddress || ''
                });

                storage.set('doctor', JSON.stringify(res.data));
            } else {
                setError('Failed to fetch doctor details');
                ToastAndroid.show('Failed to fetch doctor details', ToastAndroid.SHORT);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
            setError(errorMessage);
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        } finally {
            setIsFetching(false);
        }
    };

    const handleUpdateDoctor = async () => {
        if (!doctorForm.fName.trim() || !doctorForm.lName.trim() || !doctorForm.displayName.trim() || !doctorForm.email.trim()) {
            ToastAndroid.show('Please fill all fields', ToastAndroid.SHORT);
            return;
        }

        setIsUpdating(true);
        try {
            const res = await axios.put(`${baseUrl}/doctor/update/${doctor.id}`, {
                fName: doctorForm.fName.trim(),
                lName: doctorForm.lName.trim(),
                displayName: doctorForm.displayName.trim(),
                email: doctorForm.email.trim()
            });

            if (res.status === 200 || res.status === 201) {
                ToastAndroid.show('Doctor details updated successfully', ToastAndroid.SHORT);
                setModalVisible(false);
                fetchDoctorDetails(); // Refresh data
            } else {
                ToastAndroid.show('Failed to update doctor details', ToastAndroid.SHORT);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to update doctor details';
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateClinic = async () => {
        if (!clinicForm.clinicName.trim() || !clinicForm.clinicAddress.trim()) {
            ToastAndroid.show('Please fill all fields', ToastAndroid.SHORT);
            return;
        }

        setIsUpdating(true);
        try {
            const res = await axios.put(`${baseUrl}/doctor/update/clinic/${doctor.id}`, {
                clinicName: clinicForm.clinicName.trim(),
                clinicAddress: clinicForm.clinicAddress.trim()
            });

            if (res.status === 200 || res.status === 201) {
                ToastAndroid.show('Clinic details updated successfully', ToastAndroid.SHORT);
                setModalVisible(false);
                fetchDoctorDetails(); // Refresh data
            } else {
                ToastAndroid.show('Failed to update clinic details', ToastAndroid.SHORT);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to update clinic details';
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleImagePicker = () => {
        const options = {
            mediaType: 'photo',
            quality: 0.8,
            includeBase64: false,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel || response.error) {
                return;
            }

            if (response.assets && response.assets[0]) {
                uploadProfileImage(response.assets[0]);
            }
        });
    };

    const uploadProfileImage = async (imageAsset) => {
        setIsUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('image', {
                uri: imageAsset.uri,
                type: imageAsset.type,
                name: imageAsset.fileName || 'profile.jpg',
            });

            const res = await axios.put(`${baseUrl}/doctor/update/profile-image/${doctor.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.status === 200 || res.status === 201) {
                ToastAndroid.show('Profile image updated successfully', ToastAndroid.SHORT);
                fetchDoctorDetails(); // Refresh data
            } else {
                ToastAndroid.show('Failed to update profile image', ToastAndroid.SHORT);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to update profile image';
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        } finally {
            setIsUploadingImage(false);
        }
    };

    const openModal = (type) => {
        setModalType(type);
        setModalVisible(true);
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row justify-start items-center bg-white p-5 rounded-b-2xl">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icons name="arrow-left" size={24} color="#164972" />
                </TouchableOpacity>
                <Text className="font-semibold text-xl text-primary ml-5 tracking-wide">My Profile</Text>
            </View>

            {/* Content */}
            <ScrollView className="flex-1 px-5 py-3" showsVerticalScrollIndicator={false}>
                {isFetching ? (
                    <View className="flex-1 justify-center items-center py-20">
                        <ActivityIndicator size="large" color="#164972" />
                        <Text className="text-gray-500 mt-3">Loading profile...</Text>
                    </View>
                ) : error ? (
                    <View className="flex-1 justify-center items-center py-20">
                        <Icons name="alert-circle" size={48} color="#ef4444" />
                        <Text className="text-red-500 mt-3 text-center px-4">{error}</Text>
                        <TouchableOpacity 
                            className="mt-4 bg-primary px-6 py-2 rounded-lg"
                            onPress={fetchDoctorDetails}
                        >
                            <Text className="text-white font-semibold">Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : doctorDetails ? (
                    <View className="space-y-4">
                        {/* Profile Image Section */}
                        <View className="items-center py-6">
                            <View className="relative">
                                <Image 
                                    source={{
                                        uri: doctorDetails.imageUrl 
                                            ? `${imageBaseUrl}${doctorDetails.imageUrl}` 
                                            : 'https://via.placeholder.com/120/164972/FFFFFF?text=Dr'
                                    }}
                                    className="w-32 h-32 rounded-full"
                                    resizeMode="cover"
                                />
                                <TouchableOpacity 
                                    className="absolute bottom-0 right-0 bg-primary p-2 rounded-full"
                                    onPress={handleImagePicker}
                                    disabled={isUploadingImage}
                                >
                                    {isUploadingImage ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <Icons name="camera" size={16} color="white" />
                                    )}
                                </TouchableOpacity>
                            </View>
                            <Text className="text-xl font-bold text-gray-800 mt-4">{doctorDetails.displayName}</Text>
                            <Text className="text-gray-600">{doctorDetails.email}</Text>
                        </View>

                        {/* Doctor Details Section */}
                        <View className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-lg font-bold text-gray-800">Personal Details</Text>
                                <TouchableOpacity 
                                    onPress={() => openModal('doctor')}
                                    className="bg-primary px-4 py-2 rounded-lg"
                                >
                                    <Text className="text-white font-semibold text-sm">Edit</Text>
                                </TouchableOpacity>
                            </View>
                            
                            <View className="space-y-3">
                                <View className="flex-row items-center">
                                    <Icons name="user" size={16} color="#6b7280" />
                                    <View className="ml-3 flex-1">
                                        <Text className="text-sm text-gray-500">Full Name</Text>
                                        <Text className="text-gray-800 font-medium">{doctorDetails.fName} {doctorDetails.lName}</Text>
                                    </View>
                                </View>
                                
                                <View className="flex-row items-center">
                                    <Icons name="mail" size={16} color="#6b7280" />
                                    <View className="ml-3 flex-1">
                                        <Text className="text-sm text-gray-500">Email</Text>
                                        <Text className="text-gray-800 font-medium">{doctorDetails.email}</Text>
                                    </View>
                                </View>
                                
                                <View className="flex-row items-center">
                                    <Icons name="phone" size={16} color="#6b7280" />
                                    <View className="ml-3 flex-1">
                                        <Text className="text-sm text-gray-500">Phone Number</Text>
                                        <Text className="text-gray-800 font-medium">{doctorDetails.phoneNumber}</Text>
                                    </View>
                                </View>
                                
                                <View className="flex-row items-center">
                                    <Icons name="tag" size={16} color="#6b7280" />
                                    <View className="ml-3 flex-1">
                                        <Text className="text-sm text-gray-500">Display Name</Text>
                                        <Text className="text-gray-800 font-medium">{doctorDetails.displayName}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Clinic Details Section */}
                        <View className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-20">
                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-lg font-bold text-gray-800">Clinic Details</Text>
                                <TouchableOpacity 
                                    onPress={() => openModal('clinic')}
                                    className="bg-primary px-4 py-2 rounded-lg"
                                >
                                    <Text className="text-white font-semibold text-sm">Edit</Text>
                                </TouchableOpacity>
                            </View>
                            
                            <View className="space-y-3">
                                <View className="flex-row items-center">
                                    <Icons name="home" size={16} color="#6b7280" />
                                    <View className="ml-3 flex-1">
                                        <Text className="text-sm text-gray-500">Clinic Name</Text>
                                        <Text className="text-gray-800 font-medium">{doctorDetails.clinicName}</Text>
                                    </View>
                                </View>
                                
                                <View className="flex-row items-start">
                                    <Icons name="map-pin" size={16} color="#6b7280" style={{marginTop: 2}} />
                                    <View className="ml-3 flex-1">
                                        <Text className="text-sm text-gray-500">Clinic Address</Text>
                                        <Text className="text-gray-800 font-medium">{doctorDetails.clinicAddress}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                ) : null}
            </ScrollView>

            {/* Update Modal */}
            <Modal
                visible={isModalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
                transparent={true}
            >
                <View className="bg-black/20 flex-1">
                    <View className="bg-white p-5 rounded-lg w-full h-fit absolute bottom-0">
                        <Text className="text-lg font-bold mb-6">
                            {modalType === 'doctor' ? 'Update Personal Details' : 'Update Clinic Details'}
                        </Text>
                        <View className="absolute top-6 right-5 z-10">
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icons name="x" size={20} color="#111" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
                            {modalType === 'doctor' ? (
                                // Doctor Details Form
                                <>
                                    <Text className="text-sm font-semibold mb-2">First Name *</Text>
                                    <TextInput
                                        className="border border-gray-300 p-2 px-3 py-3 mb-4 rounded-xl text-slate-500"
                                        placeholder="Enter first name"
                                        placeholderTextColor="#aaa"
                                        value={doctorForm.fName}
                                        onChangeText={(text) => setDoctorForm({...doctorForm, fName: text})}
                                    />

                                    <Text className="text-sm font-semibold mb-2">Last Name *</Text>
                                    <TextInput
                                        className="border border-gray-300 p-2 px-3 py-3 mb-4 rounded-xl text-slate-500"
                                        placeholder="Enter last name"
                                        placeholderTextColor="#aaa"
                                        value={doctorForm.lName}
                                        onChangeText={(text) => setDoctorForm({...doctorForm, lName: text})}
                                    />

                                    <Text className="text-sm font-semibold mb-2">Display Name *</Text>
                                    <TextInput
                                        className="border border-gray-300 p-2 px-3 py-3 mb-4 rounded-xl text-slate-500"
                                        placeholder="Enter display name"
                                        placeholderTextColor="#aaa"
                                        value={doctorForm.displayName}
                                        onChangeText={(text) => setDoctorForm({...doctorForm, displayName: text})}
                                    />

                                    <Text className="text-sm font-semibold mb-2">Email *</Text>
                                    <TextInput
                                        className="border border-gray-300 p-2 px-3 py-3 mb-4 rounded-xl text-slate-500"
                                        placeholder="Enter email"
                                        placeholderTextColor="#aaa"
                                        keyboardType="email-address"
                                        value={doctorForm.email}
                                        onChangeText={(text) => setDoctorForm({...doctorForm, email: text})}
                                    />

                                    <Text className="text-sm font-semibold mb-2">Phone Number</Text>
                                    <TextInput
                                        className="border border-gray-300 p-2 px-3 py-3 mb-4 rounded-xl text-gray-400"
                                        value={doctorDetails?.phoneNumber || ''}
                                        editable={false}
                                        placeholder="Phone number (read only)"
                                    />
                                </>
                            ) : (
                                // Clinic Details Form
                                <>
                                    <Text className="text-sm font-semibold mb-2">Clinic Name *</Text>
                                    <TextInput
                                        className="border border-gray-300 p-2 px-3 py-3 mb-4 rounded-xl text-slate-500"
                                        placeholder="Enter clinic name"
                                        placeholderTextColor="#aaa"
                                        value={clinicForm.clinicName}
                                        onChangeText={(text) => setClinicForm({...clinicForm, clinicName: text})}
                                    />

                                    <Text className="text-sm font-semibold mb-2">Clinic Address *</Text>
                                    <TextInput
                                        className="border border-gray-300 p-2 px-3 py-3 mb-4 rounded-xl text-slate-500"
                                        placeholder="Enter clinic address"
                                        placeholderTextColor="#aaa"
                                        multiline={true}
                                        numberOfLines={3}
                                        value={clinicForm.clinicAddress}
                                        onChangeText={(text) => setClinicForm({...clinicForm, clinicAddress: text})}
                                        style={{textAlignVertical: 'top'}}
                                    />
                                </>
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            className="w-full bg-primary px-2 py-3 rounded-2xl flex items-center justify-center mb-4 mt-4"
                            onPress={modalType === 'doctor' ? handleUpdateDoctor : handleUpdateClinic}
                        >
                            {isUpdating ? (
                                <ActivityIndicator color='white' />
                            ) : (
                                <Text className="font-bold text-white text-md tracking-wide">
                                    Update {modalType === 'doctor' ? 'Personal' : 'Clinic'} Details
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default MyProfile