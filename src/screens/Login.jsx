import { View, Text, TouchableOpacity, TextInput, Pressable, ActivityIndicator } from 'react-native'
import React, { useEffect } from 'react'
import Icons from 'react-native-vector-icons/Feather';
import axios from 'axios';
import baseUrl from '../utils/baseUrl';
import { ToastAndroid } from 'react-native';
import { MMKV } from 'react-native-mmkv';

const Login = ({ navigation }) => {
  const storage = new MMKV();
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isvisible, setIsVisible] = React.useState(false);
  const [isValidNumber, setIsValidNumber] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [phoneFocused, setPhoneFocused] = React.useState(false);
  const [passwordFocused, setPasswordFocused] = React.useState(false);


  useEffect(() => {
    if (phoneNumber.length === 10 && password.length >= 6) {
      setIsValidNumber(true);
    } else {
      setIsValidNumber(false);
    }
  }, [phoneNumber, password])


  const handleLogin = async () => {
    if (isValidNumber) {
      setIsLoading(true);
    }


    try {
      const res = await axios.post(`${baseUrl}/doctor/login`, {
        phoneNumber,
        password
      });

      if (res.status === 200 || res.status === 201) {
        console.log('Login successful:', res.data.doctor);
        ToastAndroid.show('Login successful!', ToastAndroid.SHORT);
        storage.set('doctor', JSON.stringify(res.data.doctor));
        storage.set('isLoggedIn', JSON.stringify(true));
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }]
        });

      } else {
        ToastAndroid.show('Login failed. Please check your credentials.', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error during login:', error);
      ToastAndroid.show(error.response.data.error, ToastAndroid.SHORT);
    }
    finally {
      setIsLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-white p-5">
      <View className="absolute top-5 left-5 z-10">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons name="arrow-left" size={24} color="#164972" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 mt-14">
        <Text className="font-bold text-primary text-2xl  font-serif">Log in</Text>
        <Text className="text-slate-400 text-sm mt-2 mb-6">Welcome back! Please log in to your account.</Text>

        <View className={`flex flex-row items-center justify-between px-4 ${phoneFocused ? 'border-2 border-primary' : 'border border-slate-300'} py-1 rounded-2xl mb-4`}>
          <Icons name="phone" size={18} color={'gray'} />
          <TextInput className="flex-1 ml-2 text-black" placeholder='Phone Number' placeholderTextColor={'gray'} value={phoneNumber} onChangeText={(p) => setPhoneNumber(p)} keyboardType='numeric' maxLength={10} onFocus={() => setPhoneFocused(true)} onBlur={() => setPhoneFocused(false)} />
        </View>

        <View className={`flex flex-row items-center justify-between px-4 bg-white ${passwordFocused ? 'border-2 border-primary' : 'border border-slate-300'} py-1 rounded-2xl mb-1`}>
          <Icons name="lock" size={18} color={'gray'} />
          <TextInput
            key={isvisible ? 'text' : 'password'}
            className="flex-1 ml-2 text-black"
            placeholder='Password'
            placeholderTextColor={'gray'}
            value={password}
            secureTextEntry={!isvisible}
            onChangeText={(t) => setPassword(t)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
          />
          <Pressable onPress={() => setIsVisible(!isvisible)}>
            <Icons name={isvisible ? 'eye-off' : 'eye'} size={18} color={'gray'} />
          </Pressable>
        </View>

        <View className="w-full mb-6">
          <Text className="text-right mr-2 mt-1 text-primary font-semibold text-[12px] tracking-wider" onPress={() => navigation.navigate('Forgot Password')}>Forgot password?</Text>
        </View>


        <TouchableOpacity
          className={`w-full px-2 py-3 rounded-2xl flex items-center justify-center mb-4 ${isValidNumber ? 'bg-primary' : 'bg-slate-300'}`}
          onPress={() => handleLogin()}
          disabled={!isValidNumber}
        >
          {
            isLoading ?
              <ActivityIndicator color='white' />
              :
              <Text className="text-white font-bold tracking-widest">Login</Text>
          }
        </TouchableOpacity>
      </View>

    </View>
  )
}

export default Login