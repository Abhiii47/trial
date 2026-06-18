import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Colors } from '../theme/colors';
import { Product, useProductStore } from '../store/useProductStore';
import { useAuthStore } from '../store/useAuthStore';
import { getApiUrl } from '../services/api';
import { X, Trash2, Camera } from 'lucide-react-native';

const XIcon = X as any;
const Trash2Icon = Trash2 as any;
const CameraIcon = Camera as any;

interface AddEditProductModalProps {
  visible: boolean;
  onClose: () => void;
  product?: Product | null; // If null, we are in "Add" mode
  onBarcodeScanRequested?: () => void;
  scannedBarcode?: string | null;
}

interface FormData {
  productName: string;
  productCode: string;
  barcode: string;
  category: string;
  brand: string;
  price: string;
}

export const AddEditProductModal: React.FC<AddEditProductModalProps> = ({
  visible,
  onClose,
  product,
  onBarcodeScanRequested,
  scannedBarcode,
}) => {
  const token = useAuthStore((state) => state.token);
  const addProductStore = useProductStore((state) => state.addProduct);
  const updateProductStore = useProductStore((state) => state.updateProduct);
  const deleteProductStore = useProductStore((state) => state.deleteProduct);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      productName: '',
      productCode: '',
      barcode: '',
      category: '',
      brand: '',
      price: '',
    },
  });

  // Populate form if editing
  useEffect(() => {
    if (visible) {
      if (product) {
        reset({
          productName: product.productName,
          productCode: product.productCode,
          barcode: product.barcode || '',
          category: product.category,
          brand: product.brand,
          price: product.price.toString(),
        });
      } else {
        reset({
          productName: '',
          productCode: '',
          barcode: scannedBarcode || '',
          category: '',
          brand: '',
          price: '',
        });
      }
    }
  }, [product, visible, reset]);

  // Set barcode if scanned while modal is active
  useEffect(() => {
    if (scannedBarcode) {
      setValue('barcode', scannedBarcode);
    }
  }, [scannedBarcode, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const API_URL = getApiUrl();
      const body = {
        ...data,
        price: Number(data.price),
      };

      const url = product ? `${API_URL}/products/${product._id}` : `${API_URL}/products`;
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Operation failed');
      }

      if (product) {
        updateProductStore(product._id, result.data);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        addProductStore(result.data);
        Alert.alert('Success', 'Product added successfully');
      }
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${product.productName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const API_URL = getApiUrl();
              const response = await fetch(`${API_URL}/products/${product._id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'Failed to delete');
              }

              deleteProductStore(product._id);
              Alert.alert('Deleted', 'Product has been removed');
              onClose();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to delete product');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheetContainer}
        >
          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>
              {product ? 'Edit Product' : 'Add Product'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <XIcon size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContainer}
          >
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Name</Text>
              <Controller
                control={control}
                rules={{ required: 'Product name is required' }}
                name="productName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.productName && styles.inputError]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="e.g. Havells Life Line 1.5 SQ mm"
                    placeholderTextColor={Colors.textSecondary}
                  />
                )}
              />
              {errors.productName && (
                <Text style={styles.errorText}>{errors.productName.message}</Text>
              )}
            </View>

            {/* Code */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Code (Unique)</Text>
              <Controller
                control={control}
                rules={{ required: 'Product code is required' }}
                name="productCode"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.productCode && styles.inputError]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="e.g. HW-15-RD"
                    placeholderTextColor={Colors.textSecondary}
                    autoCapitalize="characters"
                  />
                )}
              />
              {errors.productCode && (
                <Text style={styles.errorText}>{errors.productCode.message}</Text>
              )}
            </View>

            {/* Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price (₹)</Text>
              <Controller
                control={control}
                rules={{
                  required: 'Price is required',
                  pattern: {
                    value: /^\d+(\.\d{1,2})?$/,
                    message: 'Please enter a valid price',
                  },
                }}
                name="price"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.price && styles.inputError]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="e.g. 1540"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                  />
                )}
              />
              {errors.price && (
                <Text style={styles.errorText}>{errors.price.message}</Text>
              )}
            </View>

            {/* Barcode */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Barcode (Optional)</Text>
              <View style={styles.barcodeInputRow}>
                <Controller
                  control={control}
                  name="barcode"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, styles.barcodeInput]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="e.g. 8901786151011"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="numeric"
                    />
                  )}
                />
                <TouchableOpacity
                  onPress={onBarcodeScanRequested}
                  style={styles.scanInlineBtn}
                >
                  <CameraIcon size={18} color={Colors.accent} />
                  <Text style={styles.scanInlineText}>Scan</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <Controller
                control={control}
                rules={{ required: 'Category is required' }}
                name="category"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.category && styles.inputError]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="e.g. Wires & Cables"
                    placeholderTextColor={Colors.textSecondary}
                  />
                )}
              />
              {errors.category && (
                <Text style={styles.errorText}>{errors.category.message}</Text>
              )}
            </View>

            {/* Brand */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Brand</Text>
              <Controller
                control={control}
                rules={{ required: 'Brand is required' }}
                name="brand"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.brand && styles.inputError]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="e.g. Havells"
                    placeholderTextColor={Colors.textSecondary}
                  />
                )}
              />
              {errors.brand && (
                <Text style={styles.errorText}>{errors.brand.message}</Text>
              )}
            </View>

            {/* Buttons */}
            <View style={styles.actionButtons}>
              {product && (
                <TouchableOpacity
                  disabled={isDeleting || isSubmitting}
                  onPress={handleDelete}
                  style={[styles.button, styles.deleteButton]}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Trash2Icon size={16} color="#FFF" />
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                disabled={isSubmitting || isDeleting}
                onPress={handleSubmit(onSubmit)}
                style={[
                  styles.button,
                  styles.saveButton,
                  product ? styles.flexButton : styles.fullWidthButton,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {product ? 'Save Changes' : 'Create Product'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: '90%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
  },
  inputError: {
    borderColor: Colors.error,
  },
  barcodeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barcodeInput: {
    flex: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
  },
  scanInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48, // matching Input height approx
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 12,
  },
  scanInlineText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  flexButton: {
    flex: 1,
    marginLeft: 10,
  },
  fullWidthButton: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: Colors.text, // Pure white for a striking action button in dark theme
  },
  saveButtonText: {
    color: Colors.background, // Pure black text on white button
    fontSize: 15,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: Colors.error,
    width: 100,
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
});
