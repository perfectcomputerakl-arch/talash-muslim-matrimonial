import { useEffect,useState } from 'react';
import { View,Text,Pressable,StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
export default function Profile(){
 const [profile,setProfile]=useState<any>(null);
 useEffect(()=>{(async()=>{const {data:{user}}=await supabase.auth.getUser();if(!user)return;const {data}=await supabase.from('profiles').select('*').eq('id',user.id).single();setProfile(data);})();},[]);
 return <View style={s.wrap}><Text style={s.title}>My TALASH Profile</Text><Text style={s.label}>Name: {profile?.full_name||'Complete your profile'}</Text><Text style={s.label}>Profile status: {profile?.status||'Not submitted'}</Text><Text style={s.label}>Verification: {profile?.verification_status||'Not verified'}</Text>
 <Pressable style={s.btn} onPress={()=>router.push('/capture')}><Text style={s.white}>Live Selfie Verification</Text></Pressable>
 <Text style={s.note}>Your verification selfie is private and reviewed by authorized admins. A verified badge is shown only after approval.</Text>
 </View>;
}
const s=StyleSheet.create({wrap:{padding:22},title:{fontSize:26,fontWeight:'800',color:'#0a513b',marginBottom:20},label:{fontSize:16,marginBottom:12},btn:{backgroundColor:'#0a513b',padding:15,borderRadius:12,alignItems:'center',marginTop:12},white:{color:'white',fontWeight:'700'},note:{color:'#666',lineHeight:21,marginTop:20}});
