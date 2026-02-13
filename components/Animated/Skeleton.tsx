import { View, ViewProps } from 'react-native';

interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 10, style }: SkeletonProps) {
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#f3f4f6',
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Skeleton width={40} height={40} borderRadius={12} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={12} />
        </View>
      </View>
      <Skeleton width="100%" height={14} style={{ marginBottom: 6 }} />
      <Skeleton width="80%" height={14} />
    </View>
  );
}

export function SkeletonNameCard() {
  return (
    <View style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Skeleton width={44} height={44} borderRadius={14} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Skeleton width="50%" height={20} style={{ marginBottom: 8 }} />
          <Skeleton width="80%" height={14} style={{ marginBottom: 8 }} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Skeleton width={60} height={22} borderRadius={6} />
            <Skeleton width={60} height={22} borderRadius={6} />
          </View>
        </View>
      </View>
    </View>
  );
}
