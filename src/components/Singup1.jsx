import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ToastAndroid, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import Steps from './StepsIndicator'
import Icons from 'react-native-vector-icons/Feather'
import { launchImageLibrary } from 'react-native-image-picker'


const Singup1 = ({ details, handleChange, setSteps }) => {
    const navigation = useNavigation();

    // Local state for form fields
    const [firstName, setFirstName] = useState(details?.firstName || '');
    const [lastName, setLastName] = useState(details?.lastName || '');
    const [displayName, setDisplayName] = useState(details?.displayName || '');
    const [phoneNumber, setPhoneNumber] = useState(details?.phoneNumber || '');
    const [email, setEmail] = useState(details?.email || '');

    // Handle input changes and update parent state
    const handleFirstNameChange = (text) => {
        setFirstName(text);
        handleChange('firstName', text);
    };

    const handleLastNameChange = (text) => {
        setLastName(text);
        handleChange('lastName', text);
    };

    const handleDisplayNameChange = (text) => {
        setDisplayName(text);
        handleChange('displayName', text);
    };

    const handlePhoneNumberChange = (text) => {
        setPhoneNumber(text);
        handleChange('phoneNumber', text);
    };

    const handleEmailChange = (text) => {
        setEmail(text);
        handleChange('email', text);
    };

    // Validation function
    const validateForm = () => {
        if (!firstName.trim()) {
            ToastAndroid.show('Please enter your first name', ToastAndroid.SHORT);
            return false;
        }
        if (!lastName.trim()) {
            ToastAndroid.show('Please enter your last name', ToastAndroid.SHORT);
            return false;
        }
        if (!displayName.trim()) {
            ToastAndroid.show('Please enter your display name', ToastAndroid.SHORT);
            return false;
        }
        if (!phoneNumber.trim()) {
            ToastAndroid.show('Please enter your phone number', ToastAndroid.SHORT);
            return false;
        }
        if (phoneNumber.length < 10) {
            ToastAndroid.show('Please enter a valid phone number', ToastAndroid.SHORT);
            return false;
        }
        if (!email.trim()) {
            ToastAndroid.show('Please enter your email address', ToastAndroid.SHORT);
            return false;
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            ToastAndroid.show('Please enter a valid email address', ToastAndroid.SHORT);
            return false;
        }
        return true;
    };

    // Handle next button press
    const handleNext = () => {
        if (validateForm()) {
            setSteps(2);
        }
    };


    // upload image function can be added here if needed

    const pickImage = () => {
        launchImageLibrary(
            {
                mediaType: 'photo',
                quality: 0.8,
            },
            (response) => {
                if (response.didCancel) return;
                if (response.assets && response.assets.length > 0) {
                    handleChange('image', response.assets[0]);
                }
            }
        );
    };

    // Update local state if details change from parent
    useEffect(() => {
        if (details) {
            setFirstName(details.firstName || '');
            setLastName(details.lastName || '');
            setDisplayName(details.displayName || '');
            setPhoneNumber(details.phoneNumber || '');
            setEmail(details.email || '');
        }
    }, [details]);


    return (
        <ScrollView className="flex-1 bg-white">




            <View className="absolute top-5 left-5 z-10">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icons name="arrow-left" size={24} color="#164972" />
                </TouchableOpacity>
            </View>




            <View className="flex-1 mt-14 p-5">

                <Text className="text-2xl font-bold text-primary mb-1">Create Account</Text>
                <Text className="text-gray-500 mb-8">Please fill in the details to create your account.</Text>

                <Steps active={1} steps={4} />


                {/* // upload image component can be added here if needed */}


                <View className="mb-6 flex items-center justify-center">
                    <TouchableOpacity
                        className="w-24 h-24 border-2 border-dashed border-primary items-center justify-center rounded-full"
                        onPress={pickImage}
                    >
                        <View className="w-6 h-6 absolute bottom-0 right-0 bg-primary rounded-full items-center justify-center z-40">
                            <Icons name="edit-2" size={12} color="white" />
                        </View>
                        {details.image ? (
                            <View className="w-full h-full rounded-full overflow-hidden">
                                <Image
                                    source={{ uri: details.image.uri }}
                                    className="w-full h-full rounded-lg"
                                    resizeMode="cover"
                                />
                            </View>
                        ) : (
                            <>
                                <Icons name="user" size={30} color="#164972" />
                            </>
                        )}
                    </TouchableOpacity>

                </View>

                <View className={`flex flex-row items-center justify-between px-4 border border-primary py-1 rounded-2xl mb-4`}>
                    <Icons name="user" size={18} color={'gray'} />
                    <TextInput
                        className="flex-1 ml-2 text-black"
                        placeholder='First Name'
                        placeholderTextColor={'gray'}
                        value={firstName}
                        onChangeText={handleFirstNameChange}
                    />
                </View>

                <View className={`flex flex-row items-center justify-between px-4 border border-primary py-1 rounded-2xl mb-4`}>
                    <Icons name="user" size={18} color={'gray'} />
                    <TextInput
                        className="flex-1 ml-2 text-black"
                        placeholder='Last Name'
                        placeholderTextColor={'gray'}
                        value={lastName}
                        onChangeText={handleLastNameChange}
                    />
                </View>

                <View className={`flex flex-row items-center justify-between px-4 border border-primary py-1 rounded-2xl mb-4`}>
                    <Icons name="user" size={18} color={'gray'} />
                    <TextInput
                        className="flex-1 ml-2 text-black"
                        placeholder='Display Name'
                        placeholderTextColor={'gray'}
                        value={displayName}
                        onChangeText={handleDisplayNameChange}
                    />
                </View>

                <View className={`flex flex-row items-center justify-between px-4 border border-primary py-1 rounded-2xl mb-4`}>
                    <Icons name="phone" size={18} color={'gray'} />
                    <TextInput
                        className="flex-1 ml-2 text-black"
                        placeholder='Phone Number'
                        placeholderTextColor={'gray'}
                        value={phoneNumber}
                        onChangeText={handlePhoneNumberChange}
                        keyboardType="phone-pad"
                        maxLength={10}
                    />
                </View>

                <View className={`flex flex-row items-center justify-between px-4 border border-primary py-1 rounded-2xl mb-8`}>
                    <Icons name="mail" size={18} color={'gray'} />
                    <TextInput
                        className="flex-1 ml-2 text-black"
                        placeholder='Email Address'
                        placeholderTextColor={'gray'}
                        value={email}
                        onChangeText={handleEmailChange}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <TouchableOpacity
                    className={`w-full px-2 py-3 rounded-2xl flex-row items-center justify-center mb-4 bg-primary`}
                    onPress={handleNext}
                >
                    <Text className="text-lg text-white font-bold tracking-widest">Next</Text>
                    <Icons name="arrow-right" size={18} color={'white'} style={{ marginLeft: 5 }} />
                </TouchableOpacity>
            </View>

        </ScrollView>
    )
}

export default Singup1