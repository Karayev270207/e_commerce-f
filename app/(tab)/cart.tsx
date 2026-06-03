import { useApiCreate } from "@/informations/providerData";
import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "@/informations/theme";
import { CartItem } from "@/informations/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CartScreen() {
  const {
    cart,
    addToCart,
    minusCart,
    removeCart,
    clearCart,
    cartLoading,
    cartError,
    placeOrder,
  } = useApiCreate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );
  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const handleRemove = (id: number, name: string) => {
    Alert.alert("Remove Item", `Remove "${name}" from your cart?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await removeCart(id);
          } catch (error) {
            Alert.alert("Error", "Failed to remove item from cart");
          }
        },
      },
    ]);
  };

  const handleOrder = async () => {
    if (cart.length === 0) return;
    Alert.alert(
      "Place Order",
      `Confirm order of ${totalItems} items for ${totalPrice.toFixed(2)} TMT?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setIsPlacingOrder(true);
            try {
              console.log("🛒 Placing order with", cart.length, "items");
              await placeOrder();
              Alert.alert(
                "🎉 Order Placed!",
                "Your order has been successfully placed and is on the way.",
              );
            } catch (error) {
              const errorMsg =
                error instanceof Error
                  ? error.message
                  : "Failed to place order";
              Alert.alert("❌ Order Failed", errorMsg);
              console.error("Order placement error:", error);
            } finally {
              setIsPlacingOrder(false);
            }
          },
        },
      ],
    );
  };

  // ─── Show Error if any ───
  if (cartError) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={80}
          color={Colors.error}
        />
        <Text style={[styles.emptyTitle, { color: Colors.error }]}>
          Cart Error
        </Text>
        <Text style={styles.emptySub}>{cartError}</Text>
        <Pressable
          style={[styles.orderBtn, { marginTop: Spacing.lg }]}
          onPress={() => clearCart()}
        >
          <Text style={styles.orderBtnText}>Clear Cart</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // ─── Empty Cart ───
  if (cart.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Ionicons name="bag-outline" size={80} color={Colors.textMuted} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySub}>
          Browse our shop and add items you love!
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <Text style={styles.title}>My Cart</Text>
        <Text style={styles.subtitle}>{totalItems} items</Text>
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
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{totalPrice.toFixed(2)} TMT</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery</Text>
          <Text style={[styles.summaryValue, { color: Colors.success }]}>
            Free
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{totalPrice.toFixed(2)} TMT</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.orderBtn,
            (pressed || cartLoading || isPlacingOrder) &&
              styles.orderBtnPressed,
            (cartLoading || isPlacingOrder) && styles.orderBtnDisabled,
          ]}
          onPress={handleOrder}
          disabled={cartLoading || isPlacingOrder}
        >
          {isPlacingOrder ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.orderBtnText}>Processing...</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons
                name="truck-delivery"
                size={22}
                color="#fff"
              />
              <Text style={styles.orderBtnText}>Place Order</Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ─── Cart Item Card ───
function CartItemCard({
  item,
  onAdd,
  onMinus,
  onRemove,
  isLoading,
}: {
  item: CartItem;
  onAdd: () => void | Promise<void>;
  onMinus: () => void;
  onRemove: () => void;
  isLoading: boolean;
}) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      const result = onAdd();
      if (result instanceof Promise) {
        await result;
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardImage}>
        {item.image ? (
          <Image
            source={{ uri: "data:image/png;base64," + item.image }}
            style={styles.itemImage}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="image-outline" size={30} color={Colors.textMuted} />
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.cardPrice}>
          {(item.price * item.quantity).toFixed(2)} TMT
        </Text>
        <View style={styles.quantityRow}>
          <Pressable
            style={styles.qtyBtn}
            onPress={onMinus}
            disabled={isLoading || isAdding}
          >
            <Ionicons name="remove" size={18} color={Colors.text} />
          </Pressable>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <Pressable
            style={styles.qtyBtn}
            onPress={handleAdd}
            disabled={isLoading || isAdding}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Ionicons name="add" size={18} color={Colors.text} />
            )}
          </Pressable>
        </View>
      </View>
      <Pressable
        style={styles.removeBtn}
        onPress={onRemove}
        disabled={isLoading}
      >
        <Ionicons name="trash-outline" size={20} color={Colors.error} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xxl,
  },

  // Empty
  emptyTitle: { ...Typography.h2, color: Colors.text, marginTop: Spacing.lg },
  emptySub: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: "center",
  },

  // Header
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: { ...Typography.h1, color: Colors.text },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // List
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },

  // Card
  card: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: "center",
    ...Shadows.sm,
  },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  itemImage: { width: 70, height: 70 },
  cardInfo: { flex: 1, marginLeft: Spacing.md },
  cardName: { ...Typography.bodyBold, color: Colors.text },
  cardPrice: {
    ...Typography.captionBold,
    color: Colors.primaryDark,
    marginTop: 2,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    ...Typography.bodyBold,
    color: Colors.text,
    minWidth: 20,
    textAlign: "center",
  },
  removeBtn: { padding: Spacing.sm },

  // Summary
  summaryCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xxl,
    ...Shadows.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  summaryLabel: { ...Typography.body, color: Colors.textSecondary },
  summaryValue: { ...Typography.bodyBold, color: Colors.text },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  totalLabel: { ...Typography.h3, color: Colors.text },
  totalValue: { ...Typography.price, color: Colors.primaryDark },
  orderBtn: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  orderBtnPressed: {
    backgroundColor: Colors.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  orderBtnDisabled: { opacity: 0.6 },
  orderBtnText: { ...Typography.button, color: Colors.textOnPrimary },
});
