import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function ProfilePhotoScreen() {
  const router = useRouter();

  const [userId, setUserId] = useState('');
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace('/');
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('profile_photo_path')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        Alert.alert(
          'Profile Required',
          'Please complete your profile first.'
        );
        router.replace('/edit-profile');
        return;
      }

      if (data.profile_photo_path) {
        setPhotoPath(data.profile_photo_path);

        const { data: signedData, error: signedError } =
          await supabase.storage
            .from('profile-photos')
            .createSignedUrl(data.profile_photo_path, 3600);

        if (!signedError && signedData) {
          setPhotoUrl(signedData.signedUrl);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Unable to load profile.');
    } finally {
      setLoading(false);
    }
  }

  async function choosePhoto() {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow photo library access to select your profile photo.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Unable to select photo.');
    }
  }

  async function uploadPhoto() {
    if (!selectedUri || !userId) {
      Alert.alert('Select Photo', 'Please select a photo first.');
      return;
    }

    setUploading(true);

    try {
      const response = await fetch(selectedUri);
      const blob = await response.blob();

      const filePath = `${userId}/profile-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo_path: filePath })
        .eq('id', userId);

      if (updateError) {
        await supabase.storage
          .from('profile-photos')
          .remove([filePath]);

        throw updateError;
      }

      const { data: signedData, error: signedError } =
        await supabase.storage
          .from('profile-photos')
          .createSignedUrl(filePath, 3600);

      if (signedError) throw signedError;

      setPhotoPath(filePath);
      setPhotoUrl(signedData.signedUrl);
      setSelectedUri(null);

      Alert.alert('Success', 'Your profile photo has been uploaded.');
    } catch (error: any) {
      Alert.alert(
        'Upload Failed',
        error.message || 'Please try again.'
      );
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#087F5B" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const displayedPhoto = selectedUri || photoUrl;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile Photo</Text>
      <Text style={styles.subtitle}>
        Add a clear photo to help other members recognize your profile.
      </Text>

      <View style={styles.photoContainer}>
        {displayedPhoto ? (
          <Image
            source={{ uri: displayedPhoto }}
            style={styles.photo}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>👤</Text>
            <Text style={styles.placeholderText}>No Photo</Text>
          </View>
        )}
      </View>

      <Pressable
        style={styles.chooseButton}
        onPress={choosePhoto}
        disabled={uploading}
      >
        <Text style={styles.chooseButtonText}>
          Choose Photo
        </Text>
      </Pressable>

      {selectedUri && (
        <Pressable
          style={styles.uploadButton}
          onPress={uploadPhoto}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.uploadButtonText}>
              Upload Profile Photo
            </Text>
          )}
        </Pressable>
      )}

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Privacy & Safety</Text>
        <Text style={styles.infoText}>
          • Your photo is stored in private storage.
        </Text>
        <Text style={styles.infoText}>
          • Your photo is not stored in a public bucket.
        </Text>
        <Text style={styles.infoText}>
          • Photo visibility will follow your profile privacy settings.
        </Text>
      </View>

      <Pressable
        style={styles.backButton}
        onPress={() => router.replace('/profile')}
      >
        <Text style={styles.backButtonText}>Back to Profile</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F8F6',
    alignItems: 'center',
    padding: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#555',
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#075B43',
    marginTop: 25,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 21,
  },
  photoContainer: {
    marginTop: 35,
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#087F5B',
    backgroundColor: '#E4EEE9',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 65,
  },
  placeholderText: {
    color: '#666',
    marginTop: 5,
  },
  chooseButton: {
    marginTop: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#087F5B',
    borderRadius: 12,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
  },
  chooseButtonText: {
    color: '#087F5B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadButton: {
    marginTop: 14,
    backgroundColor: '#087F5B',
    borderRadius: 12,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    marginTop: 30,
    backgroundColor: '#E8F3ED',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#075B43',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#42564B',
    marginTop: 5,
    lineHeight: 19,
  },
  backButton: {
    marginTop: 25,
    padding: 14,
  },
  backButtonText: {
    color: '#087F5B',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
