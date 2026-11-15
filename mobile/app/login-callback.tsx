import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function LoginCallback() {
  const params = useLocalSearchParams<{ code?: string }>();
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    let active = true;

    const verifyEmail = async () => {
      try {
        const code = params.code;

        if (!code) {
          throw new Error('Confirmation code not found. Please open the latest email.');
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) throw error;

        if (!active) return;

        setMessage('Email verified successfully!');

        setTimeout(() => {
          if (active) {
            router.replace('/edit-profile');
          }
        }, 1200);

      } catch (error: any) {
        if (active) {
          setMessage(error.message || 'Email verification failed.');
        }
      }
    };

    verifyEmail();

    return () => {
      active = false;
    };
  }, [params.code]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>TALASH</Text>
      <ActivityIndicator size="large" color="#0a513b" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f5ef',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25
  },
  logo: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 6,
    color: '#0a513b',
    marginBottom: 35
  },
  message: {
    marginTop: 22,
    fontSize: 16,
    color: '#244b3a',
    textAlign: 'center'
  }
});
