import { useRef, useState } from 'react';

import {
  View,
  Text,
  Pressable,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';

import { router } from 'expo-router';

import { supabase } from '../lib/supabase';

export default function Capture() {
  const camera = useRef<CameraView>(null);

  const [permission, requestPermission] =
    useCameraPermissions();

  const [photo, setPhoto] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);

  const [capturing, setCapturing] = useState(false);

  const [cameraReady, setCameraReady] = useState(false);

  const [cameraError, setCameraError] = useState('');

  // CAMERA CAPTURE
  const capturePhoto = async () => {
    if (!camera.current) {
      Alert.alert('Camera Error', 'Camera is not available.');
      return;
    }

    if (!cameraReady) {
      Alert.alert('Please Wait', 'Camera is still starting.');
      return;
    }

    if (capturing || busy) return;

    try {
      setCapturing(true);
      setCameraError('');

      console.log('TALASH: Starting camera capture');

      const result = await camera.current.takePictureAsync({
        quality: 0.8,
        shutterSound: true,
      });

      console.log('TALASH: Capture result:', result);

      if (!result || !result.uri) {
        throw new Error('Camera returned an empty image URI.');
      }

      setPhoto(result.uri);

      console.log('TALASH: Photo captured successfully');

    } catch (error: any) {
      console.error('TALASH CAMERA ERROR:', error);

      const message =
        error?.message ||
        String(error) ||
        'Unknown camera error';

      setCameraError(message);

      Alert.alert(
        'Photo Capture Failed',
        message
      );

    } finally {
      setCapturing(false);
    }
  };

  // RETAKE PHOTO
  const retakePhoto = () => {
    setPhoto(null);
    setCameraError('');
    setCameraReady(false);
  };

  // UPLOAD PHOTO
  const uploadPhoto = async () => {
    if (!photo || busy) return;

    setBusy(true);

    let uploadedPath: string | null = null;

    try {
      // Get logged-in user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        throw new Error('Please login before verification.');
      }

      // Check pending verification
      const { data: existing, error: checkError } =
        await supabase
          .from('verification_requests')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .limit(1);

      if (checkError) throw checkError;

      if (existing && existing.length > 0) {
        throw new Error(
          'You already have a pending verification request.'
        );
      }

      // Convert image URI to blob
      const response = await fetch(photo);

      if (!response.ok) {
        throw new Error('Unable to read captured image.');
      }

      const blob = await response.blob();

      if (!blob.size) {
        throw new Error('Captured image is empty.');
      }

      // Generate unique path
      const fileName = `verification-${Date.now()}.jpg`;

      const path = `${user.id}/${fileName}`;

      // Upload to Supabase private bucket
      const { error: uploadError } = await supabase.storage
        .from('verification-private')
        .upload(path, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      uploadedPath = path;

      // Save verification request
      const { error: dbError } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          selfie_path: path,
          status: 'pending',
        });

      if (dbError) throw dbError;

      uploadedPath = null;

      setPhoto(null);

      Alert.alert(
        'Verification Submitted',
        'Your live selfie has been submitted successfully. Our authorized admin team will review it.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/profile'),
          },
        ]
      );

    } catch (error: any) {
      console.error('TALASH UPLOAD ERROR:', error);

      if (uploadedPath) {
        const { error: removeError } = await supabase.storage
          .from('verification-private')
          .remove([uploadedPath]);

        if (removeError) {
          console.error('Cleanup error:', removeError);
        }
      }

      Alert.alert(
        'Submission Failed',
        error?.message || 'Something went wrong.'
      );

    } finally {
      setBusy(false);
    }
  };

  // PERMISSION LOADING
  if (!permission) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#0a513b" />

        <Text style={s.help}>
          Checking camera permission...
        </Text>
      </View>
    );
  }

  // PERMISSION NOT GRANTED
  if (!permission.granted) {
    return (
      <View style={s.center}>
        <Text style={s.icon}>📷</Text>

        <Text style={s.title}>
          Camera Permission Required
        </Text>

        <Text style={s.help}>
          TALASH needs camera access to capture your live selfie.
          Gallery photos are not accepted.
        </Text>

        <Pressable
          style={s.button}
          onPress={requestPermission}
        >
          <Text style={s.buttonText}>
            Allow Camera
          </Text>
        </Pressable>
      </View>
    );
  }

  // MAIN SCREEN
  return (
    <ScrollView contentContainerStyle={s.container}>

      <Text style={s.brand}>TALASH</Text>

      <Text style={s.title}>
        Live Selfie Verification
      </Text>

      <Text style={s.help}>
        Capture a fresh selfie using your front camera.
        Your photo will be stored privately for admin review.
      </Text>

      {/* INSTRUCTIONS */}
      <View style={s.infoBox}>
        <Text style={s.infoTitle}>
          Before taking your selfie
        </Text>

        <Text style={s.infoText}>
          • Keep your face clearly visible.
        </Text>

        <Text style={s.infoText}>
          • Use good lighting.
        </Text>

        <Text style={s.infoText}>
          • Look directly at the camera.
        </Text>

        <Text style={s.infoText}>
          • Avoid filters.
        </Text>
      </View>

      {/* CAMERA */}
      {photo ? (
        <Image
          source={{ uri: photo }}
          style={s.preview}
        />
      ) : (
        <CameraView
          ref={camera}
          style={s.camera}
          facing="front"
          mode="picture"
          onCameraReady={() => {
            console.log('TALASH: Camera ready');
            setCameraReady(true);
            setCameraError('');
          }}
          onMountError={(error) => {
            console.error('CAMERA MOUNT ERROR:', error);

            setCameraReady(false);
            setCameraError(error.message);

            Alert.alert(
              'Camera Error',
              error.message
            );
          }}
        />
      )}

      {/* CAMERA ERROR */}
      {!!cameraError && !photo && (
        <View style={s.errorBox}>
          <Text style={s.errorTitle}>
            Camera Error Details
          </Text>

          <Text style={s.errorText}>
            {cameraError}
          </Text>
        </View>
      )}

      {/* CAPTURE BUTTON */}
      {!photo && (
        <Pressable
          style={[
            s.button,
            (!cameraReady || capturing) && s.disabled,
          ]}
          onPress={capturePhoto}
          disabled={!cameraReady || capturing || busy}
        >
          {capturing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.buttonText}>
              {cameraReady
                ? 'Capture Live Selfie'
                : 'Opening Camera...'}
            </Text>
          )}
        </Pressable>
      )}

      {/* PHOTO PREVIEW */}
      {photo && (
        <>
          <Text style={s.previewLabel}>
            Selfie Preview
          </Text>

          <Pressable
            style={s.secondary}
            onPress={retakePhoto}
            disabled={busy}
          >
            <Text style={s.secondaryText}>
              Retake Photo
            </Text>
          </Pressable>

          <Pressable
            style={[s.button, busy && s.disabled]}
            onPress={uploadPhoto}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.buttonText}>
                Submit for Verification
              </Text>
            )}
          </Pressable>
        </>
      )}

      {/* PRIVACY */}
      <Text style={s.privacy}>
        🔒 Your verification selfie is private and intended
        for authorized reviewers only. Submission does not
        automatically verify your account.
      </Text>

    </ScrollView>
  );
}

