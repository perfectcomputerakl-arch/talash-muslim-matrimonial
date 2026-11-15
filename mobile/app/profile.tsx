import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../lib/supabase';

type ProfileData = {
  full_name: string | null;
  gender: string | null;
  city: string | null;
  country: string | null;
  date_of_birth: string | null;
  education: string | null;
  profession: string | null;
  about: string | null;
  status: string | null;
  verification_status: string | null;
};

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  const loadProfile = async () => {
    setLoading(true);

    try {
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace('/');
        return;
      }

      setEmail(user.email || '');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      setProfile(data);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Unable to load your profile.'
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const logout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/');
          }
        }
      ]
    );
  };

  const fields = profile
    ? [
        profile.full_name,
        profile.gender,
        profile.city,
        profile.country,
        profile.date_of_birth,
        profile.education,
        profile.profession,
        profile.about
      ]
    : [];

  const completed = fields.filter(
    value => value && String(value).trim().length > 0
  ).length;

  const completion = Math.round((completed / 8) * 100);

  const verified = profile?.verification_status === 'verified';

  const statusText = (status: string | null | undefined) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending_review':
        return 'Under Review';
      case 'rejected':
        return 'Rejected';
      case 'suspended':
        return 'Suspended';
      default:
        return 'Incomplete';
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#0a513b" />
        <Text style={s.loadingText}>Loading your TALASH profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.container}>
      <View style={s.header}>
        <Text style={s.brand}>TALASH</Text>
        <Text style={s.tagline}>Your journey towards a blessed future</Text>
      </View>

      <View style={s.profileCard}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>
            {profile?.full_name
              ? profile.full_name.charAt(0).toUpperCase()
              : 'T'}
          </Text>
        </View>

        <Text style={s.name}>
          {profile?.full_name || 'Complete Your Profile'}
        </Text>

        <Text style={s.email}>{email}</Text>

        {verified && (
          <View style={s.verifiedBadge}>
            <Text style={s.verifiedText}>✓ TALASH Verified</Text>
          </View>
        )}
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Profile Completion</Text>

        <View style={s.progressBackground}>
          <View
            style={[s.progressFill, { width: `${completion}%` }]}
          />
        </View>

        <Text style={s.progressText}>
          {completion}% completed
        </Text>
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Profile Information</Text>

        <Info label="Full Name" value={profile?.full_name} />
        <Info label="Gender" value={profile?.gender} />
        <Info label="City" value={profile?.city} />
        <Info label="Country" value={profile?.country} />
        <Info label="Date of Birth" value={profile?.date_of_birth} />
        <Info label="Education" value={profile?.education} />
        <Info label="Profession" value={profile?.profession} />
        <Info label="About Me" value={profile?.about} />
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Account Status</Text>

        <Info
          label="Profile Status"
          value={statusText(profile?.status)}
        />

        <Info
          label="Verification Status"
          value={
            profile?.verification_status === 'verified'
              ? 'Verified'
              : profile?.verification_status === 'pending'
              ? 'Pending Review'
              : profile?.verification_status === 'rejected'
              ? 'Rejected'
              : 'Not Submitted'
          }
        />

        <Pressable
          style={s.button}
          onPress={() => router.push('/capture')}
        >
          <Text style={s.buttonText}>
            📷 Live Selfie Verification
          </Text>
        </Pressable>

        <Text style={s.note}>
          Your verification selfie is stored privately and reviewed
          manually by authorized administrators. Your verified badge
          appears only after approval.
        </Text>
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Manage Profile</Text>

        <Pressable
          style={s.button}
          onPress={() => router.push('/edit-profile')}
        >
          <Text style={s.buttonText}>✏️ Edit / Complete Profile</Text>
        </Pressable>

        <Pressable
          style={s.refreshButton}
          onPress={loadProfile}
        >
          <Text style={s.refreshText}>↻ Refresh Profile</Text>
        </Pressable>
      </View>

      <Pressable style={s.logoutButton} onPress={logout}>
        <Text style={s.logoutText}>Logout</Text>
      </Pressable>

      <Text style={s.footer}>TALASH • Muslim Matrimonial</Text>
    </ScrollView>
  );
}

function Info({
  label,
  value
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>
        {value || 'Not added'}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: '#f7f5ef',
    flexGrow: 1
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f5ef'
  },
  loadingText: {
    marginTop: 12,
    color: '#0a513b'
  },
  header: {
    alignItems: 'center',
    marginBottom: 22
  },
  brand: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 5,
    color: '#0a513b'
  },
  tagline: {
    color: '#94722b',
    marginTop: 5
  },
  profileCard: {
    backgroundColor: '#0a513b',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 16
  },
  avatar: {
    width: 75,
    height: 75,
    borderRadius: 40,
    backgroundColor: '#f5d77b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0a513b'
  },
  name: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff'
  },
  email: {
    color: '#e1e8e3',
    marginTop: 5
  },
  verifiedBadge: {
    backgroundColor: '#f5d77b',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 12
  },
  verifiedText: {
    color: '#0a513b',
    fontWeight: '900'
  },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0a513b',
    marginBottom: 15
  },
  progressBackground: {
    height: 10,
    backgroundColor: '#e5e5e5',
    borderRadius: 10,
    overflow: 'hidden'
  },
  progressFill: {
    height: 10,
    backgroundColor: '#c49a35',
    borderRadius: 10
  },
  progressText: {
    marginTop: 9,
    color: '#666',
    fontWeight: '700'
  },
  infoRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee'
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4
  },
  infoValue: {
    fontSize: 15,
    color: '#222',
    fontWeight: '600'
  },
  button: {
    backgroundColor: '#0a513b',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14
  },
  note: {
    color: '#777',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 13
  },
  refreshButton: {
    borderWidth: 1,
    borderColor: '#0a513b',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12
  },
  refreshText: {
    color: '#0a513b',
    fontWeight: '800'
  },
  logoutButton: {
    backgroundColor: '#a83232',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5
  },
  logoutText: {
    color: '#fff',
    fontWeight: '900'
  },
  footer: {
    textAlign: 'center',
    color: '#999',
    marginTop: 22,
    marginBottom: 15
  }
});
