import ProductCard from "@/components/ProductCard";
import { useLogin } from "@/informations/loginContext";
import { useApiCreate } from "@/informations/providerData";
import {
  useThemeColors,
  type ThemeColors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "@/informations/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function ProductsScreen() {
  const router = useRouter();
  const C = useThemeColors();
  const styles = useMemo(() => mkStyles(C), [C]);
  const { users } = useLogin();
  const { products, loading, isError } = useApiCreate();
  const [search, setSearch] = useState("");

  const filtered = Array.isArray(products)
    ? products.filter(
        (p) =>
          !search ||
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : [];

  const handleProduct = (id: number | string) => {
    if (users) {
      router.push({ pathname: "/[id]", params: { id: String(id) } });
    } else {
      router.push("/(tab)/login");
    }
  };

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
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <Text style={styles.title}>All Products</Text>
        <Text style={styles.subtitle}>{filtered.length} products found</Text>
      </View>

      {/* ─── Search ─── */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={C.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={C.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={20} color={C.textMuted} />
          </Pressable>
        )}
      </View>

      {/* ─── Grid ─── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primary} />
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
              <Ionicons name="bag-outline" size={64} color={C.textMuted} />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ProductCard item={item} onPress={(id) => handleProduct(id)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function mkStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    center: { justifyContent: "center", alignItems: "center", padding: Spacing.xxl },
    header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
    title: { ...Typography.h2, color: C.text, marginBottom: Spacing.xs },
    subtitle: { ...Typography.body, color: C.textMuted },
    searchBox: {
      flexDirection: "row", alignItems: "center",
      marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
      paddingHorizontal: Spacing.md, borderRadius: Radius.lg,
      backgroundColor: C.surface, gap: Spacing.sm,
      borderWidth: 1, borderColor: C.borderLight, ...Shadows.sm,
    },
    searchInput: { flex: 1, paddingVertical: Spacing.md, color: C.text, ...Typography.body },
    gridRow: { justifyContent: "space-between", paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
    gridContent: { paddingBottom: Spacing.xl },
    errorTitle: { ...Typography.h3, color: C.text, marginTop: Spacing.lg },
    errorSub: { ...Typography.body, color: C.textMuted, marginTop: Spacing.sm },
    emptyText: { ...Typography.body, color: C.textMuted, marginTop: Spacing.lg },
  });
}
