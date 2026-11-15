import { useState } from 'react';
import {
View, Text, TextInput, Pressable, Switch,
Alert, StyleSheet, ScrollView, ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function Register() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [fullName, setFullName] = useState('');
const [gender, setGender] = useState('');
const [city, setCity] = useState('');
const [dateOfBirth, setDateOfBirth] = useState('');
const [muslim, setMuslim] = useState(false);
const [consent, setConsent] = useState(false);
const [loading, setLoading] = useState(false);

const submit = async () => {
if (!fullName.trim() || !email.trim() || !password ||
!gender || !city.trim() || !dateOfBirth.trim()) {
Alert.alert('Required', 'Please complete all fields.');
return;
}

if (password.length < 8) {
  Alert.alert('Weak Password', 'Password must contain at least 8 characters.');
  return;
}

if (!muslim || !consent) {
  Alert.alert('Declaration Required',
    'Please accept both declarations to continue.');
  return;
}

const dob = new Date(dateOfBirth);
if (
  !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) ||
  Number.isNaN(dob.getTime()) ||
  dob.toISOString().slice(0, 10) !== dateOfBirth ||
  dob > new Date()
) {
  Alert.alert('Invalid Date', 'Enter date in YYYY-MM-DD format.');
  return;
}

const today = new Date();
let age = today.getFullYear() - dob.getFullYear();
const birthdayPassed =
  today.getMonth() > dob.getMonth() ||
  (today.getMonth() === dob.getMonth() &&
   today.getDate() >= dob.getDate());

if (!birthdayPassed) age--;

if (age < 18) {
  Alert.alert('Age Restriction', 'TALASH is only for adults aged 18 or above.');
  return;
}

if (loading) return;
setLoading(true);

try {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password
  });

  if (error) throw error;

  if (!data.user) {
    throw new Error('Account could not be created.');
  }

  // Profile is saved after email confirmation through the
  // authenticated onboarding flow. Do not assume a session exists.

  Alert.alert(
    'Registration Successful',
    'Please verify your email. After confirmation, sign in to complete your profile.',
    [{ text: 'Continue', onPress: () => router.replace('/') }]
  );
} catch (error: any) {
  Alert.alert('Registration Failed', error.message);
} finally {
  setLoading(false);
}

};

return (
<ScrollView contentContainerStyle={s.wrap}>
<Text style={s.title}>Join TALASH</Text>
<Text style={s.help}>
A Muslim matrimonial platform for adults aged 18 and above.
</Text>

  <Text style={s.label}>Full Name</Text>
  <TextInput
    style={s.input}
    placeholder="Enter your full name"
    value={fullName}
    onChangeText={setFullName}
  />

  <Text style={s.label}>Email Address</Text>
  <TextInput
    style={s.input}
    placeholder="Enter your email"
    keyboardType="email-address"
    autoCapitalize="none"
    autoCorrect={false}
    value={email}
    onChangeText={setEmail}
  />

  <Text style={s.label}>Password</Text>
  <TextInput
    style={s.input}
    placeholder="Minimum 8 characters"
    secureTextEntry
    value={password}
    onChangeText={setPassword}
  />

  <Text style={s.label}>Date of Birth</Text>
  <TextInput
    style={s.input}
    placeholder="YYYY-MM-DD"
    keyboardType="numbers-and-punctuation"
    value={dateOfBirth}
    onChangeText={setDateOfBirth}
  />

  <Text style={s.label}>I am registering as</Text>
  <View style={s.genderRow}>
    {['Bride', 'Groom'].map(item => (
      <Pressable
        key={item}
        style={[s.genderButton, gender === item && s.selected]}
        onPress={() => setGender(item)}
      >
        <Text style={[s.genderText, gender === item && s.selectedText]}>
          {item}
        </Text>
      </Pressable>
    ))}
  </View>

  <Text style={s.label}>City</Text>
  <TextInput
    style={s.input}
    placeholder="Your city"
    value={city}
    onChangeText={setCity}
  />

  <View style={s.row}>
    <Switch value={muslim} onValueChange={setMuslim} />
    <Text style={s.check}>
      I declare that I am Muslim and wish to join this Muslim-only platform.
    </Text>
  </View>

  <View style={s.row}>
    <Switch value={consent} onValueChange={setConsent} />
    <Text style={s.check}>
      I agree to the Privacy Notice and consent to profile review.
      Verification photos will only be accessible to authorized reviewers.
    </Text>
  </View>

  <Pressable
    style={[s.button, loading && { opacity: 0.7 }]}
    onPress={submit}
    disabled={loading}
  >
    {loading
      ? <ActivityIndicator color="#fff" />
      : <Text style={s.btn}>CREATE ACCOUNT</Text>}
  </Pressable>
</ScrollView>

);
}

const s = StyleSheet.create({
wrap: { padding: 22, backgroundColor: '#f7f5ef', flexGrow: 1 },
title: { fontSize: 30, fontWeight: '900', color: '#0a513b', marginBottom: 8 },
help: { color: '#666', marginBottom: 22, lineHeight: 21 },
label: { fontWeight: '700', color: '#163b2c', marginBottom: 7 },
input: {
backgroundColor: '#fff', padding: 14, borderRadius: 10,
marginBottom: 16, borderWidth: 1, borderColor: '#ddd'
},
genderRow: { flexDirection: 'row', gap: 12, marginBottom: 18 },
genderButton: {
flex: 1, padding: 14, borderRadius: 10,
borderWidth: 1, borderColor: '#0a513b', alignItems: 'center'
},
selected: { backgroundColor: '#0a513b' },
genderText: { color: '#0a513b', fontWeight: '700' },
selectedText: { color: '#fff' },
row: { flexDirection: 'row', alignItems: 'center', marginVertical: 12, gap: 10 },
check: { flex: 1, color: '#333', lineHeight: 20 },
button: {
backgroundColor: '#0a513b', padding: 17,
borderRadius: 12, alignItems: 'center', marginTop: 20
},
btn: { color: 'white', fontWeight: '900' }
});
