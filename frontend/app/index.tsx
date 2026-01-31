import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { auth, googleProvider } from '../config/firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const savedRole = await AsyncStorage.getItem('userRole');
        if (savedRole) {
          router.replace(`/${savedRole}` as any);
        } else {
          router.replace('/role-selection');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setSigningIn(true);
      
      if (Platform.OS === 'web') {
        await signInWithPopup(auth, googleProvider);
      } else {
        Alert.alert(
          'Mobile Sign In',
          'Please use the web version to sign in with Google. Once signed in, your session will sync across devices.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Google Sign-in Error:', error);
      
      // Show more helpful error message
      if (error.code === 'auth/unauthorized-domain') {
        Alert.alert(
          'Domain Not Authorized',
          'This preview domain needs to be added to Firebase authorized domains. Please use Email Login instead.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Use Email Login', onPress: () => setShowEmailLogin(true) }
          ]
        );
      } else {
        Alert.alert('Sign In Failed', `Error: ${error.message}`);
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter email and password.');
      return;
    }

    if (isSignUp && !name) {
      Alert.alert('Missing Information', 'Please enter your name.');
      return;
    }

    try {
      setSigningIn(true);

      if (isSignUp) {
        // Create new account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update profile with name
        await updateProfile(userCredential.user, {
          displayName: name,
        });
        Alert.alert('Success', 'Account created successfully!');
      } else {
        // Sign in existing user
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error('Email Auth Error:', error);
      
      let errorMessage = 'Authentication failed. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="fast-food" size={60} color="#8b5cf6" />
          </View>
          <Text style={styles.title}>Gravli</Text>
          <Text style={styles.subtitle}>Campus Delivery</Text>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to Gravli!</Text>
          <Text style={styles.welcomeText}>
            Your on-campus delivery solution. Fast, easy, and by students, for students.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.googleButton, signingIn && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={signingIn}
        >
          {signingIn ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="logo-google" size={24} color="#fff" />
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Made By Students</Text>
        <Text style={styles.footerText}>Made For Students</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#e2e8f0',
    marginTop: 16,
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    letterSpacing: 2,
  },
  welcomeSection: {
    marginBottom: 48,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#8b5cf6',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
});
