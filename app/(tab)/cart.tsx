import { resolveImageUrl } from "@/informations/cloudinary";
import { useApiCreate } from "@/informations/providerData";
import {
  useThemeColors,
  type ThemeColors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "@/informations/theme";
import { CartItem } from "@/informations/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CartScreen() {
  const router = useRouter();
  const C = useThemeColors();
  const styles = useMemo(() => mkStyles(C), [C]);
  const {
    cart, fetchCart, addToCart, minusCart, removeCart, clearCart,
    cartLoading, cartError, placeOrder,
  } = useApiCreate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );
  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  useEffect(() => { fetchCart(); }, []);

  const handleRemove = (id: number, name: string) => {
    Alert.alert("Remove Item", `Remove "${name}" from your cart?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try { await removeCart(id); } catch {
            Alert.alert("Error", "Failed to remove item from cart");
          }
        },
      },
    ]);
  };

  const handleOrder = async () => {
    if (cart.length === 0) return;
    if (!phone.trim() || !address.trim()) {
      Alert.alert("Missing Details", "Please enter your phone number and delivery address.");
      return;
    }
    Alert.alert(
      "Place Order",
      `Confirm order of ${totalItems} items for ${totalPrice.toFixed(2)} TMT?\n\nDelivery to:\n${address}\n${phone}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setIsPlacingOrder(true);
            try {
              await placeOrder(phone, address);
              Alert.alert("Order Placed!", "Your order has been successfully placed.");
            } catch (error) {
              Alert.alert("Order Failed", error instanceof Error ? error.message : "Failed to place order");
            } finally {
              setIsPlacingOrder(false);
            }
          },
        },
      ],
    );
  };

  if (cartError) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={80} color={C.error} />
        <Text style={[styles.emptyTitle, { color: C.error }]}>Cart Error</Text>
        <Text style={styles.emptySub}>{cartError}</Text>
        <Pressable style={[styles.orderBtn, { marginTop: Spacing.lg }]} onPress={() => clearCart()}>
          <Text style={styles.orderBtnText}>Clear Cart</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (cart.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Ionicons name="bag-outline" size={80} color={C.textMuted} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySub}>Browse our shop and add items you love!</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>My Cart</Text>
            <Text style={styles.subtitle}>{totalItems} items</Text>
          </View>
          <Pressable style={styles.ordersBtn} onPress={() => router.push("/(tab)/orders")}>
            <Ionicons name="receipt-outline" size={18} color={C.primary} />
            <Text style={styles.ordersBtnText}>My Orders</Text>
          </Pressable>
        </View>
      </View>

      {/* ─── Cart Items ─── */}
      <FlatList
        data={cart}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CartItemCard
            item={item}
            onAdd={() => addToCart(item)}
            onMinus={() => minusCart(item)}
            onRemove={() => handleRemove(item.id, item.name)}
            isLoading={cartLoading}
          />
        )}
      />

      {/* ─── Order Summary ─── */}
      <View style={styles.summaryCard}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={20} color={C.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="+993 6X XXXXXX"
              placeholderTextColor={C.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        </View>

        <View style={[styles.inputContainer, { marginBottom: Spacing.xl }]}>
          <Text style={styles.inputLabel}>Delivery Address</Text>
          <View style={[styles.inputWrapper, { height: 80, alignItems: "flex-start", paddingTop: Spacing.sm }]}>
            <Ionicons name="location-outline" size={20} color={C.textMuted} style={[styles.inputIcon, { marginTop: 2 }]} />
            <TextInput
              style={[styles.input, { height: 60, textAlignVertical: "top" }]}
              placeholder="Full delivery address"
              placeholderTextColor={C.textMuted}
              value={address}
              onChangeText={setAddress}
              multiline
            />
          </View>
        </View>

        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{totalPrice.toFixed(2)} TMT</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery</Text>
          <Text style={[styles.summaryValue, { color: C.success }]}>Free</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{totalPrice.toFixed(2)} TMT</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.orderBtn,
            (pressed || cartLoading || isPlacingOrder) && styles.orderBtnPressed,
            (cartLoading || isPlacingOrder) && styles.orderBtnDisabled,
          ]}
          onPress={handleOrder}
          disabled={cartLoading || isPlacingOrder}
        >
          {isPlacingOrder ? (
            <>
              <ActivityIndicator size="small" color={C.textOnPrimary} />
              <Text style={styles.orderBtnText}>Processing...</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="truck-delivery" size={22} color={C.textOnPrimary} />
              <Text style={styles.orderBtnText}>Place Order</Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function CartItemCard({
  item, onAdd, onMinus, onRemove, isLoading,
}: {
  item: CartItem;
  onAdd: () => void | Promise<void>;
  onMinus: () => void;
  onRemove: () => void;
  isLoading: boolean;
}) {
  const C = useThemeColors();
  const styles = useMemo(() => mkItemStyles(C), [C]);
  const [isAdding, setIsAdding] = useState(false);
  const imageUri = resolveImageUrl(item.image, process.env.EXPO_PUBLIC_API_URL);

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      const result = onAdd();
      if (result instanceof Promise) await result;
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.itemImage} resizeMode="cover" />
        ) : (
          <Ionicons name="image-outline" size={30} color={C.textMuted} />
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardPrice}>{(item.price * item.quantity).toFixed(2)} TMT</Text>
        <View style={styles.quantityRow}>
          <Pressable style={styles.qtyBtn} onPress={onMinus} disabled={isLoading || isAdding}>
            <Ionicons name="remove" size={18} color={C.text} />
          </Pressable>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <Pressable style={styles.qtyBtn} onPress={handleAdd} disabled={isLoading || isAdding}>
            {isAdding ? (
              <ActivityIndicator size="small" color={C.primary} />
            ) : (
              <Ionicons name="add" size={18} color={C.text} />
            )}
          </Pressable>
        </View>
      </View>
      <Pressable style={styles.removeBtn} onPress={onRemove} disabled={isLoading}>
        <Ionicons name="trash-outline" size={20} color={C.error} />
      </Pressable>
    </View>
  );
}

