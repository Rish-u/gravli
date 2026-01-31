import React, { useEffect, useState, useMemo } from 'react';
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
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import { signOut } from 'firebase/auth';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CAFE_DATA, BLOCKS, DELIVERY_FEE, PICKUP_FEE, generateOrderPin } from '../constants/cafeData';
import { CartItem, DeliveryRequest } from '../types';
import { formatTimeAgo, formatSubStatus, getStatusColor } from '../utils/helpers';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function StudentScreen() {
  const router = useRouter();
  const [cart, setCart] = useState<{ [key: string]: CartItem }>({});
  const [currentCafeId, setCurrentCafeId] = useState<string | null>(null);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [myOrders, setMyOrders] = useState<DeliveryRequest[]>([]);
  const [allOrders, setAllOrders] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');

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

        const myActiveOrders = orders.filter(
          (o) => o.requesterId === user.uid && (o.status === 'open' || o.status === 'in-progress')
        );
        setMyOrders(myActiveOrders);
        setAllOrders(orders);
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
    await AsyncStorage.setItem('userRole', 'deliverer');
    router.replace('/deliverer');
  };

  const openMenu = (cafeId: string) => {
    setCurrentCafeId(cafeId);
    setSearchText('');
    setMenuModalVisible(true);
  };

  const updateCart = (itemId: string, change: number) => {
    if (!currentCafeId) return;

    const firstItem = Object.values(cart)[0];
    if (firstItem && firstItem.cafeId !== currentCafeId) {
      Alert.alert(
        'Different Cafe',
        'Your cart contains items from another cafe. Clear cart and start new order?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear Cart',
            onPress: () => {
              setCart({});
              addToCart(itemId, change);
            },
          },
        ]
      );
      return;
    }

    addToCart(itemId, change);
  };

  const addToCart = (itemId: string, change: number) => {
    if (!currentCafeId) return;

    const cafe = CAFE_DATA[currentCafeId];
    const item = cafe.items.find((i) => i.id === itemId);
    if (!item) return;

    setCart((prev) => {
      const newCart = { ...prev };
      if (!newCart[itemId]) {
        newCart[itemId] = {
          id: itemId,
          name: item.name,
          price: item.price,
          quantity: 0,
          cafeId: currentCafeId,
          cafeName: cafe.name,
        };
      }

      newCart[itemId].quantity += change;

      if (newCart[itemId].quantity <= 0) {
        delete newCart[itemId];
      }

      return newCart;
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      delete newCart[itemId];
      return newCart;
    });
  };

  const cartTotal = useMemo(() => {
    return Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const filteredMenu = useMemo(() => {
    if (!currentCafeId) return [];
    const cafe = CAFE_DATA[currentCafeId];
    const lowerSearch = searchText.toLowerCase();
    return cafe.items.filter((item) => item.name.toLowerCase().includes(lowerSearch));
  }, [currentCafeId, searchText]);

  const handleCheckout = () => {
    if (cartItemCount === 0) return;
    setCartModalVisible(false);
    setCheckoutModalVisible(true);
  };

  const submitOrder = async () => {
    // For delivery, require block and room number
    if (orderType === 'delivery' && (!selectedBlock || roomNumber.trim().length !== 3)) {
      Alert.alert('Invalid Input', 'Please select a block and enter a 3-digit room number.');
      return;
    }

    setSubmitting(true);

    const firstItem = Object.values(cart)[0];
    const currentFee = orderType === 'delivery' ? DELIVERY_FEE : PICKUP_FEE;
    const orderPin = generateOrderPin();
    
    const request = {
      items: Object.values(cart).map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      itemPrice: cartTotal,
      pickupLocation: firstItem.cafeName,
      dropoffLocation: orderType === 'delivery' 
        ? `${selectedBlock} - Room ${roomNumber}` 
        : 'Self Pickup',
      deliveryFee: currentFee,
      totalAmount: cartTotal + currentFee,
      status: 'open',
      requesterId: user!.uid,
      requesterName: user!.displayName || 'Anonymous',
      requesterPhotoURL: user!.photoURL || '',
      requesterUid: user!.uid,
      delivererId: null,
      delivererName: null,
      createdAt: serverTimestamp(),
      subStatus: null,
      estimatedTime: null,
      orderType: orderType,
      pin: orderPin,
      ownerStatus: null,
    };

    try {
      await addDoc(collection(db, 'artifacts/gravli-android/public/data/deliveries'), request);
      setCart({});
      setSelectedBlock('');
      setRoomNumber('');
      setOrderType('delivery');
      setCheckoutModalVisible(false);
      Alert.alert(
        'Order Placed!', 
        `Your order PIN is: ${orderPin}\n\nShow this PIN when collecting your order.`
      );
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'artifacts/gravli-android/public/data/deliveries', orderId));
          } catch (error) {
            console.error('Error canceling order:', error);
          }
        },
      },
    ]);
  };

  const activeInProgressOrder = myOrders.find((o) => o.status === 'in-progress');

  const renderCafeGrid = () => {
    return (
      <View style={styles.cafeGrid}>
        {Object.entries(CAFE_DATA).map(([cafeId, cafe]) => (
          <TouchableOpacity
            key={cafeId}
            style={styles.cafeBox}
            onPress={() => openMenu(cafeId)}
          >
            <View style={styles.cafeImage}>
              <Ionicons name="restaurant" size={40} color="#8b5cf6" />
            </View>
            <Text style={styles.cafeName}>{cafe.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderOrderCard = (order: DeliveryRequest) => {
    const isMyOrder = order.requesterId === user?.uid;
    const statusColor = getStatusColor(order.status);

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

        <Text style={styles.orderDetail}>From: {order.pickupLocation}</Text>
        <Text style={styles.orderDetail}>To: {order.dropoffLocation}</Text>
        {order.delivererName && (
          <Text style={styles.orderDetail}>Deliverer: {order.delivererName}</Text>
        )}
        <Text style={styles.orderTimeText}>{formatTimeAgo(order.createdAt)}</Text>

        {order.status === 'in-progress' && (
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
          <Text style={styles.orderTotal}>₹{order.totalAmount.toFixed(2)}</Text>
          {isMyOrder && order.status === 'open' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => cancelOrder(order.id)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
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
            <Text style={styles.headerTitle}>Gravli</Text>
            <Text style={styles.headerSubtitle}>Welcome, {user?.displayName}!</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setHistoryModalVisible(true)}>
            <Ionicons name="time-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={switchRole}>
            <Ionicons name="bicycle" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Active Order Bar */}
        {activeInProgressOrder && (
          <TouchableOpacity style={styles.activeOrderBar}>
            <View>
              <Text style={styles.activeOrderTitle}>Your order is In Progress!</Text>
              <Text style={styles.activeOrderStatus}>
                {formatSubStatus(activeInProgressOrder.subStatus)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#8b5cf6" />
          </TouchableOpacity>
        )}

        {/* New Order Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Place a New Order</Text>
          {renderCafeGrid()}
        </View>

        {/* My Orders Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Active Orders</Text>
          {myOrders.length === 0 ? (
            <Text style={styles.emptyText}>You have no active orders.</Text>
          ) : (
            myOrders.map(renderOrderCard)
          )}
        </View>
      </ScrollView>

      {/* Cart Button */}
      {cartItemCount > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => setCartModalVisible(true)}
        >
          <Ionicons name="cart" size={24} color="#fff" />
          <Text style={styles.cartButtonText}>View Cart ({cartItemCount})</Text>
        </TouchableOpacity>
      )}

      {/* Menu Modal */}
      <Modal
        visible={menuModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setMenuModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {currentCafeId ? CAFE_DATA[currentCafeId].name : ''}
              </Text>
              <TouchableOpacity onPress={() => setMenuModalVisible(false)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search items..."
              placeholderTextColor="#94a3b8"
              value={searchText}
              onChangeText={setSearchText}
            />

            <FlatList
              data={filteredMenu}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const quantity = cart[item.id]?.quantity || 0;
                return (
                  <View style={styles.menuItem}>
                    <View style={styles.menuItemInfo}>
                      <Text style={styles.menuItemName}>{item.name}</Text>
                      <Text style={styles.menuItemPrice}>₹{item.price.toFixed(2)}</Text>
                    </View>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={[styles.quantityButton, quantity === 0 && styles.quantityButtonDisabled]}
                        onPress={() => updateCart(item.id, -1)}
                      >
                        <Ionicons name="remove" size={20} color="#fff" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateCart(item.id, 1)}
                      >
                        <Ionicons name="add" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
              style={styles.menuList}
              contentContainerStyle={styles.menuListContent}
            />
          </View>
        </View>
      </Modal>

      {/* Cart Modal */}
      <Modal
        visible={cartModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCartModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Cart</Text>
              <TouchableOpacity onPress={() => setCartModalVisible(false)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.cartList} contentContainerStyle={styles.cartListContent}>
              {Object.values(cart).length === 0 ? (
                <Text style={styles.emptyText}>Your cart is empty.</Text>
              ) : (
                Object.values(cart).map((item) => (
                  <View key={item.id} style={styles.cartItem}>
                    <View style={styles.cartItemInfo}>
                      <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                        <Ionicons name="close-circle" size={24} color="#ef4444" />
                      </TouchableOpacity>
                      <View style={styles.cartItemDetails}>
                        <Text style={styles.cartItemName}>
                          {item.name} x {item.quantity}
                        </Text>
                        <Text style={styles.cartItemCafe}>from {item.cafeName}</Text>
                      </View>
                    </View>
                    <Text style={styles.cartItemPrice}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.cartFooter}>
              <View style={styles.cartTotal}>
                <Text style={styles.cartTotalLabel}>Total</Text>
                <Text style={styles.cartTotalAmount}>₹{cartTotal.toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                style={[styles.checkoutButton, cartItemCount === 0 && styles.buttonDisabled]}
                onPress={handleCheckout}
                disabled={cartItemCount === 0}
              >
                <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Checkout Modal */}
      <Modal
        visible={checkoutModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCheckoutModalVisible(false)}
      >
        <KeyboardAwareScrollView
          style={styles.modalOverlay}
          contentContainerStyle={styles.modalOverlayContent}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Order</Text>
              <TouchableOpacity onPress={() => setCheckoutModalVisible(false)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.checkoutForm}>
              <Text style={styles.formLabel}>Drop-off Location</Text>

              <View style={styles.locationRow}>
                <View style={styles.locationInput}>
                  <Text style={styles.inputLabel}>Block</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.blockScroll}
                  >
                    {BLOCKS.map((block) => (
                      <TouchableOpacity
                        key={block}
                        style={[
                          styles.blockOption,
                          selectedBlock === block && styles.blockOptionSelected,
                        ]}
                        onPress={() => setSelectedBlock(block)}
                      >
                        <Text
                          style={[
                            styles.blockOptionText,
                            selectedBlock === block && styles.blockOptionTextSelected,
                          ]}
                        >
                          {block}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.roomInputContainer}>
                  <Text style={styles.inputLabel}>Room</Text>
                  <TextInput
                    style={styles.roomInput}
                    placeholder="e.g., 102"
                    placeholderTextColor="#94a3b8"
                    value={roomNumber}
                    onChangeText={setRoomNumber}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
              </View>

              <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Total Amount (Item + Fee)</Text>
                <Text style={styles.totalAmount}>₹{(cartTotal + DELIVERY_FEE).toFixed(2)}</Text>
              </View>

              <View style={styles.checkoutActions}>
                <TouchableOpacity
                  style={styles.cancelCheckoutButton}
                  onPress={() => setCheckoutModalVisible(false)}
                >
                  <Text style={styles.cancelCheckoutText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmOrderButton, submitting && styles.buttonDisabled]}
                  onPress={submitOrder}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.confirmOrderText}>Confirm Order</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAwareScrollView>
      </Modal>

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
              {allOrders.filter(
                (o) => o.requesterId === user?.uid && o.status === 'completed'
              ).length === 0 ? (
                <Text style={styles.emptyText}>No completed orders yet.</Text>
              ) : (
                allOrders
                  .filter((o) => o.requesterId === user?.uid && o.status === 'completed')
                  .map(renderOrderCard)
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
    backgroundColor: '#6366f1',
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#e0e7ff',
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    flex: 1,
  },
  activeOrderBar: {
    backgroundColor: '#1e293b',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  activeOrderTitle: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  activeOrderStatus: {
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
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
  cafeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cafeBox: {
    width: '48%',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cafeImage: {
    height: 120,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cafeName: {
    padding: 12,
    textAlign: 'center',
    fontWeight: '600',
    color: '#fff',
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
    alignItems: 'center',
    marginTop: 12,
  },
  orderTotal: {
    fontSize: 24,
    fontWeight: '700',
    color: '#22c55e',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cartButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 50,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalOverlayContent: {
    flexGrow: 1,
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
  searchInput: {
    backgroundColor: '#0f172a',
    color: '#fff',
    padding: 12,
    margin: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  menuList: {
    maxHeight: 500,
  },
  menuListContent: {
    padding: 16,
  },
  menuItem: {
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  menuItemPrice: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    backgroundColor: '#8b5cf6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    minWidth: 24,
    textAlign: 'center',
  },
  cartList: {
    padding: 16,
  },
  cartListContent: {
    paddingBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  cartItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cartItemCafe: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  cartFooter: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  cartTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cartTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  cartTotalAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  checkoutButton: {
    backgroundColor: '#8b5cf6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  checkoutForm: {
    padding: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 12,
  },
  locationRow: {
    gap: 12,
    marginBottom: 24,
  },
  locationInput: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  blockScroll: {
    flexDirection: 'row',
  },
  blockOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  blockOptionSelected: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  blockOptionText: {
    color: '#cbd5e1',
    fontWeight: '600',
  },
  blockOptionTextSelected: {
    color: '#fff',
  },
  roomInputContainer: {
    flex: 1,
  },
  roomInput: {
    backgroundColor: '#0f172a',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  totalSection: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  checkoutActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelCheckoutButton: {
    flex: 1,
    backgroundColor: '#475569',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelCheckoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmOrderButton: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  historyList: {
    padding: 16,
  },
});
