import type { SVGProps } from 'react';

// lucide-react-native icons accept React Native style props (color, size, strokeWidth)
// Override the module's typing to allow color prop everywhere
declare module 'lucide-react-native' {
  import { FC } from 'react';

  export interface LucideProps {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
    style?: any;
  }

  type LucideIcon = FC<LucideProps>;

  export const Activity: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const Barcode: LucideIcon;
  export const Bolt: LucideIcon;
  export const BoltOff: LucideIcon;
  export const Camera: LucideIcon;
  export const Check: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const FolderOpen: LucideIcon;
  export const Hash: LucideIcon;
  export const History: LucideIcon;
  export const Lock: LucideIcon;
  export const LogOut: LucideIcon;
  export const Mail: LucideIcon;
  export const Package: LucideIcon;
  export const Plus: LucideIcon;
  export const RotateCw: LucideIcon;
  export const Scan: LucideIcon;
  export const ScanBarcode: LucideIcon;
  export const Search: LucideIcon;
  export const Shield: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const ShoppingBag: LucideIcon;
  export const SlidersHorizontal: LucideIcon;
  export const Trash2: LucideIcon;
  export const User: LucideIcon;
  export const X: LucideIcon;
  export const Zap: LucideIcon;
  export const ZapOff: LucideIcon;
}
