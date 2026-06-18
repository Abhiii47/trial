import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Vibration } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Colors } from '../src/theme/colors';
import { useProductStore } from '../src/store/useProductStore';
import { useAuthStore } from '../src/store/useAuthStore';
import { X, Zap, ZapOff, Plus } from 'lucide-react-native';

export default function BarcodeScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState<boolean>(false);
  
  // Local matched product state
  const [matchedProduct, setMatchedProduct] = useState<any>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  const products = useProductStore((state) => state.products);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    // Camera permissions are still loading
    return <View style={styles.loadingContainer}><Text style={styles.text}>Loading Camera...</Text></View>;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Camera Access Required</Text>
        <Text style={styles.subtitle}>
          We need your permission to open the camera and scan product barcodes.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeBtnText} onPress={() => router.back()}>
          <Text style={{ color: Colors.textSecondary }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    Vibration.vibrate(100);

    // Search local database
    const matched = products.find((p) => p.barcode === data);
    setScannedCode(data);

    if (matched) {
      setMatchedProduct(matched);
    } else {
      setMatchedProduct(null);
    }
  };

  const handleRescan = () => {
    setScanned(false);
    setMatchedProduct(null);
    setScannedCode(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torch}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
        }}
      >
        {/* Top Controls */}
        <View style={styles.overlayTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.controlBtn}>
            <X size={22} color={Colors.text as any} />
          </TouchableOpacity>
          
          <Text style={styles.scanTitle}>Scan Product Barcode</Text>
          
          <TouchableOpacity onPress={() => setTorch(!torch)} style={styles.controlBtn}>
            {torch ? <Zap size={22} color={Colors.accent as any} /> : <ZapOff size={22} color={Colors.text as any} />}
          </TouchableOpacity>
        </View>

        {/* Viewfinder Target area */}
        <View style={styles.viewfinderContainer}>
          <View style={[styles.viewfinder, scanned && styles.viewfinderScanned]}>
            {!scanned && <View style={styles.scannerLine} />}
          </View>
        </View>

        <View style={styles.overlayBottom} />
      </CameraView>

      {/* Result Cards Overlay */}
      {scanned && (
        <View style={styles.resultContainer}>
          {matchedProduct ? (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultCategory}>{matchedProduct.category.toUpperCase()}</Text>
                <Text style={styles.resultBrand}>{matchedProduct.brand}</Text>
              </View>
              
              <Text style={styles.resultName}>{matchedProduct.productName}</Text>
              <Text style={styles.resultCode}>Code: {matchedProduct.productCode}</Text>
              
              <Text style={styles.resultPrice}>{formatPrice(matchedProduct.price)}</Text>

              <View style={styles.resultActions}>
                <TouchableOpacity onPress={handleRescan} style={[styles.actionBtn, styles.rescanBtn]}>
                  <Text style={styles.rescanBtnText}>Scan Next</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    // Navigate to home search with prefilled search code
                    useProductStore.getState().setSearchQuery(matchedProduct.productCode);
                    router.dismissAll();
                  }}
                  style={[styles.actionBtn, styles.viewBtn]}
                >
                  <Text style={styles.viewBtnText}>View in Catalog</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.resultCard}>
              <Text style={styles.notFoundTitle}>Barcode Not Found</Text>
              <Text style={styles.notFoundSubtitle}>
                No product matches the scanned code: {'\n'}
                <Text style={{ fontFamily: 'monospace', fontWeight: 'bold', color: Colors.text }}>{scannedCode}</Text>
              </Text>

              <View style={styles.resultActions}>
                <TouchableOpacity onPress={handleRescan} style={[styles.actionBtn, styles.rescanBtn, { flex: 1 }]}>
                  <Text style={styles.rescanBtnText}>Try Again</Text>
                </TouchableOpacity>
                
                {isAuthenticated && (
                  <TouchableOpacity
                    onPress={() => {
                      // Redirect back to dashboard, prefills barcode
                      router.replace({
                        pathname: '/(admin)/dashboard',
                        params: { newBarcode: scannedCode }
                      });
                    }}
                    style={[styles.actionBtn, styles.addBtn]}
                  >
                    <Plus size={16} color={"#000" as any} style={{ marginRight: 6 }} />
                    <Text style={styles.addBtnText}>Add Product</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 30,
    lineHeight: 20,
  },
  text: {
    color: '#FFF',
  },
  permissionBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  permissionBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  closeBtnText: {
    padding: 10,
  },
  overlayTop: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  viewfinderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  viewfinder: {
    width: 280,
    height: 200,
    borderWidth: 2,
    borderColor: '#FFF',
    borderRadius: 16,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinderScanned: {
    borderColor: Colors.price,
  },
  scannerLine: {
    width: '100%',
    height: 2,
    backgroundColor: Colors.accent,
    position: 'absolute',
    top: 0,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'transparent',
  },
  resultContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'transparent',
  },
  resultCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultCategory: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.accent,
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resultBrand: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  resultName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  resultCode: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  resultPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.price,
    marginBottom: 16,
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rescanBtn: {
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 10,
  },
  rescanBtnText: {
    color: Colors.text,
    fontWeight: '600',
  },
  viewBtn: {
    backgroundColor: Colors.accent,
  },
  viewBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.error,
    marginBottom: 8,
  },
  notFoundSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  addBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    flexDirection: 'row',
  },
  addBtnText: {
    color: '#000',
    fontWeight: '600',
  },
});
