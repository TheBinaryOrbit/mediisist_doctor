import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, ToastAndroid, Switch } from 'react-native'
import React, { useState, useEffect } from 'react'
import Icons from 'react-native-vector-icons/Feather'
import { useGetDoctor } from '../hooks/useGetDoctor'
import axios from 'axios'
import baseUrl from '../utils/baseUrl'

const Timings = ({ navigation }) => {
    const doctor = useGetDoctor()
    const [timings, setTimings] = useState([])
    const [isFetching, setIsFetching] = useState(false)
    const [error, setError] = useState('')
    const [isModalVisible, setModalVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedTiming, setSelectedTiming] = useState(null)
    const [updatedTiming, setUpdatedTiming] = useState({
        day: '',
        startTime: '',
        endTime: '',
        isAvailable: true,
        fee: 0
    })


    const [sortedTimings, setSortedTimings] = useState([]);

    useEffect(() => {
        if (doctor?.id) {
            fetchTimings();
        }
    }, [doctor?.id]);

    const fetchTimings = async () => {
        setIsFetching(true);
        setError('');
        try {
            const res = await axios.get(`${baseUrl}/timing/get/${doctor.id}`);
            if (res.status === 200 || res.status === 201) {
                const timingData = res.data || [];
                const validTimings = Array.isArray(timingData) ? timingData : [];
                setTimings(validTimings);
            } else {
                setError('Failed to fetch timings');
                ToastAndroid.show('Failed to fetch timings', ToastAndroid.SHORT);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
            setError(errorMessage);
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
            setTimings([]);
        } finally {
            setIsFetching(false);
        }
    }

    const handleUpdateTiming = async () => {
        setIsLoading(true);

        // Validation only if available
        if (updatedTiming.isAvailable) {
            if (!updatedTiming.startTime.trim() || !updatedTiming.endTime.trim()) {
                ToastAndroid.show('Please fill start and end time for available days', ToastAndroid.SHORT);
                setIsLoading(false);
                return;
            }
        }

        try {
            const timingData = {
                day: updatedTiming.day,
                isAvailable: updatedTiming.isAvailable,
                fee: parseFloat(updatedTiming.fee) || 0
            };

            // Only include time fields if available
            if (updatedTiming.isAvailable) {
                timingData.startTime = updatedTiming.startTime;
                timingData.endTime = updatedTiming.endTime;
            }

            const res = await axios.put(`${baseUrl}/timing/update/${doctor.id}`, timingData);

            if (res.status === 200 || res.status === 201) {
                ToastAndroid.show('Timing updated successfully', ToastAndroid.SHORT);

                // Update the timing in the array
                setTimings(prevTimings =>
                    prevTimings.map(timing =>
                        timing.id === selectedTiming.id
                            ? { ...timing, ...timingData }
                            : timing
                    )
                );

                setModalVisible(false);
                setSelectedTiming(null);
            } else {
                ToastAndroid.show('Failed to update timing', ToastAndroid.SHORT);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to update timing';
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        } finally {
            setIsLoading(false);
        }
    }

    const openUpdateModal = (timing) => {
        setSelectedTiming(timing);
        setUpdatedTiming({
            day: timing.day,
            startTime: timing.startTime || '',
            endTime: timing.endTime || '',
            isAvailable: timing.isAvailable,
            fee: timing.fee || 0
        });
        setModalVisible(true);
    }

    const sortDays = (data) => {
        const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

        return data.sort((a, b) => {
            return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        });
    }
    

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row justify-start items-center  bg-white p-5 rounded-b-2xl">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icons name="arrow-left" size={24} color="#164972" />
                </TouchableOpacity>
                <Text className="font-semibold text-xl text-primary ml-5 tracking-wide">Schedules</Text>
            </View>

            {/* Content Area */}
            <ScrollView className="flex-1 px-5 py-3" showsVerticalScrollIndicator={false}>
                {isFetching ? (
                    // Loading indicator while fetching
                    <View className="flex-1 justify-center items-center py-20">
                        <ActivityIndicator size="large" color="#164972" />
                        <Text className="text-gray-500 mt-3">Loading schedules...</Text>
                    </View>
                ) : error ? (
                    // Error display
                    <View className="flex-1 justify-center items-center py-20">
                        <Icons name="alert-circle" size={48} color="#ef4444" />
                        <Text className="text-red-500 mt-3 text-center px-4">{error}</Text>
                        <TouchableOpacity
                            className="mt-4 bg-primary px-6 py-2 rounded-lg"
                            onPress={() => fetchTimings()}
                        >
                            <Text className="text-white font-semibold">Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : !timings || timings.length === 0 ? (
                    // Empty state
                    <View className="flex-1 justify-center items-center py-20">
                        <Icons name="calendar" size={48} color="#9ca3af" />
                        <Text className="text-gray-500 mt-3 text-center">No schedules found</Text>
                        <Text className="text-gray-400 mt-1 text-center">Contact support to set up your schedule</Text>
                    </View>
                ) : (
                    // Timing cards
                    <View className="space-y-3 mb-10">
                        {sortDays(timings).map((timing, index) => (
                            <View
                                key={timing.id || `timing-${index}`}
                                className={`p-4 rounded-xl border-2 shadow-sm ${timing.isAvailable
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                            >
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-1">
                                        <View className="flex-row items-center mb-2">
                                            <Text className="text-lg font-bold text-gray-800 mr-3">
                                                {timing.day}
                                            </Text>
                                            <View className={`px-2 py-1 rounded-full ${timing.isAvailable
                                                    ? 'bg-green-100'
                                                    : 'bg-gray-100'
                                                }`}>
                                                <Text className={`text-xs font-medium ${timing.isAvailable
                                                        ? 'text-green-800'
                                                        : 'text-gray-600'
                                                    }`}>
                                                    {timing.isAvailable ? 'Available' : 'Not Available'}
                                                </Text>
                                            </View>
                                        </View>

                                        {timing.isAvailable ? (
                                            <>
                                                <View className="flex-row items-center mb-1">
                                                    <Icons name="clock" size={14} color="#6b7280" />
                                                    <Text className="text-gray-600 ml-2">
                                                        {timing.startTime} - {timing.endTime}
                                                    </Text>
                                                </View>
                                                <View className="flex-row items-center">
                                                    <Icons name="dollar-sign" size={14} color="#6b7280" />
                                                    <Text className="text-gray-600 ml-2">
                                                        Fee: ₹{timing.fee || 0}
                                                    </Text>
                                                </View>
                                            </>
                                        ) : (
                                            <Text className="text-gray-500 text-sm">
                                                Day off - No appointments available
                                            </Text>
                                        )}
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => openUpdateModal(timing)}
                                        className="bg-primary p-3 w-10 h-10 rounded-full ml-3 items-center justify-center"
                                    >
                                        <Icons name="edit" size={16} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Update Modal */}
            <Modal
                visible={isModalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
                transparent={true}
            >
                <View className="bg-black/20  flex-1">
                    <View className="bg-white p-5 rounded-lg w-full h-fit absolute bottom-0">
                        <Text className="text-lg font-bold mb-6">Update Schedule - {updatedTiming.day}</Text>
                        <View className="absolute top-6 right-5 z-10">
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icons name="x" size={20} color="#111" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
                            {/* Availability Toggle */}
                            <View className="flex-row items-center justify-between mb-6">
                                <Text className="text-base font-semibold">Available on {updatedTiming.day}</Text>
                                <Switch
                                    value={updatedTiming.isAvailable}
                                    onValueChange={(value) => setUpdatedTiming({
                                        ...updatedTiming,
                                        isAvailable: value,
                                        startTime: value ? updatedTiming.startTime : '',
                                        endTime: value ? updatedTiming.endTime : ''
                                    })}
                                    trackColor={{ false: '#d1d5db', true: '#164972' }}
                                    thumbColor={updatedTiming.isAvailable ? '#fff' : '#f3f4f6'}
                                />
                            </View>

                            {updatedTiming.isAvailable && (
                                <>
                                    {/* Start Time */}
                                    <Text className="text-sm font-semibold mb-2">Start Time *</Text>
                                    <TextInput
                                        className="border border-gray-300 p-2 px-3 py-3 mb-4 rounded-xl text-slate-500"
                                        placeholder="e.g. 09:00"
                                        placeholderTextColor="#aaa"
                                        value={updatedTiming.startTime}
                                        onChangeText={(text) => setUpdatedTiming({ ...updatedTiming, startTime: text })}
                                    />

                                    {/* End Time */}
                                    <Text className="text-sm font-semibold mb-2">End Time *</Text>
                                    <TextInput
                                        className="border border-gray-300 p-2 px-3 py-3 mb-4 rounded-xl text-slate-500"
                                        placeholder="e.g. 17:00"
                                        placeholderTextColor="#aaa"
                                        value={updatedTiming.endTime}
                                        onChangeText={(text) => setUpdatedTiming({ ...updatedTiming, endTime: text })}
                                    />

                                    {/* Fee */}
                                    <Text className="text-sm font-semibold mb-2">Consultation Fee</Text>
                                    <TextInput
                                        className="border border-gray-300 p-2 px-3 py-3 mb-4 rounded-xl text-slate-500"
                                        placeholder="e.g. 500"
                                        placeholderTextColor="#aaa"
                                        keyboardType="numeric"
                                        value={updatedTiming.fee.toString()}
                                        onChangeText={(text) => setUpdatedTiming({ ...updatedTiming, fee: text })}
                                    />
                                </>
                            )}

                            {!updatedTiming.isAvailable && (
                                <View className="bg-gray-100 p-4 rounded-xl">
                                    <Text className="text-gray-600 text-center">
                                        This day will be marked as unavailable. No appointments can be booked.
                                    </Text>
                                </View>
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            className="w-full bg-primary px-2 py-3 rounded-2xl flex items-center justify-center mb-4 mt-4"
                            onPress={handleUpdateTiming}
                        >
                            {isLoading ? (
                                <ActivityIndicator color='white' />
                            ) : (
                                <Text className="font-bold text-white text-md tracking-wide">
                                    Update Schedule
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default Timings