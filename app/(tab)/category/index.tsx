import { useApiCreate } from '@/informations/providerData';
import {
  useThemeColors,
  type ThemeColors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from '@/informations/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CategoryScreen() {
  const router = useRouter();
  const C = useThemeColors();
  const styles = useMemo(() => mkStyles(C), [C]);
  const { categories, products, isError, loading } = useApiCreate();
  const [search, setSearch] = useState('');

  const filteredCategories = Array.isArray(categories)
    ? categories.filter(
        (c) => !search || c.category_name?.toLowerCase().includes(search.toLowerCase()),
      )
    : [];

  if (isError) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <MaterialCommunityIcons name="wifi-off" size={80} color={C.textMuted} />
        <Text style={styles.errorTitle}>No Connection</Text>
        <Text style={styles.errorSub}>Check your internet and try again</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <Text style={styles.subtitle}>{categories.length} categories available</Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={C.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories..."
          placeholderTextColor={C.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={C.textMuted} />
          </Pressable>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="folder-open-outline" size={64} color={C.textMuted} />
              <Text style={styles.emptyText}>No categories found</Text>
            </View>
          }
          renderItem={({ item }) => {
            const productCount = products.filter((p) => p.category_id === item.id).length;
            return (
              <Pressable
                style={({ pressed }) => [styles.categoryCard, pressed && styles.cardPressed]}
                onPress={() =>
                  router.push({ pathname: '/(tab)/category/[id]', params: { id: String(item.id) } })
                }
              >
                <View style={styles.iconBox}>
                  <Ionicons name="grid" size={24} color={C.accent} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.category_name}</Text>
                  <Text style={styles.cardCount}>{productCount} Products</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

function mkStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
    header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
    title: { ...Typography.h1, color: C.text },
    subtitle: { ...Typography.caption, color: C.textSecondary, marginTop: 2 },
    searchBox: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface,
      marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
      paddingHorizontal: Spacing.md, borderRadius: Radius.lg, height: 48, ...Shadows.sm,
    },
    searchInput: { flex: 1, marginLeft: Spacing.sm, ...Typography.body, color: C.text },
    listContent: { paddingHorizontal: Spacing.lg, paddingBottom: 100, gap: Spacing.md },
    categoryCard: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.surface, padding: Spacing.md,
      borderRadius: Radius.lg, ...Shadows.sm,
    },
    cardPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
    iconBox: {
      width: 48, height: 48, borderRadius: Radius.md,
      backgroundColor: C.accentSurface, alignItems: 'center',
      justifyContent: 'center', marginRight: Spacing.md,
    },
    cardInfo: { flex: 1 },
    cardName: { ...Typography.bodyBold, color: C.text },
    cardCount: { ...Typography.small, color: C.textSecondary, marginTop: 2 },
    errorTitle: { ...Typography.h3, color: C.text, marginTop: Spacing.lg },
    errorSub: { ...Typography.body, color: C.textSecondary, marginTop: Spacing.xs },
    emptyText: { ...Typography.body, color: C.textSecondary, marginTop: Spacing.md },
  });
}
