import ProductCard from '@/components/ProductCard';
import { useLogin } from '@/informations/loginContext';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CategoryProductsScreen() {
  const router = useRouter();
  const C = useThemeColors();
  const styles = useMemo(() => mkStyles(C), [C]);
  const { users } = useLogin();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, categories } = useApiCreate();
  const [search, setSearch] = useState('');

  const categoryId = Number(id);
  const category = categories.find((c) => c.id === categoryId);
  const categoryProducts = products.filter((p) => p.category_id === categoryId);
  const filtered = Array.isArray(categoryProducts)
    ? categoryProducts.filter(
        (p) =>
          !search ||
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : [];

  const handleProduct = (productId: string | number) => {
    if (users) {
      router.push({ pathname: '/[id]', params: { id: String(productId) } });
    } else {
      router.push('/(tab)/login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </Pressable>
        <View>
          <Text style={styles.title}>{category?.category_name ?? 'Category'}</Text>
          <Text style={styles.subtitle}>{filtered.length} products</Text>
        </View>
      </View>

      {/* ─── Search ─── */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={C.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search in category..."
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

      {/* ─── Grid ─── */}
      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="bag-outline" size={64} color={C.textMuted} />
            <Text style={styles.emptyText}>No products in this category</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard item={item} onPress={handleProduct} />
        )}
      />
    </SafeAreaView>
  );
}

function mkStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl, marginTop: 40 },
    header: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.md, paddingBottom: Spacing.sm,
    },
    backBtn: { marginRight: Spacing.md, padding: Spacing.xs },
    title: { ...Typography.h2, color: C.text },
    subtitle: { ...Typography.caption, color: C.textSecondary, marginTop: 2 },
    searchBox: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface,
      marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
      paddingHorizontal: Spacing.md, borderRadius: Radius.lg, height: 48, ...Shadows.sm,
    },
    searchInput: { flex: 1, marginLeft: Spacing.sm, ...Typography.body, color: C.text },
    gridRow: { justifyContent: 'space-between', paddingHorizontal: Spacing.lg },
    gridContent: { paddingBottom: 100, gap: Spacing.md },
    emptyText: { ...Typography.body, color: C.textSecondary, marginTop: Spacing.md },
  });
}
