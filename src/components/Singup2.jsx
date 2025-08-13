import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Modal, ActivityIndicator, ToastAndroid } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import Steps from './StepsIndicator'
import Icons from 'react-native-vector-icons/Feather'
import axios from 'axios'
import baseUrl from '../utils/baseUrl'

const Singup2 = ({ details, handleChange, setSteps }) => {
    const navigation = useNavigation();
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [selectedSpecialization, setSelectedSpecialization] = useState(details?.specialization || '');
    const [selectedSpecializationId, setSelectedSpecializationId] = useState(details?.specializationId || '');
    const [specializations, setSpecializations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch specializations from API
    useEffect(() => {
        fetchSpecializations();
    }, []);

    const fetchSpecializations = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${baseUrl}/specialization/getall`);
            
            if (response.data.success) {
                setSpecializations(response.data.specializations);
                
                // If there's already a selected specialization, find and set it
                if (details?.specializationId) {
                    const currentSpec = response.data.specializations.find(
                        spec => spec.id === details.specializationId
                    );
                    if (currentSpec) {
                        setSelectedSpecialization(currentSpec.label);
                        setSelectedSpecializationId(currentSpec.id);
                    }
                }
            } else {
                setError('Failed to load specializations');
                ToastAndroid.show('Failed to load specializations', ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error('Error fetching specializations:', error);
            setError('Network error. Please check your connection.');
            ToastAndroid.show('Network error. Please try again.', ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSpecialization = (specialization) => {
        setSelectedSpecialization(specialization.label);
        setSelectedSpecializationId(specialization.id);
        handleChange('specialization', specialization.label);
        handleChange('specializationId', specialization.id);
        setDropdownVisible(false);
    };
    const handleNext = () => {
        if (!selectedSpecializationId) {
            ToastAndroid.show('Please select a specialization to continue', ToastAndroid.SHORT);
            return;
        }
        setSteps(3);
    };

    return (
        <ScrollView className="flex-1 bg-white">

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="absolute top-5 left-5 z-10">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icons name="arrow-left" size={24} color="#164972" />
                    </TouchableOpacity>
                </View>




                <View className="flex-1 mt-14 p-5">

                    <Text className="text-2xl font-bold text-primary mb-1">Create Account</Text>
                    <Text className="text-gray-500 mb-8">Please fill in the details to create your account.</Text>

                    <Steps active={2} steps={4} />

                    {/* Specialization Dropdown */}
                    <View className="mb-14">
                        
                        <TouchableOpacity
                            className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-4 flex-row items-center justify-between"
                            onPress={() => !loading && setDropdownVisible(true)}
                            disabled={loading}
                        >
                            <Text className={`text-base ${selectedSpecialization ? 'text-gray-900' : 'text-gray-400'}`}>
                                {loading ? 'Loading specializations...' : 
                                 error ? 'Error loading specializations' :
                                 selectedSpecialization || 'Choose your medical specialization'}
                            </Text>
                            {loading ? (
                                <ActivityIndicator size="small" color="#6B7280" />
                            ) : (
                                <Icons name="chevron-down" size={20} color="#6B7280" />
                            )}
                        </TouchableOpacity>
                        
                        {error && (
                            <TouchableOpacity 
                                className="mt-2 px-3 py-1 bg-red-50 rounded-lg"
                                onPress={fetchSpecializations}
                            >
                                <Text className="text-red-600 text-sm text-center">
                                    Tap to retry loading specializations
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Dropdown Modal */}
                    <Modal
                        visible={dropdownVisible}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setDropdownVisible(false)}
                    >
                        <TouchableOpacity
                            className="flex-1 bg-black/60 bg-opacity-50 justify-center items-center"
                            activeOpacity={1}
                            onPress={() => setDropdownVisible(false)}
                        >
                            <View className="bg-white rounded-2xl mx-8 max-h-96 w-4/5">
                                <View className="p-4 border-b border-gray-200">
                                    <Text className="text-lg font-bold text-primary text-center">Select Specialization</Text>
                                </View>
                                <ScrollView className="max-h-80">
                                    {loading ? (
                                        <View className="p-8 items-center">
                                            <ActivityIndicator size="large" color="#164972" />
                                            <Text className="text-gray-500 mt-2">Loading specializations...</Text>
                                        </View>
                                    ) : error ? (
                                        <View className="p-8 items-center">
                                            <Text className="text-red-500 text-center mb-4">{error}</Text>
                                            <TouchableOpacity
                                                className="bg-primary px-4 py-2 rounded-lg"
                                                onPress={fetchSpecializations}
                                            >
                                                <Text className="text-white">Retry</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : specializations.length === 0 ? (
                                        <View className="p-8 items-center">
                                            <Text className="text-gray-500 text-center">No specializations available</Text>
                                        </View>
                                    ) : (
                                        specializations.map((specialization) => (
                                            <TouchableOpacity
                                                key={specialization.id}
                                                className={`p-4 border-b border-gray-100 ${selectedSpecializationId === specialization.id ? 'bg-blue-50' : ''}`}
                                                onPress={() => handleSelectSpecialization(specialization)}
                                            >
                                                <View className="flex-row items-center justify-between">
                                                    <Text className={`text-base ${selectedSpecializationId === specialization.id ? 'text-primary font-medium' : 'text-gray-700'}`}>
                                                        {specialization.label}
                                                    </Text>
                                                    {selectedSpecializationId === specialization.id && (
                                                        <Icons name="check" size={18} color="#164972" />
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        ))
                                    )}
                                </ScrollView>
                                <TouchableOpacity
                                    className="p-4 border-t border-gray-200"
                                    onPress={() => setDropdownVisible(false)}
                                >
                                    <Text className="text-center text-gray-500 font-medium">Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Modal>


                    <View className={`flex flex-row items-center justify-between py-1 rounded-2xl mb-4 `}>
                        <TouchableOpacity
                            className={`max-w-1/2 px-4 py-3 rounded-2xl flex-row items-center justify-center mb-4 bg-white border-2 border-primary`}
                            onPress={() => setSteps(1)}
                        >
                            <Icons name="arrow-left" size={18} color={'#164972'} style={{ marginRight: 5 }} />
                            <Text className="text-md text-primary font-bold tracking-widest">Previous</Text>
                            

                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`max-w-1/2 px-6 py-3 rounded-2xl flex-row items-center justify-center mb-4 ${selectedSpecializationId ? 'bg-primary' : 'bg-gray-400'}`}
                            onPress={handleNext}
                            disabled={!selectedSpecializationId}
                        >

                            <Text className="text-md text-white font-bold tracking-widest">Next</Text>
                            <Icons name="arrow-right" size={18} color={'white'} style={{ marginLeft: 5 }} />

                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </ScrollView>
    )
}

export default Singup2