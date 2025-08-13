import React, { useState } from 'react'
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    ToastAndroid,
    Alert,
    Dimensions,
    Platform,
    Pressable,
} from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import RNFetchBlob from 'rn-fetch-blob'
import DialogBox from '../components/DialogBox'


const { width, height } = Dimensions.get('window')

const PrescriptionImage = () => {
    const route = useRoute()
    const navigation = useNavigation()
    const { prescriptionUrl } = route.params
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [visibleHeader, setVisibleHeader] = useState(true)

    const handleImageLoad = () => {
        setLoading(false)
    }

    const handleImageError = () => {
        setLoading(false)
        setImageError(true)
        ToastAndroid.show('Failed to load prescription image', ToastAndroid.SHORT)
    }

    const handleDownload = async () => {
        setIsOpen(false);
        try {
            setDownloading(true)

            const timestamp = new Date().getTime()
            const fileName = `prescription_${timestamp}.jpg`

            const { config, fs } = RNFetchBlob
            const downloadDir = Platform.OS === 'ios' ? fs.dirs.DocumentDir : fs.dirs.DownloadDir
            const filePath = `${downloadDir}/${fileName}`

            const configOptions = Platform.select({
                ios: {
                    fileCache: true,
                    path: filePath,
                    appendExt: 'jpg'
                },
                android: {
                    fileCache: true,
                    path: filePath,
                    appendExt: 'jpg',
                    addAndroidDownloads: {
                        useDownloadManager: true,
                        notification: true,
                        mediaScannable: true,
                        title: fileName,
                        description: 'Prescription image download',
                        path: filePath
                    }
                }
            })

            const response = await config(configOptions).fetch('GET', prescriptionUrl)

            if (Platform.OS === 'ios') {
                // For iOS, show success message
                ToastAndroid.show('Prescription downloaded successfully', ToastAndroid.LONG)
            } else {
                // For Android, the download manager will show notification
                ToastAndroid.show('Prescription downloaded to Downloads folder', ToastAndroid.LONG)
            }

        } catch (error) {
            console.error('Download error:', error)
            ToastAndroid.show('Failed to download prescription', ToastAndroid.SHORT)
        } finally {
            setDownloading(false)
        }
    }

    const confirmDownload = () => {
        setIsOpen(true);
    }

    return (
        <Pressable className="flex-1 bg-black"
            onPress={() => setVisibleHeader(!visibleHeader)}
        >
            <StatusBar backgroundColor="black" barStyle="light-content" />

            <DialogBox
                isOpen={isOpen}
                title={'Download Prescription'}
                message={'The Prescription image will be downloaded into Downloads folder'}
                onCancel={() => setIsOpen(false)}
                onConfirm={handleDownload}
            />

            {/* Header with controls */}
            {
                visibleHeader && (
                    <View className="absolute top-0 left-0 right-0 z-10 bg-black/70 pt-2 pb-4 px-4">
                        <View className="flex-row items-center justify-between">
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                className="bg-black/50 rounded-full p-3"
                            >
                                <Ionicons name="arrow-back" size={16} color="white" />
                            </TouchableOpacity>

                            <Text className="text-white text-lg font-medium">Prescription</Text>

                            <TouchableOpacity
                                onPress={confirmDownload}
                                disabled={downloading || imageError}
                                className="bg-black/50 rounded-full p-3"
                            >
                                {downloading ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <FontAwesome5
                                        name="download"
                                        size={16}
                                        color={imageError ? '#666' : 'white'}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )
            }

            {/* Main content */}
            <View className="flex-1 justify-center items-center">
                {loading && (
                    <View className="absolute z-5">
                        <ActivityIndicator size="large" color="white" />
                        <Text className="text-white mt-2">Loading prescription...</Text>
                    </View>
                )}

                {imageError ? (
                    <View className="items-center px-8">
                        <FontAwesome5 name="exclamation-triangle" size={64} color="#666" />
                        <Text className="text-white text-lg font-medium mt-4 text-center">
                            Failed to load prescription
                        </Text>
                        <Text className="text-gray-400 text-center mt-2">
                            Please check your internet connection and try again
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                setImageError(false)
                                setLoading(true)
                            }}
                            className="bg-primary rounded-lg px-6 py-3 mt-4"
                        >
                            <Text className="text-white font-medium">Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Image
                        source={{ uri: prescriptionUrl }}
                        style={{
                            width: width,
                            height: height,
                            resizeMode: 'contain'
                        }}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                    />
                )}
            </View>

        </Pressable>
    )
}

export default PrescriptionImage