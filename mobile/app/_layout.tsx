import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Layout() {
  return (
    <>
      <StatusBar style="dark" />

      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#073b2b'
          },
          headerTintColor: '#f5d77b',
          headerTitleStyle: {
            fontWeight: 'bold'
          },
          contentStyle: {
            backgroundColor: '#f7f5ef'
          },
          headerBackTitle: 'Back'
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: 'TALASH' }}
        />

        <Stack.Screen
          name="register"
          options={{ title: 'Create Account' }}
        />

        <Stack.Screen
          name="profile"
          options={{ title: 'My Profile' }}
        />

        <Stack.Screen
          name="edit-profile"
          options={{ title: 'Create / Edit Profile' }}
        />

        <Stack.Screen
          name="capture"
          options={{ title: 'Live Selfie Verification' }}
        />
      </Stack>
    </>
  );
}
