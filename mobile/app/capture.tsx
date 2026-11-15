import { useRef, useState } from 'react';
import { View, Text, Pressable, Image, Alert, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from '../lib/supabase';
export default function Capture(){
 const camera=useRef<CameraView>(null); const [permission,requestPermission]=useCameraPermissions();
 const [photo,setPhoto]=useState<string|null>(null); const [busy,setBusy]=useState(false);
 const upload=async()=>{
  if(!photo)return; setBusy(true);
  try{
   const {data:{user}}=await supabase.auth.getUser(); if(!user) throw new Error('Please login first.');
   const response=await fetch(photo); const blob=await response.blob();
   const path=`${user.id}/verification-${Date.now()}.jpg`;
   const {error}=await supabase.storage.from('verification-private').upload(path,blob,{contentType:'image/jpeg',upsert:false});
   if(error)throw error;
   const {error:dbError}=await supabase.from('verification_requests').insert({user_id:user.id,selfie_path:path,status:'pending'});
   if(dbError)throw dbError;
   Alert.alert('Submitted','Your live selfie has been submitted for manual admin review.');
  }catch(e:any){Alert.alert('Upload failed',e.message||'Please try again.');}finally{setBusy(false);}
 };
 if(!permission)return <View style={s.center}><Text>Checking camera permission…</Text></View>;
 if(!permission.granted)return <View style={s.center}><Text>Camera access is required to take a live verification selfie.</Text><Pressable style={s.btn} onPress={requestPermission}><Text style={s.white}>Allow Camera</Text></Pressable></View>;
 return <View style={s.wrap}><Text style={s.title}>Live selfie verification</Text><Text style={s.help}>Take a fresh photo using the camera. Gallery uploads are not used for this verification step.</Text>
 {photo?<Image source={{uri:photo}} style={s.preview}/>:<CameraView ref={camera} style={s.camera} facing="front"/>}
 <Pressable style={s.btn} onPress={async()=>{const p=await camera.current?.takePictureAsync({quality:0.75});if(p?.uri)setPhoto(p.uri);}}><Text style={s.white}>Capture Live Selfie</Text></Pressable>
 {photo&&<><Pressable style={s.secondary} onPress={()=>setPhoto(null)}><Text>Retake</Text></Pressable><Pressable style={s.btn} disabled={busy} onPress={upload}><Text style={s.white}>{busy?'Uploading…':'Submit for Verification'}</Text></Pressable></>}
 </View>;
}
const s=StyleSheet.create({wrap:{flex:1,padding:18},center:{flex:1,justifyContent:'center',alignItems:'center',padding:24},title:{fontSize:24,fontWeight:'800',color:'#0a513b'},help:{color:'#666',marginVertical:12,lineHeight:20},camera:{height:430,borderRadius:16,overflow:'hidden'},preview:{height:430,resizeMode:'cover',borderRadius:16},btn:{backgroundColor:'#0a513b',padding:15,borderRadius:12,alignItems:'center',marginTop:14},white:{color:'white',fontWeight:'700'},secondary:{padding:12,alignItems:'center'}});
