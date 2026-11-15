import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Required', 'Please enter email and password.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Login failed. Please try again.');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile) {
        router.replace('/profile');
      } else {
        router.replace('/edit-profile');
      }
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'Please check your login details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.logo}>TALASH</Text>

      <Text style={s.subtitle}>
        A Trusted Muslim Matrimonial Platform
      </Text>

      <Text style={s.heading}>Welcome Back</Text>

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
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable
        style={[s.button, loading && s.disabled]}
        onPress={login}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={s.buttonText}>Login</Text>
        )}
      </Pressable>

      <View style={s.registerRow}>
        <Text style={s.registerText}>New to TALASH? </Text>

        <Pressable onPress={() => router.push('/register')}>
          <Text style={s.registerLink}>Create Account</Text>
        </Pressable>
      </View>

      <Text style={s.footer}>
        Privacy • Respect • Trust
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
    backgroundColor: '#f7f5ef'
  },
  logo: {
    textAlign: 'center',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 7,
    color: '#0a513b'
  },
  subtitle: {
    textAlign: 'center',
    color: '#94722b',
    marginTop: 8,
    marginBottom: 45
  },
  heading: {
    fontSize: 27,
    fontWeight: '900',
    color: '#0a513b',
    marginBottom: 22
  },
  label: {
    color: '#244b3a',
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 13
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 15
  },
  button: {
    backgroundColor: '#0a513b',
    padding: 17,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 25
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900'
  },
  disabled: {
    opacity: 0.6
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25
  },
  registerText: {
    color: '#666'
  },
  registerLink: {
    color: '#0a513b',
    fontWeight: '900'
  },
  footer: {
    textAlign: 'center',
    color: '#999',
    marginTop: 45
  }
});
