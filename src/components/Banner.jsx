import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions, ActivityIndicator, Animated } from 'react-native';
import Carousel from 'react-native-banner-carousel';

const BannerWidth = Dimensions.get('window').width;
const BannerHeight = 150;

const SkeletonLoader = () => {
    const animatedValue = new Animated.Value(0);

    useEffect(() => {
        const animate = () => {
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: false,
                }),
            ]).start(() => animate());
        };
        animate();
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View style={styles.container}>
            <View style={styles.skeletonContainer}>
                <Animated.View style={[styles.skeletonBanner, { opacity }]} />

                {/* Skeleton dots */}
                <View style={styles.skeletonDotsContainer}>
                    {[...Array(3)].map((_, index) => (
                        <Animated.View
                            key={index}
                            style={[styles.skeletonDot, { opacity }]}
                        />
                    ))}
                </View>
            </View>
        </View>
    );
};

const Banner = () => {
    const images = [
        require('../assets/login1.png'),
        require('../assets/login2.png'),
    ];
    const [loading, setLoading] = useState(false);



    const renderPage = (image, index) => (
        <View key={index}>
            <Image
                source={image}
                style={styles.image}
                resizeMode="cover"
            />
        </View>
    );

    if (loading) {
        return <SkeletonLoader />;
    }

    return (
        <View style={styles.container}>
            <Carousel
                autoplay
                autoplayTimeout={4000}
                loop
                index={0}
                pageSize={BannerWidth}
                pageIndicatorStyle={styles.inactiveDot}
                activePageIndicatorStyle={styles.activeDot}
            >
                {images.map((img, i) => renderPage(img, i))}
            </Carousel>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingTop: 0,
    },
    image: {
        width: BannerWidth - 32,
        height: BannerHeight,
        borderRadius: 12,
        marginHorizontal: 16,
        borderColor : '#ccc',
        borderWidth: 1,
    },
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
    // Skeleton styles
    skeletonContainer: {
        alignItems: 'center',
    },
    skeletonBanner: {
        width: BannerWidth - 32,
        height: BannerHeight,
        backgroundColor: '#e0e0e0',
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    skeletonDotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    skeletonDot: {
        width: 8,
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        marginHorizontal: 4,
    },
});

export default Banner;