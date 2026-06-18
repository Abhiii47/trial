import React from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { Colors } from '../theme/colors';
import { Product } from '../store/useProductStore';
import { Barcode, ChevronRight, Hash } from 'lucide-react-native';

const BarcodeIcon = Barcode as any;
const ChevronRightIcon = ChevronRight as any;
const HashIcon = Hash as any;

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  showChevron?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, showChevron = false }) => {
  const animatedScale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale: animatedScale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }: any) => [
          styles.pressable,
          pressed && styles.pressedState
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.leftCol}>
            <Text numberOfLines={2} style={styles.productName}>
              {product.productName}
            </Text>
            
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <HashIcon size={12} color={Colors.textSecondary} style={styles.metaIcon} />
                <Text style={styles.metaText}>{product.productCode}</Text>
              </View>
              
              {product.barcode && (
                <View style={[styles.metaItem, styles.leftMargin]}>
                  <BarcodeIcon size={12} color={Colors.textSecondary} style={styles.metaIcon} />
                  <Text style={styles.metaText}>{product.barcode}</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.rightCol}>
            <Text style={styles.priceText}>{formatPrice(product.price)}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{product.brand}</Text>
            </View>
            <View style={[styles.tag, styles.categoryTag]}>
              <Text style={styles.categoryTagText}>{product.category}</Text>
            </View>
          </View>
          
          {showChevron && (
            <ChevronRightIcon size={18} color={Colors.textSecondary} />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pressable: {
    padding: 16,
  },
  pressedState: {
    backgroundColor: Colors.cardSelected,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftCol: {
    flex: 1,
    paddingRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftMargin: {
    marginLeft: 12,
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  priceText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.price,
    letterSpacing: -0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  categoryTag: {
    marginLeft: 8,
    backgroundColor: Colors.accentLight,
    borderColor: 'rgba(10, 132, 255, 0.2)',
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accent,
  },
});
