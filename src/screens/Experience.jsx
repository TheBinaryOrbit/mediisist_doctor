import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, ToastAndroid } from 'react-native'
import React, { useState, useEffect } from 'react'
import Icons from 'react-native-vector-icons/Feather'
import { useGetDoctor } from '../hooks/useGetDoctor'
import axios from 'axios'
import baseUrl from '../utils/baseUrl'

const Experience = ({ navigation }) => {
    const doctor = useGetDoctor()
    const [isModalVisible, setModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newExperience, setNewExperience] = useState({
        title: '',
        hospital: '',
        employmentType: '',
        from: '',
        to: '',
        currentlyWorking: false
    });

    const [isFetching, setIsFetching] = useState(false);
    const [experiences, setExperiences] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (doctor?.id) {
            fetchExperiences();
        }
    }, [doctor?.id]);

    const fetchExperiences = async () => {
        setIsFetching(true);
        setError('');
        try {
            const res = await axios.get(`${baseUrl}/experience/get/${doctor.id}`);
            if (res.status === 200 || res.status === 201) {
                // Handle different response structures and ensure we always have an array
                const experienceData = res.data.experiences || res.data || [];
                const validExperiences = Array.isArray(experienceData) ? experienceData : [];
                setExperiences(validExperiences);
            } else {
                setError('Failed to fetch experiences');
                ToastAndroid.show('Failed to fetch experiences', ToastAndroid.SHORT);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
            setError(errorMessage);
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
            // Set experiences to empty array on error to show empty state
            setExperiences([]);
        } finally {
            setIsFetching(false);
        }
    }

    const handleAddExperience = async () => {
        setIsLoading(true);

        // validation of input fields
        if (!newExperience.title.trim() || !newExperience.hospital.trim() || !newExperience.employmentType.trim() || !newExperience.from.trim()) {
            ToastAndroid.show('Please fill all required fields', ToastAndroid.SHORT);
            setIsLoading(false);
            return;
        }

        // If not currently working, 'to' field is required
        if (!newExperience.currentlyWorking && !newExperience.to.trim()) {
            ToastAndroid.show('Please specify end date or mark as currently working', ToastAndroid.SHORT);
            setIsLoading(false);
            return;
        }

        try {
            const experienceData = {
                title: newExperience.title,
                hospital: newExperience.hospital,
                employmentType: newExperience.employmentType,
                from: newExperience.from,
                currentlyWorking: newExperience.currentlyWorking
            };

            // Only include 'to' if not currently working
            if (!newExperience.currentlyWorking) {
                experienceData.to = newExperience.to;
            }

            const res = await axios.post(`${baseUrl}/experience/add/${doctor.id}`, experienceData);

            if (res.status === 200 || res.status === 201) {
                ToastAndroid.show('Experience added successfully', ToastAndroid.SHORT);
                
                // Add the new experience to the existing experiences array
                const newExperienceWithId = res.data.experience || { ...experienceData, id: Date.now() };
                setExperiences(prevExperiences => [...prevExperiences, newExperienceWithId]);
                
                setNewExperience({
                    title: '',
                    hospital: '',
                    employmentType: '',
                    from: '',
                    to: '',
                    currentlyWorking: false
                });
                setModalVisible(false);
            }
            else {
                ToastAndroid.show('Failed to add experience', ToastAndroid.SHORT);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to add experience';
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        } finally {
            setIsLoading(false);
        }
    }

    const handleDeleteExperience = async (experienceId) => {
        try {
            const res = await axios.delete(`${baseUrl}/experience/delete/${experienceId}/${doctor.id}`);
            
            if (res.status === 200 || res.status === 201) {
                ToastAndroid.show('Experience deleted successfully', ToastAndroid.SHORT);
                
                // Remove the deleted experience from the array
                setExperiences(prevExperiences => 
                    prevExperiences.filter(exp => exp.id !== experienceId)
                );
            } else {
                ToastAndroid.show('Failed to delete experience', ToastAndroid.SHORT);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to delete experience';
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        }
    }

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row justify-start items-center  bg-white p-5 rounded-b-2xl">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icons name="arrow-left" size={24} color="#164972" />
                </TouchableOpacity>
                <Text className="font-semibold text-xl text-primary ml-5 tracking-wide">Experiences</Text>
            </View>

            {/* Content Area */}
            <ScrollView className="flex-1 px-5 py-3" showsVerticalScrollIndicator={false}>
                {isFetching ? (
                    // Loading indicator while fetching
                    <View className="flex-1 justify-center items-center py-20">
                        <ActivityIndicator size="large" color="#164972" />
                        <Text className="text-gray-500 mt-3">Loading experiences...</Text>
                    </View>
                ) : error ? (
                    // Error display
                    <View className="flex-1 justify-center items-center py-20">
                        <Icons name="alert-circle" size={48} color="#ef4444" />
                        <Text className="text-red-500 mt-3 text-center px-4">{error}</Text>
                        <TouchableOpacity 
                            className="mt-4 bg-primary px-6 py-2 rounded-lg"
                            onPress={() => fetchExperiences()}
                        >
                            <Text className="text-white font-semibold">Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : !experiences || experiences.length === 0 ? (
                    // Empty state - handles both null/undefined and empty array
                    <View className="flex-1 justify-center items-center py-20">
                        <Icons name="briefcase" size={48} color="#9ca3af" />
                        <Text className="text-gray-500 mt-3 text-center">No experiences added yet</Text>
                        <Text className="text-gray-400 mt-1 text-center">Tap the + button to add your first experience</Text>
                    </View>
                ) : (
                    // Experience cards
                    <View className="space-y-3">
                        {experiences.filter(experience => experience && typeof experience === 'object').map((experience, index) => (
                            <View 
                                key={experience.id || `experience-${index}`} 
                                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
                            >
                                <View className="flex-row items-start justify-between">
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-800 mb-1">
                                            {experience.title || 'Unknown Position'}
                                        </Text>
                                        <View className="flex-row items-center mb-2">
                                            <Icons name="map-pin" size={14} color="#6b7280" />
                                            <Text className="text-gray-600 ml-2 flex-1">
                                                {experience.hospital || 'Unknown Hospital'}
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center mb-2">
                                            <Icons name="user" size={14} color="#6b7280" />
                                            <Text className="text-gray-600 ml-2">
                                                {experience.employmentType || 'Unknown Type'}
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <Icons name="calendar" size={14} color="#6b7280" />
                                            <Text className="text-gray-600 ml-2">
                                                {experience.from || 'Unknown'} - {experience.currentlyWorking ? 'Present' : (experience.to || 'Unknown')}
                                            </Text>
                                        </View>
                                        {experience.currentlyWorking && (
                                            <View className="flex-row items-center mt-1">
                                                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                                                <Text className="text-green-600 text-sm font-medium">Currently Working</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View className="flex-col items-center space-y-2">
                                        <View className="bg-primary/10 p-2 rounded-full">
                                            <Icons name="briefcase" size={20} color="#164972" />
                                        </View>
                                        <TouchableOpacity 
                                            onPress={() => handleDeleteExperience(experience.id)}
                                            className="bg-red-100 p-2 rounded-full"
                                        >
                                            <Icons name="trash-2" size={16} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            <TouchableOpacity
                className="absolute bottom-5 right-5 bg-primary p-3 rounded-full shadow-lg z-40"
                onPress={() => setModalVisible(true)}
            >
                <Icons name="plus" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Modal for adding new experience */}
            <Modal
                visible={isModalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
                transparent={true}
            >
                <View className="bg-black/20  flex-1">
                    <View className="bg-white p-5 rounded-lg w-full h-fit absolute bottom-0">
                        <Text className="text-lg font-bold mb-6">Add Experience Details</Text>
                        <View className="absolute top-6 right-5 z-10">
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icons name="x" size={20} color="#111" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
                            {/* Job Title */}
                            <Text className="text-sm font-semibold mb-2">Job Title *</Text>
                            <TextInput
                                className="border border-gray-300 p-2 px-3 py-3 mb-4 rounded-xl text-slate-500"
                                placeholder="e.g. Senior Doctor, Consultant"
                                placeholderTextColor="#aaa"
                                value={newExperience.title}
                                onChangeText={(text) => setNewExperience({ ...newExperience, title: text })}
                            />

                            {/* Hospital */}
                            <Text className="text-sm font-semibold mb-2">Hospital/Organization *</Text>
                            <TextInput
                                className="border border-gray-300 p-2 px-3 py-3 mb-4 rounded-xl text-slate-500"
                                placeholder="e.g. ABC Hospital, XYZ Clinic"
                                placeholderTextColor="#aaa"
                                value={newExperience.hospital}
                                onChangeText={(text) => setNewExperience({ ...newExperience, hospital: text })}
                            />

                            {/* Employment Type */}
                            <Text className="text-sm font-semibold mb-2">Employment Type *</Text>
                            <TextInput
                                className="border border-gray-300 p-2 px-3 py-3 mb-4 rounded-xl text-slate-500"
                                placeholder="e.g. Full-time, Part-time, Contract"
                                placeholderTextColor="#aaa"
                                value={newExperience.employmentType}
                                onChangeText={(text) => setNewExperience({ ...newExperience, employmentType: text })}
                            />

                            {/* Start Date */}
                            <Text className="text-sm font-semibold mb-2">Start Date *</Text>
                            <TextInput
                                className="border border-gray-300 p-2 px-3 py-3 mb-4 rounded-xl text-slate-500"
                                placeholder="e.g. 2020"
                                placeholderTextColor="#aaa"
                                value={newExperience.from}
                                keyboardType='numeric'
                                maxLength={4}
                                onChangeText={(text) => setNewExperience({ ...newExperience, from: text })}
                            />

                            {/* Currently Working Checkbox */}
                            <TouchableOpacity 
                                className="flex-row items-center mb-4"
                                onPress={() => setNewExperience({ 
                                    ...newExperience, 
                                    currentlyWorking: !newExperience.currentlyWorking,
                                    to: !newExperience.currentlyWorking ? '' : newExperience.to
                                })}
                            >
                                <View className={`w-5 h-5 border-2 border-primary rounded mr-3 ${newExperience.currentlyWorking ? 'bg-primary' : 'bg-white'}`}>
                                    {newExperience.currentlyWorking && (
                                        <Icons name="check" size={12} color="white" style={{margin: 1}} />
                                    )}
                                </View>
                                <Text className="text-gray-700">I currently work here</Text>
                            </TouchableOpacity>

                            {/* End Date - only show if not currently working */}
                            {!newExperience.currentlyWorking && (
                                <>
                                    <Text className="text-sm font-semibold mb-2">End Date *</Text>
                                    <TextInput
                                        className="border border-gray-300 p-2 px-3 py-3 mb-4 rounded-xl text-slate-500"
                                        placeholder="e.g. 2023"
                                        placeholderTextColor="#aaa"
                                        value={newExperience.to}
                                        keyboardType='numeric'
                                        maxLength={4}
                                        onChangeText={(text) => setNewExperience({ ...newExperience, to: text })}
                                    />
                                </>
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            className="w-full bg-primary px-2 py-3 rounded-2xl flex items-center justify-center mb-4 mt-4"
                            onPress={() => {
                                handleAddExperience();
                            }}
                        >
                            {
                                isLoading ?
                                    <ActivityIndicator color='white' />
                                    :
                                    <Text className="font-bold text-white text-md tracking-wide">Add Experience</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default Experience