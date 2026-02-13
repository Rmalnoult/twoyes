import { View, Text, TouchableOpacity } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
        <Icon size={40} color="#9ca3af" />
      </View>
      <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
        {title}
      </Text>
      <Text className="text-base text-gray-600 text-center mb-8 leading-relaxed">
        {description}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          className="bg-primary-600 rounded-2xl py-3 px-8"
          onPress={onAction}
        >
          <Text className="text-white font-semibold text-lg">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
