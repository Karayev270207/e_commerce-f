import { getProducts } from "@/informations/apiPort";
import {
  useThemeColors,
  type ThemeColors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "@/informations/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import { useMemo, useState } from "react";
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
  const C = useThemeColors();
  const styles = useMemo(() => mkStyles(C), [C]);
  const [brands, setBrands] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useFocusEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const products = await getProducts();
        const uniqueBrands = new Set<string>();
        products.forEach((p) => {
          if (p.brand_id) uniqueBrands.add(String(p.brand_id));
        });
        setBrands(uniqueBrands);
      } catch {
        // non-fatal
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
      <View style={styles.header}>
        <Text style={styles.title}>Brands</Text>
        <Text style={styles.subtitle}>{brandList.length} brands available</Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={C.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search brands..."
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

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={brandList}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="pricetags-outline" size={64} color={C.textMuted} />
              <Text style={styles.emptyText}>No brands found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable style={({ pressed }) => [styles.brandItem, pressed && styles.brandItemPressed]}>
              <View style={styles.brandIcon}>
                <Ionicons name="pricetag" size={24} color={C.primary} />
              </View>
              <View style={styles.brandContent}>
                <Text style={styles.brandName}>{item}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

function mkStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    center: { justifyContent: "center", alignItems: "center", flex: 1 },
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
    listContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
    brandItem: {
      flexDirection: "row", alignItems: "center",
      paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.md, borderRadius: Radius.md,
      backgroundColor: C.surface, ...Shadows.sm,
    },
    brandItemPressed: { opacity: 0.7 },
    brandIcon: {
      width: 48, height: 48, borderRadius: 24,
      backgroundColor: C.primarySurface,
      justifyContent: "center", alignItems: "center", marginRight: Spacing.md,
    },
    brandContent: { flex: 1 },
    brandName: { ...Typography.body, color: C.text },
    emptyText: { ...Typography.body, color: C.textMuted, marginTop: Spacing.lg },
  });
}
