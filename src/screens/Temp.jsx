import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const TempScreen = () => {
  // State to hold the user's input
  const [callId, setCallId] = useState('');
  
  // Hook to get the navigation object
  const navigation = useNavigation();

  // Function to handle the button press
  const handleJoinCall = () => {
    Keyboard.dismiss(); // Dismiss the keyboard
    if (callId.trim() === '') {
      Alert.alert('Error', 'Please enter a Call ID.');
      return;
    }

    // Navigate to the VideoCallScreen and pass the callId as a parameter
    navigation.navigate('VideoCall', {
      callId: callId.trim(),
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join a Call</Text>
      <Text style={styles.subtitle}>Enter the Call ID from an appointment to join the video call.</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter Call ID"
        placeholderTextColor="#888"
        value={callId}
        onChangeText={setCallId}
        autoCapitalize="none"
      />
      
      <TouchableOpacity style={styles.button} onPress={handleJoinCall}>
        <Text style={styles.buttonText}>Join Call</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 3, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TempScreen;