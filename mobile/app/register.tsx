import { useState } from 'react';
import { View, Text, TextInput, Pressable, Switch, Alert, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
export default function Register(){
 const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
 const [fullName,setFullName]=useState(''); const [gender,setGender]=useState(''); const [city,setCity]=useState('');
 const [muslim,setMuslim]=useState(false); const [consent,setConsent]=useState(false);
 const submit=async()=>{
  if(!muslim||!consent||!email||!password||!fullName||!gender){Alert.alert('Please complete all required fields and declarations.');return;}
  const {data,error}=await supabase.auth.signUp({email,password});
  if(error){Alert.alert('Registration failed',error.message);return;}
  if(data.user){const {error:pe}=await supabase.from('profiles').insert({id:data.user.id,full_name:fullName,gender,city,religion_declaration:true,privacy_consent:true,status:'incomplete'}); if(pe) Alert.alert('Profile saved with issue',pe.message);}
  Alert.alert('Next step','Your account is created. Sign in after email confirmation, then complete your live photo submission.');
  router.replace('/');
 };
 return <ScrollView contentContainerStyle={s.wrap}><Text style={s.title}>Create your TALASH profile</Text>
  <Text style={s.help}>Registration is for adults (18+) seeking Muslim matrimonial matches.</Text>
  <TextInput style={s.input} placeholder="Full name" value={fullName} onChangeText={setFullName}/>
  <TextInput style={s.input} placeholder="Email address" autoCapitalize="none" value={email} onChangeText={setEmail}/>
  <TextInput style={s.input} placeholder="Password (min. 8 characters)" secureTextEntry value={password} onChangeText={setPassword}/>
  <TextInput style={s.input} placeholder="Gender (Bride / Groom)" value={gender} onChangeText={setGender}/>
  <TextInput style={s.input} placeholder="City" value={city} onChangeText={setCity}/>
  <View style={s.row}><Switch value={muslim} onValueChange={setMuslim}/><Text style={s.check}>I self-declare that I am Muslim and wish to join this Muslim-only platform.</Text></View>
  <View style={s.row}><Switch value={consent} onValueChange={setConsent}/><Text style={s.check}>I agree to the privacy notice and consent to profile review. I understand verification photos are restricted to authorized reviewers.</Text></View>
  <Pressable style={s.button} onPress={submit}><Text style={s.btn}>Create Account</Text></Pressable>
 </ScrollView>;
}
const s=StyleSheet.create({wrap:{padding:22},title:{fontSize:26,fontWeight:'800',color:'#0a513b',marginBottom:8},help:{color:'#666',marginBottom:18},input:{backgroundColor:'#fff',padding:14,borderRadius:10,marginBottom:12,borderWidth:1,borderColor:'#ddd'},row:{flexDirection:'row',alignItems:'center',marginVertical:12,gap:10},check:{flex:1,color:'#333',lineHeight:20},button:{backgroundColor:'#0a513b',padding:16,borderRadius:12,alignItems:'center',marginTop:18},btn:{color:'white',fontWeight:'800'}});
