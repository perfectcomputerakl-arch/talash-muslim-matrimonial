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
        mediaTypes: Image
