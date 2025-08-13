import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, ToastAndroid, ActivityIndicator } from 'react-native'
import React, { use, useEffect, useState } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/Feather';
import { useGetDoctor } from '../hooks/useGetDoctor';
import axios from 'axios';
import baseUrl from '../utils/baseUrl';
import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';

const Slots = () => {
    const navigation = useNavigation();
    const doctor = useGetDoctor();
    const isFocused = useIsFocused();
    const [statusOptions, setStatusOptions] = useState([]);
    const [activeStatus, setActiveStatus] = useState('monday');
    const [isModalVisible, setModalVisible] = useState(false);
    const [isFeatching, setIsFetching] = useState(false);
    const [error, setError] = useState('');
    const [slots, setSlots] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isAddingSlot, setIsAddingSlot] = useState(false);
    const [newSlot, setNewSlot] = useState({
        startTime: '',
        endTime: '',
        timeFrame: '30'
    });


    const fetchSchedules = async () => {
        setIsFetching(true);
        setError('');
        try {
            const res = await axios.get(`${baseUrl}/timing/get/available/${doctor.id}`);
            if (res.status === 200 || res.status === 201) {
                console.log('Fetched schedules:', res.data);
                setStatusOptions(res.data);
            } else {
                setError('Failed to fetch schedules');
                ToastAndroid.show('Failed to fetch schedules', ToastAndroid.SHORT);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
            setError(errorMessage);
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        } finally {
            setIsFetching(false);
        }
    }

    const fetchSlots = async (timingId) => {
        if (!timingId) return;
        
        setIsLoadingSlots(true);
        try {
            const res = await axios.get(`${baseUrl}/slot/get/${timingId}`);
            if (res.status === 200 || res.status === 201) {
                setSlots(res.data.slots || res.data || []);
            } else {
                setSlots([]);
                ToastAndroid.show('Failed to fetch slots', ToastAndroid.SHORT);
            }
        } catch (error) {
            console.log('Error fetching slots:', error);
            setSlots([]);
        } finally {
            setIsLoadingSlots(false);
        }
    }

    const handleAddSlot = async () => {
        if (!activeStatus?.id) {
            ToastAndroid.show('Please select a day first', ToastAndroid.SHORT);
            return;
        }

        // Validation
        if (!newSlot.startTime.trim() || !newSlot.endTime.trim()) {
            ToastAndroid.show('Please fill all fields', ToastAndroid.SHORT);
            return;
        }

        // Helper function to convert time string to minutes for comparison
        const timeToMinutes = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(num => parseInt(num));
            return hours * 60 + minutes;
        };

        // Check if start time is before end time
        const startMinutes = timeToMinutes(newSlot.startTime);
        const endMinutes = timeToMinutes(newSlot.endTime);
        
        if (startMinutes >= endMinutes) {
            ToastAndroid.show('Start time must be before end time', ToastAndroid.SHORT);
            return;
        }

        // Check if times are within the day's range
        const dayStartMinutes = timeToMinutes(activeStatus.startTime);
        const dayEndMinutes = timeToMinutes(activeStatus.endTime);
        
        if (startMinutes < dayStartMinutes || endMinutes > dayEndMinutes) {
            ToastAndroid.show(`Time must be between ${activeStatus.startTime} - ${activeStatus.endTime}`, ToastAndroid.SHORT);
            return;
        }

        setIsAddingSlot(true);
        try {
            const slotData = {
                timingId: activeStatus.id,
                startTime: newSlot.startTime,
                endTime: newSlot.endTime,
                timeFrame: parseInt(newSlot.timeFrame)
            };

            const res = await axios.post(`${baseUrl}/slot/add`, slotData);

            if (res.status === 200 || res.status === 201) {
                ToastAndroid.show('Slot added successfully', ToastAndroid.SHORT);
                
                // Add new slot to the list
                const newSlotWithId = res.data.slot || { ...slotData, id: Date.now() };
                fetchSlots(activeStatus.id); // Refresh slots for the current day
                
                // Reset form
                setNewSlot({
                    startTime: '',
                    endTime: '',
                    timeFrame: '30'
                });
                setModalVisible(false);
            } else {
                ToastAndroid.show('Failed to add slot', ToastAndroid.SHORT);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to add slot';
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        } finally {
            setIsAddingSlot(false);
        }
    }

    const handleDeleteSlot = async (slotId) => {
        try {
            const res = await axios.delete(`${baseUrl}/slot/delete/${slotId}`);
            
            if (res.status === 200 || res.status === 201) {
                ToastAndroid.show('Slot deleted successfully', ToastAndroid.SHORT);
                
                // Remove slot from the list
                setSlots(prevSlots => prevSlots.filter(slot => slot.id !== slotId));
            } else {
                ToastAndroid.show('Failed to delete slot', ToastAndroid.SHORT);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to delete slot';
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        }
    }

    const sortDays = (data) => {
        const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
        
        return data.sort((a, b) => {
            return dayOrder.indexOf(a?.key.toLowerCase()) - dayOrder.indexOf(b?.key.toLowerCase());
        });
    }

    useEffect(() => {
        setActiveStatus(statusOptions[0]);
    },[statusOptions]);


    const handleStatusChange = (status) => {
        setActiveStatus(status);
        fetchSlots(status.id); // Fetch slots when day changes
    };

    // Fetch slots when activeStatus changes
    useEffect(() => {
        if (activeStatus?.id) {
            fetchSlots(activeStatus.id);
        }
    }, [activeStatus]);


    useEffect(() => {
        if(isFocused){
            fetchSchedules();
        }
    }, [isFocused])

    return (
        <View className="flex-1 bg-white">

            {/* Add Button */}
            <TouchableOpacity
                className="absolute bottom-5 right-5 bg-primary p-3 rounded-full shadow-lg z-40"
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Modal for adding new slot */}
            <Modal
                visible={isModalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
                transparent={true}
            >
                <View className="bg-black/20  flex-1">
                    <View className="bg-white p-5 rounded-lg w-full h-fit pb-10 absolute bottom-0">
                        <Text className="text-lg font-bold mb-6">Add New Slot</Text>
                        <View className="absolute top-6 right-5 z-10">
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icons name="x" size={20} color="#111" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="max-h-80">
                            {/* Selected Day */}
                            <Text className="text-sm font-semibold mb-2">Selected Day</Text>
                            <TextInput
                                className="border border-gray-300 p-2 uppercase px-3 py-3 mb-4 rounded-xl text-slate-500"
                                value={activeStatus?.label || ''}
                                editable={false}
                                placeholder="Selected Day"
                            />

                            {/* Available Time Range */}
                            <Text className="text-sm font-semibold mb-2">Available Time Range</Text>
                            <View className="bg-gray-100 p-3 rounded-xl mb-4">
                                <Text className="text-gray-600 text-center">
                                    {activeStatus?.startTime} - {activeStatus?.endTime}
                                </Text>
                            </View>

                            {/* Start Time and End Time */}
                            <Text className="text-sm font-semibold mb-2">Slot Timing</Text>
                            <View className="flex-row justify-between items-center mb-4">
                                <View className="w-[45%]">
                                    <Text className="text-xs text-gray-500 mb-1">Start Time</Text>
                                    <TextInput
                                        className="border border-gray-300 p-2 rounded-xl text-center"
                                        placeholder="HH:MM"
                                        placeholderTextColor={'slategray'}
                                        value={newSlot.startTime}
                                        onChangeText={(text) => setNewSlot({...newSlot, startTime: text})}
                                    />
                                </View>

                                <View className="w-[45%]">
                                    <Text className="text-xs text-gray-500 mb-1">End Time</Text>
                                    <TextInput
                                        className="border border-gray-300 p-2 rounded-xl text-center"
                                        placeholder="HH:MM"
                                        placeholderTextColor={'slategray'}
                                        value={newSlot.endTime}
                                        onChangeText={(text) => setNewSlot({...newSlot, endTime: text})}
                                    />
                                </View>
                            </View>

                            {/* Time Frame Options */}
                            <Text className="text-sm font-semibold mb-2">Appointment Duration</Text>
                            <View className="flex-row justify-between mb-6">
                                <TouchableOpacity 
                                    className={`flex-1 p-3 rounded-xl mr-2 border ${newSlot.timeFrame === '15' ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}
                                    onPress={() => setNewSlot({...newSlot, timeFrame: '15'})}
                                >
                                    <Text className={`text-center font-medium ${newSlot.timeFrame === '15' ? 'text-white' : 'text-gray-600'}`}>
                                        15 Minutes
                                    </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    className={`flex-1 p-3 rounded-xl ml-2 border ${newSlot.timeFrame === '30' ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}
                                    onPress={() => setNewSlot({...newSlot, timeFrame: '30'})}
                                >
                                    <Text className={`text-center font-medium ${newSlot.timeFrame === '30' ? 'text-white' : 'text-gray-600'}`}>
                                        30 Minutes
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>

                        {/* Add Slot Button */}
                        <TouchableOpacity
                            className="w-full bg-primary px-2 py-3 rounded-2xl flex items-center justify-center mb-4"
                            onPress={handleAddSlot}
                        >
                            {isAddingSlot ? (
                                <ActivityIndicator color='white' />
                            ) : (
                                <Text className="font-bold text-white text-md tracking-wide">Add Slot</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Header Section */}
            <View className="bg-white px-5 pt-4">
                <View className="flex-row items-center justify-between mb-1">
                    <TouchableOpacity className="p-2 -ml-2"
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>

                    <View className="flex-1 items-center">
                        <Text className="text-xl font-bold text-gray-900 tracking-widest">
                            Your Slots
                        </Text>
                    </View>

                    <TouchableOpacity className="p-2 -mr-2"
                    onPress={() => navigation.navigate('Timings')}
                    >
                        <Ionicons name="calendar-outline" size={24} color="#374151" />
                    </TouchableOpacity>
                </View>
            </View>

            {
                isFeatching ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#374151" />
                        <Text className="text-gray-500 mt-2">Loading slots...</Text>
                    </View>
                ) : error ? (
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-red-500">{error}</Text>
                    </View>
                ) : (
                    <View className="flex-1 p-5">
                        <View className="mb-4">
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                className="flex-row"
                            >
                                {sortDays(statusOptions).map((option) => (
                                    <TouchableOpacity
                                        key={option?.id}
                                        onPress={() => handleStatusChange(option)}
                                        className={`mr-3 px-4 py-2 rounded-full border ${activeStatus?.key === option?.key
                                            ? 'bg-primary border-primary'
                                            : 'bg-white border-gray-300'
                                            }`}
                                    >
                                        <Text
                                            className={`font-medium ${activeStatus?.key === option?.key
                                                ? 'text-white'
                                                : 'text-gray-600'
                                                }`}
                                        >
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Slots Content */}
                        <View className="flex-1">
                            {isLoadingSlots ? (
                                <View className="flex-1 items-center justify-center">
                                    <ActivityIndicator size="large" color="#164972" />
                                    <Text className="text-gray-500 mt-2">Loading slots...</Text>
                                </View>
                            ) : !activeStatus ? (
                                <View className="flex-1 items-center justify-center">
                                    <Text className="text-gray-400 text-base">
                                        Please select a day to view slots
                                    </Text>
                                </View>
                            ) : slots.length === 0 ? (
                                <View className="flex-1 items-center justify-center">
                                    <Icons name="clock" size={48} color="#9ca3af" />
                                    <Text className="text-gray-400 text-base mt-3">
                                        No slots available for {activeStatus?.label}
                                    </Text>
                                    <Text className="text-gray-400 text-sm mt-1">
                                        Tap the + button to add your first slot
                                    </Text>
                                </View>
                            ) : (
                                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                                    <View className="space-y-3">
                                        {slots.map((slot, index) => (
                                            <View 
                                                key={slot.id || `slot-${index}`}
                                                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
                                            >
                                                <View className="flex-row items-center justify-between">
                                                    <View className="flex-1">
                                                        <View className="flex-row items-center mb-2">
                                                            <Icons name="clock" size={16} color="#164972" />
                                                            <Text className="text-lg font-bold text-gray-800 ml-2">
                                                                {slot.startTime} - {slot.endTime}
                                                            </Text>
                                                        </View>
                                                        <View className="flex-row items-center">
                                                            <Icons name="calendar" size={14} color="#6b7280" />
                                                            <Text className="text-gray-600 ml-2">
                                                                Duration: {(() => {
                                                                    const timeToMinutes = (timeStr) => {
                                                                        const [hours, minutes] = timeStr.split(':').map(num => parseInt(num));
                                                                        return hours * 60 + minutes;
                                                                    };
                                                                    const startMinutes = timeToMinutes(slot.startTime);
                                                                    const endMinutes = timeToMinutes(slot.endTime);
                                                                    const duration = endMinutes - startMinutes;
                                                                    
                                                                    if (duration >= 60) {
                                                                        const hours = Math.floor(duration / 60);
                                                                        const mins = duration % 60;
                                                                        return mins > 0 ? `${hours}h ${mins} min` : `${hours}h`;
                                                                    } else {
                                                                        return `${duration} min`;
                                                                    }
                                                                })()} 
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    
                                                    <TouchableOpacity 
                                                        onPress={() => handleDeleteSlot(slot.id)}
                                                        className="bg-red-100 p-2 rounded-full ml-3"
                                                    >
                                                        <Icons name="trash-2" size={16} color="#ef4444" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </ScrollView>
                            )}
                        </View>
                    </View>
                )
            }

        </View>
    )
}

export default Slots