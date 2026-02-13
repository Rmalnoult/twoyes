# State Management & Data Layer

This document explains how state management and data fetching work in TwoYes.

## Architecture Overview

We use a hybrid approach:
- **Zustand** for client-side state (auth, preferences)
- **TanStack Query (React Query)** for server state (API data, caching)
- **Supabase** for backend (auth, database, storage)
- **AsyncStorage** for persistence

## Client State (Zustand)

### Location
`/store/index.ts`

### Usage

```typescript
import { useStore, useAuth, usePreferences } from '@/store';

function MyComponent() {
  // Use the whole store (not recommended)
  const { user, theme } = useStore();

  // Better: Use specific slices
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = usePreferences();

  return (
    <View>
      {isAuthenticated ? (
        <Text>Welcome {user?.display_name}</Text>
      ) : (
        <Text>Please sign in</Text>
      )}
      <Text>Theme: {theme}</Text>
    </View>
  );
}
```

### Adding New State

To add new client state, edit `/store/index.ts`:

```typescript
// 1. Define the interface
interface NewState {
  someValue: string;
  setSomeValue: (value: string) => void;
}

// 2. Add to StoreState type
type StoreState = AuthState & PreferencesState & NewState;

// 3. Add to store implementation
export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // ... existing state ...
      someValue: '',
      setSomeValue: (someValue) => set({ someValue }),
    }),
    {
      // ... persist config ...
    }
  )
);
```

## Server State (TanStack Query)

### Query Hooks

Located in `/hooks/*.ts` files. Example: `/hooks/useNames.ts`

### Usage

```typescript
import { useNames, useName, useAddFavorite } from '@/hooks/useNames';

function BrowseScreen() {
  // Fetch list of names with filters
  const { data: names, isLoading, error } = useNames({
    gender: 'girl',
    origins: ['english', 'french'],
    limit: 50,
  });

  // Fetch single name
  const { data: name } = useName(nameId);

  // Mutations (create, update, delete)
  const addFavorite = useAddFavorite();

  const handleFavorite = async (nameId: string, userId: string) => {
    try {
      await addFavorite.mutateAsync({ userId, nameId });
      // Success! Query cache automatically updated
    } catch (error) {
      console.error('Failed to add favorite:', error);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <FlatList
      data={names}
      renderItem={({ item }) => <NameCard name={item} onFavorite={handleFavorite} />}
    />
  );
}
```

### Creating New Query Hooks

1. Define query keys (for cache management):
```typescript
export const myKeys = {
  all: ['my-resource'] as const,
  lists: () => [...myKeys.all, 'list'] as const,
  list: (filters: any) => [...myKeys.lists(), filters] as const,
  details: () => [...myKeys.all, 'detail'] as const,
  detail: (id: string) => [...myKeys.details(), id] as const,
};
```

2. Create query hook:
```typescript
export function useMyResource(id: string) {
  return useQuery({
    queryKey: myKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('my_table')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

3. Create mutation hook:
```typescript
export function useUpdateMyResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('my_table')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: myKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: myKeys.lists() });
    },
  });
}
```

## Supabase Client

### Location
`/services/supabase.ts`

### Direct Usage (Advanced)

For complex queries not covered by hooks:

```typescript
import { supabase } from '@/services/supabase';

async function complexQuery() {
  const { data, error } = await supabase
    .from('names')
    .select(`
      *,
      user_favorites!inner(user_id),
      partner_matches(*)
    `)
    .eq('gender', 'unisex')
    .gte('popularity_rank_us', 100)
    .order('name', { ascending: true })
    .limit(20);

  if (error) throw error;
  return data;
}
```

### Real-time Subscriptions

```typescript
import { useEffect } from 'react';
import { supabase } from '@/services/supabase';

function PartnerMatches({ userId }: { userId: string }) {
  useEffect(() => {
    const channel = supabase
      .channel('partner-matches')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'partner_matches',
          filter: `user_a_id=eq.${userId}`,
        },
        (payload) => {
          console.log('New match!', payload);
          // Handle new match (show notification, update UI)
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return <View>{/* ... */}</View>;
}
```

## Custom API Client (axios)

### Location
`/services/api.ts`

### Usage

For custom API endpoints (AI features, external services):

```typescript
import apiClient from '@/services/api';

async function generateNameRecommendations(userId: string, preferences: any) {
  const response = await apiClient.post('/ai/recommendations', {
    userId,
    preferences,
  });

  return response.data;
}
```

The client automatically:
- Adds auth token from Supabase session
- Refreshes token if expired
- Handles 401 errors

## Best Practices

### 1. Query Keys
Always use consistent query keys for cache management:
```typescript
// ✅ Good - organized, typed
export const nameKeys = {
  all: ['names'] as const,
  list: (filters: any) => ['names', 'list', filters] as const,
};

// ❌ Bad - inconsistent
useQuery({ queryKey: ['names'], ... });
useQuery({ queryKey: ['name-list'], ... });
```

### 2. Stale Time
Set appropriate stale times based on data volatility:
```typescript
// Rarely changes - long stale time
useQuery({
  queryKey: nameKeys.detail(id),
  staleTime: 30 * 60 * 1000, // 30 minutes
});

// Frequently changes - short stale time
useQuery({
  queryKey: ['realtime-matches'],
  staleTime: 0, // Always fetch fresh
});
```

### 3. Error Handling
Always handle errors in mutations:
```typescript
const mutation = useMutation({
  mutationFn: myMutationFn,
  onError: (error) => {
    console.error('Mutation failed:', error);
    // Show toast/alert to user
  },
});
```

### 4. Loading States
Show proper loading indicators:
```typescript
const { data, isLoading, isFetching, error } = useQuery(...);

if (isLoading) return <LoadingSpinner />; // Initial load
if (error) return <ErrorMessage />;

return (
  <View>
    {isFetching && <RefreshIndicator />} {/* Background refetch */}
    {/* ... content ... */}
  </View>
);
```

## Debugging

### React Query DevTools

Currently not available for React Native. Monitor queries via:
```typescript
import { useQueryClient } from '@tanstack/react-query';

function DebugButton() {
  const queryClient = useQueryClient();

  const logCache = () => {
    console.log('Query Cache:', queryClient.getQueryCache().getAll());
  };

  return <Button onPress={logCache} title="Log Query Cache" />;
}
```

### Zustand DevTools

View store state:
```typescript
import { useStore } from '@/store';

function DebugButton() {
  const store = useStore();

  const logStore = () => {
    console.log('Store State:', store);
  };

  return <Button onPress={logStore} title="Log Store State" />;
}
```
