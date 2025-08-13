import { View, Text, ToastAndroid } from 'react-native'
import React, { useEffect } from 'react'
import Singup1 from '../components/Singup1';
import Singup2 from '../components/Singup2';
import Singup3 from '../components/Singup3';
import Singup4 from '../components/Singup4';
import axios from 'axios';
import baseUrl from '../utils/baseUrl';


const Singup = ({ navigation }) => {
    const [details, setDetails] = React.useState({
        firstName: '',
        lastName: '',
        displayName: '',
        phoneNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
        specializationId: '',
        clinicName: '',
        clinicAddress: '',
        latitude: '',
        longitude: '',
        image: ''
    });

    useEffect(()=>{
        console.log('Clinic latitude updated 2:', details.latitude); // For debugging
    } , [details.latitude])

    const [loading, setLoading] = React.useState(false);

    const [steps, setSteps] = React.useState(1);

    const handleChange = (name, value) => {
        setDetails({
            ...details,
            [name]: value
        });
        // console.log('Updated details:', { ...details, [name]: value }); // For debugging
    }

    // Function to validate all steps
    const validateAllSteps = () => {
        const requiredFields = [
            'firstName', 'lastName', 'displayName', 'phoneNumber', 'email',
            'specializationId', 'clinicName', 'clinicAddress', 'latitude', 'longitude',
            'password', 'confirmPassword' , 'image'
        ];

        console.log('Validating all steps with details:', details); // For debugging

        const missingFields = requiredFields.filter(field => !details[field]);

        if (missingFields.length > 0) {
            console.log('Missing fields:', missingFields);
            return false;
        }

        return true;
    }


    const handleCreateAccount = async () => {
        setLoading(true);
        console.log('Creating account with details:', details);

        const form = new FormData();

        // convert into this formate { fName, lName, displayName, phoneNumber, email, password, clinicName, clinicAddress, lat, lng, specialization }

        form.append('fName', details.firstName.trim());
        form.append('lName', details.lastName.trim());
        form.append('displayName', details.displayName.trim());
        form.append('phoneNumber', details.phoneNumber.trim());
        form.append('email', details.email.trim());
        form.append('password', details.password.trim());
        form.append('clinicName', details.clinicName.trim());
        form.append('clinicAddress', details.clinicAddress.trim());
        form.append('lat', String(details.latitude).trim());
        form.append('lng', String(details.longitude).trim());
        form.append('specializationId', details.specializationId);
        form.append('image', {
            uri: details.image.uri,
            type: details.image.type,
            name: details.image.fileName || 'profile.jpg' // Use fileName if available, otherwise default to 'profile.jpg'
        });

        try {
            const res = await axios.post(`${baseUrl}/doctor/add`, form, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Response from server:', res.data); // For debugging

            if (res.status === 200 || res.status === 201) {
                console.log('Account created successfully:', res.data);
                ToastAndroid.show('Account created successfully!', ToastAndroid.SHORT);
                
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }]
                })
            }
            else {
                ToastAndroid.show('Failed to create account. Please try again.', ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error('Error creating account:', error);
            ToastAndroid.show(error.response.data.error, ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {
                steps == 1 ? (
                    <Singup1 details={details} handleChange={handleChange} setSteps={setSteps} />
                ) :
                    steps == 2 ? (
                        <Singup2 details={details} handleChange={handleChange} setSteps={setSteps} />
                    ) : steps == 3 ? (
                        <Singup3 details={details} handleChange={handleChange} setSteps={setSteps} />
                    ) : steps == 4 ? (
                        <Singup4
                            details={details}
                            handleChange={handleChange}
                            setSteps={setSteps}
                            onCreateAccount={handleCreateAccount}
                            validateAllSteps={validateAllSteps}
                            loading={loading}
                        />
                    ) : null
            }

        </>
    )
}

export default Singup