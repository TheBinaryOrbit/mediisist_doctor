import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import {
  RTCPeerConnection,
  RTCView,
  mediaDevices,
  RTCIceCandidate,
  RTCSessionDescription,
} from 'react-native-webrtc';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import InCallManager from 'react-native-incall-manager';

const { width, height } = Dimensions.get('window');

const configuration = {
  iceServers: [
    { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
  ],
  iceCandidatePoolSize: 10,
};

const VideoCallScreen = ({ route }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const navigation = useNavigation();
  const peerConnection = useRef(null);
  const firestoreUnsubscribers = useRef([]);
  const callStartTime = useRef(null);
  const controlsTimer = useRef(null);

  // Get route params
  const { videoCallId, appointmentId, patientName } = route.params || {};

  useEffect(() => {
    const callId = videoCallId || route.params?.callId;
    if (callId) {
      initiateCall(callId);
    } else {
      Alert.alert("Error", "No Call ID was provided.");
      navigation.goBack();
    }

    // Initialize InCallManager for proper audio routing
    InCallManager.start({ media: 'video' });
    InCallManager.setKeepScreenOn(true);
    InCallManager.setSpeakerphoneOn(true);

    // Call duration timer
    const durationInterval = setInterval(() => {
      if (callStartTime.current) {
        setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
      }
    }, 1000);

    // Auto-hide controls after 5 seconds
    const hideControlsTimer = setTimeout(() => {
      setShowControls(false);
    }, 5000);

    // Main cleanup function runs on component unmount
    return () => {
      clearInterval(durationInterval);
      clearTimeout(hideControlsTimer);
      InCallManager.stop();
      hangUp();
    };
  }, [videoCallId, route.params?.callId]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleControls = () => {
    setShowControls(!showControls);
    if (controlsTimer.current) {
      clearTimeout(controlsTimer.current);
    }
    if (!showControls) {
      controlsTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 5000);
    }
  };

  const setupMedia = async () => {
    let stream;
    try {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      }
      
      // Request media with explicit constraints
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: { 
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          frameRate: { min: 15, ideal: 30, max: 30 },
          facingMode: 'user'
        },
      };
      
      stream = await mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      // Ensure video track is enabled by default
      stream.getVideoTracks().forEach(track => {
        track.enabled = true;
      });
      
      return stream;
    } catch (error) {
      console.error("Error getting media stream:", error);
      Alert.alert("Error", "Could not access camera or microphone.");
    }
    return null;
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleSpeaker = () => {
    try {
      const newSpeakerState = !isSpeakerOn;
      InCallManager.setSpeakerphoneOn(newSpeakerState);
      setIsSpeakerOn(newSpeakerState);
      console.log('Speaker toggled to:', newSpeakerState ? 'Speaker' : 'Earpiece');
    } catch (error) {
      console.error('Error toggling speaker:', error);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const switchCamera = async () => {
    try {
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack && videoTrack._switchCamera) {
          await videoTrack._switchCamera();
        }
      }
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  };

  const initializePeerConnection = (stream) => {
    peerConnection.current = new RTCPeerConnection(configuration);

    // Add local stream tracks to the connection
    stream.getTracks().forEach(track => {
      peerConnection.current.addTrack(track, stream);
    });

    // --- KEY HANDLERS ---

    // 1. Handles the arrival of the remote stream
    peerConnection.current.ontrack = event => {
      console.log('ONTRACK EVENT: A remote track was received!');
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    // 2. Monitors the connection status (crucial for debugging)
    peerConnection.current.oniceconnectionstatechange = () => {
      const state = peerConnection.current.iceConnectionState;
      console.log('ICE Connection State changed to:', state);
      if (state === 'failed' || state === 'disconnected' || state === 'closed') {
        Alert.alert("Connection Failed", "Could not connect to the other user.");
      }
    };
  };

  const initiateCall = async (id) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert("Authentication Error", "You are not signed in.");
        return;
      }

      setLoading(true);
      const localStream = await setupMedia();
      if (!localStream) {
        setLoading(false);
        return;
      }
      
      initializePeerConnection(localStream);

      const callDocRef = firestore().collection('calls').doc(id);
      collectIceCandidates(callDocRef);

      const callSnapshot = await callDocRef.get();

      // SCENARIO A: You are the first to join (the "Caller")
      if (!callSnapshot.exists || !callSnapshot.data()?.offer) {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        await callDocRef.set({ offer });

        // Listen for the answer from the joiner
        const unsub = callDocRef.onSnapshot(snapshot => {
          const data = snapshot.data();
          if (!peerConnection.current.remoteDescription && data?.answer) {
            const answerDescription = new RTCSessionDescription(data.answer);
            peerConnection.current.setRemoteDescription(answerDescription);
          }
        });
        firestoreUnsubscribers.current.push(unsub);
      } 
      // SCENARIO B: You are the second to join (the "Joiner")
      else {
        const { offer } = callSnapshot.data();
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        await callDocRef.update({ answer });
      }

      setInCall(true);
      setLoading(false);
      callStartTime.current = Date.now();
    } catch (e) {
      console.error("An error occurred in initiateCall:", e);
      setLoading(false);
    }
  };

  const collectIceCandidates = (docRef) => {
    const callerCandidatesCollection = docRef.collection('callerCandidates');
    const calleeCandidatesCollection = docRef.collection('calleeCandidates');

    // Generates and sends local ICE candidates to Firestore
    peerConnection.current.onicecandidate = event => {
      if (event.candidate) {
        docRef.get().then(snapshot => {
          const collection = snapshot.data()?.answer ? calleeCandidatesCollection : callerCandidatesCollection;
          collection.add(event.candidate.toJSON());
        });
      }
    };

    // Listens for and adds remote ICE candidates from Firestore
    const listenToCandidates = (collection) => {
      const unsub = collection.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            peerConnection.current.addIceCandidate(candidate)
              .catch(e => console.error('Error adding received ICE candidate', e));
          }
        });
      });
      return unsub;
    };
    
    firestoreUnsubscribers.current.push(listenToCandidates(callerCandidatesCollection));
    firestoreUnsubscribers.current.push(listenToCandidates(calleeCandidatesCollection));
  };

  const hangUp = async () => {
    try {
      // 1. Delete the call document from Firestore
      const callId = videoCallId || route.params?.callId;
      if (callId) {
        const callDocRef = firestore().collection('calls').doc(callId);
        
        // Delete the main call document
        await callDocRef.delete();
        
        // Delete caller candidates subcollection
        const callerCandidates = await callDocRef.collection('callerCandidates').get();
        const callerDeletePromises = callerCandidates.docs.map(doc => doc.ref.delete());
        await Promise.all(callerDeletePromises);
        
        // Delete callee candidates subcollection
        const calleeCandidates = await callDocRef.collection('calleeCandidates').get();
        const calleeDeletePromises = calleeCandidates.docs.map(doc => doc.ref.delete());
        await Promise.all(calleeDeletePromises);
        
        console.log('Call document and subcollections deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting call document:', error);
      // Continue with cleanup even if deletion fails
    }

    // 2. Stop all listeners to prevent memory leaks
    firestoreUnsubscribers.current.forEach(unsubscribe => unsubscribe());
    firestoreUnsubscribers.current = [];

    // 3. Stop local media tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    // 4. Close the WebRTC peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    // 5. Stop InCallManager
    InCallManager.stop();

    // 6. Reset component state and navigate back
    setLocalStream(null);
    setRemoteStream(null);
    setInCall(false);
    navigation.goBack();
    peerConnection.current = null;
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {loading && !inCall ? (
        <View className="flex-1 justify-center items-center bg-gray-900">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-white mt-4 text-base">Connecting to call...</Text>
          {patientName && (
            <Text className="text-gray-400 mt-2 text-sm">
              Calling {patientName}
            </Text>
          )}
        </View>
      ) : inCall && localStream ? (
        <TouchableOpacity 
          className="flex-1" 
          activeOpacity={1} 
          onPress={toggleControls}
        >
          {/* Remote Video (Main View) */}
          <View className="flex-1 relative">
            {remoteStream ? (
              <RTCView
                streamURL={remoteStream.toURL()}
                style={{ flex: 1, backgroundColor: '#000' }}
                objectFit="cover"
                mirror={false}
              />
            ) : (
              <View className="flex-1 bg-gray-900 justify-center items-center">
                <View className="w-30 h-30 rounded-full bg-gray-700 justify-center items-center mb-5">
                  <Ionicons name="person" size={60} color="#666" />
                </View>
                <Text className="text-white text-lg mb-2">
                  {patientName || 'Patient'}
                </Text>
                <Text className="text-gray-400 text-sm">
                  Connecting...
                </Text>
              </View>
            )}

            {/* Local Video (Picture-in-Picture) */}
            <View 
              className="absolute top-15 right-5 border-2 border-white rounded-3xl overflow-hidden bg-black"
              style={{
                width: width * 0.25,
                height: width * 0.35,
              }}
            >
              <RTCView
                streamURL={localStream.toURL()}
                style={{ flex: 1 }}
                objectFit="cover"
                mirror={true}
              />
            </View>

            {/* Top Header with Call Info */}
            {showControls && (
              <View className="absolute top-0 left-0 right-0 pt-4 px-5 pb-5 bg-black/10 bg-opacity-30">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-white text-lg font-bold">
                      {patientName || 'Video Call'}
                    </Text>
                    <Text className="text-gray-300 text-sm mt-1">
                      {formatDuration(callDuration)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={switchCamera}
                    className="w-11 h-11 rounded-full bg-white bg-opacity-20 justify-center items-center"
                  >
                    <MaterialIcons name="flip-camera-ios" size={24} color="#164972" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Bottom Controls */}
            {showControls && (
              <View className="absolute bottom-0 left-0 right-0 pb-6 px-5 pt-5 bg-black/10 bg-opacity-30">
                <View className="flex-row justify-center items-center space-x-5">
                  {/* Mute Button */}
                  <TouchableOpacity
                    onPress={toggleMute}
                    className={`w-14 h-14 rounded-full justify-center items-center ${
                      isMuted ? 'bg-red-600' : 'bg-white bg-opacity-20'
                    }`}
                  >
                    <Ionicons 
                      name={isMuted ? "mic-off" : "mic"} 
                      size={24} 
                      color={isMuted ? "white" : "#164972"} 
                    />
                  </TouchableOpacity>



                  {/* Video Toggle Button */}
                  <TouchableOpacity
                    onPress={toggleVideo}
                    className={`w-14 h-14 rounded-full justify-center items-center ${
                      !isVideoEnabled ? 'bg-red-600' : 'bg-white bg-opacity-20'
                    }`}
                  >
                    <Ionicons 
                      name={isVideoEnabled ? "videocam" : "videocam-off"} 
                      size={24} 
                      color={isVideoEnabled ? "#164972" : "white"} 
                    />
                  </TouchableOpacity>


                  {/* Speaker Button */}
                  <TouchableOpacity
                    onPress={toggleSpeaker}
                    className={`w-14 h-14 rounded-full justify-center items-center ${
                      isSpeakerOn ? 'bg-green-600' : 'bg-white bg-opacity-20'
                    }`}
                  >
                    <MaterialIcons 
                      name={isSpeakerOn ? "volume-up" : "volume-down"} 
                      size={24} 
                      color={isSpeakerOn ? "white" : "#164972"} 
                    />
                  </TouchableOpacity>

                  {/* End Call Button */}
                  <TouchableOpacity
                    onPress={hangUp}
                    className="w-16 h-16 rounded-full bg-red-600 justify-center items-center mx-2"
                  >
                    <MaterialIcons name="call-end" size={28} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ) : (
        <View className="flex-1 justify-center items-center bg-gray-900">
          <Ionicons name="warning-outline" size={48} color="#dc2626" />
          <Text className="text-white text-lg mt-4 text-center px-10">
            Unable to join the call
          </Text>
          <Text className="text-gray-400 text-sm mt-2 text-center px-10">
            Please check your internet connection and try again
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mt-6 px-8 py-3 bg-primary rounded-lg"
          >
            <Text className="text-white text-base font-semibold">
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default VideoCallScreen;