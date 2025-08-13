import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator, ToastAndroid } from 'react-native'
import React, { useState, useEffect } from 'react'
import Icons from 'react-native-vector-icons/Feather'
import axios from 'axios'
import baseUrl from '../utils/baseUrl'

const RescheduledModal = ({ isopen, setIsOpen, date, refetch, timingId, appointmentId, doctorId }) => {
    const [slots, setSlots] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [rescheduling, setRescheduling] = useState(false)

    useEffect(() => {
        if (isopen && timingId && date) {
            fetchAvailableSlots()
        }
    }, [isopen, timingId, date])

    const fetchAvailableSlots = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await axios.get(`${baseUrl}/slot/getfreeslots/${timingId}/${date}`)
            
            if (response.data && Array.isArray(response.data)) {
                // Filter only available slots
                const availableSlots = response.data.filter(slot => slot.isAvailable)
                setSlots(availableSlots)
            } else {
                setSlots([])
            }
        } catch (error) {
            console.error('Error fetching available slots:', error)
            setError('Failed to load available slots')
            ToastAndroid.show('Failed to load available slots', ToastAndroid.SHORT)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectSlot = (slot) => {
        setSelectedSlot(slot)
    }

    const handleReschedule = async () => {
        if (!selectedSlot) {
            ToastAndroid.show('Please select a time slot', ToastAndroid.SHORT)
            return
        }

        try {
            setRescheduling(true)
            const response = await axios.patch(`${baseUrl}/appointment/reschedule/${appointmentId}`, {
                doctorId: doctorId,
                slotId: selectedSlot.id
            })

            if (response.status === 200 || response.status === 201) {
                ToastAndroid.show('Appointment rescheduled successfully', ToastAndroid.SHORT)
                setIsOpen(false)
                setSelectedSlot(null)
                if (refetch) {
                    refetch()
                }
            } else {
                ToastAndroid.show('Failed to reschedule appointment', ToastAndroid.SHORT)
            }
        } catch (error) {
            console.error('Error rescheduling appointment:', error)
            ToastAndroid.show('Failed to reschedule appointment', ToastAndroid.SHORT)
        } finally {
            setRescheduling(false)
        }
    }

    const formatTime = (time) => {
        if (!time) return ''
        const [hours, minutes] = time.split(':')
        const hour12 = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours)
        const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM'
        return `${hour12}:${minutes} ${ampm}`
    }

    const closeModal = () => {
        setIsOpen(false)
        setSelectedSlot(null)
        setError(null)
    }
    return (
        <Modal
            visible={isopen}
            transparent={true}
            animationType="fade"
            onRequestClose={closeModal}
        >
            <TouchableOpacity
                className="flex-1 bg-black/60 bg-opacity-50 justify-center items-center"
                activeOpacity={1}
                onPress={closeModal}
            >
                <TouchableOpacity
                    className="bg-white rounded-2xl mx-8 max-h-96 w-4/5"
                    activeOpacity={1}
                    onPress={() => {}}
                >
                    <View className="p-4 border-b border-gray-200">
                        <Text className="text-lg font-bold text-primary text-center">Reschedule Appointment</Text>
                        <Text className="text-sm text-gray-600 text-center mt-1">Select an available time slot</Text>
                    </View>
                    <ScrollView className="max-h-80">
                        {loading ? (
                            <View className="p-8 items-center">
                                <ActivityIndicator size="large" color="#164972" />
                                <Text className="text-gray-500 mt-2">Loading available slots...</Text>
                            </View>
                        ) : error ? (
                            <View className="p-8 items-center">
                                <Text className="text-red-500 text-center mb-4">{error}</Text>
                                <TouchableOpacity
                                    className="bg-primary px-4 py-2 rounded-lg"
                                    onPress={fetchAvailableSlots}
                                >
                                    <Text className="text-white">Retry</Text>
                                </TouchableOpacity>
                            </View>
                        ) : slots.length === 0 ? (
                            <View className="p-8 items-center">
                                <Text className="text-gray-500 text-center">No available slots for this date</Text>
                            </View>
                        ) : (
                            slots.map((slot) => (
                                <TouchableOpacity
                                    key={slot.id}
                                    className={`p-4 border-b border-gray-100 ${selectedSlot?.id === slot.id ? 'bg-blue-50' : ''}`}
                                    onPress={() => handleSelectSlot(slot)}
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View>
                                            <Text className={`text-base ${selectedSlot?.id === slot.id ? 'text-primary font-medium' : 'text-gray-700'}`}>
                                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                            </Text>
                                            <Text className="text-xs text-gray-500 mt-1">
                                                Available Slot
                                            </Text>
                                        </View>
                                        {selectedSlot?.id === slot.id && (
                                            <Icons name="check" size={18} color="#164972" />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                    <View className="flex-row p-4 border-t border-gray-200 space-x-3">
                        <TouchableOpacity
                            className="flex-1 p-3 border border-gray-300 rounded-lg"
                            onPress={closeModal}
                        >
                            <Text className="text-center text-gray-600 font-medium">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`flex-1 p-3 rounded-lg ${selectedSlot ? 'bg-primary' : 'bg-gray-300'}`}
                            onPress={handleReschedule}
                            disabled={!selectedSlot || rescheduling}
                        >
                            {rescheduling ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text className={`text-center font-medium ${selectedSlot ? 'text-white' : 'text-gray-500'}`}>
                                    Reschedule
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    )
}

export default RescheduledModal