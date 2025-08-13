import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, ToastAndroid } from 'react-native'
import React, { useState, useEffect } from 'react'
import Icons from 'react-native-vector-icons/Feather'
import { useGetDoctor } from '../hooks/useGetDoctor'
import axios from 'axios'
import baseUrl from '../utils/baseUrl'

const PaymentMethod = ({ navigation }) => {
    const doctor = useGetDoctor()
    const [paymentDetails, setPaymentDetails] = useState(null)
    const [isFetching, setIsFetching] = useState(false)
    const [error, setError] = useState('')
    const [isAdding, setIsAdding] = useState(false)
    const [showAddForm, setShowAddForm] = useState(false)
    
    const [bankForm, setBankForm] = useState({
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        bankeeName: ''
    })

    useEffect(() => {
        if (doctor?.id) {
            fetchPaymentDetails();
        }
    }, [doctor?.id]);

    const fetchPaymentDetails = async () => {
        setIsFetching(true);
        setError('');
        try {
            const res = await axios.get(`${baseUrl}/payment/get/${doctor.id}`);
            if (res.status === 200 || res.status === 201) {
                setPaymentDetails(res.data);
                setShowAddForm(false); // Hide form if payment exists
            } else {
                setPaymentDetails(null);
                setShowAddForm(true); // Show form if no payment found
            }
        } catch (error) {
            if (error.response?.status === 404) {
                // No payment details found - show add form
                setPaymentDetails(null);
                setShowAddForm(true);
            } else {
                const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
                setError(errorMessage);
                ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
            }
        } finally {
            setIsFetching(false);
        }
    };

    const handleAddPaymentMethod = async () => {
        // Validation
        if (!bankForm.bankName.trim() || !bankForm.accountNumber.trim() || !bankForm.ifscCode.trim() || !bankForm.bankeeName.trim()) {
            ToastAndroid.show('Please fill all fields', ToastAndroid.SHORT);
            return;
        }

        // Basic IFSC validation (11 characters, first 4 letters, last 7 alphanumeric)
        const ifscPattern = /^[A-Z]{4}[0][A-Z0-9]{6}$/;
        if (!ifscPattern.test(bankForm.ifscCode.toUpperCase())) {
            ToastAndroid.show('Please enter a valid IFSC code', ToastAndroid.SHORT);
            return;
        }

        // Account number validation (should be numeric and reasonable length)
        if (!/^\d{9,18}$/.test(bankForm.accountNumber)) {
            ToastAndroid.show('Please enter a valid account number (9-18 digits)', ToastAndroid.SHORT);
            return;
        }

        setIsAdding(true);
        try {
            const paymentData = {
                doctorId: doctor.id,
                bankName: bankForm.bankName.trim(),
                accountNumber: bankForm.accountNumber.trim(),
                ifscCode: bankForm.ifscCode.trim().toUpperCase(),
                bankeeName: bankForm.bankeeName.trim()
            };

            const res = await axios.post(`${baseUrl}/payment/add`, paymentData);

            if (res.status === 200 || res.status === 201) {
                ToastAndroid.show('Payment method added successfully', ToastAndroid.SHORT);
                
                // Reset form
                setBankForm({
                    bankName: '',
                    accountNumber: '',
                    ifscCode: '',
                    bankeeName: ''
                });
                
                // Refresh payment details
                fetchPaymentDetails();
            } else {
                ToastAndroid.show('Failed to add payment method', ToastAndroid.SHORT);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to add payment method';
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row justify-start items-center bg-white p-5 rounded-b-2xl">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icons name="arrow-left" size={24} color="#164972" />
                </TouchableOpacity>
                <Text className="font-semibold text-xl text-primary ml-5 tracking-wide">Payment Method</Text>
            </View>

            <ScrollView className="flex-1 px-5 py-3" showsVerticalScrollIndicator={false}>
                {isFetching ? (
                    // Loading state
                    <View className="flex-1 justify-center items-center py-20">
                        <ActivityIndicator size="large" color="#164972" />
                        <Text className="text-gray-500 mt-3">Loading payment details...</Text>
                    </View>
                ) : error ? (
                    // Error state
                    <View className="flex-1 justify-center items-center py-20">
                        <Icons name="alert-circle" size={48} color="#ef4444" />
                        <Text className="text-red-500 mt-3 text-center px-4">{error}</Text>
                        <TouchableOpacity 
                            className="mt-4 bg-primary px-6 py-2 rounded-lg"
                            onPress={fetchPaymentDetails}
                        >
                            <Text className="text-white font-semibold">Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : paymentDetails ? (
                    // Show existing payment details
                    <View className="space-y-4">
                        <View className="bg-green-50 border border-green-200 p-4 rounded-xl">
                            <View className="flex-row items-center mb-2">
                                <Icons name="check-circle" size={20} color="#10b981" />
                                <Text className="text-green-800 font-semibold ml-2">Payment Method Added</Text>
                            </View>
                            <Text className="text-green-600 text-sm">
                                Your bank details have been successfully added and verified.
                            </Text>
                        </View>

                        {/* Bank Details Card */}
                        <View className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <Text className="text-lg font-bold text-gray-800 mb-4">Bank Details</Text>
                            
                            <View className="space-y-4">
                                <View className="flex-row items-center">
                                    <Icons name="home" size={16} color="#6b7280" />
                                    <View className="ml-3 flex-1">
                                        <Text className="text-sm text-gray-500">Bank Name</Text>
                                        <Text className="text-gray-800 font-medium">{paymentDetails.bankName}</Text>
                                    </View>
                                </View>
                                
                                <View className="flex-row items-center">
                                    <Icons name="credit-card" size={16} color="#6b7280" />
                                    <View className="ml-3 flex-1">
                                        <Text className="text-sm text-gray-500">Account Number</Text>
                                        <Text className="text-gray-800 font-medium">
                                            ****{paymentDetails.accountNumber.slice(-4)}
                                        </Text>
                                    </View>
                                </View>
                                
                                <View className="flex-row items-center">
                                    <Icons name="hash" size={16} color="#6b7280" />
                                    <View className="ml-3 flex-1">
                                        <Text className="text-sm text-gray-500">IFSC Code</Text>
                                        <Text className="text-gray-800 font-medium">{paymentDetails.ifscCode}</Text>
                                    </View>
                                </View>
                                
                                <View className="flex-row items-center">
                                    <Icons name="user" size={16} color="#6b7280" />
                                    <View className="ml-3 flex-1">
                                        <Text className="text-sm text-gray-500">Account Holder Name</Text>
                                        <Text className="text-gray-800 font-medium">{paymentDetails.bankeeName}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Support Contact Card */}
                        <View className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                            <View className="flex-row items-center mb-2">
                                <Icons name="shield" size={20} color="#6b7280" />
                                <Text className="text-gray-700 font-semibold ml-2">Need to Update?</Text>
                            </View>
                            <Text className="text-gray-600 text-sm">
                                To change your bank details, please contact our support team at support@mediisist.in. We'll help you update your information securely.
                            </Text>
                            
                        </View>
                    </View>
                ) : showAddForm ? (
                    // Show add payment form
                    <View className="space-y-4">
                        <View className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                            <View className="flex-row items-center mb-2">
                                <Icons name="alert-triangle" size={20} color="#f59e0b" />
                                <Text className="text-yellow-800 font-semibold ml-2">Add Payment Method</Text>
                            </View>
                            <Text className="text-yellow-700 text-sm">
                                Please add your bank details to receive payments. This information can only be added once.
                            </Text>
                        </View>

                        {/* Add Payment Form */}
                        <View className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <Text className="text-lg font-bold text-gray-800 mb-4">Bank Details</Text>
                            
                            <View className="space-y-4">
                                <View>
                                    <Text className="text-sm font-semibold mb-2">Bank Name *</Text>
                                    <TextInput
                                        className="border border-gray-300 p-2 px-3 py-3 rounded-xl text-slate-500"
                                        placeholder="e.g. State Bank of India"
                                        placeholderTextColor="#aaa"
                                        value={bankForm.bankName}
                                        onChangeText={(text) => setBankForm({...bankForm, bankName: text})}
                                    />
                                </View>

                                <View>
                                    <Text className="text-sm font-semibold mb-2">Account Number *</Text>
                                    <TextInput
                                        className="border border-gray-300 p-2 px-3 py-3 rounded-xl text-slate-500"
                                        placeholder="Enter account number"
                                        placeholderTextColor="#aaa"
                                        keyboardType="numeric"
                                        value={bankForm.accountNumber}
                                        onChangeText={(text) => setBankForm({...bankForm, accountNumber: text})}
                                    />
                                </View>

                                <View>
                                    <Text className="text-sm font-semibold mb-2">IFSC Code *</Text>
                                    <TextInput
                                        className="border border-gray-300 p-2 px-3 py-3 rounded-xl text-slate-500"
                                        placeholder="e.g. SBIN0001234"
                                        placeholderTextColor="#aaa"
                                        autoCapitalize="characters"
                                        value={bankForm.ifscCode}
                                        onChangeText={(text) => setBankForm({...bankForm, ifscCode: text})}
                                    />
                                </View>

                                <View>
                                    <Text className="text-sm font-semibold mb-2">Account Holder Name *</Text>
                                    <TextInput
                                        className="border border-gray-300 p-2 px-3 py-3 rounded-xl text-slate-500"
                                        placeholder="Enter account holder name"
                                        placeholderTextColor="#aaa"
                                        value={bankForm.bankeeName}
                                        onChangeText={(text) => setBankForm({...bankForm, bankeeName: text})}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                className="w-full bg-primary px-2 py-3 rounded-2xl flex items-center justify-center mt-6"
                                onPress={handleAddPaymentMethod}
                            >
                                {isAdding ? (
                                    <ActivityIndicator color='white' />
                                ) : (
                                    <Text className="font-bold text-white text-md tracking-wide">
                                        Add Payment Method
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Security Note */}
                        <View className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-10">
                            <View className="flex-row items-center mb-2">
                                <Icons name="shield" size={20} color="#6b7280" />
                                <Text className="text-gray-700 font-semibold ml-2">Security Note</Text>
                            </View>
                            <Text className="text-gray-600 text-sm">
                                Your bank details are encrypted and stored securely. This information is only used for payment processing and can only be added once for security reasons.
                            </Text>
                        </View>
                    </View>
                ) : null}
            </ScrollView>
        </View>
    )
}

export default PaymentMethod