import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../config/firebase';
import { OWNER_IDS } from '../constants/cafeData';
import { UserRole } from '../types';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('User');
  const [ownerModalVisible, setOwnerModalVisible] = useState(false);
  const [ownerId, setOwnerId] = useState('');
  const [verifying, setVerifying] = useState(false);

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

  const selectRole = async (role: UserRole) => {
    await AsyncStorage.setItem('userRole', role);
    router.replace(`/${role}` as any);
  };

  const handleOwnerLogin = async () => {
    if (!ownerId.trim()) {
      Alert.alert('Missing ID', 'Please enter your Owner ID.');
      return;
    }

    setVerifying(true);

    // Simulate verification delay
    setTimeout(async () => {
      const upperOwnerId = ownerId.trim().toUpperCase();
      
      if (OWNER_IDS[upperOwnerId]) {
        await AsyncStorage.setItem('ownerId', upperOwnerId);
        await AsyncStorage.setItem('userRole', 'owner');
        setOwnerModalVisible(false);
        router.replace('/owner');
      } else {
        Alert.alert(
          'Invalid Owner ID',
          'The Owner ID you entered is not recognized. Please check and try again.',
          [{ text: 'OK' }]
        );
      }
      setVerifying(false);
    }, 500);
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

          <TouchableOpacity
            style={[styles.roleButton, styles.ownerButton]}
            onPress={() => setOwnerModalVisible(true)}
          >
            <Ionicons name="storefront" size={40} color="#fff" />
            <Text style={styles.roleButtonText}>Cafe Owner</Text>
            <Text style={styles.roleButtonSubtext}>Manage your cafe orders</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Owner Login Modal */}
      <Modal
        visible={ownerModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setOwnerModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cafe Owner Login</Text>
              <TouchableOpacity onPress={() => setOwnerModalVisible(false)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.ownerIconContainer}>
                <Ionicons name="storefront" size={60} color="#f59e0b" />
              </View>
              
              <Text style={styles.modalSubtitle}>
                Enter your unique Owner ID to access your cafe management dashboard.
              </Text>

              <View style={styles.inputContainer}>
                <Ionicons name="key-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Owner ID (e.g., OWNER001)"
                  placeholderTextColor="#94a3b8"
                  value={ownerId}
                  onChangeText={setOwnerId}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={[styles.loginButton, verifying && styles.buttonDisabled]}
                onPress={handleOwnerLogin}
                disabled={verifying}
              >
                {verifying ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="log-in" size={20} color="#fff" />
                    <Text style={styles.loginButtonText}>Login as Owner</Text>
                  </>
                )}
              </TouchableOpacity>

              <Text style={styles.helpText}>
                Don't have an Owner ID? Contact campus administration.
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
