import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function EditProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'Bride' | 'Groom'>('Groom');
  const [dob, setDob] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('India');
  const [education, setEducation] = useState('');
  const [profession, setProfession] = useState('');
  const [about, setAbout] = useState('');

  const [muslimDeclaration, setMuslimDeclaration] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace('/');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFullName(data.full_name || '');
        setGender(data.gender === 'Bride' ? 'Bride' : 'Groom');
        setDob(data.date_of_birth || '');
        setCity(data.city || '');
        setCountry(data.country || 'India');
        setEducation(data.education || '');
        setProfession(data.profession || '');
        setAbout(data.about || '');
        setMuslimDeclaration(data.religion_declaration === true);
        setPrivacyConsent(data.privacy_consent === true);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Unable to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const isAdult = (date: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;

    const birth = new Date(`${date}T00:00:00`);
    if (Number.isNaN(birth.getTime())) return false;

    const [year, month, day] = date.split('-').map(Number);

    if (
      birth.getFullYear() !== year ||
      birth.getMonth() + 1 !== month ||
      birth.getDate() !== day
    ) return false;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();

    const birthdayNotReached =
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() &&
        today.getDate() < birth.getDate());

    if (birthdayNotReached) age--;

    return age >= 18;
  };

  const saveProfile = async () => {
    if (!fullName.trim() || !city.trim() || !dob.trim()) {
      Alert.alert(
        'Required Information',
        'Please enter your name, date of birth and city.'
      );
      return;
    }

    if (!isAdult(dob)) {
      Alert.alert(
        'Age Requirement',
        'TALASH is only for adults aged 18 or above. Enter date as YYYY-MM-DD.'
      );
      return;
    }

    if (!muslimDeclaration || !privacyConsent) {
      Alert.alert(
        'Confirmation Required',
        'Please confirm both declarations before saving your profile.'
      );
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Please login again.');
      }

      const profileData = {
        id: user.id,
        full_name: fullName.trim(),
        gender,
        date_of_birth: dob,
        city: city.trim(),
        country: country.trim() || 'India',
        education: education.trim(),
        profession: profession.trim(),
        about: about.trim(),
        religion_declaration: true,
        privacy_consent: true,
        role: 'user'
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (error) throw error;

      Alert.alert(
        'Profile Saved',
        'Your TALASH profile has been saved successfully.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/profile')
          }
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Save Failed',
        error.message || 'Unable to save your profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#0a513b" />
        <Text style={s.help}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.brand}>TALASH</Text>
      <Text style={s.title}>Create Your Profile</Text>
      <Text style={s.help}>
        Add your details to create your matrimonial profile.
      </Text>

      <Text style={s.label}>Full Name *</Text>
      <TextInput
        style={s.input}
        placeholder="Enter your full name"
        value={fullName}
        onChangeText={setFullName}
      />

      <Text style={s.label}>I am registering as *</Text>
      <View style={s.genderRow}>
        {(['Bride', 'Groom'] as const).map(item => (
          <Pressable
            key={item}
            style={[
              s.genderButton,
              gender === item && s.selectedGender
            ]}
            onPress={() => setGender(item)}
          >
            <Text
              style={[
                s.genderText,
                gender === item && s.selectedGenderText
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={s.label}>Date of Birth * (YYYY-MM-DD)</Text>
      <TextInput
        style={s.input}
        placeholder="Example: 1998-05-21"
        value={dob}
        onChangeText={setDob}
        keyboardType="numbers-and-punctuation"
        maxLength={10}
      />

      <Text style={s.label}>City *</Text>
      <TextInput
        style={s.input}
        placeholder="Enter your city"
        value={city}
        onChangeText={setCity}
      />

      <Text style={s.label}>Country</Text>
      <TextInput
        style={s.input}
        placeholder="Country"
        value={country}
        onChangeText={setCountry}
      />

      <Text style={s.label}>Education</Text>
      <TextInput
        style={s.input}
        placeholder="Your education"
        value={education}
        onChangeText={setEducation}
      />

      <Text style={s.label}>Profession</Text>
      <TextInput
        style={s.input}
        placeholder="Your profession"
        value={profession}
        onChangeText={setProfession}
      />

      <Text style={s.label}>About Me</Text>
      <TextInput
        style={[s.input, s.multiline]}
        placeholder="Write a little about yourself..."
        value={about}
        onChangeText={setAbout}
        multiline
        textAlignVertical="top"
        maxLength={1000}
      />

      <Pressable
        style={s.checkRow}
        onPress={() => setMuslimDeclaration(!muslimDeclaration)}
      >
        <Text style={s.checkbox}>
          {muslimDeclaration ? '☑' : '☐'}
        </Text>
        <Text style={s.checkText}>
          I declare that I am a Muslim and the information provided is truthful.
        </Text>
      </Pressable>

      <Pressable
        style={s.checkRow}
        onPress={() => setPrivacyConsent(!privacyConsent)}
      >
        <Text style={s.checkbox}>
          {privacyConsent ? '☑' : '☐'}
        </Text>
        <Text style={s.checkText}>
          I agree to the TALASH Privacy Policy and consent to the use of my
          information for matrimonial services.
        </Text>
      </Pressable>

      <Pressable
        style={[s.saveButton, saving && s.disabled]}
        onPress={saveProfile}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={s.saveText}>Save My Profile</Text>
        )}
      </Pressable>

      <Text style={s.footer}>
        TALASH • Muslim Matrimonial Platform
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f7f5ef',
    flexGrow: 1
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f5ef'
  },
  brand: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 5,
    color: '#0a513b',
    marginBottom: 10
  },
  title: {
    fontSize: 25,
    fontWeight: '900',
    color: '#0a513b'
  },
  help: {
    color: '#777',
    lineHeight: 21,
    marginBottom: 20,
    marginTop: 8
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: '#244b3a',
    marginBottom: 7,
    marginTop: 13
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#deded5',
    borderRadius: 11,
    padding: 14,
    fontSize: 15,
    color: '#222'
  },
  multiline: {
    height: 110
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12
  },
  genderButton: {
    flex: 1,
    padding: 15,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#0a513b',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  selectedGender: {
    backgroundColor: '#0a513b'
  },
  genderText: {
    color: '#0a513b',
    fontWeight: '800'
  },
  selectedGenderText: {
    color: '#fff'
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    gap: 10
  },
  checkbox: {
    fontSize: 23,
    color: '#0a513b'
  },
  checkText: {
    flex: 1,
    color: '#444',
    lineHeight: 21
  },
  saveButton: {
    backgroundColor: '#0a513b',
    padding: 17,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 25
  },
  saveText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16
  },
  disabled: {
    opacity: 0.6
  },
  footer: {
    textAlign: 'center',
    color: '#999',
    marginTop: 25,
    marginBottom: 15
  }
});
