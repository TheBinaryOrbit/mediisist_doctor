import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ToastAndroid,
    Linking,
    Modal
} from 'react-native'
import { useRoute } from '@react-navigation/native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { launchImageLibrary } from 'react-native-image-picker'
import axios from 'axios'
import baseUrl from '../utils/baseUrl'
import { useGetDoctor } from '../hooks/useGetDoctor'
import DialogBox from '../components/DialogBox'
import imageBaseUrl from '../utils/ImageBaseUrl'
import RescheduledModal from '../components/RescheduledModal'

const AppointmentDetails = ({ navigation }) => {
    const route = useRoute()
    const { appointmentId } = route.params
    const doctor = useGetDoctor()
    const [appointment, setAppointment] = useState(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [prescriptionModal, setPrescriptionModal] = useState(false)
    const [isOpen, setIsOpen] = useState(false);
    const [dialogContent, setDialogContent] = useState('');
    const [dialogFunction, setDialogFunction] = useState(null);
    const [dialogTitle, setDialogTitle] = useState('');
    const  [isRecheduleModalOpen , setIsRecheduleModalOpen] = useState(false);

    useEffect(() => {
        fetchAppointmentDetails()
    }, [])

    const fetchAppointmentDetails = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`${baseUrl}/appointment/get/${appointmentId}`)

            if (response.status === 200 || response.status === 201) {
                setAppointment(response.data)
            }
        } catch (error) {
            console.error('Error fetching appointment details:', error)
            ToastAndroid.show('Failed to fetch appointment details', ToastAndroid.SHORT)
        } finally {
            setLoading(false)
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
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatDateTime = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    }

    const getStatusConfig = (status) => {
        switch (status) {
            case 'SCHEDULED':
                return {
                    bg: 'bg-blue-100',
                    text: 'text-blue-800',
                    icon: 'calendar-check',
                    label: 'Scheduled',
                    action: 'Accept Appointment'
                }
            case 'ACCEPTED':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-800',
                    icon: 'check-circle',
                    label: 'Accepted',
                    action: 'Start Consultation'
                }
            case 'REJECTED':
                return {
                    bg: 'bg-red-100',
                    text: 'text-red-800',
                    icon: 'times-circle',
                    label: 'Rejected',
                    action: null
                }
            case 'IN_PROGRESS':
                return {
                    bg: 'bg-yellow-100',
                    text: 'text-yellow-800',
                    icon: 'clock',
                    label: 'In Progress',
                    action: 'Waiting for Patient to complete...'
                }
            case 'COMPLETED':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-800',
                    icon: 'check-circle',
                    label: 'Completed',
                    action: null
                }
            default:
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-800',
                    icon: 'info-circle',
                    label: status,
                    action: null
                }
        }
    }

    const handleStatusUpdate = async (newStatus) => {
        setIsOpen(true);

        switch (newStatus) {
            case 'ACCEPTED':
                setDialogTitle('Accept Appointment');
                setDialogContent(`Are you sure you want to ${newStatus.toLowerCase()} this appointment?`);
                setDialogFunction(() => handleAccept);
                break;
            case 'REJECTED':
                setDialogTitle('Reject Appointment');
                setDialogContent(`Are you sure you want to ${newStatus.toLowerCase()} this appointment?`);
                setDialogFunction(() => handleReject);
                break;
            case 'COMPLETED':
                setDialogTitle('Complete Appointment');
                setDialogContent(`Are you sure you want to ${newStatus.toLowerCase()} this appointment?`);
                setDialogFunction(() => handleComplete);
                break;
            case 'IN_PROGRESS':
                setDialogTitle('Start Consultation');
                setDialogContent(`Are you sure you want to ${newStatus.toLowerCase()} this appointment?`);
                setDialogFunction(() => handleStartConsultation);
                break;

        }
    }

    const handleAccept = async () => {
        setIsOpen(false);
        try {
            const date = new Date()
            const videoCallId = `$APP{appointmentId}MED-${date.getTime()}`
            setUpdating(true)
            const response = await axios.patch(`${baseUrl}/appointment/accept/${appointmentId}/${doctor.id}` , {
                videoCallId : videoCallId
            })


            if (response.status === 200) {
                ToastAndroid.show(`Appointment Accepted successfully`, ToastAndroid.SHORT)
                fetchAppointmentDetails()
            }

        } catch (error) {
            console.error('Error Accepting appointment status:', error)
            ToastAndroid.show('Failed to Accept appointment status', ToastAndroid.SHORT)
        } finally {
            setUpdating(false)
        }
    }

    const handleReject = async () => {
        setIsOpen(false);
        try {
            setUpdating(true)
            const response = await axios.patch(`${baseUrl}/appointment/reject/${appointmentId}/${doctor.id}`)

            if (response.status === 200) {
                ToastAndroid.show(`Appointment Rejected successfully`, ToastAndroid.SHORT)
                fetchAppointmentDetails()
            }

        } catch (error) {
            console.error('Error Rejected appointment status:', error)
            ToastAndroid.show('Failed to Rejected appointment status', ToastAndroid.SHORT)
        } finally {
            setUpdating(false)
        }
    }

    const handleInProgress = async () => {
        setIsOpen(false);
        try {
            setUpdating(true)
            const response = await axios.patch(`${baseUrl}/appointment/in-progress/${appointmentId}/${doctor.id}`)

            if (response.status === 200) {
                ToastAndroid.show(`Appointment In Progress successfully`, ToastAndroid.SHORT)
                fetchAppointmentDetails()
            }

        } catch (error) {
            console.error('Error In Progress appointment status:', error)
            ToastAndroid.show('Failed to In Progress appointment status', ToastAndroid.SHORT)
        } finally {
            setUpdating(false)
        }
    }

    const handleComplete = async () => {
        setIsOpen(false);
        try {
            setUpdating(true)
            const response = await axios.patch(`${baseUrl}/appointment/complete/${appointmentId}/${doctor.id}`)

            if (response.status === 200) {
                ToastAndroid.show(`Appointment Completed successfully`, ToastAndroid.SHORT)
                fetchAppointmentDetails()
            }

        } catch (error) {
            console.error('Error Completing appointment status:', error)
            ToastAndroid.show('Failed to Complete appointment status', ToastAndroid.SHORT)
        } finally {
            setUpdating(false)
        }
    }

    const handleStartConsultation = async () => {
        // Check if appointment time has started
        
        // if (!isAppointmentTimeStarted()) {
        //     ToastAndroid.show('Appointment time has not been started', ToastAndroid.LONG) // this condition is going to be chage
        //     return
        // }

        // Update status to in-progress first
        // await handleInProgress()
        
        // Navigate to VideoCall with appointment videoCallId
        if (appointment.videoCallId) {
            navigation.navigate('VideoCall', { 
                callId: appointment.videoCallId,
                appointmentId: appointment.id,
                patientName: `${appointment.patientFirstName} ${appointment.patientLastName}`
            })
        } else {
            ToastAndroid.show('Video call not available for this appointment', ToastAndroid.SHORT)
        }
    }

    const isAppointmentTimeStarted = () => {
        try {
            const currentDate = new Date()
            const appointmentDate = new Date(appointment.date)
            const [hours, minutes] = appointment.slot.startTime.split(':')
            
            // Set appointment start time
            appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
            
            // Check if current time is past or equal to appointment start time
            return currentDate >= appointmentDate
        } catch (error) {
            console.error('Error checking appointment time:', error)
            return false
        }
    }



    const handleCall = (phoneNumber) => {
        const phoneUrl = `tel:${phoneNumber}`
        Linking.openURL(phoneUrl)
    }

    const handleUploadPrescription = async () => {
        try {
            const options = {
                mediaType: 'photo',
                includeBase64: false,
                maxHeight: 2000,
                maxWidth: 2000,
                quality: 0.8,
            }

            launchImageLibrary(options, (response) => {
                if (response.didCancel) {
                    console.log('User cancelled image picker')
                    return
                }

                if (response.errorMessage) {
                    console.log('ImagePicker Error: ', response.errorMessage)
                    ToastAndroid.show('Error selecting image', ToastAndroid.SHORT)
                    return
                }

                if (response.assets && response.assets[0]) {
                    uploadPrescriptionImage(response.assets[0])
                }
            })
        } catch (error) {
            console.error('Error opening image picker:', error)
            ToastAndroid.show('Failed to open image picker', ToastAndroid.SHORT)
        }
    }

    const uploadPrescriptionImage = async (imageAsset) => {
        try {
            setUploading(true)

            const formData = new FormData()
            formData.append('prescription', {
                uri: imageAsset.uri,
                type: imageAsset.type,
                name: imageAsset.fileName || `prescription_${Date.now()}.jpg`
            })

            const response = await axios.patch(
                `${baseUrl}/appointment/upload/prescription/${appointmentId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )

            if (response.status === 200 || response.status === 201) {
                ToastAndroid.show('Prescription uploaded successfully', ToastAndroid.SHORT)
                setPrescriptionModal(false)
                fetchAppointmentDetails() // Refresh appointment data
            } else {
                ToastAndroid.show('Failed to upload prescription', ToastAndroid.SHORT)
            }
        } catch (error) {
            console.error('Error uploading prescription:', error)
            ToastAndroid.show('Failed to upload prescription', ToastAndroid.SHORT)
        } finally {
            setUploading(false)
        }
    }

    const getNextStatus = (currentStatus) => {
        switch (currentStatus) {
            case 'SCHEDULED':
                return 'ACCEPTED'
            case 'ACCEPTED':
                return 'IN_PROGRESS'
            case 'IN_PROGRESS':
                return 'COMPLETED'
            default:
                return null
        }
    }

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50">
                <View className="bg-white px-4 pt-4 pb-4 border-b border-gray-100">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="p-2 -ml-2"
                        >
                            <Ionicons name="arrow-back" size={22} color="#374151" />
                        </TouchableOpacity>
                        <Text className="text-lg font-medium text-gray-900 ml-2">Appointment Details</Text>
                    </View>
                </View>

                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#164972" />
                    <Text className="text-gray-500 mt-3">Loading appointment details...</Text>
                </View>
            </View>
        )
    }

    if (!appointment) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <MaterialIcons name="error-outline" size={48} color="#9ca3af" />
                <Text className="text-lg font-medium text-gray-500 mt-4">
                    Appointment not found
                </Text>
                <TouchableOpacity
                    className="mt-4 bg-blue-500 px-6 py-2 rounded-lg"
                    onPress={() => navigation.goBack()}
                >
                    <Text className="text-white font-medium">Go Back</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const statusConfig = getStatusConfig(appointment.status)
    const nextStatus = getNextStatus(appointment.status)

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-4 pt-4 pb-4 border-b border-gray-100">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="p-2 -ml-2"
                    >
                        <Ionicons name="arrow-back" size={22} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-lg font-medium text-gray-900 ml-2">Appointment Details</Text>
                </View>
            </View>

            <DialogBox
                isOpen={isOpen}
                onCancel={() => setIsOpen(false)}
                onConfirm={dialogFunction}
                message={dialogContent}
                title={dialogTitle}
            />

            <RescheduledModal
                isopen={isRecheduleModalOpen}
                setIsOpen={setIsRecheduleModalOpen}
                date={appointment.date}
                refetch={fetchAppointmentDetails}
                timingId={appointment.slot.timingsId}
                appointmentId={appointment.id}
                doctorId={appointment.doctor.id}
            />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Status Banner */}
                <View className={`mx-5 mt-5 rounded-lg px-5 py-4 ${statusConfig.bg} ${statusConfig.text}`}>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <FontAwesome5 name={statusConfig.icon} size={18} />
                            <Text className="text-base font-medium ml-3">
                                Status: {statusConfig.label}
                            </Text>
                        </View>
                        {appointment.isRescheduled && (
                            <View className="bg-white rounded-full px-3 py-1">
                                <Text className="text-primary text-xs font-bold">RESCHEDULED</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Appointment Info Card */}
                <View className="bg-white mx-5 mt-4 rounded-lg shadow-sm p-5 border border-gray-100">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-base font-semibold text-gray-900">Appointment Details</Text>
                        <View className={`px-2 py-1 rounded-md ${statusConfig.bg}`}>
                            <Text className={`text-xs font-medium ${statusConfig.text}`}>
                                {appointment.mode === 'ONLINE' ? 'Online' : 'In-Clinic'}
                            </Text>
                        </View>
                    </View>

                    <View className="space-y-3">
                        <View className="flex-row items-center">
                            <Ionicons name="calendar-outline" size={18} color="#6b7280" />
                            <Text className="text-gray-700 ml-3">
                                {formatDate(appointment.date)}
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                            <Ionicons name="time-outline" size={18} color="#6b7280" />
                            <Text className="text-gray-700 ml-3">
                                {formatTime(appointment.slot.startTime)} - {formatTime(appointment.slot.endTime)}
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                            <Ionicons name="document-text-outline" size={18} color="#6b7280" />
                            <Text className="text-gray-700 ml-3">
                                Booked on {formatDateTime(appointment.createdAt)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Patient Info Card */}
                <View className="bg-white mx-5 mt-4 rounded-lg shadow-sm p-5 border border-gray-100">
                    <Text className="text-base font-semibold text-gray-900 mb-4">Patient Information</Text>

                    <View className="flex-row items-center">
                        <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                            <Text className="text-primary font-bold text-lg">
                                {appointment.patientFirstName[0]}{appointment.patientLastName[0]}
                            </Text>
                        </View>
                        <View className="flex-1 ml-4">
                            <Text className="text-base font-medium text-gray-900">
                                {appointment.patientFirstName} {appointment.patientLastName}
                            </Text>
                            <Text className="text-gray-500 text-sm mt-1">
                                {appointment.patientAge} years • {appointment.patientGender}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => handleCall(appointment.patientPhoneNumber)}
                            className="bg-blue-50 rounded-full p-2"
                        >
                            <FontAwesome5 name="phone-alt" size={14} color="#3b82f6" />
                        </TouchableOpacity>
                    </View>

                    {/* <View className="mt-4 pt-4 border-t border-gray-100">
                        <Text className="text-sm font-medium text-gray-500 mb-2">Contact Number</Text>
                        <Text className="text-gray-900">{appointment.patientPhoneNumber}</Text>
                    </View> */}
                </View>

                {/* Booked By Card */}
                <View className="bg-white mx-5 mt-4 rounded-lg shadow-sm p-5 border border-gray-100">
                    <Text className="text-base font-semibold text-gray-900 mb-4">Booked By</Text>

                    <View className="flex-row items-center">
                        <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center">
                            <Text className="text-gray-600 font-bold text-lg">
                                {appointment.bookedBy.fname[0]}{appointment.bookedBy.lname[0]}
                            </Text>
                        </View>
                        <View className="flex-1 ml-4">
                            <Text className="text-base font-medium text-gray-900">
                                {appointment.bookedBy.fname} {appointment.bookedBy.lname}
                            </Text>
                            <Text className="text-gray-500 text-sm mt-1">{appointment.bookedBy.email}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => handleCall(appointment.bookedBy.phoneNumber)}
                            className="bg-blue-50 rounded-full p-2"
                        >
                            <FontAwesome5 name="phone-alt" size={14} color="#3b82f6" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Payment Info Card */}
                <View className="bg-white mx-5 mt-4 rounded-lg shadow-sm p-5 border border-gray-100">
                    <Text className="text-base font-semibold text-gray-900 mb-4">Payment Information</Text>

                    <View className="space-y-3">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-500">Payment Status</Text>
                            <Text className={`font-medium ${appointment.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'
                                }`}>
                                {appointment.status === 'COMPLETED' ? 'Completed' : 'Pending'}
                            </Text>
                        </View>

                        <View className="flex-row justify-between">
                            <Text className="text-gray-500">Amount</Text>
                            <Text className="text-gray-900 font-mono text-sm">₹{appointment.orderData.amount}</Text>
                        </View>

                        {appointment.refundData && (
                            <>
                                <View className="flex-row justify-between mt-3">
                                    <Text className="text-gray-500">Refund Amount</Text>
                                    <Text className="text-red-600 font-medium">₹{appointment.refundData.amount}</Text>
                                </View>

                                <View className="flex-row justify-between mt-3">
                                    <Text className="text-gray-500">Refund Status</Text>
                                    <Text className="text-red-600 font-medium">{appointment.refundData.status}</Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* Prescription Section */}
                {appointment.status === 'COMPLETED' && (
                    <View className="bg-white mx-5 mt-4 mb-6 rounded-lg shadow-sm p-5 border border-gray-100">
                        <Text className="text-base font-semibold text-gray-900 mb-4">Prescription</Text>

                        {appointment.prescriptionUrl ? (
                            <TouchableOpacity className="bg-green-50 border border-green-100 rounded-lg p-4 flex-row items-center"
                                onPress={() => navigation.navigate('PrescriptionImage', { prescriptionUrl: `${imageBaseUrl}${appointment.prescriptionUrl}` })}
                            >
                                <Ionicons name="document-text" size={20} color="#10b981" />
                                <View className="ml-3 flex-1">
                                    <Text className="text-green-800 font-medium">Prescription Uploaded</Text>
                                    <Text className="text-green-600 text-xs mt-1">Tap to view</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="#10b981" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={() => setPrescriptionModal(true)}
                                className="border-2 border-dashed border-blue-200 rounded-lg p-5 items-center bg-blue-50"
                            >
                                <Ionicons name="cloud-upload-outline" size={28} color="#3b82f6" />
                                <Text className="text-primary font-medium mt-2">Upload Prescription</Text>
                                <Text className="text-gray-500 text-xs mt-1">PDF or image files</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}


                {
                    appointment.status === 'SCHEDULED' && (!appointment.isRescheduled) && (
                        <View className="p-5">
                            <TouchableOpacity
                                onPress={() => setIsRecheduleModalOpen(true)}
                                disabled={updating}
                                className="flex-1 bg-primary rounded-lg py-3 items-center mt-3"
                            >
                                {updating ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-medium">Rescheduled</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )
                }
            </ScrollView>

            {/* Action Buttons */}
            {nextStatus && (
                <View className="absolute bottom-0 left-0 right-0 bg-white px-5 py-4 border-t border-gray-100">
                    {appointment.status === 'SCHEDULED' && (
                        <>
                            <View className="flex-row space-x-3">
                                <TouchableOpacity
                                    onPress={() => handleStatusUpdate('REJECTED')}
                                    disabled={updating}
                                    className="flex-1 bg-white border border-gray-300 rounded-lg py-3 items-center"
                                >
                                    {updating ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-primary font-medium">Reject</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => handleStatusUpdate(nextStatus)}
                                    disabled={updating}
                                    className="flex-1 bg-primary rounded-lg py-3 items-center"
                                >
                                    {updating ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-white font-medium">Accept</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {(appointment.status === 'ACCEPTED' || appointment.status === 'IN_PROGRESS') && (
                        <TouchableOpacity
                            onPress={() => handleStatusUpdate(nextStatus)}
                            disabled={updating || appointment.status === 'IN_PROGRESS'}
                            className="bg-primary rounded-lg py-3 items-center"
                        >
                            {updating ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-medium">{statusConfig.action}</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Prescription Upload Modal */}
            <Modal
                visible={prescriptionModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setPrescriptionModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center px-5">
                    <View className="bg-white rounded-xl w-full p-6">
                        <Text className="text-lg font-semibold text-gray-900 mb-1 text-center">
                            Upload Prescription
                        </Text>
                        <Text className="text-gray-500 text-center mb-6">
                            Upload the image of the prescription for this appointment.
                        </Text>

                        <View className="flex-row space-x-3">
                            <TouchableOpacity
                                onPress={() => setPrescriptionModal(false)}
                                className="flex-1 bg-gray-100 rounded-lg py-3 items-center"
                            >
                                <Text className="text-gray-700 font-medium">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleUploadPrescription}
                                disabled={uploading}
                                className="flex-1 bg-primary rounded-lg py-3 items-center"
                            >
                                {uploading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-medium">Upload</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default AppointmentDetails