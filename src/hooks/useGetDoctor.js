import { MMKV } from "react-native-mmkv";

export const useGetDoctor = ()=>{
    const storage = new MMKV();

    const doctor = storage.getString('doctor');

    console.log('Retrieved doctor data:', doctor); // For debugging

    return JSON.parse(doctor)
}