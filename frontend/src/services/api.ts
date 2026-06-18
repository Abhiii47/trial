import Constants from 'expo-constants';

export const getApiUrl = (): string => {
  // Check if we have a explicit env variable
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // Try to extract IP address from Expo hostUri (works for physical devices on same WiFi)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000`;
  }
  
  // Fallback to local loopback (works on Android Emulator)
  return 'http://10.0.2.2:5000'; 
};
