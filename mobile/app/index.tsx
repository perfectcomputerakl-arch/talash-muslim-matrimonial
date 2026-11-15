import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
export default function Home() {
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const signIn=async()=>{const {error}=await supabase.auth.signInWithPassword({email,password}); if(error) Alert.alert('Sign in failed',error.message); else router.push('/profile');};
 return <View style={s.wrap}>
  <Text style={s.logo}>TALASH</Text><Text style={s.tag}>Find a compatible life partner</Text>
  <Text style={s.heading}>Welcome</Text>
  <TextInput style={s.input} placeholder="Email address" autoCapitalize="none" value={email} onChangeText={setEmail}/>
  <TextInput style={s.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword}/>
  <Pressable style={s.button} onPress={signIn}><Text style={s.btnText}>Login</Text></Pressable>
  <Pressable onPress={()=>router.push('/register')}><Text style={s.link}>Create a new profile</Text></Pressable>
  <Text style={s.note}>For Muslim users only · Privacy-first matchmaking</Text>
 </View>;
}
const s=StyleSheet.create({wrap:{flex:1,justifyContent:'center',padding:24},logo:{fontSize:42,fontWeight:'900',color:'#0a513b',textAlign:'center',letterSpacing:4},tag:{textAlign:'center',color:'#94722b',marginBottom:40},heading:{fontSize:24,fontWeight:'700',marginBottom:18,color:'#163b2c'},input:{backgroundColor:'white',padding:15,borderRadius:12,marginBottom:12,borderWidth:1,borderColor:'#ddd'},button:{backgroundColor:'#0a513b',padding:16,borderRadius:12,alignItems:'center',marginTop:8},btnText:{color:'#fff',fontWeight:'700'},link:{textAlign:'center',color:'#0a513b',marginTop:22,fontWeight:'700'},note:{textAlign:'center',marginTop:38,color:'#777',fontSize:12}});
