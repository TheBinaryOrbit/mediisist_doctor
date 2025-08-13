import { SafeAreaView ,StatusBar } from 'react-native'
import React, { useEffect } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import Login from './src/screens/Login'
import TAndC from './src/screens/TAndC'
import Privacy from './src/screens/Privacy'
import Splash from './src/screens/Splash'
import GetStarted from './src/screens/GetStarted'
import Singup from './src/screens/Singup'
import Main from './src/screens/Main'
import Educations from './src/screens/Educations'
import Experience from './src/screens/Experience'
import Timings from './src/screens/Timings'
import PaymentMethod from './src/screens/PaymentMethod'
import Wallet from './src/screens/Wallet'
import MyProfile from './src/screens/MyProfile'
import Appointments from './src/screens/Appointments'
import AppointmentDetails from './src/screens/AppointmentDetails'
import PrescriptionImage from './src/screens/PrescriptionImage'
import VideoCallScreen from './src/screens/VideoCallScreen'

const Stack = createNativeStackNavigator()

const App = () => {
  return (
    <NavigationContainer >
      <SafeAreaProvider>
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <SafeAreaView style={{ flex: 1 }}>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
          <Stack.Screen name="Splash" component={Splash} />
          <Stack.Screen name="GetStarted" component={GetStarted} />

          <Stack.Screen name="TAndC" component={TAndC} options={{ animation: 'slide_from_right' }}/>
          <Stack.Screen name="Privacy" component={Privacy} options={{ animation: 'slide_from_right' }}/>
          

          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Singup" component={Singup} />

          <Stack.Screen name="Main" component={Main} />

          <Stack.Screen name="Appointments" component={Appointments} options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="AppointmentDetails" component={AppointmentDetails}/>

          <Stack.Screen name="Education" component={Educations} options={{ animation: 'slide_from_right' }}/>
          <Stack.Screen name="Experience" component={Experience}  options={{ animation: 'slide_from_right' }}/>
          <Stack.Screen name="Timings" component={Timings} options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="Payment Method" component={PaymentMethod} options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="Wallet" component={Wallet} options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="MyProfile" component={MyProfile} options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="PrescriptionImage" component={PrescriptionImage} options={{ animation: 'slide_from_right' }} />


          <Stack.Screen name="VideoCall" component={VideoCallScreen} options={{ animation: 'slide_from_right' }} />

          {/* // temp */}
          {/* <Stack.Screen name="Temp" component={TempScreen} options={{ animation: 'slide_from_right' }} /> */}
         </Stack.Navigator>
        </SafeAreaView>
      </SafeAreaProvider>
    </NavigationContainer>
  )
}



export default App