import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
export default function Layout() {
  return <><StatusBar style="dark" /><Stack screenOptions={{headerStyle:{backgroundColor:'#073b2b'},headerTintColor:'#f5d77b',contentStyle:{backgroundColor:'#f7f5ef'}}}>
    <Stack.Screen name="index" options={{title:'TALASH'}} />
    <Stack.Screen name="register" options={{title:'Create Profile'}} />
    <Stack.Screen name="capture" options={{title:'Live Photo'}} />
    <Stack.Screen name="profile" options={{title:'My Profile'}} />
  </Stack></>;
}
