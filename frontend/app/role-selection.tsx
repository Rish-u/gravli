import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../config/firebase';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const isDemoMode = await AsyncStorage.getItem('isDemoMode');
      if (isDemoMode === 'true' && auth.currentUser) {
        setUserName(auth.currentUser.displayName || 'Demo User');
      } else if (auth.currentUser) {
        setUserName(auth.currentUser.displayName || 'User');
      }
    } catch (error) {
      console.error('Error loading user name:', error);
    }
  };

  const selectRole = async (role: 'student' | 'deliverer') => {
    await AsyncStorage.setItem('userRole', role);
    router.replace(`/${role}` as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.content}>
        <Text style={styles.greeting}>Hello, {userName}!</Text>
        <Text style={styles.title}>What would you like to do?</Text>
        <Text style={styles.subtitle}>Choose your role for this session</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.roleButton, styles.studentButton]}
            onPress={() => selectRole('student')}
          >
            <Ionicons name="cart" size={40} color="#fff" />
            <Text style={styles.roleButtonText}>Order Food</Text>
            <Text style={styles.roleButtonSubtext}>Browse cafes and place orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleButton, styles.delivererButton]}
            onPress={() => selectRole('deliverer')}
          >
            <Ionicons name="bicycle" size={40} color="#fff" />
            <Text style={styles.roleButtonText}>Deliver Orders</Text>
            <Text style={styles.roleButtonSubtext}>Accept and fulfill deliveries</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  greeting: {
    fontSize: 18,
    color: '#94a3b8',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8b5cf6',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 48,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  roleButton: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  studentButton: {
    backgroundColor: '#6366f1',
  },
  delivererButton: {
    backgroundColor: '#22c55e',
  },
  roleButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  roleButtonSubtext: {
    color: '#e2e8f0',
    fontSize: 14,
  },
});
