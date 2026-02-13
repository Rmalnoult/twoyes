import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.resetError);
      }

      return (
        <View className="flex-1 bg-white items-center justify-center px-6">
          <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-6">
            <AlertCircle size={40} color="#ef4444" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Oops! Something went wrong
          </Text>
          <Text className="text-base text-gray-600 text-center mb-8 leading-relaxed">
            We encountered an unexpected error. Please try again.
          </Text>
          <ScrollView className="max-h-40 w-full mb-6 bg-gray-50 rounded-2xl p-4">
            <Text className="text-xs font-mono text-gray-600">
              {this.state.error?.message || 'Unknown error'}
            </Text>
          </ScrollView>
          <TouchableOpacity
            className="bg-primary-600 rounded-2xl py-3 px-8 flex-row items-center"
            onPress={this.resetError}
          >
            <RefreshCw size={20} color="white" />
            <Text className="text-white font-semibold text-lg ml-2">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Functional error fallback component
export function ErrorFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-6">
        <AlertCircle size={40} color="#ef4444" />
      </View>
      <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
        Something went wrong
      </Text>
      <Text className="text-base text-gray-600 text-center mb-4">
        {error.message}
      </Text>
      <TouchableOpacity
        className="bg-primary-600 rounded-2xl py-3 px-8"
        onPress={resetError}
      >
        <Text className="text-white font-semibold text-lg">Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}