function mkItemStyles(C: ThemeColors) {
  return StyleSheet.create({
    card: {
      flexDirection: "row",
      backgroundColor: C.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      alignItems: "center",
      ...Shadows.sm,
    },
    cardImage: {
      width: 70, height: 70, borderRadius: Radius.md,
      backgroundColor: C.surfaceAlt, alignItems: "center",
      justifyContent: "center", overflow: "hidden",
    },
    itemImage: { width: 70, height: 70 },
    cardInfo: { flex: 1, marginLeft: Spacing.md },
    cardName: { ...Typography.bodyBold, color: C.text },
    cardPrice: { ...Typography.captionBold, color: C.primaryDark, marginTop: 2 },
    quantityRow: {
      flexDirection: "row", alignItems: "center",
      marginTop: Spacing.sm, gap: Spacing.sm,
    },
    qtyBtn: {
      width: 30, height: 30, borderRadius: Radius.sm,
      backgroundColor: C.surfaceAlt, alignItems: "center", justifyContent: "center",
    },
    qtyText: { ...Typography.bodyBold, color: C.text, minWidth: 20, textAlign: "center" },
    removeBtn: { padding: Spacing.sm },
  });
}

function mkStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    center: { alignItems: "center", justifyContent: "center", padding: Spacing.xxl },

    emptyTitle: { ...Typography.h2, color: C.text, marginTop: Spacing.lg },
    emptySub: { ...Typography.body, color: C.textSecondary, marginTop: Spacing.xs, textAlign: "center" },

    header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { ...Typography.h1, color: C.text },
    subtitle: { ...Typography.caption, color: C.textSecondary, marginTop: 2 },
    ordersBtn: {
      flexDirection: "row", alignItems: "center", gap: Spacing.xs,
      paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
      borderRadius: Radius.md, backgroundColor: C.primarySurface,
      borderWidth: 1, borderColor: C.primary,
    },
    ordersBtnText: { ...Typography.captionBold, color: C.primary },

    listContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: Spacing.md },

    summaryCard: {
      backgroundColor: C.surface,
      borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
      padding: Spacing.xxl, ...Shadows.lg,
    },
    inputContainer: { marginBottom: Spacing.md },
    inputLabel: { ...Typography.bodyBold, color: C.text, marginBottom: Spacing.xs },
    inputWrapper: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: C.surfaceAlt, borderRadius: Radius.md,
      minHeight: 50, paddingHorizontal: Spacing.sm,
      borderWidth: 1, borderColor: C.border,
    },
    inputIcon: { marginRight: Spacing.sm },
    input: { ...Typography.body, flex: 1, color: C.text },

    summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: Spacing.sm },
    summaryLabel: { ...Typography.body, color: C.textSecondary },
    summaryValue: { ...Typography.bodyBold, color: C.text },
    summaryDivider: { height: 1, backgroundColor: C.border, marginVertical: Spacing.sm },
    totalLabel: { ...Typography.h3, color: C.text },
    totalValue: { ...Typography.price, color: C.primaryDark },
    orderBtn: {
      flexDirection: "row", backgroundColor: C.primary,
      height: 52, borderRadius: Radius.md,
      alignItems: "center", justifyContent: "center",
      marginTop: Spacing.lg, gap: Spacing.sm, ...Shadows.md,
    },
    orderBtnPressed: { backgroundColor: C.primaryDark, transform: [{ scale: 0.98 }] },
    orderBtnDisabled: { opacity: 0.6 },
    orderBtnText: { ...Typography.button, color: C.textOnPrimary },
  });
}
