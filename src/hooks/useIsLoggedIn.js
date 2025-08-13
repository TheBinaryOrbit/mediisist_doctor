import { MMKV } from "react-native-mmkv"

export const useIsLoggedIn = ()=>{
    const storage = new MMKV();
    const isLoggedIn = storage.getString('isLoggedIn');

    if(isLoggedIn == 'true'){
        return true
    }
    else{
        return false
    }
}