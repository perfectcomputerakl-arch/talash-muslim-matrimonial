import { useRef, useState } from 'react';
import {
View,
Text,
Pressable,
Image,
Alert,
StyleSheet,
ActivityIndicator,
ScrollView
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function Capture() {
const camera = useRef<CameraView>(null);
const [permission, requestPermission] = useCameraPermissions();

const [photo, setPhoto] = useState<string | null>(null);
const [busy, setBusy] = useState(false);
const [cameraReady, setCameraReady] = useState(false);

const capturePhoto = async () => {
if (!camera.current || !cameraReady) {
Alert.alert('Camera Not Ready', 'Please wait for the camera.');
return;
}

try {
  const result = await camera.current.takePictureAsync({
    quality: 0.8,
    skipProcessing: false
  });

  if (result?.uri) {
    setPhoto(result.uri);
  }
} catch {
  Alert.alert('Camera Error', 'Unable to capture photo. Please try again.');
}

};

const uploadPhoto = async () => {
if (!photo || busy) return;

setBusy(true);

try {
  const { data: { user }, error: authError } =
    await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Please login before submitting verification.');
  }

  // Check for an existing pending request
  const { data: existing, error: checkError } = await supabase
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

  // Prepare image for private upload
  const response = await fetch(photo);
  if (!response.ok) {
    throw new Error('Could not read the captured photo.');
  }

  const blob = await response.blob();

  const fileName = `verification-${Date.now()}.jpg`;
  const path = `${user.id}/${fileName}`;

  // Upload to private storage bucket
  const { error: uploadError } = await supabase.storage
    .from('verification-private')
    .upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: false
    });

  if (uploadError) throw uploadError;

  // Create verification request
  const { error: dbError } = await supabase
    .from('verification_requests')
    .insert({
      user_id: user.id,
      selfie_path: path,
      status: 'pending'
    });

  if (dbError) {
    // Remove uploaded file if database insertion fails
    await supabase.storage
      .from('verification-private')
      .remove([path]);

    throw dbError;
  }

  setPhoto(null);

  Alert.alert(
    'Verification Submitted',
    'Your live selfie has been submitted successfully. Our authorized admin team will review it.',
    [
      {
        text: 'OK',
        onPress: () => router.replace('/profile')
      }
    ]
  );

} catch (error: any) {
  Alert.alert(
    'Submission Failed',
    error.message || 'Something went wrong. Please try again.'
  );
} finally {
  setBusy(false);
}

};

if (!permission) {
return (
<View style={s.center}>
<ActivityIndicator size="large" color="#0a513b" />
<Text style={s.help}>Checking camera permission...</Text>
</View>
);
}

if (!permission.granted) {
return (
<View style={s.center}>
<Text style={s.icon}>📷</Text>
<Text style={s.title}>Camera Permission Required</Text>
<Text style={s.help}>
TALASH needs camera access to capture a fresh verification selfie.
Gallery photos are not accepted for this step.
</Text>

    <Pressable style={s.button} onPress={requestPermission}>
      <Text style={s.buttonText}>Allow Camera</Text>
    </Pressable>
  </View>
);

}

return (
<ScrollView contentContainerStyle={s.container}>
<Text style={s.brand}>TALASH</Text>

  <Text style={s.title}>Live Selfie Verification</Text>

  <Text style={s.help}>
    Capture a fresh selfie using your phone camera. Your photo will be
    stored privately and submitted for manual admin review.
  </Text>

  <View style={s.infoBox}>
    <Text style={s.infoTitle}>Before taking your selfie</Text>
    <Text style={s.infoText}>• Keep your face clearly visible.</Text>
    <Text style={s.infoText}>• Use good lighting.</Text>
    <Text style={s.infoText}>• Look directly at the camera.</Text>
    <Text style={s.infoText}>• Avoid filters and face coverings that obscure your face.</Text>
  </View>

  {photo ? (
    <Image source={{ uri: photo }} style={s.preview} />
  ) : (
    <CameraView
      ref={camera}
      style={s.camera}
      facing="front"
      onCameraReady={() => setCameraReady(true)}
    />
  )}

  {!photo && (
    <Pressable
      style={[s.button, !cameraReady && s.disabled]}
      onPress={capturePhoto}
      disabled={!cameraReady || busy}
    >
      <Text style={s.buttonText}>
        {cameraReady ? 'Capture Live Selfie' : 'Opening Camera...'}
      </Text>
    </Pressable>
  )}

  {photo && (
    <>
      <Text style={s.previewLabel}>Selfie Preview</Text>

      <Pressable
        style={s.secondary}
        onPress={() => setPhoto(null)}
        disabled={busy}
      >
        <Text style={s.secondaryText}>Retake Photo</Text>
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

  <Text style={s.privacy}>
    🔒 Your verification selfie is private and is intended for authorized
    reviewers only. Submission does not automatically verify your account.
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
padding: 25,
backgroundColor: '#f7f5ef'
},
brand: {
fontSize: 18,
fontWeight: '900',
letterSpacing: 4,
color: '#94722b',
marginBottom: 12
},
icon: {
fontSize: 45,
marginBottom: 15
},
title: {
fontSize: 25,
fontWeight: '900',
color: '#0a513b',
marginBottom: 10
},
help: {
color: '#666',
lineHeight: 22,
marginBottom: 18
},
infoBox: {
backgroundColor: '#e9f1eb',
padding: 15,
borderRadius: 12,
marginBottom: 18
},
infoTitle: {
fontWeight: '800',
color: '#0a513b',
marginBottom: 8
},
infoText: {
color: '#355344',
lineHeight: 23
},
camera: {
height: 420,
borderRadius: 18,
overflow: 'hidden',
backgroundColor: '#ddd'
},
preview: {
width: '100%',
height: 420,
borderRadius: 18,
resizeMode: 'cover',
backgroundColor: '#ddd'
},
previewLabel: {
textAlign: 'center',
marginTop: 12,
color: '#0a513b',
fontWeight: '800'
},
button: {
backgroundColor: '#0a513b',
padding: 17,
borderRadius: 12,
alignItems: 'center',
marginTop: 16
},
buttonText: {
color: '#fff',
fontWeight: '900',
fontSize: 15
},
disabled: {
opacity: 0.5
},
secondary: {
padding: 14,
alignItems: 'center',
marginTop: 8,
borderWidth: 1,
borderColor: '#0a513b',
borderRadius: 12
},
secondaryText: {
color: '#0a513b',
fontWeight: '800'
},
privacy: {
textAlign: 'center',
fontSize: 12,
lineHeight: 19,
color: '#777',
marginTop: 25,
marginBottom: 20
}
});