// STYLES
const s = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f7f5ef',
    flexGrow: 1,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#f7f5ef',
  },

  brand: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#94722b',
    marginBottom: 12,
  },

  icon: {
    fontSize: 45,
    marginBottom: 15,
  },

  title: {
    fontSize: 25,
    fontWeight: '900',
    color: '#0a513b',
    marginBottom: 10,
  },

  help: {
    color: '#666',
    lineHeight: 22,
    marginBottom: 18,
  },

  infoBox: {
    backgroundColor: '#e9f1eb',
    padding: 15,
    borderRadius: 12,
    marginBottom: 18,
  },

  infoTitle: {
    fontWeight: '800',
    color: '#0a513b',
    marginBottom: 8,
  },

  infoText: {
    color: '#355344',
    lineHeight: 23,
  },

  camera: {
    height: 420,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },

  preview: {
    width: '100%',
    height: 420,
    borderRadius: 18,
    resizeMode: 'cover',
    backgroundColor: '#ddd',
  },

  previewLabel: {
    textAlign: 'center',
    marginTop: 12,
    color: '#0a513b',
    fontWeight: '800',
  },

  button: {
    backgroundColor: '#0a513b',
    padding: 17,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 15,
  },

  disabled: {
    opacity: 0.5,
  },

  secondary: {
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#0a513b',
    borderRadius: 12,
  },

  secondaryText: {
    color: '#0a513b',
    fontWeight: '800',
  },

  privacy: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 19,
    color: '#777',
    marginTop: 25,
    marginBottom: 20,
  },

  errorBox: {
    backgroundColor: '#ffebee',
    padding: 14,
    borderRadius: 12,
    marginTop: 15,
  },

  errorTitle: {
    color: '#b71c1c',
    fontWeight: '900',
    marginBottom: 6,
  },

  errorText: {
    color: '#b71c1c',
    lineHeight: 21,
  },
});
