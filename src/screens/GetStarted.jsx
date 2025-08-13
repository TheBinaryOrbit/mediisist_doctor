import { View, Text, TextInput, TouchableOpacity, Image, StatusBar, ToastAndroid, ActivityIndicator, Dimensions, StyleSheet } from 'react-native'
import React from 'react'
import Carousel from 'react-native-banner-carousel';

const { width: screenWidth } = Dimensions.get('window');
const BannerWidth = screenWidth;

const images = [
    require('../assets/login1.png'),
    require('../assets/login2.png'),
];

const GetStarted = ({ navigation }) => {

    const renderPage = (image, index) => (
        <View key={index} className="flex justify-end items-end">
            <Image
                source={image}
                className="h-full w-full" resizeMode='contain'
            />
        </View>
    );


    return (
        <>
            <View className="bg-white h-full relative flex flex-col ">
                <View className="justify-end items-center pt-3 ">
                    <Image source={require('../assets/logo.png')} className="w-32 h-32"  resizeMode='contain' />
                    
                </View>
                <View className="w-full flex-1 bg-white">
                    <Carousel
                        autoplay
                        autoplayTimeout={3000}
                        loop
                        index={0}
                        pageSize={BannerWidth}
                        showsPageIndicator={true}
                        pageIndicatorStyle={styles.inactiveDot}
                        activePageIndicatorStyle={styles.activeDot}
                    >
                        {images.map((img, i) => renderPage(img, i))}
                    </Carousel>
                </View>
                <View className="bg-white/90 bottom-0 w-full h-fit rounded-t-2xl p-5">
                    <>
                        <TouchableOpacity
                            className={`w-full bg-primary px-2 py-3 rounded-2xl flex items-center justify-center mb-4 `}
                            onPress={() => navigation.navigate('Singup')}
                        >
                            <Text className="font-bold text-white text-md tracking-wide">Create account</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`w-full border border-primary px-2 py-3 rounded-2xl flex items-center justify-center mb-4 `}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text className="font-bold text-primary text-md">Log in</Text>
                        </TouchableOpacity>
                        <View className="flex flex-row  items-start mb-4 gap-2">

                            <Text className="text-black text-center text-xs flex-1">
                                By creating account or logging in, you agree to our{' '}
                                <Text
                                    onPress={() => navigation.navigate('TAndC')}
                                    className="text-primary underline font-medium"
                                >
                                    {'\n'}Terms & Conditions
                                </Text>{' '}and{' '}
                                <Text
                                    onPress={() => navigation.navigate('Privacy')}
                                    className="text-primary underline font-medium"
                                >
                                    Privacy Policy
                                </Text>
                                .
                            </Text>
                        </View>
                    </>
                </View>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    activeDot: {
        backgroundColor: '#164972',
        width: 8,
        height: 8,
        borderRadius: 5,
        marginHorizontal: 4
    },
    inactiveDot: {
        backgroundColor: '#ccc',
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4
    },
});

export default GetStarted