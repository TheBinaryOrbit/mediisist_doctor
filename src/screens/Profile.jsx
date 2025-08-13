import { View, Text, TouchableOpacity, ScrollView , StatusBar , Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import Icons from 'react-native-vector-icons/FontAwesome5';
import Icon from 'react-native-vector-icons/Feather';
import DialogBox from '../components/DialogBox';
import { MMKV } from 'react-native-mmkv';
import { Linking } from 'react-native';
import imageBaseUrl from '../utils/ImageBaseUrl';
import { useGetDoctor } from '../hooks/useGetDoctor';
import { useIsFocused } from '@react-navigation/native';

const menuItems = [
    // { title: 'My Profile', icon: 'user', route: 'Wallet' },
    { title: 'Wallet', icon: 'wallet', route: 'Wallet' },
    { title: 'Payment Method', icon: 'money-check', route: 'Payment Method' },
    { title: 'Educations', icon: 'book', route: 'Education' },
    { title: 'Experience', icon: 'briefcase', route: 'Experience' },
    { title: 'Timings', icon: 'clock', route: 'Timings' },
    { title: 'Terms & Conditions', icon: 'file-contract', route: 'TAndC' },
    { title: 'Privacy Policy', icon: 'shield-alt', route: 'Privacy' },
    { title: 'Video Call', icon: 'shield-alt', route: 'Temp' },
];

const Profile = ({ navigation }) => {
    const storage = new MMKV();
    const [isOpen, setIsOpen] = useState(false);
    const [doctor, setDoctor] = useState(null);
    const isFocused = useIsFocused();

    const handleLogout = () => {
        storage.delete('user');
        storage.delete('isLoggedIn');
        navigation.reset({
            index: 0,
            routes: [{ name: 'GetStarted' }]
        })
    }

    const handlePress = (item) => {
        if (item.link) {
            Linking.openURL(item.link);
        } else {
            navigation.navigate(item.route);
        }
    };
    
    useEffect(()=>{
        if(isFocused){
            const doctor = useGetDoctor();
            console.log('Doctor Data:', doctor);
            setDoctor(doctor);
        }
    }, [isFocused])

    return (
        <>
        <StatusBar backgroundColor={'#164972'} barStyle="light-content" />
            <View className="flex-1 bg-white">
                {/* Enhanced Header */}
                <View className="bg-primary px-6 py-6 rounded-b-3xl">
                    <View className="flex flex-row items-center gap-4">
                        {/* User Photo */}
                        <TouchableOpacity onPress={() => navigation.navigate('MyProfile')} className="relative">
                            <View className="w-20 h-20 bg-white rounded-full items-center justify-center">
                                <Image source={{ uri: `${imageBaseUrl}${doctor?.imageUrl}` }} className="w-full h-full rounded-full" />
                            </View>
                            {/* Edit Icon */}
                            <View className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                                <Icons name="edit" size={12} color="white" />
                            </View>
                        </TouchableOpacity>

                        {/* User Details */}
                        <View className="flex-1">
                            <Text className="text-xl font-bold text-white">
                                {doctor?.displayName || '--'}
                            </Text>
                            <View className="flex-row items-center mb-2">
                                <Text className="text-white/90 text-sm">
                                    {doctor?.specialization?.label || '--'}
                                </Text>
                            </View>
                            <View className="flex-row items-center mb-1">
                                <Icon name="phone" size={12} color="white" />
                                <Text className="text-white/90 text-sm ml-2">
                                    +91 {doctor?.phoneNumber || '--'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>


                <ScrollView className="pb-5">
                {/* Menu Items */}
                <View className="flex-1 mt-6 mb-6">
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            className="border-b border-slate-300 px-4 py-4 flex-row justify-between items-center mb-2"
                            onPress={() => handlePress(item)}
                        >
                            <View className="flex-row items-center gap-3">
                                <Icons name={item.icon} size={18} color={item.color || '#164972'} />
                                <Text className={`font-medium tracking-wider text-[16px] ${item.color ? 'text-red-500' : 'text-slate-600'}`}>
                                    {item.title}
                                </Text>
                            </View>
                            <Icon name="chevron-right" size={18} color={item.color || '#164972'} />
                        </TouchableOpacity>
                    ))}
                    <View className="px-4">
                        <Text className="text-slate-400 mb-3 mt-2">App Version : 1.0.0</Text>
                        <Text onPress={() => setIsOpen(true)} className="text-red-400 font-bold">Log out</Text>
                        <DialogBox isOpen={isOpen} onCancel={() => setIsOpen(false)} onConfirm={() => handleLogout()} title={'Log out'} message='Are You Sure You Want To Logout ?' />
                    </View>
                </View>
                </ScrollView>
            </View>
        </>
    );
};

export default Profile;