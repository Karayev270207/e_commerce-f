import ProductCard from "@/components/ProductCard";
import { getBrands } from "@/informations/apiPort";
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
import { TypeBrand } from "@/informations/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const C = useThemeColors();
  const styles = useMemo(() => mkStyles(C), [C]);
  const { users } = useLogin();
  const { products, categories, loading, isError } = useApiCreate();
  const [search, setSearch] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [brands, setBrands] = useState<TypeBrand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [activeBrandId, setActiveBrandId] = useState<number | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setBrandsLoading(true);
        const data = await getBrands();
        setBrands(Array.isArray(data) ? data : []);
      } catch {
        // non-fatal
      } finally {
        setBrandsLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const filteredProducts = Array.isArray(products)
    ? products.filter((p) => {
        const matchesSearch =
          !search || p.name?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory =
          activeCategoryId === null || p.category_id === activeCategoryId;
        const matchesBrand =
          activeBrandId === null || p.brand_id === activeBrandId;
        return matchesSearch && matchesCategory && matchesBrand;
      })
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
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greeting}>Good day,</Text>
            <Text style={styles.userName}>{users?.username || "Guest"}</Text>
          </View>
          <View style={styles.headerActions}>
            {users && (
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {users.username?.[0]?.toUpperCase() ?? "U"}
                </Text>
              </View>
            )}
            <Pressable
              onPress={() => router.push("/(tab)/cart")}
              style={styles.cartBtn}
            >
              <Ionicons name="bag" size={22} color={C.primary} />
            </Pressable>
          </View>
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
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ─── Brands ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Brands</Text>
            {activeBrandId !== null && (
              <Pressable onPress={() => setActiveBrandId(null)}>
                <Text style={styles.clearFilter}>Clear</Text>
              </Pressable>
            )}
          </View>
          {brandsLoading ? (
            <ActivityIndicator
              size="small"
              color={C.primary}
              style={{ marginVertical: Spacing.md }}
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsContent}
            >
              {brands.length > 0 ? (
                brands.map((brand) => (
                  <Pressable
                    key={brand.id}
                    onPress={() =>
                      setActiveBrandId(
                        activeBrandId === brand.id ? null : brand.id,
                      )
                    }
                    style={[
                      styles.brandChip,
                      activeBrandId === brand.id && styles.brandChipActive,
                    ]}
                  >
                    <Ionicons
                      name="pricetag"
                      size={13}
                      color={
                        activeBrandId === brand.id ? C.textOnPrimary : C.primary
                      }
                    />
                    <Text
                      style={[
                        styles.brandChipText,
                        activeBrandId === brand.id && styles.chipTextActive,
                      ]}
                    >
                      {brand.brand_name}
                    </Text>
                  </Pressable>
                ))
              ) : (
                <Text style={styles.noItems}>No brands available</Text>
              )}
            </ScrollView>
          )}
        </View>

        {/* ─── Categories ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            {activeCategoryId !== null && (
              <Pressable onPress={() => setActiveCategoryId(null)}>
                <Text style={styles.clearFilter}>Clear</Text>
              </Pressable>
            )}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContent}
          >
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() =>
                    setActiveCategoryId(
                      activeCategoryId === cat.id ? null : cat.id,
                    )
                  }
                  style={[
                    styles.categoryChip,
                    activeCategoryId === cat.id && styles.categoryChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      activeCategoryId === cat.id && styles.chipTextActive,
                    ]}
                  >
                    {cat.category_name}
                  </Text>
                </Pressable>
              ))
            ) : (
              <Text style={styles.noItems}>No categories</Text>
            )}
          </ScrollView>
        </View>

        {/* ─── Products ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeCategoryId || activeBrandId
                ? "Filtered Products"
                : "Featured Products"}
            </Text>
            <Text style={styles.productCount}>
              {filteredProducts.length} items
            </Text>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={C.primary} />
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
              <Ionicons name="bag-outline" size={48} color={C.textMuted} />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          )}

          {filteredProducts.length > 2 && (
            <Pressable
              style={({ pressed }) => [
                styles.viewAllBtn,
                pressed && styles.viewAllBtnPressed,
              ]}
              onPress={() => router.push("/(tab)/product/products")}
            >
              <Text style={styles.viewAllBtnText}>View All Products</Text>
              <Ionicons name="arrow-forward" size={20} color={C.primary} />
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function mkStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    center: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: Spacing.xl,
    },

    // Header
    header: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.sm,
      backgroundColor: C.surface,
      borderBottomWidth: 1,
      borderBottomColor: C.borderLight,
      ...Shadows.sm,
    },
    greetingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: Spacing.md,
    },
    greeting: { ...Typography.body, color: C.textMuted },
    userName: { ...Typography.h3, color: C.text },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
    },
    userAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: C.accentSurface,
      borderWidth: 2,
      borderColor: C.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    userAvatarText: {
      ...Typography.captionBold,
      color: C.accent,
    },
    cartBtn: {
      width: 40,
      height: 40,
      borderRadius: Radius.full,
      backgroundColor: C.primarySurface,
      alignItems: "center",
      justifyContent: "center",
      ...Shadows.sm,
    },

    // Search
    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.md,
      borderRadius: Radius.lg,
      backgroundColor: C.surfaceAlt,
      gap: Spacing.sm,
      borderWidth: 1,
      borderColor: C.borderLight,
    },
    searchInput: {
      flex: 1,
      paddingVertical: Spacing.md,
      color: C.text,
      ...Typography.body,
    },

    // Sections
    section: { marginHorizontal: Spacing.lg, marginBottom: Spacing.xl, marginTop: Spacing.lg },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: Spacing.md,
    },
    sectionTitle: { ...Typography.h3, color: C.text },
    clearFilter: { ...Typography.body, color: C.accent },
    productCount: { ...Typography.caption, color: C.textMuted },
    noItems: { ...Typography.body, color: C.textMuted },
    chipsContent: { paddingRight: Spacing.lg },

    // Brand chips
    brandChip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.full,
      backgroundColor: C.surface,
      borderWidth: 1.5,
      borderColor: C.primary,
      marginRight: Spacing.sm,
      gap: Spacing.xs,
      ...Shadows.sm,
    },
    brandChipActive: { backgroundColor: C.primary, borderColor: C.primary },
    brandChipText: { ...Typography.captionBold, color: C.primary },

    // Category chips
    categoryChip: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.lg,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.borderLight,
      marginRight: Spacing.sm,
      ...Shadows.sm,
    },
    categoryChipActive: { backgroundColor: C.accent, borderColor: C.accent },
    categoryChipText: { ...Typography.body, color: C.text },
    chipTextActive: { color: "#fff" },

    // Products grid
    gridRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    emptyText: { ...Typography.body, color: C.textMuted, marginTop: Spacing.lg },
    viewAllBtn: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: Spacing.md,
      gap: Spacing.sm,
      backgroundColor: C.primarySurface,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: C.primary,
    },
    viewAllBtnPressed: { opacity: 0.7 },
    viewAllBtnText: { ...Typography.bodyBold, color: C.primary },

    // Error
    errorTitle: { ...Typography.h3, color: C.text, marginTop: Spacing.lg },
    errorSub: { ...Typography.body, color: C.textMuted, marginTop: Spacing.sm },
  });
}
