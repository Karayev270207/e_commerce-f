import { deleteOrder, getOrders } from "@/informations/apiPort";
import { useLogin } from "@/informations/loginContext";
import {
  useThemeColors,
  type ThemeColors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "@/informations/theme";
import { TypeOrder } from "@/informations/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrdersScreen() {
  const C = useThemeColors();
  const styles = useMemo(() => mkStyles(C), [C]);
  const { users } = useLogin();
  const [orders, setOrders] = useState<TypeOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getOrders(users?.id);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [users?.id]);

  useFocusEffect(useCallback(() => { fetchOrders(); }, [fetchOrders]));

  const handleDelete = (id: number) => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "Keep", style: "cancel" },
      {
        text: "Cancel Order",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteOrder(id);
            setOrders((prev) => prev.filter((o) => o.id !== id));
          } catch {
            Alert.alert("Error", "Failed to cancel order. Try again.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={72} color={C.error} />
        <Text style={styles.errorTitle}>Failed to Load</Text>
        <Text style={styles.errorSub}>{error}</Text>
        <Pressable style={styles.retryBtn} onPress={fetchOrders}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        <Text style={styles.subtitle}>
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.listContent, orders.length === 0 && styles.emptyContainer]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="receipt-outline" size={80} color={C.textMuted} />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySub}>Your order history will appear here</Text>
          </View>
        }
        renderItem={({ item }) => (
          <OrderCard order={item} onDelete={() => handleDelete(item.id)} />
        )}
      />
    </SafeAreaView>
  );
}

function OrderCard({ order, onDelete }: { order: TypeOrder; onDelete: () => void }) {
  const C = useThemeColors();
  const styles = useMemo(() => mkCardStyles(C), [C]);

  const date = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : "—";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.orderIdRow}>
          <View style={styles.orderIconBox}>
            <Ionicons name="receipt" size={18} color={C.primary} />
          </View>
          <Text style={styles.orderId}>Order #{order.id}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Placed</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailRow}>
        <Ionicons name="call-outline" size={16} color={C.textMuted} />
        <Text style={styles.detailText}>{order.phone || "—"}</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="location-outline" size={16} color={C.textMuted} />
        <Text style={styles.detailText} numberOfLines={2}>{order.address || "—"}</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={16} color={C.textMuted} />
        <Text style={styles.detailText}>{date}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{Number(order.total_price).toFixed(2)} TMT</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.7 }]}
          onPress={onDelete}
        >
          <Ionicons name="trash-outline" size={15} color={C.error} />
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

function mkCardStyles(C: ThemeColors) {
  return StyleSheet.create({
    card: { backgroundColor: C.surface, borderRadius: Radius.lg, padding: Spacing.lg, ...Shadows.md },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.md },
    orderIdRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
    orderIconBox: {
      width: 36, height: 36, borderRadius: Radius.sm,
      backgroundColor: C.primarySurface, alignItems: "center", justifyContent: "center",
    },
    orderId: { ...Typography.bodyBold, color: C.text },
    statusBadge: { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full, backgroundColor: C.successLight },
    statusText: { ...Typography.small, color: C.success, fontWeight: "600" as const },
    divider: { height: 1, backgroundColor: C.border, marginVertical: Spacing.md },
    detailRow: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm, marginBottom: Spacing.sm },
    detailText: { ...Typography.body, color: C.textSecondary, flex: 1 },
    cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    totalLabel: { ...Typography.caption, color: C.textMuted },
    totalValue: { ...Typography.price, color: C.primaryDark, fontSize: 18 },
    cancelBtn: {
      flexDirection: "row", alignItems: "center", gap: Spacing.xs,
      paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
      borderRadius: Radius.sm, borderWidth: 1, borderColor: C.error,
    },
    cancelBtnText: { ...Typography.captionBold, color: C.error },
  });
}

function mkStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    center: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.xxl },
    emptyContainer: { flex: 1 },
    header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
    title: { ...Typography.h1, color: C.text },
    subtitle: { ...Typography.caption, color: C.textSecondary, marginTop: 2 },
    listContent: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md },
    loadingText: { ...Typography.body, color: C.textMuted, marginTop: Spacing.md },
    errorTitle: { ...Typography.h3, color: C.text, marginTop: Spacing.lg },
    errorSub: { ...Typography.body, color: C.textSecondary, marginTop: Spacing.xs, textAlign: "center" },
    retryBtn: { marginTop: Spacing.lg, paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md, backgroundColor: C.primary, borderRadius: Radius.md },
    retryText: { ...Typography.bodyBold, color: C.textOnPrimary },
    emptyTitle: { ...Typography.h3, color: C.text, marginTop: Spacing.lg },
    emptySub: { ...Typography.body, color: C.textSecondary, marginTop: Spacing.xs, textAlign: "center" },
  });
}
