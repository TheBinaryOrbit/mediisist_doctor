import { View, Text , ScrollView , TouchableOpacity } from 'react-native'
import React from 'react'
import Icons from 'react-native-vector-icons/Feather'

const TAndC = ({ navigation }) => {
  return (
    <ScrollView className="flex-1 bg-white">
    
    
          <View className="flex-row justify-start items-center  bg-white p-5 rounded-b-2xl">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icons name="arrow-left" size={24} color="#164972" />
            </TouchableOpacity>
            <Text className="font-semibold text-xl text-primary ml-5">Terms and Conditions</Text>
          </View>
    
    
    
    
    
    
        </ScrollView>
  )
}

export default TAndC