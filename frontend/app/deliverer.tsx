import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import { signOut } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  query,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeliveryRequest } from '../types';
import { formatTimeAgo, formatSubStatus, getStatusColor } from '../utils/helpers';

export default function DelivererScreen() {
  const router = useRouter();
  const [allOrders, setAllOrders] = useState<DeliveryRequest[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<DeliveryRequest[]>([]);
  const [completedDeliveries, setCompletedDeliveries] = useState<DeliveryRequest[]>([]);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [etaInputs, setEtaInputs] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      router.replace('/');
      return;
    }

    const unsubscribe = onSnapshot(
      query(collection(db, 'artifacts/gravli-android/public/data/deliveries')),
      (snapshot) => {
        const orders: DeliveryRequest[] = [];
        const now = Date.now() / 1000;
        const maxAge = 900; // 15 minutes

        snapshot.forEach((doc) => {
          const data = doc.data();
          const order: DeliveryRequest = {
            id: doc.id,
            ...data,
          } as DeliveryRequest;

          // Clean up old open orders
          if (
            order.status === 'open' &&
            order.createdAt &&
            now - order.createdAt.seconds > maxAge
          ) {
            if (order.requesterId === user.uid) {
              deleteDoc(doc.ref);
            }
          } else {
            orders.push(order);
          }
        });

        // Sort by latest
        orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        setAllOrders(orders);

        const myActive = orders.filter(
          (o) => o.delivererId === user.uid && (o.status === 'in-progress' || o.status === 'completed')
        );
        setMyDeliveries(myActive);

        const completed = orders.filter(
          (o) => o.delivererId === user.uid && o.status === 'completed'
        );
        setCompletedDeliveries(completed);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userRole');
    await signOut(auth);
    router.replace('/');
  };

  const switchRole = async () => {
    await AsyncStorage.setItem('userRole', 'student');
    router.replace('/student');
  };

  const acceptDelivery = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'artifacts/gravli-android/public/data/deliveries', orderId), {
        status: 'in-progress',
        delivererId: user!.uid,
        delivererName: user!.displayName || 'Anonymous',
      });
    } catch (error) {
      console.error('Error accepting delivery:', error);
      Alert.alert('Error', 'Failed to accept delivery. Please try again.');
    }
  };

  const updateETA = async (orderId: string) => {
    const eta = etaInputs[orderId];
    const etaNum = parseInt(eta);

    if (!eta || etaNum < 1 || etaNum > 40) {
      Alert.alert('Invalid ETA', 'Please enter a time between 1 and 40 minutes.');
      return;
    }

    try {
      await updateDoc(doc(db, 'artifacts/gravli-android/public/data/deliveries', orderId), {
        estimatedTime: eta,
      });
      setEtaInputs((prev) => {
        const newInputs = { ...prev };
        delete newInputs[orderId];
        return newInputs;
      });
    } catch (error) {
      console.error('Error updating ETA:', error);
      Alert.alert('Error', 'Failed to update ETA. Please try again.');
    }
  };

  const updateStatus = async (orderId: string, subStatus: string) => {
    try {
      await updateDoc(doc(db, 'artifacts/gravli-android/public/data/deliveries', orderId), {
        subStatus,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status. Please try again.');
    }
  };

  const completeDelivery = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'artifacts/gravli-android/public/data/deliveries', orderId), {
        status: 'completed',
      });
      Alert.alert('Success', 'Delivery completed!');
    } catch (error) {
      console.error('Error completing delivery:', error);
      Alert.alert('Error', 'Failed to complete delivery. Please try again.');
    }
  };

  const openDeliveries = allOrders.filter((o) => o.status === 'open');
  const hasActiveDelivery = myDeliveries.some((o) => o.status === 'in-progress');

  const renderDeliveryCard = (order: DeliveryRequest, type: 'available' | 'my-delivery' | 'history') => {
    const statusColor = getStatusColor(order.status);
    const isMyDelivery = type === 'my-delivery';
    const isHistory = type === 'history';

    return (
      <View key={order.id} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderTitleContainer}>
            {order.items.map((item, idx) => (
              <Text key={idx} style={styles.orderItemText}>
                {item.name} x {item.quantity}
              </Text>
            ))}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
        </View>

        {!isMyDelivery && !isHistory && order.requesterName && (
          <View style={styles.requesterInfo}>
            {order.requesterPhotoURL && (
              <Image source={{ uri: order.requesterPhotoURL }} style={styles.avatar} />
            )}
            <Text style={styles.requesterName}>Requester: {order.requesterName}</Text>
          </View>
        )}

        <Text style={styles.orderDetail}>Item Total: ₹{order.itemPrice.toFixed(2)}</Text>
        <Text style={styles.orderDetail}>From: {order.pickupLocation}</Text>
        <Text style={styles.orderDetail}>To: {order.dropoffLocation}</Text>
        <Text style={styles.orderTimeText}>{formatTimeAgo(order.createdAt)}</Text>

        {isMyDelivery && order.status === 'in-progress' && (
          <View style={styles.trackingSection}>
            <Text style={styles.trackingLabel}>
              ETA: {order.estimatedTime ? `${order.estimatedTime} mins` : 'Not set'}
            </Text>
            <Text style={styles.trackingLabel}>
              Status: {formatSubStatus(order.subStatus)}
            </Text>
          </View>
        )}

        <View style={styles.orderFooter}>
          <View>
            <Text style={styles.orderTotal}>₹{order.totalAmount.toFixed(2)}</Text>
            {type === 'available' && (
              <Text style={styles.earningsText}>You'll earn: ₹{order.deliveryFee.toFixed(2)}</Text>
            )}
          </View>

          {type === 'available' && order.requesterId !== user?.uid && (
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => acceptDelivery(order.id)}
            >
              <Text style={styles.acceptButtonText}>Accept Job</Text>
            </TouchableOpacity>
          )}

          {type === 'available' && order.requesterId === user?.uid && (
            <Text style={styles.ownOrderText}>Your own order</Text>
          )}

          {isMyDelivery && order.status === 'in-progress' && (
            <View style={styles.deliveryActions}>
              {!order.estimatedTime && (
                <View style={styles.etaSection}>
                  <TextInput
                    style={styles.etaInput}
                    placeholder="ETA (1-40 mins)"
                    placeholderTextColor="#94a3b8"
                    value={etaInputs[order.id] || ''}
                    onChangeText={(text) =>
                      setEtaInputs((prev) => ({ ...prev, [order.id]: text }))
                    }
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  <TouchableOpacity
                    style={styles.etaButton}
                    onPress={() => updateETA(order.id)}
                  >
                    <Text style={styles.etaButtonText}>Set ETA</Text>
                  </TouchableOpacity>
                </View>
              )}

              {order.estimatedTime && (
                <View style={styles.statusActions}>
                  {!order.subStatus && (
                    <TouchableOpacity
                      style={styles.statusButton}
                      onPress={() => updateStatus(order.id, 'reached-cafe')}
                    >
                      <Text style={styles.statusButtonText}>Reached Cafe</Text>
                    </TouchableOpacity>
                  )}

                  {order.subStatus === 'reached-cafe' && (
                    <TouchableOpacity
                      style={styles.statusButton}
                      onPress={() => updateStatus(order.id, 'picked-up')}
                    >
                      <Text style={styles.statusButtonText}>Picked Up</Text>
                    </TouchableOpacity>
                  )}

                  {order.subStatus === 'picked-up' && (
                    <TouchableOpacity
                      style={[styles.statusButton, styles.completeButton]}
                      onPress={() => completeDelivery(order.id)}
                    >
                      <Text style={styles.statusButtonText}>Delivered</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {user?.photoURL && (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          )}
          <View>
            <Text style={styles.headerTitle}>Gravli Deliverer</Text>
            <Text style={styles.headerSubtitle}>Welcome, {user?.displayName}!</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.deliveryStats}>
            <Text style={styles.statsText}>Deliveries: {completedDeliveries.length}</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={() => setHistoryModalVisible(true)}>
            <Ionicons name="time-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={switchRole}>
            <Ionicons name="cart" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* My Current Deliveries */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Current Deliveries</Text>
          {myDeliveries.filter((o) => o.status === 'in-progress').length === 0 ? (
            <Text style={styles.emptyText}>You have no active deliveries.</Text>
          ) : (
            myDeliveries
              .filter((o) => o.status === 'in-progress')
              .map((order) => renderDeliveryCard(order, 'my-delivery'))
          )}
        </View>

        {/* Available Deliveries */}
        {hasActiveDelivery ? (
          <View style={styles.messageCard}>
            <Ionicons name="information-circle" size={48} color="#8b5cf6" />
            <Text style={styles.messageText}>
              Please complete your current delivery to see more available jobs.
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Deliveries</Text>
            {openDeliveries.length === 0 ? (
              <Text style={styles.emptyText}>No available deliveries right now. Check back soon!</Text>
            ) : (
              openDeliveries.map((order) => renderDeliveryCard(order, 'available'))
            )}
          </View>
        )}
      </ScrollView>

      {/* History Modal */}
      <Modal
        visible={historyModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delivery History</Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.historyList}>
              {completedDeliveries.length === 0 ? (
                <Text style={styles.emptyText}>No completed deliveries yet.</Text>
              ) : (
                completedDeliveries.map((order) => renderDeliveryCard(order, 'history'))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#22c55e',
    flexWrap: 'wrap',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#e0f2e9',
  },
  deliveryStats: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 16,
    padding: 24,
  },
  orderCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderTitleContainer: {
    flex: 1,
  },
  orderItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8b5cf6',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  requesterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#0f172a',
    borderRadius: 8,
  },
  requesterName: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  orderDetail: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 4,
  },
  orderTimeText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
  },
  trackingSection: {
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  trackingLabel: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '600',
    marginBottom: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  orderTotal: {
    fontSize: 24,
    fontWeight: '700',
    color: '#22c55e',
  },
  earningsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
    marginTop: 4,
  },
  ownOrderText: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  acceptButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  deliveryActions: {
    flex: 1,
    marginLeft: 12,
  },
  etaSection: {
    flexDirection: 'row',
    gap: 8,
  },
  etaInput: {
    flex: 1,
    backgroundColor: '#0f172a',
    color: '#fff',
    padding: 8,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  etaButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  etaButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statusActions: {
    gap: 8,
  },
  statusButton: {
    backgroundColor: '#8b5cf6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#3b82f6',
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  messageCard: {
    backgroundColor: '#1e293b',
    padding: 24,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  messageText: {
    color: '#cbd5e1',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  historyList: {
    padding: 16,
  },
});
