import { getProducts } from "@/informations/apiPort";
import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "@/informations/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BrandsScreen() {
  const [brands, setBrands] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useFocusEffect(() => {
    const fetchBrands = async () => {
      try {
        console.log("🏷️ [Brands] Fetching products to extract brands...");
        setLoading(true);
        const products = await getProducts();

        // Extract unique brands from products
        const uniqueBrands = new Set<string>();
        products.forEach((p) => {
          if (p.brand_id) {
            uniqueBrands.add(String(p.brand_id));
          }
        });

        setBrands(uniqueBrands);
        console.log("✅ [Brands] Found brands:", Array.from(uniqueBrands));
      } catch (error) {
        console.error("❌ [Brands] Failed to fetch brands:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  });

  const brandList = Array.from(brands).filter(
    (b) => !search || b.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <Text style={styles.title}>Brands</Text>
        <Text style={styles.subtitle}>{brandList.length} brands available</Text>
      </View>

      {/* ─── Search ─── */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search brands..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* ─── Brands List ─── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={brandList}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons
                name="pricetags-outline"
                size={64}
                color={Colors.textMuted}
              />
              <Text style={styles.emptyText}>No brands found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.brandItem,
                pressed && styles.brandItemPressed,
              ]}
            >
              <View style={styles.brandIcon}>
                <Ionicons name="pricetag" size={24} color={Colors.primary} />
              </View>
              <View style={styles.brandContent}>
                <Text style={styles.brandName}>{item}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textMuted}
              />
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    color: Colors.text,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  brandItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    ...Shadows.sm,
  },
  brandItemPressed: {
    opacity: 0.7,
  },
  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  brandContent: {
    flex: 1,
  },
  brandName: {
    ...Typography.body,
    color: Colors.text,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
    marginTop: Spacing.lg,
  },
});
