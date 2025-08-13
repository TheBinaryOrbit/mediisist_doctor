import React from 'react';
import { View, StyleSheet , SafeAreaView, StatusBar } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icons from 'react-native-vector-icons/Feather';

import Home from './Home';
import Profile from './Profile';
import Slots from './Slots';
import Appointments from './Appointments';

const Tab = createBottomTabNavigator();

const Main = () => {
    return (
        <View className="flex-1 bg-white"> 
            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: '#164972',
                    tabBarInactiveTintColor: 'gray',
                    
                    tabBarStyle: styles.bar,
                    headerShown: false,
                }}
            >
                <Tab.Screen
                    name='Home'
                    component={Home}
                    options={{
                        tabBarIcon: (props) => (
                            <Icons name="home" color={props.color} size={props.focused ? 22 : 18} />
                        ),
                    }}
                />


                <Tab.Screen
                    name='Appointments'
                    component={Appointments}
                    options={{
                        tabBarIcon: (props) => (
                            <Icons name="calendar" color={props.color} size={props.focused ? 22 : 18} />
                        ),
                        
                    }}
                />

                <Tab.Screen
                    name='Slots'
                    component={Slots}
                    options={{
                        tabBarIcon: (props) => (
                            <Icons name="clock" color={props.color} size={props.focused ? 22 : 18} />
                        ),
                    }}
                />
                <Tab.Screen
                    name='Profile'
                    component={Profile}
                    options={{
                        tabBarIcon: (props) => (
                            <Icons name="user" color={props.color} size={props.focused ? 22 : 18} />
                        ),
                    }}
                />
            </Tab.Navigator>
        </View>
    );
};

const styles = StyleSheet.create({
    bar: {
        // margin: 10,
        // marginBottom: 22,
        // borderRadius: 20,
        height: 57,
        // paddingBlock : 5
        // elevation: 5,
    },
});

export default Main;
