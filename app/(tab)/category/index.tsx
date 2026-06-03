import ProductCard from '@/components/ProductCard';
import { useLogin } from '@/informations/loginContext';
import { useApiCreate } from '@/informations/providerData';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/informations/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.lg * 3) / 2;

export default function CategoryScreen() {
  const router = useRouter();
  const { users } = useLogin();
  const { products, isError, loading } = useApiCreate();
  const [search, setSearch] = useState('');

  const filtered = Array.isArray(products) ? products.filter(
    (p) => !search || p.name?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const handleProduct = (id: string) => {
    if (users) {
      router.push({ pathname: '/[id]', params: { id } });
    } else {
      router.push('/(tab)/login');
    }
  };

  if (isError) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <MaterialCommunityIcons name="wifi-off" size={80} color={Colors.textMuted} />
        <Text style={styles.errorTitle}>No Connection</Text>
        <Text style={styles.errorSub}>Check your internet and try again</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <Text style={styles.title}>Shop</Text>
        <Text style={styles.subtitle}>{products.length} products available</Text>
      </View>

      {/* ─── Search ─── */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* ─── Grid ─── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={(item) => String(item.id)}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="bag-outline" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ProductCard item={item} onPress={(id) => handleProduct(String(id))} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title: { ...Typography.h1, color: Colors.text },
  subtitle: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md, paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg, height: 48, ...Shadows.sm,
  },
  searchInput: { flex: 1, marginLeft: Spacing.sm, ...Typography.body, color: Colors.text },
  gridRow: { justifyContent: 'space-between', paddingHorizontal: Spacing.lg },
  gridContent: { paddingBottom: 100, gap: Spacing.md },
  card: {
    width: CARD_WIDTH, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    overflow: 'hidden', ...Shadows.md,
  },
  cardPressed: { opacity: 0.92, transform: [{ scale: 0.97 }] },
  imageBox: { width: '100%', height: CARD_WIDTH * 0.75, backgroundColor: Colors.surfaceAlt },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: Spacing.md },
  cardCategory: { ...Typography.small, color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.8 },
  cardName: { ...Typography.bodyBold, color: Colors.text, marginTop: 2 },
  cardPrice: { ...Typography.price, color: Colors.primaryDark, marginTop: Spacing.xs, fontSize: 16 },
  errorTitle: { ...Typography.h3, color: Colors.text, marginTop: Spacing.lg },
  errorSub: { ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.xs },
  emptyText: { ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.md },
});
