import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions, ActivityIndicator, ToastAndroid } from 'react-native'
import React, { useState, useEffect } from 'react'
import Icons from 'react-native-vector-icons/FontAwesome5';
import Banner from '../components/Banner';
import { useGetDoctor } from '../hooks/useGetDoctor';
import axios from 'axios';
import baseUrl from '../utils/baseUrl';
import { useIsFocused } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const images = [
    require('../assets/login1.png'),
    require('../assets/login2.png'),
];

// Sample data for quick actions
const quickActions = [
    { id: 1, name: 'Profile', icon: 'user', color: '#3B82F6' , route : 'Profile' },
    { id: 2, name: 'Slots', icon: 'clock', color: '#10B981' , route : 'Slots' },
    { id: 3, name: 'Wallet', icon: 'wallet', color: '#F59E0B' , route : 'Wallet' },
    { id: 4, name: 'Payment', icon: 'file-invoice-dollar', color: '#8B5CF6' , route : 'Payment Method' },
];

const Home = ({ navigation }) => {
    const doctor = useGetDoctor();
    const isFocused = useIsFocused();
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (doctor?.id && isFocused) {
            fetchProfileStatus();
        }
    }, [doctor?.id, isFocused]);

    const fetchProfileStatus = async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await axios.get(`${baseUrl}/doctor/checkprofile/${doctor.id}`);
            if (res.status === 200 || res.status === 201) {
                setProfileData(res.data);
            } else {
                setError('Failed to fetch profile status');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const renderProfileChecks = () => {
        if (!profileData?.profileChecks) return null;

        const { isVerified, isEducationAdded, isExperienceAdded, isPaymentMethodAdded } = profileData.profileChecks;
        
        return (
            <View className="space-y-3">
                {/* Verification Status */}
                {!isVerified && (
                    <View className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                        <View className="flex-row items-center">
                            <Icons name="clock" size={16} color="#f59e0b" />
                            <Text className="text-yellow-800 font-semibold ml-2">Verification Pending</Text>
                        </View>
                        <Text className="text-yellow-700 text-sm mt-1">
                            Your account verification is pending. You'll be notified once approved.
                        </Text>
                    </View>
                )}

                {/* Education Status */}
                {!isEducationAdded && (
                    <TouchableOpacity 
                        className="bg-blue-50 border border-blue-200 p-4 rounded-xl"
                        onPress={() => navigation.navigate('Education')}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                                <Icons name="graduation-cap" size={16} color="#3b82f6" />
                                <View className="ml-3 flex-1">
                                    <Text className="text-blue-800 font-semibold">Add Education Details</Text>
                                    <Text className="text-blue-600 text-sm">Complete your profile by adding education</Text>
                                </View>
                            </View>
                            <Icons name="chevron-right" size={12} color="#3b82f6" />
                        </View>
                    </TouchableOpacity>
                )}

                {/* Experience Status */}
                {!isExperienceAdded && (
                    <TouchableOpacity 
                        className="bg-green-50 border border-green-200 p-4 rounded-xl"
                        onPress={() => navigation.navigate('Experience')}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                                <Icons name="briefcase" size={16} color="#10b981" />
                                <View className="ml-3 flex-1">
                                    <Text className="text-green-800 font-semibold">Add Experience Details</Text>
                                    <Text className="text-green-600 text-sm">Add your professional experience</Text>
                                </View>
                            </View>
                            <Icons name="chevron-right" size={12} color="#10b981" />
                        </View>
                    </TouchableOpacity>
                )}

                {/* Payment Method Status */}
                {!isPaymentMethodAdded && (
                    <TouchableOpacity 
                        className="bg-purple-50 border border-purple-200 p-4 rounded-xl"
                        onPress={() => navigation.navigate('Payment Method')}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                                <Icons name="credit-card" size={16} color="#8b5cf6" />
                                <View className="ml-3 flex-1">
                                    <Text className="text-purple-800 font-semibold">Add Payment Method</Text>
                                    <Text className="text-purple-600 text-sm">Add bank details to receive payments</Text>
                                </View>
                            </View>
                            <Icons name="chevron-right" size={12} color="#8b5cf6" />
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderTimingStatus = () => {
        if (!profileData?.timings) return null;

        const availableDays = profileData.timings.filter(timing => timing.isAvailable);
        const daysNeedingSlots = availableDays.filter(timing => timing.slotsCount === 0 || timing.fee === 0);

        if (daysNeedingSlots.length === 0) return null;

        return (
            <View className="space-y-3">
                <Text className="text-base font-semibold text-gray-800">Schedule Setup Required</Text>
                {daysNeedingSlots.map((timing, index) => (
                    <TouchableOpacity 
                        key={index}
                        className="bg-orange-50 border border-orange-200 p-4 rounded-xl"
                        onPress={() => navigation.navigate('Slots')}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                                <Icons name="calendar-alt" size={16} color="#f97316" />
                                <View className="ml-3 flex-1">
                                    <Text className="text-orange-800 font-semibold">{timing.day}</Text>
                                    <Text className="text-orange-600 text-sm">
                                        {timing.slotsCount === 0 && timing.fee === 0 
                                            ? 'Add slots and set consultation fee'
                                            : timing.slotsCount === 0 
                                                ? 'Add time slots'
                                                : 'Set consultation fee'
                                        }
                                    </Text>
                                </View>
                            </View>
                            <Icons name="chevron-right" size={12} color="#f97316" />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-5 pt-4">
                <View className="flex-row items-center justify-between mb-1">
                    <View className="items-center">
                        <Text className="text-xl font-bold text-gray-900">
                            Home
                        </Text>
                    </View>

                    <TouchableOpacity className="p-2 -mr-2">
                        <Icons name="user-circle" size={24} color="#374151" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Banner */}
                <View className="mt-6">
                    <Banner />
                </View>

                {/* Quick Actions */}
                <View className="mx-5 mt-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>
                    <View className="flex-row justify-between">
                        {quickActions.map((action) => (
                            <TouchableOpacity
                                key={action.id}
                                className="items-center flex-1"
                                activeOpacity={0.7}
                                onPress={() => navigation.navigate(action.route)}
                            >
                                <View
                                    className="w-12 h-12 rounded-lg items-center justify-center mb-2"
                                    style={{ backgroundColor: `${action.color}15` }}
                                >
                                    <Icons name={action.icon} size={16} color={action.color} />
                                </View>
                                <Text className="text-sm text-gray-700 font-medium">{action.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Profile Status */}
                <View className="mx-5 mt-6 mb-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-semibold text-gray-900">Profile Status</Text>
                        <TouchableOpacity onPress={fetchProfileStatus}>
                            <Icons name="sync-alt" size={16} color="#3b82f6" />
                        </TouchableOpacity>
                    </View>
                    
                    {isLoading ? (
                        <View className="bg-white rounded-xl shadow-sm p-8 items-center">
                            <ActivityIndicator size="large" color="#164972" />
                            <Text className="text-gray-500 mt-2">Loading profile status...</Text>
                        </View>
                    ) : error ? (
                        <View className="bg-white rounded-xl shadow-sm p-4">
                            <View className="items-center">
                                <Icons name="exclamation-triangle" size={24} color="#ef4444" />
                                <Text className="text-red-500 mt-2 text-center">{error}</Text>
                                <TouchableOpacity 
                                    className="mt-3 bg-primary px-4 py-2 rounded-lg"
                                    onPress={fetchProfileStatus}
                                >
                                    <Text className="text-white font-semibold">Retry</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : profileData ? (
                        <View className="space-y-4">
                            {/* Profile Completion Cards */}
                            {renderProfileChecks()}
                            
                            {/* Timing Setup Cards */}
                            {profileData.timings && renderTimingStatus()}
                            
                            {/* All Complete Message */}
                            {profileData.profileChecks?.isVerified && 
                             profileData.profileChecks?.isEducationAdded && 
                             profileData.profileChecks?.isExperienceAdded && 
                             profileData.profileChecks?.isPaymentMethodAdded && 
                             (!profileData.timings || profileData.timings.filter(t => t.isAvailable && (t.slotsCount === 0 || t.fee === 0)).length === 0) && (
                                <View className="bg-green-50 border border-green-200 p-4 rounded-xl">
                                    <View className="flex-row items-center">
                                        <Icons name="check-circle" size={20} color="#10b981" />
                                        <Text className="text-green-800 font-semibold ml-2">Profile Complete!</Text>
                                    </View>
                                    <Text className="text-green-600 text-sm mt-1">
                                        Your profile is complete and ready to receive appointments.
                                    </Text>
                                </View>
                            )}
                        </View>
                    ) : null}
                </View>
            </ScrollView>
        </View>
    )
}

export default Home