import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import Steps from './StepsIndicator'
import Icons from 'react-native-vector-icons/Feather'

const Singup4 = ({ details, handleChange, setSteps, onCreateAccount, validateAllSteps, loading }) => {
    const navigation = useNavigation();
    const [password, setPassword] = useState(details.password || '');
    const [isvisible, setIsVisible] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const [consfirmPassword, setConfirmPassword] = useState(details.confirmPassword || '');
    const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
    const [isconfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    useEffect(() => {
        if (consfirmPassword !== password) {
            setConfirmPasswordError('Passwords do not match');
        } else {
            setConfirmPasswordError('');
        }
    }, [consfirmPassword]);

    const handlePasswordChange = (name, value) => {
        if (name === 'password') {
            setPassword(value);
        }
        if (name === 'confirmPassword') {
            setConfirmPassword(value);
        }
        handleChange(name, value);
    }

    // Handle create account button press
    const handleCreateAccountPress = () => {
        // Basic validation
        if (!password.trim()) {
            alert('Please enter a password');
            return;
        }
        if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }
        if (password !== consfirmPassword) {
            alert('Passwords do not match');
            return;
        }

        // Check if all required fields are filled
        if (validateAllSteps && !validateAllSteps()) {
            alert('Please complete all required fields in previous steps');
            return;
        }

        // Call the create account function from parent
        if (onCreateAccount) {
            onCreateAccount();
        } else {
            // Fallback if no function provided
            alert('Account created successfully!');
        }
    };


    return (
        <ScrollView className="flex-1 bg-white">

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="absolute top-5 left-5 z-10">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icons name="arrow-left" size={24} color="#164972" />
                    </TouchableOpacity>
                </View>




                <View className="flex-1 mt-14 p-5">

                    <Text className="text-2xl font-bold text-primary mb-1">Create Account</Text>
                    <Text className="text-gray-500 mb-8">Please fill in the details to create your account.</Text>

                    <Steps active={4} steps={4} />


                    <View className={`flex flex-row items-center justify-between px-4 bg-white ${passwordFocused ? 'border-2 border-primary' : 'border border-slate-300'} py-1 rounded-2xl mb-4`}>
                        <Icons name="lock" size={18} color={'gray'} />
                        <TextInput
                            key={isvisible ? 'text' : 'password'}
                            className="flex-1 ml-2 text-black"
                            placeholder='Password'
                            placeholderTextColor={'gray'}
                            value={password}
                            secureTextEntry={!isvisible}
                            onChangeText={(t) => handlePasswordChange('password', t)}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                        />
                        <Pressable onPress={() => setIsVisible(!isvisible)}>
                            <Icons name={isvisible ? 'eye-off' : 'eye'} size={18} color={'gray'} />
                        </Pressable>
                    </View>


                    <View className={`flex flex-row items-center justify-between px-4 bg-white ${confirmPasswordFocused ? 'border-2 border-primary' : 'border border-slate-300'} py-1 rounded-2xl mb-2`}>
                        <Icons name="lock" size={18} color={'gray'} />
                        <TextInput
                            key={isvisible ? 'text' : 'password'}
                            className="flex-1 ml-2 text-black"
                            placeholder='Confirm Password'
                            placeholderTextColor={'gray'}
                            value={consfirmPassword}
                            secureTextEntry={!isconfirmPasswordVisible}
                            onChangeText={(t) => handlePasswordChange('confirmPassword', t)}
                            onFocus={() => setConfirmPasswordFocused(true)}
                            onBlur={() => setConfirmPasswordFocused(false)}
                        />
                        <Pressable onPress={() => setIsConfirmPasswordVisible(!isconfirmPasswordVisible)}>
                            <Icons name={isconfirmPasswordVisible ? 'eye-off' : 'eye'} size={18} color={'gray'} />
                        </Pressable>
                    </View>

                    {confirmPasswordError ? (
                        <Text className="text-red-500 text-sm mb-4 italic">*{confirmPasswordError}</Text>
                    ) : null}



                    <View className={`flex flex-row items-center justify-between py-1 rounded-2xl mt-8 `}>
                        <TouchableOpacity
                            className={`max-w-1/2 px-4 py-3 rounded-2xl flex-row items-center justify-center mb-4 bg-white border-2 border-primary`}
                            onPress={() => setSteps(3)}
                            disabled={loading}
                        >
                            <Icons name="arrow-left" size={18} color={'#164972'} style={{ marginRight: 5 }} />
                            <Text className="text-md text-primary font-bold tracking-widest">Previous</Text>


                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`max-w-1/2 px-6 py-3 rounded-2xl flex-row items-center justify-center mb-4 bg-primary`}
                            onPress={handleCreateAccountPress}
                            disabled={loading}
                        >
                            {
                                loading ?
                                    <ActivityIndicator size="small" color="#fff" />
                                    :
                                    <Text className="text-md text-white font-bold tracking-widest">Create Account</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </ScrollView>
    )
}

export default Singup4