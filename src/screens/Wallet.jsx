import { View, Text, TouchableOpacity, FlatList, Alert, RefreshControl, ScrollView, TextInput, Modal, ToastAndroid } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import baseUrl from '../utils/baseUrl'
import { useGetDoctor } from '../hooks/useGetDoctor'
import { useIsFocused } from '@react-navigation/native'
import Icons from 'react-native-vector-icons/Feather'

const Wallet = ({ navigation}) => {
    const doctor = useGetDoctor()
    const isFocused = useIsFocused()
    const [amount, setAmount] = useState(0)
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [showWithdrawModal, setShowWithdrawModal] = useState(false)
    const [withdrawAmount, setWithdrawAmount] = useState('')

    const fetchWalletData = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`${baseUrl}/doctor/get/wallet/${doctor.id}`)
            console.log('Wallet data:', res.data)
            setAmount(res.data.amount || 0)
            setHistory(res.data.history || [])
        } catch (error) {
            console.error('Error fetching wallet data:', error)
            ToastAndroid.show('Failed to fetch wallet data', ToastAndroid.SHORT)
        } finally {
            setLoading(false)
        }
    }

    const handleWithdrawal = () => {
        if (amount <= 0) {
            ToastAndroid.show('Insufficient balance for withdrawal', ToastAndroid.SHORT);
            return
        }
        setShowWithdrawModal(true)
    }

    const processWithdrawal = async () => {
        const withdrawAmountNum = parseInt(withdrawAmount)

        if (!withdrawAmount || withdrawAmountNum <= 0 || isNaN(withdrawAmountNum)) {
            ToastAndroid.show('Please enter a valid withdrawal amount', ToastAndroid.SHORT)
            return
        }

        if (withdrawAmountNum > amount) {
            ToastAndroid.show('Withdrawal amount cannot exceed available balance', ToastAndroid.SHORT)
            return
        }

        setLoading(true)
        try {
            const withdrawalData = {
                doctorId: doctor.id,
                amount: withdrawAmountNum
            }

            const res = await axios.post(`${baseUrl}/withdraw/add`, withdrawalData)

            if (res.status === 201 || res.status === 200) {
                ToastAndroid.show('Withdrawal request submitted successfully', ToastAndroid.SHORT)
                setShowWithdrawModal(false)
                setWithdrawAmount('')
                fetchWalletData() // Refresh wallet data
            } else {
                ToastAndroid.show('Failed to submit withdrawal request', ToastAndroid.SHORT)
            }
        } catch (error) {
            console.error('Error processing withdrawal:', error)
            ToastAndroid.show('Failed to process withdrawal request', ToastAndroid.SHORT)
        } finally {
            setLoading(false)
        }
    }

    const handleWithdrawAmountChange = (text) => {
        // Only allow integers (no decimal points)
        const numericText = text.replace(/[^0-9]/g, '')
        setWithdrawAmount(numericText)
    }

    const handleQuickAmount = (quickAmount) => {
        setWithdrawAmount(quickAmount.toString())
    }

    const closeModal = () => {
        setShowWithdrawModal(false)
        setWithdrawAmount('')
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await fetchWalletData()
        setRefreshing(false)
    }

    useEffect(() => {
        if (doctor?.id && isFocused) {
            fetchWalletData()
        }
    }, [doctor?.id, isFocused])

    const getStatusBadge = (status) => {
        switch (status?.toUpperCase()) {
            case 'SUCCESS':
                return {
                    bgColor: 'bg-emerald-100',
                    textColor: 'text-emerald-700',
                    dotColor: 'bg-emerald-500'
                }
            case 'PENDING':
                return {
                    bgColor: 'bg-amber-100',
                    textColor: 'text-amber-700',
                    dotColor: 'bg-amber-500'
                }
            case 'REJECTED':
                return {
                    bgColor: 'bg-red-100',
                    textColor: 'text-red-700',
                    dotColor: 'bg-red-500'
                }
            default:
                return {
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-700',
                    dotColor: 'bg-gray-500'
                }
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const renderWithdrawalItem = ({ item }) => {
        const statusStyle = getStatusBadge(item.status)

        return (
            <View className="bg-white mx-5 mb-4 rounded-2xl overflow-hidden" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
                <View className="p-5">
                    <View className="flex-row justify-between items-start mb-3">
                        <View>
                            <Text className="text-2xl font-bold text-gray-900 mb-1">
                                ₹{item.amount?.toLocaleString('en-IN')}
                            </Text>
                            <Text className="text-sm text-gray-500">
                                {formatDate(item.createdAt)}
                            </Text>
                        </View>
                        <View className={`flex-row items-center px-3 py-1.5 rounded-full ${statusStyle.bgColor}`}>
                            <View className={`w-2 h-2 rounded-full mr-2 ${statusStyle.dotColor}`} />
                            <Text className={`text-xs font-semibold uppercase tracking-wide ${statusStyle.textColor}`}>
                                {item.status || 'PENDING'}
                            </Text>
                        </View>
                    </View>

                    {item.processedAt && (
                        <View className="border-t border-gray-100 pt-3 mt-3">
                            <Text className="text-xs text-gray-500">
                                Processed: {formatDate(item.processedAt)}
                            </Text>
                        </View>
                    )}

                    {item.remarks && (
                        <View className="bg-gray-50 rounded-lg p-3 mt-3">
                            <Text className="text-sm text-gray-700 leading-5">
                                {item.remarks}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-gray-50">




            <View className="flex-row justify-start items-center  bg-white p-5 rounded-b-2xl">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icons name="arrow-left" size={24} color="#164972" />
                </TouchableOpacity>
                <Text className="font-semibold text-xl text-primary ml-5 tracking-wide">Wallet</Text>
            </View>

            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#164972']}
                        tintColor="#164972"
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Balance Card */}
                <View className="mx-5 mt-5 mb-6 rounded-3xl overflow-hidden" style={{ backgroundColor: '#164972', shadowColor: '#164972', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }}>
                    <View className="p-5">
                        <View className="flex-row items-center justify-between mb-6">
                            <View>
                                <Text className="text-white/80 text-sm font-medium uppercase tracking-wider">
                                    Available Balance
                                </Text>
                                <Text className="text-white text-2xl font-bold mt-2">
                                    ₹{amount.toLocaleString('en-IN')}
                                </Text>
                            </View>
                            <View className="bg-white/20 rounded-full p-4">
                                <View className="w-8 h-8 bg-white/30 rounded-full" />
                            </View>
                        </View>

                        <TouchableOpacity
                            className={`flex-row items-center justify-center py-3 rounded-xl ${loading || amount <= 0
                                ? 'bg-white/20'
                                : 'bg-white active:bg-white/90'
                                }`}
                            onPress={handleWithdrawal}
                            disabled={loading || amount <= 0}
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 }}
                        >
                            <Text className={`font-bold text-md ${loading || amount <= 0 ? 'text-white/60' : 'text-[#164972]'
                                }`}>
                                {loading ? 'Processing...' : 'Withdraw Money'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Transaction History */}
                <View className="px-5 mb-4">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-xl font-bold text-gray-900">
                            Transaction History
                        </Text>
                        <Text className="text-sm font-medium" style={{ color: '#164972' }}>
                            {history.length} transactions
                        </Text>
                    </View>
                </View>

                {/* History List */}
                {history.length === 0 ? (
                    <View className="mx-5 mb-8">
                        <View className="bg-white rounded-2xl p-12 items-center" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
                            <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                                <View className="w-8 h-8 bg-gray-300 rounded-full" />
                            </View>
                            <Text className="text-lg font-semibold text-gray-900 mb-2">
                                No transactions yet
                            </Text>
                            <Text className="text-gray-500 text-center leading-6">
                                Your withdrawal requests will appear here once you make them.
                            </Text>
                        </View>
                    </View>
                ) : (
                    <FlatList
                        data={history}
                        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                        renderItem={renderWithdrawalItem}
                        scrollEnabled={false}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                <View className="h-8" />
            </ScrollView>

            {/* Withdrawal Modal */}
            <Modal
                visible={showWithdrawModal}
                animationType="slide"
                transparent
                onRequestClose={closeModal}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6 pb-8">
                        {/* Modal Header */}
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-2xl font-bold text-gray-900">
                                Withdraw Money
                            </Text>
                            <TouchableOpacity
                                onPress={closeModal}
                                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                            >
                                <Text className="text-gray-600 font-bold text-lg">×</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Available Balance */}
                        <View className="bg-gray-50 rounded-2xl p-4 mb-6">
                            <Text className="text-sm text-gray-600 mb-1">Available Balance</Text>
                            <Text className="text-2xl font-bold text-gray-900">
                                ₹{amount.toLocaleString('en-IN')}
                            </Text>
                        </View>

                        {/* Amount Input */}
                        <View className="mb-6">
                            <Text className="text-base font-semibold text-gray-900 mb-3">
                                Enter Withdrawal Amount
                            </Text>
                            <View className="border-2 border-gray-200 rounded-2xl p-4 focus:border-primary">
                                <TextInput
                                    className="text-2xl font-bold text-gray-900"
                                    placeholder="0"
                                    placeholderTextColor="#9CA3AF"
                                    value={withdrawAmount}
                                    onChangeText={handleWithdrawAmountChange}
                                    keyboardType="number-pad"
                                    style={{ color: '#164972' }}
                                />
                            </View>
                        </View>

                        {/* Quick Amount Buttons */}
                        <View className="mb-8">
                            <Text className="text-base font-semibold text-gray-900 mb-3">
                                Quick Select
                            </Text>
                            <View className="flex-row flex-wrap gap-3">
                                {[1000, 2000, 5000, 10000].map((quickAmount) => (
                                    <TouchableOpacity
                                        key={quickAmount}
                                        onPress={() => handleQuickAmount(quickAmount)}
                                        disabled={quickAmount > amount}
                                        className={`px-4 py-2 rounded-xl border-2 ${quickAmount > amount
                                            ? 'border-gray-200 bg-gray-100'
                                            : withdrawAmount === quickAmount.toString()
                                                ? 'border-primary bg-primary/10'
                                                : 'border-gray-200 bg-white active:bg-gray-50'
                                            }`}
                                    >
                                        <Text className={`font-semibold ${quickAmount > amount
                                            ? 'text-gray-400'
                                            : withdrawAmount === quickAmount.toString()
                                                ? 'text-primary'
                                                : 'text-gray-700'
                                            }`}>
                                            ₹{quickAmount.toLocaleString('en-IN')}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                                {amount > 0 && (
                                    <TouchableOpacity
                                        onPress={() => handleQuickAmount(amount)}
                                        className={`px-4 py-2 rounded-xl border-2 ${withdrawAmount === amount.toString()
                                            ? 'border-primary bg-primary/10'
                                            : 'border-gray-200 bg-white active:bg-gray-50'
                                            }`}
                                    >
                                        <Text className={`font-semibold ${withdrawAmount === amount.toString()
                                            ? 'text-primary'
                                            : 'text-gray-700'
                                            }`}>
                                            All (₹{amount.toLocaleString('en-IN')})
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={closeModal}
                                className="flex-1 py-4 rounded-2xl border-2 border-gray-200 bg-white active:bg-gray-50"
                            >
                                <Text className="text-center font-bold text-gray-700">
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={processWithdrawal}
                                disabled={loading || !withdrawAmount || parseInt(withdrawAmount) <= 0 || isNaN(parseInt(withdrawAmount))}
                                className={`flex-1 py-4 rounded-2xl ${loading || !withdrawAmount || parseInt(withdrawAmount) <= 0 || isNaN(parseInt(withdrawAmount))
                                    ? 'bg-gray-300'
                                    : 'bg-primary active:bg-primary/90'
                                    }`}
                                style={{
                                    shadowColor: '#164972',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    elevation: 6
                                }}
                            >
                                <Text className={`text-center font-bold ${loading || !withdrawAmount || parseInt(withdrawAmount) <= 0 || isNaN(parseInt(withdrawAmount))
                                    ? 'text-gray-500'
                                    : 'text-white'
                                    }`}>
                                    {loading ? 'Processing...' : 'Confirm Withdrawal'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default Wallet