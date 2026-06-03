import ProductCard from "@/components/ProductCard";
import { useLogin } from "@/informations/loginContext";
import { useApiCreate } from "@/informations/providerData";
import { Colors, Radius, Spacing, Typography } from "@/informations/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - Spacing.lg * 3) / 2;

// ─── Constants ───

export default function HomeScreen() {
  const router = useRouter();
  const { users } = useLogin();
  const { products, categories, loading, isError } = useApiCreate();
  const [search, setSearch] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const handleCategoryClick = (categoryId: number) => {
    console.log("📂 [Home] Selected category_id:", categoryId);
    setActiveCategoryId(categoryId);
  };

  const filteredProducts = Array.isArray(products)
    ? products.filter((p) => {
      const matchesSearch =
        !search || p.name?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategoryId === null || p.category_id === activeCategoryId;
      return matchesSearch && matchesCategory;
    })
    : [];

  const handleProduct = (id: number | string) => {
    if (users) {
      router.push({ pathname: "/[id]", params: { id: String(id) } });
    } else {
      router.push("/(tab)/login");
    }
  };

  // ─── Error State ───
  if (isError) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <MaterialCommunityIcons
          name="wifi-off"
          size={80}
          color={Colors.textMuted}
        />
        <Text style={styles.errorTitle}>No Connection</Text>
        <Text style={styles.errorSub}>Check your internet and try again</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greeting}>Welcome</Text>
            <Text style={styles.userName}>{users?.username || "Guest"}</Text>
          </View>
          <Pressable onPress={() => router.push("/(tab)/cart")}>
            <Ionicons name="bag" size={24} color={Colors.primary} />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
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
            <Pressable onPress={() => setSearch("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={Colors.textMuted}
              />
            </Pressable>
          )}
        </View>

        {/* ─── Category Filter ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            {activeCategoryId !== null && (
              <Pressable onPress={() => setActiveCategoryId(null)}>
                <Text style={styles.clearFilter}>Clear Filter</Text>
              </Pressable>
            )}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    console.log("📂 [Home] Selected category_id:", cat.id);
                    setActiveCategoryId(cat.id);
                  }}
                  style={[
                    styles.categoryChip,
                    activeCategoryId === cat.id && styles.categoryChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      activeCategoryId === cat.id &&
                      styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.category_name}
                  </Text>
                  {activeCategoryId === cat.id && (
                    <Text style={styles.categoryChipBadge}>{cat.id}</Text>
                  )}
                </Pressable>
              ))
            ) : (
              <Text style={styles.noCategories}>No categories available</Text>
            )}
          </ScrollView>
          {activeCategoryId && (
            <Text style={styles.activeFilterInfo}>
              ✅ Filtering by category_id: {activeCategoryId}
            </Text>
          )}
        </View>

        {/* ─── Products Grid ─── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {activeCategoryId
              ? `Category ${activeCategoryId}`
              : "Featured Products"}
          </Text>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : filteredProducts.length > 0 ? (
            <View style={styles.gridRow}>
              {filteredProducts.slice(0, 2).map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onPress={(id) => handleProduct(id)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.center}>
              <Ionicons name="bag-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          )}

          {filteredProducts.length > 2 && (
            <Pressable
              style={({ pressed }) => [
                styles.viewAllBtn,
                pressed && styles.viewAllBtnPressed,
              ]}
              onPress={() => router.push("/(tab)/products")}
            >
              <Text style={styles.viewAllBtnText}>View All Products</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  greetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  userName: {
    ...Typography.h3,
    color: Colors.text,
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
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  clearFilter: {
    ...Typography.body,
    color: Colors.primary,
  },
  categoriesContent: {
    paddingRight: Spacing.lg,
    gap: Spacing.md,
  },
  categoryChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginRight: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    ...Typography.body,
    color: Colors.text,
  },
  categoryChipTextActive: {
    color: Colors.textOnPrimary,
  },
  categoryChipBadge: {
    ...Typography.caption,
    color: Colors.textOnPrimary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  activeFilterInfo: {
    ...Typography.caption,
    color: Colors.success,
    marginTop: Spacing.md,
    textAlign: "center",
  },
  noCategories: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
    marginTop: Spacing.lg,
  },
  viewAllBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  viewAllBtnPressed: {
    opacity: 0.7,
  },
  viewAllBtnText: {
    ...Typography.body,
    color: Colors.primary,
  },
  errorTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginTop: Spacing.lg,
  },
  errorSub: {
    ...Typography.body,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
});
