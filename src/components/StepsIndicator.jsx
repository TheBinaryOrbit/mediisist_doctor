import { View, Text } from 'react-native';
import React from 'react';

const Steps = ({ active, steps }) => {
    const activearr = Array(active).fill(1);
    const inactivearr = Array(steps - active).fill(1);

    return (
        <>
            <View className="flex-row items-center justify-between mb-2 px-3">
                {activearr.map((_, index) => (
                    <React.Fragment key={`active-${index}`}>
                        {index !== 0 && (
                            <View className="flex-1 h-0.5 bg-primary mx-1 mt-0.5" />
                        )}
                        <View className="flex items-center">
                            <View className="w-6 h-6 rounded-full bg-primary justify-center items-center">
                                <Text className="text-white text-xs font-bold">{index + 1}</Text>
                            </View>
                        </View>
                    </React.Fragment>
                ))}

                {inactivearr.map((_, index) => (
                    <React.Fragment key={`inactive-${index}`}>
                        <View className="flex-1 h-0.5 bg-gray-300 mx-1 mt-0.5" />
                        <View className="flex items-center">
                            <View className="w-6 h-6 rounded-full bg-gray-300 justify-center items-center">
                                <Text className="text-white text-xs font-bold">{index + active + 1}</Text>
                            </View>
                        </View>
                    </React.Fragment>
                ))}
            </View>

            <View className="flex-row justify-between px-2 mb-10">
                {activearr.map((_, index) => (
                    <Text key={`label-active-${index}`} className="text-xs text-primary">
                        Step {index + 1}
                    </Text>
                ))}

                {inactivearr.map((_, index) => (
                    <Text key={`label-inactive-${index}`} className="text-xs text-gray-400">
                        Step {index + active + 1}
                    </Text>
                ))}
            </View>
        </>
    );
};

export default Steps;
