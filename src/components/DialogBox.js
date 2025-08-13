import { View, Text, Modal, TouchableOpacity } from 'react-native'
import React from 'react'

const DialogBox = ({ isOpen, onConfirm, onCancel, title, message }) => {
    return (
        <Modal
            visible={isOpen}
            transparent={true}
            animationType="fade"
        >
            <View className="flex-1 bg-black/50 justify-center items-center px-5">
                <View className="bg-white rounded-xl w-full p-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-1 text-center">
                        {title}
                    </Text>
                    <Text className="text-gray-500 text-center mb-6">
                        {message}
                    </Text>

                    <View className="flex-row space-x-3">
                        <TouchableOpacity
                            onPress={() => onCancel()}
                            className="flex-1 bg-gray-100 rounded-lg py-3 items-center"
                        >
                            <Text className="text-gray-700 font-medium">Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => onConfirm()}
                            className="flex-1 bg-primary rounded-lg py-3 items-center"
                        >

                            <Text className="text-white font-medium">Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default DialogBox