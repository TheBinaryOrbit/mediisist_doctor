import { Image, View, StatusBar } from 'react-native'
import React, { useEffect } from 'react'
import { useIsLoggedIn } from '../hooks/useIsLoggedIn';


const Splash = ({ navigation }) => {

  const isLoggedIn = useIsLoggedIn();

  useEffect(() => {
    setTimeout(() => {
      isLoggedIn ?
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }]
        })
        :
        navigation.reset({
          index: 0,
          routes: [{ name: 'GetStarted' }]
        });
    }, 3000);
  })

  return (
    <>
      <View className="bg-white w-screen h-screen">
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <Image source={require('../assets/splash.gif')} className="w-full h-full scale-75" />
      </View>
    </>
  )
}

export default Splash