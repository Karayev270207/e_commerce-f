import { resolveImageUrl } from "@/informations/cloudinary";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProductDetail() {
  const router = useRouter();
  const C = useThemeColors();
  const styles = useMemo(() => mkStyles(C), [C]);
  const { users } = useLogin();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, addToCart, cartLoading } = useApiCreate();
  const insets = useSafeAreaInsets();
  const [isAdding, setIsAdding] = useState(false);
  const product = products.find((p) => p.id == Number(id));

  useEffect(() => {
    if (!users) {
      const timer = setTimeout(() => { router.replace("/(tab)/login"); }, 100);
      return () => clearTimeout(timer);
    }
  }, [users, router]);

  if (!users) return null;

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Ionicons name="alert-circle-outline" size={64} color={C.textMuted} />
        <Text style={styles.notFoundText}>Product not found</Text>
      </SafeAreaView>
    );
  }

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(product);
      Alert.alert("Added to Cart", `${product.name} has been added to your cart!`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const inStock = (product.stock ?? 0) > 0;
  const resolvedImage = resolveImageUrl(product.image, process.env.EXPO_PUBLIC_API_URL);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* ─── Hero Image ─── */}
        <View style={styles.imageArea}>
          <Pressable
            style={[styles.backBtn, { top: insets.top + 8 }]}
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={22} color={C.text} />
          </Pressable>
          {resolvedImage ? (
            <Image source={{ uri: resolvedImage }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={80} color={C.textMuted} />
            </View>
          )}
        </View>

        {/* ─── Info Card ─── */}
        <View style={styles.infoCard}>
          <View style={styles.categoryRow}>
            <Text style={styles.category}>{product.category}</Text>
            <View style={[styles.stockBadge, inStock ? styles.stockIn : styles.stockOut]}>
              <Text style={[styles.stockText, { color: inStock ? C.success : C.error }]}>
                {inStock ? `${product.stock} in stock` : "Out of stock"}
              </Text>
            </View>
          </View>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{product.price} TMT</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {product.description ??
              "High quality product carefully selected for the best shopping experience. Order now and get fast delivery to your doorstep."}
          </Text>

          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="shield-checkmark" size={20} color={C.accent} />
              </View>
              <Text style={styles.featureText}>Quality</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="car" size={20} color={C.accent} />
              </View>
              <Text style={styles.featureText}>Fast Delivery</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="refresh" size={20} color={C.accent} />
              </View>
              <Text style={styles.featureText}>Easy Return</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ─── Bottom Bar ─── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.md }]}>
        <View>
          <Text style={styles.bottomLabel}>Price</Text>
          <Text style={styles.bottomPrice}>{product.price} TMT</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.addBtn,
            (pressed || isAdding || cartLoading) && styles.addBtnPressed,
            (isAdding || cartLoading) && styles.addBtnDisabled,
            !inStock && styles.addBtnDisabled,
          ]}
          onPress={handleAddToCart}
          disabled={isAdding || cartLoading || !inStock}
        >
          {isAdding || cartLoading ? (
            <>
              <ActivityIndicator size="small" color={C.textOnPrimary} />
              <Text style={styles.addBtnText}>Adding...</Text>
            </>
          ) : (
            <>
              <Ionicons name="bag-add" size={22} color={C.textOnPrimary} />
              <Text style={styles.addBtnText}>{inStock ? "Add to Cart" : "Out of Stock"}</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function mkStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    center: { alignItems: "center", justifyContent: "center" },

    imageArea: { width: "100%", height: 320, backgroundColor: C.surfaceAlt },
    image: { width: "100%", height: "100%" },
    imagePlaceholder: { flex: 1, alignItems: "center", justifyContent: "center" },
    backBtn: {
      position: "absolute", left: Spacing.lg, zIndex: 10,
      width: 38, height: 38, borderRadius: Radius.full,
      backgroundColor: C.surface, alignItems: "center", justifyContent: "center",
      ...Shadows.md,
    },

    infoCard: {
      backgroundColor: C.surface,
      borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
      marginTop: -20, padding: Spacing.xxl, minHeight: 300,
    },
    categoryRow: {
      flexDirection: "row", justifyContent: "space-between",
      alignItems: "center", marginBottom: Spacing.xs,
    },
    category: {
      ...Typography.small, color: C.accent,
      textTransform: "uppercase", letterSpacing: 1,
    },
    stockBadge: {
      paddingHorizontal: Spacing.sm, paddingVertical: 3,
      borderRadius: Radius.full,
    },
    stockIn: { backgroundColor: C.successLight },
    stockOut: { backgroundColor: C.errorLight },
    stockText: { ...Typography.small, fontWeight: "600" as const },

    name: { ...Typography.h1, color: C.text, marginTop: Spacing.xs },
    price: { ...Typography.price, color: C.primaryDark, marginTop: Spacing.sm },
    divider: { height: 1, backgroundColor: C.border, marginVertical: Spacing.lg },
    sectionTitle: { ...Typography.bodyBold, color: C.text, marginBottom: Spacing.sm },
    description: { ...Typography.body, color: C.textSecondary, lineHeight: 22 },

    featuresRow: {
      flexDirection: "row", justifyContent: "space-around",
      marginTop: Spacing.xxl, paddingTop: Spacing.lg,
      borderTopWidth: 1, borderTopColor: C.border,
    },
    featureItem: { alignItems: "center", gap: Spacing.xs },
    featureIcon: {
      width: 40, height: 40, borderRadius: Radius.md,
      backgroundColor: C.accentSurface, alignItems: "center", justifyContent: "center",
    },
    featureText: { ...Typography.small, color: C.textSecondary },

    notFoundText: { ...Typography.h3, color: C.textSecondary, marginTop: Spacing.md },

    bottomBar: {
      flexDirection: "row", justifyContent: "space-between", alignItems: "center",
      backgroundColor: C.surface, paddingHorizontal: Spacing.xxl, paddingTop: Spacing.lg,
      borderTopWidth: 1, borderTopColor: C.border, ...Shadows.lg,
    },
    bottomLabel: { ...Typography.caption, color: C.textMuted },
    bottomPrice: { ...Typography.price, color: C.text },
    addBtn: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: C.primary, paddingHorizontal: Spacing.xxl,
      paddingVertical: Spacing.md, borderRadius: Radius.lg,
      gap: Spacing.sm, ...Shadows.md,
    },
    addBtnPressed: { backgroundColor: C.primaryDark, transform: [{ scale: 0.97 }] },
    addBtnDisabled: { opacity: 0.6 },
    addBtnText: { ...Typography.button, color: C.textOnPrimary },
  });
}
