import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Image,
  RefreshControl,
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
  updateDoc,
  doc,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeliveryRequest } from '../types';
import { formatTimeAgo, getStatusColor } from '../utils/helpers';
import { CAFE_DATA, OWNER_IDS } from '../constants/cafeData';

export default function OwnerScreen() {
  const router = useRouter();
  const [cafeOrders, setCafeOrders] = useState<DeliveryRequest[]>([]);
  const [ownerCafeId, setOwnerCafeId] = useState<string | null>(null);
  const [ownerCafeName, setOwnerCafeName] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    loadOwnerData();
  }, []);

  const loadOwnerData = async () => {
    const ownerId = await AsyncStorage.getItem('ownerId');
    if (ownerId && OWNER_IDS[ownerId]) {
      setOwnerCafeId(OWNER_IDS[ownerId]);
      setOwnerCafeName(CAFE_DATA[OWNER_IDS[ownerId]]?.name || 'Your Cafe');
    }
  };

  useEffect(() => {
    if (!user || !ownerCafeName) {
      return;
    }

    const unsubscribe = onSnapshot(
      query(collection(db, 'artifacts/gravli-android/public/data/deliveries')),
      (snapshot) => {
        const orders: DeliveryRequest[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const order: DeliveryRequest = {
            id: docSnap.id,
            ...data,
          } as DeliveryRequest;

          // Filter orders for this cafe
          if (order.pickupLocation === ownerCafeName) {
            orders.push(order);
          }
        });

        // Sort by latest
        orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setCafeOrders(orders);
      }
    );

    return () => unsubscribe();
  }, [user, ownerCafeName]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userRole');
    await AsyncStorage.removeItem('ownerId');
    await signOut(auth);
    router.replace('/');
  };

  const switchRole = async () => {
    await AsyncStorage.removeItem('ownerId');
    router.replace('/role-selection');
  };

  const markOrderReady = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'artifacts/gravli-android/public/data/deliveries', orderId), {
        ownerStatus: 'ready',
      });
      Alert.alert('Success', 'Order marked as ready for pickup!');
    } catch (error) {
      console.error('Error marking order ready:', error);
      Alert.alert('Error', 'Failed to update order status.');
    }
  };

  const rejectOrder = async (orderId: string) => {
    Alert.alert(
      'Reject Order',
      'Are you sure you want to reject this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'artifacts/gravli-android/public/data/deliveries', orderId), {
                ownerStatus: 'rejected',
                status: 'rejected',
              });
              Alert.alert('Order Rejected', 'The order has been rejected.');
            } catch (error) {
              console.error('Error rejecting order:', error);
              Alert.alert('Error', 'Failed to reject order.');
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const generateShortOrderId = (id: string) => {
    return id.slice(-6).toUpperCase();
  };

  const pendingOrders = cafeOrders.filter(
    (o) => o.status === 'open' || (o.status === 'in-progress' && o.ownerStatus !== 'ready')
  );
  const readyOrders = cafeOrders.filter((o) => o.ownerStatus === 'ready' && o.status !== 'completed');
  const completedOrders = cafeOrders.filter((o) => o.status === 'completed');

  const getOwnerStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'ready':
        return '#22c55e';
      case 'rejected':
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  const renderOrderCard = (order: DeliveryRequest, showActions: boolean = true) => {
    const statusColor = getStatusColor(order.status);
    const ownerStatusColor = getOwnerStatusColor(order.ownerStatus);

    return (
      <View key={order.id} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderIdSection}>
            <Text style={styles.orderIdLabel}>Order ID</Text>
            <Text style={styles.orderId}>#{generateShortOrderId(order.id)}</Text>
            {order.pin && (
              <View style={styles.pinBadge}>
                <Text style={styles.pinText}>PIN: {order.pin}</Text>
              </View>
            )}
          </View>
          <View style={styles.statusBadges}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
            {order.ownerStatus && (
              <View style={[styles.statusBadge, { backgroundColor: ownerStatusColor }]}>
                <Text style={styles.statusText}>{order.ownerStatus}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.orderItems}>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.name} × {item.quantity}
              </Text>
              <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.orderDetails}>
          <Text style={styles.orderDetail}>
            <Ionicons name="person" size={14} color="#94a3b8" /> {order.requesterName}
          </Text>
          <Text style={styles.orderDetail}>
            <Ionicons name="location" size={14} color="#94a3b8" /> {order.dropoffLocation}
          </Text>
          <Text style={styles.orderTime}>{formatTimeAgo(order.createdAt)}</Text>
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.orderTotal}>₹{order.totalAmount.toFixed(2)}</Text>
          
          {showActions && order.status !== 'completed' && order.ownerStatus !== 'rejected' && order.ownerStatus !== 'ready' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.readyButton}
                onPress={() => markOrderReady(order.id)}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>Ready</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => rejectOrder(order.id)}
              >
                <Ionicons name="close-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (!ownerCafeName) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading cafe data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.cafeIcon}>
            <Ionicons name="storefront" size={24} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>{ownerCafeName}</Text>
            <Text style={styles.headerSubtitle}>Cafe Management</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setHistoryModalVisible(true)}>
            <Ionicons name="time-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={switchRole}>
            <Ionicons name="swap-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{pendingOrders.length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{readyOrders.length}</Text>
          <Text style={styles.statLabel}>Ready</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{completedOrders.length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" />
        }
      >
        {/* Pending Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="hourglass" size={20} color="#f59e0b" /> Pending Orders
          </Text>
          {pendingOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="checkmark-done-circle" size={48} color="#22c55e" />
              <Text style={styles.emptyText}>No pending orders!</Text>
            </View>
          ) : (
            pendingOrders.map((order) => renderOrderCard(order))
          )}
        </View>

        {/* Ready Orders */}
        {readyOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" /> Ready for Pickup
            </Text>
            {readyOrders.map((order) => renderOrderCard(order, false))}
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
              <Text style={styles.modalTitle}>Order History</Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.historyList}>
              {completedOrders.length === 0 ? (
                <Text style={styles.emptyText}>No completed orders yet.</Text>
              ) : (
                completedOrders.map((order) => renderOrderCard(order, false))
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f59e0b',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  cafeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#fef3c7',
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: '#1e293b',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
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
  orderIdSection: {
    flex: 1,
  },
  orderIdLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  orderId: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8b5cf6',
  },
  pinBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  pinText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  statusBadges: {
    flexDirection: 'column',
    gap: 4,
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
    textTransform: 'capitalize',
  },
  orderItems: {
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    color: '#e2e8f0',
  },
  itemPrice: {
    fontSize: 14,
    color: '#94a3b8',
  },
  orderDetails: {
    marginBottom: 12,
  },
  orderDetail: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 4,
  },
  orderTime: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
  },
  orderTotal: {
    fontSize: 24,
    fontWeight: '700',
    color: '#22c55e',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  readyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
