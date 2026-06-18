import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Animated,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Colors } from '../src/theme/colors';
import { useProductStore, Product } from '../src/store/useProductStore';
import { useAuthStore } from '../src/store/useAuthStore';
import { ProductCard } from '../src/components/ProductCard';
import {
  Search,
  ScanBarcode,
  SlidersHorizontal,
  ChevronDown,
  RotateCw,
  User,
  Shield,
  X
} from 'lucide-react-native';

export default function SearchScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  
  const products = useProductStore((state) => state.products);
  const isSyncing = useProductStore((state) => state.isSyncing);
  const syncError = useProductStore((state) => state.syncError);
  const lastSynced = useProductStore((state) => state.lastSynced);
  const syncWithServer = useProductStore((state) => state.syncWithServer);

  const searchQuery = useProductStore((state) => state.searchQuery);
  const selectedCategory = useProductStore((state) => state.selectedCategory);
  const sortBy = useProductStore((state) => state.sortBy);
  
  const setSearchQuery = useProductStore((state) => state.setSearchQuery);
  const setSelectedCategory = useProductStore((state) => state.setSelectedCategory);
  const setSortBy = useProductStore((state) => state.setSortBy);
  const getFilteredProducts = useProductStore((state) => state.getFilteredProducts);
  const getCategories = useProductStore((state) => state.getCategories);

  const { isAuthenticated } = useAuthStore();

  const [showSortOptions, setShowSortOptions] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation on load
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Update layout header to include auth button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => router.push(isAuthenticated ? '/(admin)/dashboard' : '/(auth)/login')}
          style={styles.headerBtn}
        >
          {isAuthenticated ? (
            <Shield size={20} color={Colors.accent as any} />
          ) : (
            <User size={20} color={Colors.text as any} />
          )}
        </TouchableOpacity>
      ),
    });
  }, [isAuthenticated, navigation]);

  // Sync search query store when typing (instant search)
  const handleSearchChange = (text: string) => {
    setLocalQuery(text);
    setSearchQuery(text);
  };

  const handleClearSearch = () => {
    setLocalQuery('');
    setSearchQuery('');
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
  };

  const filteredProducts = getFilteredProducts();
  const categories = getCategories();

  // Low-end virtualization performance optimizations
  const renderItem = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => {
        if (isAuthenticated) {
          // Open edit modal directly in admin screen
          router.push({
            pathname: '/(admin)/dashboard',
            params: { editProductId: item._id }
          });
        }
      }}
      showChevron={isAuthenticated}
    />
  );

  const getItemLayout = (_data: any, index: number) => ({
    length: 110, // Approximate height of ProductCard
    offset: 110 * index,
    index,
  });

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.mainView, { opacity: fadeAnim }]}>
        {/* Sync Info Header */}
        <View style={styles.syncContainer}>
          <Text style={styles.syncText}>
            {syncError 
              ? `${syncError}` 
              : lastSynced 
                ? `Last Synced: ${lastSynced}` 
                : 'Not Synced'}
          </Text>
          <TouchableOpacity 
            disabled={isSyncing} 
            onPress={() => syncWithServer()} 
            style={styles.syncBtn}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color={Colors.accent} />
            ) : (
              <RotateCw size={12} color={Colors.textSecondary as any} />
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar Group */}
        <View style={styles.searchBarRow}>
          <View style={styles.searchContainer}>
            <Search size={18} color={Colors.textSecondary as any} style={styles.searchIcon} />
            <TextInput
              value={localQuery}
              onChangeText={handleSearchChange}
              placeholder="Search Name, Code, or Barcode..."
              placeholderTextColor={Colors.textSecondary}
              style={styles.searchInput}
            />
            {localQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch} style={styles.clearBtn}>
                <X size={16} color={Colors.textSecondary as any} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            onPress={() => router.push('/scanner')}
            style={styles.scanBtn}
          >
            <ScanBarcode size={22} color={Colors.background as any} />
          </TouchableOpacity>
        </View>

        {/* Categories Scroller */}
        <View style={styles.categoriesRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => handleCategoryPress(cat)}
                  style={[
                    styles.categoryTab,
                    isSelected && styles.categoryTabSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected && styles.categoryTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Filters and Sorting Bar */}
        <View style={styles.filterBar}>
          <Text style={styles.resultsCount}>
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
          </Text>
          
          <TouchableOpacity 
            onPress={() => setShowSortOptions(!showSortOptions)}
            style={styles.sortToggle}
          >
            <SlidersHorizontal size={14} color={Colors.accent as any} style={{ marginRight: 6 }} />
            <Text style={styles.sortToggleText}>
              {sortBy === 'name_asc' && 'Name (A-Z)'}
              {sortBy === 'price_asc' && 'Price (Low-High)'}
              {sortBy === 'price_desc' && 'Price (High-Low)'}
            </Text>
            <ChevronDown size={14} color={Colors.textSecondary as any} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* Sorting Dropdown Mock Sheet */}
        {showSortOptions && (
          <View style={styles.sortDropdown}>
            <TouchableOpacity 
              onPress={() => { setSortBy('name_asc'); setShowSortOptions(false); }}
              style={[styles.sortOption, sortBy === 'name_asc' && styles.sortOptionSelected]}
            >
              <Text style={[styles.sortOptionText, sortBy === 'name_asc' && styles.sortOptionTextSelected]}>Name (A-Z)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => { setSortBy('price_asc'); setShowSortOptions(false); }}
              style={[styles.sortOption, sortBy === 'price_asc' && styles.sortOptionSelected]}
            >
              <Text style={[styles.sortOptionText, sortBy === 'price_asc' && styles.sortOptionTextSelected]}>Price (Low to High)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => { setSortBy('price_desc'); setShowSortOptions(false); }}
              style={[styles.sortOption, sortBy === 'price_desc' && styles.sortOptionSelected]}
            >
              <Text style={[styles.sortOptionText, sortBy === 'price_desc' && styles.sortOptionTextSelected]}>Price (High to Low)</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Products FlatList with optimizations for low-end devices */}
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={(item: Product) => item._id}
          getItemLayout={getItemLayout}
          maxToRenderPerBatch={8}
          windowSize={5}
          initialNumToRender={8}
          removeClippedSubviews={true}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isSyncing}
              onRefresh={() => syncWithServer()}
              tintColor={Colors.accent}
              colors={[Colors.accent]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search filters or check your spelling.
              </Text>
            </View>
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mainView: {
    flex: 1,
  },
  headerBtn: {
    padding: 8,
    marginRight: 8,
  },
  syncContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#0A0A0A',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  syncText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  syncBtn: {
    padding: 4,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    height: '100%',
  },
  clearBtn: {
    padding: 4,
  },
  scanBtn: {
    width: 48,
    height: 48,
    backgroundColor: Colors.text, // White scanner button
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  categoriesRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  categoriesScroll: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 4,
  },
  categoryTabSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentLight,
  },
  categoryText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: Colors.accent,
    fontWeight: '600',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sortToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161616',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  sortDropdown: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sortOption: {
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  sortOptionSelected: {
    backgroundColor: 'rgba(10, 132, 255, 0.05)',
  },
  sortOptionText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  sortOptionTextSelected: {
    color: Colors.accent,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
