import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, ToastAndroid } from 'react-native'
import React, { useState, useEffect } from 'react'
import Icons from 'react-native-vector-icons/Feather'
import { useGetDoctor } from '../hooks/useGetDoctor'
import axios from 'axios'
import baseUrl from '../utils/baseUrl'

const Educations = ({ navigation }) => {
    const doctor = useGetDoctor()
    const [isModalVisible, setModalVisible] = useState(false);
    const [activeStatus, setActiveStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [newEducation, setNewEducation] = useState({
        courseName: '',
        universityName: '',
        yearOfPassing: ''
    });

    const [isFetching, setIsFetching] = useState(false);
    const [educations, setEducations] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (doctor?.id) {
            fetchEducations();
        }
    }, [doctor?.id]);



    const fetchEducations = async () => {
        setIsFetching(true);
        setError('');
        try {
            const res = await axios.get(`${baseUrl}/education/get/${doctor.id}`);
            if (res.status === 200 || res.status === 201) {
                // Handle different response structures and ensure we always have an array
                const educationData = res.data.educationDetails || res.data || [];
                const validEducations = Array.isArray(educationData) ? educationData : [];
                setEducations(validEducations);
            } else {
                setError('Failed to fetch educations');
                ToastAndroid.show('Failed to fetch educations', ToastAndroid.SHORT);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
            setError(errorMessage);
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
            // Set educations to empty array on error to show empty state
            setEducations([]);
        } finally {
            setIsFetching(false);
        }
    }


    const handleAddEducation = async () => {
        setIsLoading(true);

        // validation of input fields
        if (!newEducation.courseName.trim() || !newEducation.universityName.trim() || !newEducation.yearOfPassing.trim()) {
            ToastAndroid.show('Please fill all fields', ToastAndroid.SHORT);
            setIsLoading(false);
            return;
        }

        try {
            
            const res = await axios.post(`${baseUrl}/education/add/${doctor.id}`, {
                courseName: newEducation.courseName.trim(),
                universityName: newEducation.universityName.trim(),
                yearOfPassing: newEducation.yearOfPassing.trim()
            });

            

            if (res.status === 200 || res.status === 201) {
                ToastAndroid.show('Education added successfully', ToastAndroid.SHORT);
                
                // Add the new education to the existing educations array
                const newEducationWithId = res.data.education || { ...newEducation, id: Date.now() };
                setEducations(prevEducations => [...prevEducations, newEducationWithId]);
                
                setNewEducation({
                    courseName: '',
                    universityName: '',
                    yearOfPassing: ''
                });
                setModalVisible(false);
            }
            else {
                ToastAndroid.show('Failed to add education', ToastAndroid.SHORT);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to add education';
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        } finally {
            setIsLoading(false);
        }
    }

    const handleDeleteEducation = async (educationId) => {
        try {
            const res = await axios.delete(`${baseUrl}/education/delete/${educationId}/${doctor.id}`);
            
            if (res.status === 200 || res.status === 201) {
                ToastAndroid.show('Education deleted successfully', ToastAndroid.SHORT);
                
                // Remove the deleted education from the array
                setEducations(prevEducations => 
                    prevEducations.filter(edu => edu.id !== educationId)
                );
            } else {
                ToastAndroid.show('Failed to delete education', ToastAndroid.SHORT);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to delete education';
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
                <Text className="font-semibold text-xl text-primary ml-5 tracking-wide">Educations</Text>
            </View>

            {/* Content Area */}
            <ScrollView className="flex-1 px-5 py-3" showsVerticalScrollIndicator={false}>
                {isFetching ? (
                    // Loading indicator while fetching
                    <View className="flex-1 justify-center items-center py-20">
                        <ActivityIndicator size="large" color="#164972" />
                        <Text className="text-gray-500 mt-3">Loading educations...</Text>
                    </View>
                ) : error ? (
                    // Error display
                    <View className="flex-1 justify-center items-center py-20">
                        <Icons name="alert-circle" size={48} color="#ef4444" />
                        <Text className="text-red-500 mt-3 text-center px-4">{error}</Text>
                        <TouchableOpacity 
                            className="mt-4 bg-primary px-6 py-2 rounded-lg"
                            onPress={() => fetchEducations()}
                        >
                            <Text className="text-white font-semibold">Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : !educations || educations.length === 0 ? (
                    // Empty state - handles both null/undefined and empty array
                    <View className="flex-1 justify-center items-center py-20">
                        <Icons name="book-open" size={48} color="#9ca3af" />
                        <Text className="text-gray-500 mt-3 text-center">No educations added yet</Text>
                        <Text className="text-gray-400 mt-1 text-center">Tap the + button to add your first education</Text>
                    </View>
                ) : (
                    // Education cards
                    <View className="space-y-3">
                        {educations.filter(education => education && typeof education === 'object').map((education, index) => (
                            <View 
                                key={education.id || `education-${index}`} 
                                className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm"
                            >
                                <View className="flex-row items-start justify-between">
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-800 mb-1 uppercase">
                                            {education.courseName || 'Unknown Course'}
                                        </Text>
                                        <View className="flex-row items-center mb-2">
                                            <Icons name="home" size={14} color="#6b7280" />
                                            <Text className="text-gray-600 ml-2 flex-1 uppercase">
                                                {education.universityName || 'Unknown University'}
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <Icons name="calendar" size={14} color="#6b7280" />
                                            <Text className="text-gray-600 ml-2">
                                                Graduated in {education.yearOfPassing || 'Unknown Year'}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="flex-col items-center space-y-2">
                                        <View className="bg-primary/10 p-2 rounded-full">
                                            <Icons name="award" size={20} color="#164972" />
                                        </View>
                                        <TouchableOpacity 
                                            onPress={() => handleDeleteEducation(education.id)}
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

            {/* Modal for adding new slot */}
            <Modal
                visible={isModalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
                transparent={true}
            >
                <View className="bg-black/20  flex-1">
                    <View className="bg-white p-5 rounded-lg w-full h-fit absolute bottom-0">
                        <Text className="text-lg font-bold mb-6">Add Education Details</Text>
                        {/* Add your form fields here */}
                        <View className="absolute top-6 right-5 z-10">
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icons name="x" size={20} color="#111" />
                            </TouchableOpacity>
                        </View>
                        {/* {courseName , universityName, yearOfPassing} */}
                        <Text className="text-sm font-semibold mb-2">Course Name</Text>
                        <TextInput
                            className="border border-gray-300 p-2 uppercase px-3 py-3 mb-4 rounded-xl text-slate-500"
                            placeholder="e.g. MBBS, BDS"
                            placeholderTextColor="#aaa"
                            value={newEducation.courseName}
                            onChangeText={(text) => setNewEducation({ ...newEducation, courseName: text })}
                        />

                        <Text className="text-sm font-semibold mb-2">University Name</Text>
                        <TextInput
                            className="border border-gray-300 p-2 uppercase px-3 py-3 mb-4 rounded-xl text-slate-500"
                            placeholder="e.g. XYZ University"
                            placeholderTextColor="#aaa"
                            value={newEducation.universityName}
                            onChangeText={(text) => setNewEducation({ ...newEducation, universityName: text })}
                        />

                        <Text className="text-sm font-semibold mb-2">Year of Passing</Text>
                        <TextInput
                            className="border border-gray-300 p-2 uppercase px-3 py-3 mb-4 rounded-xl text-slate-500"
                            placeholder="e.g. 2023"
                            placeholderTextColor="#aaa"
                            keyboardType="numeric"
                            value={newEducation.yearOfPassing}
                            onChangeText={(text) => setNewEducation({ ...newEducation, yearOfPassing: text })}
                        />

                        {/* EACH SLOT TIMING */}
                        <TouchableOpacity
                            className="w-full bg-primary px-2 py-3 rounded-2xl flex items-center justify-center mb-4"
                            onPress={() => {
                                handleAddEducation();
                            }}
                        >
                            {
                                isLoading ?
                                    <ActivityIndicator color='white' />
                                    :

                                    <Text className="font-bold text-white text-md tracking-wide">Add</Text>
                            }

                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}


export default Educations