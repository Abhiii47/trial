import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useProductStore, Product } from '../../src/store/useProductStore';
import { ProductCard } from '../../src/components/ProductCard';
import { AddEditProductModal } from '../../src/components/AddEditProductModal';
import {
  Plus,
  LogOut,
  FolderOpen,
  ShoppingBag,
  History,
  Scan
} from 'lucide-react-native';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();

  const { user, logout, isAuthenticated } = useAuthStore();
  const products = useProductStore((state) => state.products);
  const getCategories = useProductStore((state) => state.getCategories);

  // Modal control
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [prefilledBarcode, setPrefilledBarcode] = useState<string | null>(null);

  // Redirect if logged out
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  // Set up header actions
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <LogOut size={18} color={Colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Handle incoming deep links / screen params
  useEffect(() => {
    if (params.newBarcode) {
      setPrefilledBarcode(params.newBarcode as string);
      setSelectedProduct(null);
      setModalVisible(true);
      
      // Clean up search params to prevent reopening
      router.setParams({ newBarcode: '' });
    } else if (params.editProductId) {
      const prod = products.find((p) => p._id === params.editProductId);
      if (prod) {
        setSelectedProduct(prod);
        setPrefilledBarcode(null);
        setModalVisible(true);
      }
      router.setParams({ editProductId: '' });
    }
  }, [params, products]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/');
        },
      },
    ]);
  };

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setPrefilledBarcode(null);
    setModalVisible(true);
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setPrefilledBarcode(null);
    setModalVisible(true);
  };

  const handleBarcodeScanRequested = () => {
    setModalVisible(false);
    // Open barcode scanner modal
    router.push('/scanner');
  };

  // Stats Calculations
  const totalProducts = products.length;
  const totalCategories = getCategories().filter((c) => c !== 'All').length;
  
  // Sort products by updatedAt to show "Recently Updated"
  const recentlyUpdated = [...products]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.welcomeText}>Hello, {user?.name || 'Owner'}</Text>
      <Text style={styles.dashboardSubtitle}>Store Management Control Panel</Text>

      {/* Stats Bento Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <ShoppingBag size={20} color={Colors.accent} />
          </View>
          <Text style={styles.statValue}>{totalProducts}</Text>
          <Text style={styles.statLabel}>Total Products</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: 'rgba(48, 209, 88, 0.1)' }]}>
            <FolderOpen size={20} color={Colors.price} />
          </View>
          <Text style={styles.statValue}>{totalCategories}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity onPress={handleAddNew} style={styles.actionBtn}>
          <Plus size={18} color="#000" style={{ marginRight: 6 }} />
          <Text style={styles.actionBtnText}>Add Product</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => router.push('/scanner')} 
          style={[styles.actionBtn, styles.scanActionBtn]}
        >
          <Scan size={18} color={Colors.text} style={{ marginRight: 6 }} />
          <Text style={[styles.actionBtnText, { color: Colors.text }]}>Scan & Add</Text>
        </TouchableOpacity>
      </View>

      {/* List Header */}
      <View style={styles.listHeader}>
        <History size={16} color={Colors.textSecondary} style={{ marginRight: 6 }} />
        <Text style={styles.listHeaderTitle}>Recently Updated Products</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={recentlyUpdated}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => handleProductPress(item)}
            showChevron={true}
          />
        )}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.scrollContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products added yet.</Text>
          </View>
        }
      />

      {/* Add / Edit Sheet Modal */}
      <AddEditProductModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedProduct(null);
          setPrefilledBarcode(null);
        }}
        product={selectedProduct}
        onBarcodeScanRequested={handleBarcodeScanRequested}
        scannedBarcode={prefilledBarcode}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: 8,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
    marginLeft: 6,
  },
  headerContainer: {
    padding: 16,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  dashboardSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginHorizontal: 4,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    backgroundColor: Colors.text, // White button
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionBtnText: {
    color: Colors.background, // Black text
    fontSize: 14,
    fontWeight: '600',
  },
  scanActionBtn: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  listHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
