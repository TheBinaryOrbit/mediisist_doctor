import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useIsFocused } from '@react-navigation/native'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import { useGetDoctor } from '../hooks/useGetDoctor'
import axios from 'axios'
import baseUrl from '../utils/baseUrl'
import { ToastAndroid } from 'react-native'

const Appointments = ({ navigation }) => {
    const doctor = useGetDoctor()
    const isFocused = useIsFocused()
    const [appointments, setAppointments] = useState([])
    const [filteredAppointments, setFilteredAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState('SCHEDULED')

    const statusOptions = [
        { key: 'SCHEDULED', label: 'Scheduled', color: '#6B7280' },
        { key: 'ACCEPTED', label: 'Accepted', color: '#10B981' },
        { key: 'REJECTED', label: 'Rejected', color: '#EF4444' },
        { key: 'IN_PROGRESS', label: 'In Progress', color: '#F59E0B' },
        { key: 'COMPLETED', label: 'Completed', color: '#10B981' },
    ]

    useEffect(() => {
        if (isFocused && doctor?.id) {
            fetchAppointments()
        }
    }, [isFocused, doctor?.id])

    useEffect(() => {
        filterAppointments()
    }, [appointments, selectedStatus])

    const fetchAppointments = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`${baseUrl}/appointment/get/doctor/${doctor.id}`)

            if (response.data.appointments) {
                setAppointments(response.data.appointments)
            } else {
                setAppointments([])
            }
        } catch (error) {
            console.error('Error fetching appointments:', error)
            ToastAndroid.show('Failed to fetch appointments', ToastAndroid.SHORT)
            setAppointments([])
        } finally {
            setLoading(false)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await fetchAppointments()
        setRefreshing(false)
    }

    const filterAppointments = () => {
        if (selectedStatus === 'ALL') {
            setFilteredAppointments(appointments)
        } else {
            setFilteredAppointments(appointments.filter(apt => apt.status === selectedStatus))
        }
    }

    const formatTime = (time) => {
        if (!time) return ''
        const [hours, minutes] = time.split(':')
        const hour12 = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours)
        const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM'
        return `${hour12}:${minutes} ${ampm}`
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'SCHEDULED':
                return 'bg-gray-500'
            case 'ACCEPTED':
                return 'bg-green-600'
            case 'REJECTED':
                return 'bg-red-600'
            case 'IN_PROGRESS':
                return 'bg-yellow-600'
            case 'COMPLETED':
                return 'bg-green-600'
            default:
                return 'bg-gray-500'
        }
    }

    const getModeIcon = (mode) => {
        return mode === 'ONLINE' ? 'video' : 'clinic-medical'
    }

    const getModeColor = (mode) => {
        return mode === 'ONLINE' ? 'text-green-600' : 'text-blue-600'
    }

    const handleStatusUpdate = (appointmentId, newStatus) => {
        Alert.alert(
            'Update Status',
            `Are you sure you want to mark this appointment as ${newStatus}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Update', onPress: () => updateAppointmentStatus(appointmentId, newStatus) }
            ]
        )
    }

    const updateAppointmentStatus = async (appointmentId, newStatus) => {
        try {
            // You can implement status update API call here
            ToastAndroid.show(`Appointment ${newStatus.toLowerCase()}`, ToastAndroid.SHORT)
            // Refresh appointments after update
            fetchAppointments()
        } catch (error) {
            console.error('Error updating appointment status:', error)
            ToastAndroid.show('Failed to update appointment status', ToastAndroid.SHORT)
        }
    }

    const renderAppointmentCard = (appointment) => (
        <View key={appointment.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 mx-4 p-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900 mb-1">
                        {appointment.patientFirstName} {appointment.patientLastName}
                    </Text>
                    <Text className="text-gray-600 text-sm">
                        {appointment.patientAge} years • {appointment.patientGender}
                    </Text>
                </View>

                <View className="items-end">
                    <View className={`px-3 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                        <Text className="text-white text-xs font-bold tracking-wide py-[1.5px]">
                            {appointment.status}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Booked By Info */}
            <View className="bg-gray-50 rounded-xl p-3 mb-3">
                <View className="flex-row items-center mb-2">
                    <FontAwesome5 name="user-tie" size={14} color="#6B7280" />
                    <Text className="text-gray-700 font-medium ml-2">
                        Booked by: {appointment.bookedBy.fname} {appointment.bookedBy.lname}
                    </Text>
                </View>
                <View className="flex-row items-center">
                    <FontAwesome5 name="envelope" size={12} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-2">
                        {appointment.bookedBy.email}
                    </Text>
                </View>
                <View className="flex-row items-center mt-1">
                    <FontAwesome5 name="phone" size={12} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-2">
                        {appointment.bookedBy.phoneNumber}
                    </Text>
                </View>
            </View>

            {/* Appointment Details */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center flex-1">
                    <FontAwesome5 name="clock" size={16} color="#164972" />
                    <Text className="text-gray-700 font-medium ml-2">
                        {formatTime(appointment.slot.startTime)} - {formatTime(appointment.slot.endTime)}
                    </Text>
                </View>

                <View className="flex-row items-center">
                    <FontAwesome5
                        name={getModeIcon(appointment.mode)}
                        size={16}
                        color={appointment.mode === 'ONLINE' ? '#10B981' : '#3B82F6'}
                    />
                    <Text className={`font-medium ml-2 ${getModeColor(appointment.mode)}`}>
                        {appointment.mode === 'ONLINE' ? 'Online' : 'In-Clinic'}
                    </Text>
                </View>
            </View>

            <View className="border-t border-gray-100 pt-3">
                <TouchableOpacity
                    onPress={() => navigation.navigate('AppointmentDetails', { appointmentId: appointment.id })}
                    className="bg-primary rounded-lg px-4 py-2"
                >
                    <Text className="text-white font-medium text-sm text-center">See More</Text>
                </TouchableOpacity>
            </View>
        </View>
    )

    if (loading && !refreshing) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#164972" />
                <Text className="text-gray-500 mt-2">Loading appointments...</Text>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-4 py-6 shadow-sm">
                <Text className="text-2xl font-bold text-gray-900">Appointments</Text>
                <Text className="text-gray-500 mt-1">Manage your patient appointments</Text>
            </View>

            {/* Status Filter */}
            <View className="bg-white border-b border-gray-100">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="px-4 py-4"
                    contentContainerStyle={{ paddingRight: 16 }}
                >
                    {statusOptions.map((status) => (
                        <TouchableOpacity
                            key={status.key}
                            onPress={() => setSelectedStatus(status.key)}
                            className={`mr-3 px-4 py-2 rounded-full border ${selectedStatus === status.key
                                    ? 'bg-primary border-primary'
                                    : 'bg-white border-gray-300'
                                }`}
                        >
                            <Text
                                className={`font-medium ${selectedStatus === status.key ? 'text-white' : 'text-gray-600'
                                    }`}
                            >
                                {status.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Appointments List */}
            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                <View className="py-4">
                    {filteredAppointments.length === 0 ? (
                        <View className="flex-1 justify-center items-center py-20">
                            <FontAwesome5 name="calendar-times" size={64} color="#D1D5DB" />
                            <Text className="text-gray-500 text-lg font-medium mt-4">
                                {selectedStatus === 'ALL' ? 'No appointments found' : `No ${selectedStatus.toLowerCase()} appointments`}
                            </Text>
                            <Text className="text-gray-400 text-center mt-2 px-8">
                                Your appointments will appear here once patients book consultations
                            </Text>
                        </View>
                    ) : (
                        filteredAppointments.map(renderAppointmentCard)
                    )}
                </View>
            </ScrollView>
        </View>
    )
}

export default Appointments