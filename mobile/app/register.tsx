import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const register = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password || !confirmPassword) {
      Alert.alert('Required', 'Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        'Weak Password',
        'Password must contain at least 8 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password
      });

      if (error) throw error;

      if (data.session) {
        Alert.alert(
          'Account Created',
          'Your TALASH account has been created. Now complete your profile.',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/edit-profile')
            }
          ]
        );
      } else {
        Alert.alert(
          'Verify Your Email',
          'We have sent a confirmation link to your email address. Please verify your email, then return to TALASH and login to complete your profile.',
          [
            {
              text: 'Go to Login',
              onPress: () => router.replace('/')
            }
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.message || 'Unable to create your account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.logo}>TALASH</Text>

      <Text style={s.subtitle}>
        Begin your journey towards a blessed future
      </Text>

      <Text style={s.heading}>Create Account</Text>

      <Text style={s.description}>
        Join TALASH, a Muslim matrimonial platform built around privacy,
        respect and trust.
      </Text>

      <Text style={s.label}>Email Address</Text>
      <TextInput
        style={s.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={s.label}>Password</Text>
      <TextInput
        style={s.input}
        placeholder="Minimum 8 characters"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={s.label}>Confirm Password</Text>
      <TextInput
        style={s.input}
        placeholder="Enter password again"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <View style={s.notice}>
        <Text style={s.noticeTitle}>Important</Text>
        <Text style={s.noticeText}>
          • TALASH is for adults aged 18 and above.
        </Text>
        <Text style={s.noticeText}>
          • Users must declare their Muslim identity.
        </Text>
        <Text style={s.noticeText}>
          • Profile information must be truthful.
        </Text>
        <Text style={s.noticeText}>
          • Verification is subject to manual admin review.
        </Text>
      </View>

      <Pressable
        style={[s.button, loading && s.disabled]}
        onPress={register}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={s.buttonText}>Create My Account</Text>
        )}
      </Pressable>

      <View style={s.loginRow}>
        <Text style={s.loginText}>Already have an account? </Text>
        <Pressable onPress={() => router.replace('/')}>
          <Text style={s.loginLink}>Login</Text>
        </Pressable>
      </View>

      <Text style={s.footer}>
        TALASH • Privacy • Respect • Trust
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 23,
    justifyContent: 'center',
    backgroundColor: '#f7f5ef'
  },
  logo: {
    textAlign: 'center',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 7,
    color: '#0a513b'
  },
  subtitle: {
    textAlign: 'center',
    color: '#94722b',
    marginTop: 8,
    marginBottom: 35
  },
  heading: {
    fontSize: 27,
    fontWeight: '900',
    color: '#0a513b'
  },
  description: {
    color: '#777',
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 15
  },
  label: {
    color: '#244b3a',
    fontWeight: '800',
    marginTop: 15,
    marginBottom: 7
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 15
  },
  notice: {
    backgroundColor: '#e9f1eb',
    padding: 15,
    borderRadius: 12,
    marginTop: 22
  },
  noticeTitle: {
    color: '#0a513b',
    fontWeight: '900',
    marginBottom: 7
  },
  noticeText: {
    color: '#466052',
    lineHeight: 23
  },
  button: {
    backgroundColor: '#0a513b',
    padding: 17,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900'
  },
  disabled: {
    opacity: 0.6
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25
  },
  loginText: {
    color: '#666'
  },
  loginLink: {
    color: '#0a513b',
    fontWeight: '900'
  },
  footer: {
    textAlign: 'center',
    color: '#999',
    marginTop: 35,
    marginBottom: 15
  }
});
