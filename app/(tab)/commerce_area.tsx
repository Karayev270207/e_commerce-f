import { resolveImageUrl } from "@/informations/cloudinary";
import { useCommerceArea } from "@/informations/commerceAreaContext";
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
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CommerceAreaScreen() {
  const router = useRouter();
  const C = useThemeColors();
  const s = useMemo(() => mkStyles(C), [C]);
  const { users } = useLogin();
  const {
    myArea, loading, error, initialized,
    loadMyArea, createArea, updateArea, deleteArea, clearError,
  } = useCommerceArea();
  const { products } = useApiCreate();

  useFocusEffect(
    useCallback(() => {
      if (users?.id) loadMyArea(users.id);
    }, [users?.id, loadMyArea]),
  );
  useEffect(() => () => clearError(), [clearError]);

  if (!users) {
    return (
      <SafeAreaView style={[s.container, s.center]}>
        <Ionicons name="lock-closed-outline" size={72} color={C.textMuted} />
        <Text style={s.emptyTitle}>Login Required</Text>
        <Text style={s.emptySub}>Please log in to manage your commerce area.</Text>
        <Pressable style={s.primaryBtn} onPress={() => router.push("/(tab)/login")}>
          <Text style={s.primaryBtnText}>Go to Login</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!initialized || (loading && !myArea)) {
    return (
      <SafeAreaView style={[s.container, s.center]}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={s.loadingText}>Loading your commerce area…</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[s.container, s.center]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color={C.error} />
        <Text style={s.emptyTitle}>Something went wrong</Text>
        <Text style={s.emptySub}>{error}</Text>
        <Pressable style={s.primaryBtn} onPress={() => { clearError(); loadMyArea(users.id!); }}>
          <Text style={s.primaryBtnText}>Try Again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!myArea) {
    return <CreateAreaScreen customerId={users.id!} onCreate={createArea} loading={loading} />;
  }

  const areaProducts = (products ?? []).filter((p) => p.commerce_area_id === myArea.id);

  return (
    <AreaDashboard
      area={myArea}
      products={areaProducts}
      loading={loading}
      onUpdate={(data) => updateArea(myArea.id, data)}
      onDelete={() => deleteArea(myArea.id)}
    />
  );
}

// ─── Create Area Screen ───────────────────────────────────────────────────────
function CreateAreaScreen({
  customerId, onCreate, loading,
}: {
  customerId: number;
  onCreate: (data: { customer_id: number; area_name: string; description?: string; imageUri?: string }) => Promise<void>;
  loading: boolean;
}) {
  const C = useThemeColors();
  const s = useMemo(() => mkStyles(C), [C]);
  const [areaName, setAreaName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState("");

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permission Required", "Please grant photo library access."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, quality: 0.8 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleCreate = async () => {
    if (!areaName.trim()) { Alert.alert("Required", "Please enter a name for your commerce area."); return; }
    try {
      await onCreate({ customer_id: customerId, area_name: areaName.trim(), description: description.trim() || undefined, imageUri: imageUri || undefined });
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Could not create commerce area.");
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.createContent} showsVerticalScrollIndicator={false}>
          <View style={s.createIllustration}>
            <MaterialCommunityIcons name="storefront-outline" size={80} color={C.primary} />
          </View>
          <Text style={s.createTitle}>Create Your Commerce Area</Text>
          <Text style={s.createSub}>
            Your commerce area is your personal store. You can list up to{" "}
            <Text style={{ color: C.primary, fontWeight: "700" }}>30 products</Text> in it.
          </Text>

          <Pressable style={({ pressed }) => [s.imagePicker, pressed && { opacity: 0.8 }]} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={s.imagePreview} resizeMode="cover" />
            ) : (
              <View style={s.imageEmpty}>
                <MaterialCommunityIcons name="camera-plus-outline" size={36} color={C.textMuted} />
                <Text style={s.imageEmptyText}>Add store logo (optional)</Text>
              </View>
            )}
          </Pressable>

          <View style={s.formCard}>
            <Text style={s.label}>Store Name *</Text>
            <TextInput style={s.input} placeholder="e.g. Ahmed's Electronics" placeholderTextColor={C.textMuted} value={areaName} onChangeText={setAreaName} maxLength={100} />
            <Text style={s.label}>Description</Text>
            <TextInput style={[s.input, s.inputMulti]} placeholder="Tell buyers what your store is about…" placeholderTextColor={C.textMuted} value={description} onChangeText={setDescription} multiline />
            <Pressable
              style={({ pressed }) => [s.primaryBtn, { marginTop: Spacing.xl }, pressed && { opacity: 0.85 }, loading && { opacity: 0.6 }]}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={C.textOnPrimary} />
              ) : (
                <>
                  <Ionicons name="storefront-outline" size={20} color={C.textOnPrimary} />
                  <Text style={s.primaryBtnText}>Create Commerce Area</Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Area Dashboard ───────────────────────────────────────────────────────────
function AreaDashboard({
  area, products, loading, onUpdate, onDelete,
}: {
  area: import("@/informations/types").TypeCommerceArea;
  products: import("@/informations/types").Product[];
  loading: boolean;
  onUpdate: (data: { area_name?: string; description?: string; is_active?: boolean; imageUri?: string }) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const C = useThemeColors();
  const s = useMemo(() => mkStyles(C), [C]);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(area.area_name);
  const [draftDesc, setDraftDesc] = useState(area.description ?? "");
  const [isActive, setIsActive] = useState(area.is_active ?? true);
  const [draftImageUri, setDraftImageUri] = useState("");
  const resolvedAreaImage = resolveImageUrl(area.image_url, process.env.EXPO_PUBLIC_API_URL);

  const MAX_PRODUCTS = 30;
  const productCount = products.length;

  const pickLogo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permission Required", "Please grant photo library access."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, quality: 0.8 });
    if (!result.canceled) setDraftImageUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!draftName.trim()) { Alert.alert("Required", "Area name cannot be empty."); return; }
    try {
      await onUpdate({ area_name: draftName.trim(), description: draftDesc.trim() || undefined, imageUri: draftImageUri || undefined });
      setDraftImageUri("");
      setEditing(false);
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to save changes.");
    }
  };

  const handleToggleActive = async (val: boolean) => {
    setIsActive(val);
    try { await onUpdate({ is_active: val }); } catch { setIsActive(!val); }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Commerce Area",
      "This will permanently delete your store and unlink all products. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => { try { await onDelete(); } catch (err: any) { Alert.alert("Error", err?.message ?? "Failed to delete."); } } },
      ],
    );
  };

  const createdDate = area.created_at
    ? new Date(area.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ─── Header ─── */}
        <View style={s.dashHeader}>
          <View style={s.dashHeaderLeft}>
            <Pressable style={s.storeIconBox} onPress={editing ? pickLogo : undefined}>
              {resolvedAreaImage || draftImageUri ? (
                <Image source={{ uri: draftImageUri || resolvedAreaImage! }} style={s.storeLogo} resizeMode="cover" />
              ) : (
                <MaterialCommunityIcons name="storefront" size={28} color={C.primary} />
              )}
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={s.dashTitle} numberOfLines={1}>{area.area_name}</Text>
              <Text style={s.dashSub}>Since {createdDate}</Text>
            </View>
          </View>
          <View style={[s.statusBadge, isActive ? s.statusActive : s.statusInactive]}>
            <Text style={[s.statusText, { color: isActive ? C.success : C.textMuted }]}>
              {isActive ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>

        {/* ─── Stats bar ─── */}
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statValue}>{productCount}</Text>
            <Text style={s.statLabel}>Products</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statBox}>
            <Text style={s.statValue}>{MAX_PRODUCTS - productCount}</Text>
            <Text style={s.statLabel}>Slots left</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statBox}>
            <Text style={[s.statValue, { color: productCount >= MAX_PRODUCTS ? C.error : C.primary }]}>
              {productCount}/{MAX_PRODUCTS}
            </Text>
            <Text style={s.statLabel}>Capacity</Text>
          </View>
        </View>

        {/* ─── Capacity bar ─── */}
        <View style={s.section}>
          <View style={s.capacityBarBg}>
            <View style={[s.capacityBarFill, {
              width: `${Math.min((productCount / MAX_PRODUCTS) * 100, 100)}%`,
              backgroundColor: productCount >= MAX_PRODUCTS ? C.error : C.primary,
            }]} />
          </View>
        </View>

        {/* ─── Details / Edit ─── */}
        <View style={[s.section, s.card]}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Store Details</Text>
            {!editing ? (
              <Pressable style={s.editBtn} onPress={() => { setDraftName(area.area_name); setDraftDesc(area.description ?? ""); setEditing(true); }}>
                <Ionicons name="pencil-outline" size={16} color={C.primary} />
                <Text style={s.editBtnText}>Edit</Text>
              </Pressable>
            ) : (
              <View style={s.editActions}>
                <Pressable style={s.cancelBtn} onPress={() => setEditing(false)}>
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={[s.saveBtn, loading && { opacity: 0.6 }]} onPress={handleSave} disabled={loading}>
                  {loading ? <ActivityIndicator size="small" color={C.textOnPrimary} /> : <Text style={s.saveBtnText}>Save</Text>}
                </Pressable>
              </View>
            )}
          </View>

          {editing ? (
            <>
              <Text style={s.label}>Store Name</Text>
              <TextInput style={s.input} value={draftName} onChangeText={setDraftName} maxLength={100} />
              <Text style={s.label}>Description</Text>
              <TextInput style={[s.input, s.inputMulti]} value={draftDesc} onChangeText={setDraftDesc} placeholder="Optional description…" placeholderTextColor={C.textMuted} multiline />
              <Text style={s.label}>Store Logo</Text>
              <Pressable style={({ pressed }) => [s.imagePicker, pressed && { opacity: 0.8 }]} onPress={pickLogo}>
                {draftImageUri || resolvedAreaImage ? (
                  <Image source={{ uri: draftImageUri || resolvedAreaImage! }} style={s.imagePreview} resizeMode="cover" />
                ) : (
                  <View style={s.imageEmpty}>
                    <MaterialCommunityIcons name="camera-plus-outline" size={28} color={C.textMuted} />
                    <Text style={s.imageEmptyText}>Tap to add logo</Text>
                  </View>
                )}
              </Pressable>
            </>
          ) : (
            <>
              <Text style={s.detailLabel}>Store Name</Text>
              <Text style={s.detailValue}>{area.area_name}</Text>
              {area.description ? (
                <>
                  <Text style={s.detailLabel}>Description</Text>
                  <Text style={s.detailValue}>{area.description}</Text>
                </>
              ) : null}
            </>
          )}

          <View style={s.toggleRow}>
            <View>
              <Text style={s.detailLabel}>Store Status</Text>
              <Text style={s.detailMuted}>{isActive ? "Visible to buyers" : "Hidden from buyers"}</Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={handleToggleActive}
              trackColor={{ false: C.border, true: C.primaryLight }}
              thumbColor={isActive ? C.primary : C.textMuted}
            />
          </View>
        </View>

        {/* ─── Products in this area ─── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Products ({productCount})</Text>
          </View>
          {productCount === 0 ? (
            <View style={[s.card, s.emptyProducts]}>
              <Ionicons name="bag-outline" size={48} color={C.textMuted} />
              <Text style={s.emptySub}>No products yet.</Text>
              <Text style={[s.emptySub, { color: C.textMuted }]}>Use the Add tab to list products.</Text>
            </View>
          ) : (
            <FlatList
              data={products}
              keyExtractor={(p) => String(p.id)}
              scrollEnabled={false}
              contentContainerStyle={{ gap: Spacing.sm }}
              renderItem={({ item }) => (
                <View style={[s.card, s.productRow]}>
                  <View style={s.productInfo}>
                    <Text style={s.productName} numberOfLines={1}>{item.name}</Text>
                    <Text style={s.productPrice}>{Number(item.price).toFixed(2)} TMT</Text>
                    {item.stock !== undefined && (
                      <Text style={s.productStock}>Stock: {item.stock}</Text>
                    )}
                  </View>
                  <View style={[(item.stock ?? 0) > 0 ? s.stockBadgeIn : s.stockBadgeOut, s.stockBadge]}>
                    <Text style={[s.stockBadgeText, { color: (item.stock ?? 0) > 0 ? C.success : C.error }]}>
                      {(item.stock ?? 0) > 0 ? "In Stock" : "Out"}
                    </Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>

        {/* ─── Danger zone ─── */}
        <View style={[s.section, s.dangerCard]}>
          <Text style={s.dangerTitle}>Danger Zone</Text>
          <Text style={s.dangerSub}>
            Deleting your commerce area will unlink all products. This cannot be undone.
          </Text>
          <Pressable
            style={({ pressed }) => [s.deleteBtn, pressed && { opacity: 0.8 }, loading && { opacity: 0.5 }]}
            onPress={handleDelete}
            disabled={loading}
          >
            <Ionicons name="trash-outline" size={18} color={C.error} />
            <Text style={s.deleteBtnText}>Delete Commerce Area</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Shared style factory ─────────────────────────────────────────────────────
function mkStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    center: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.xxl },
    loadingText: { ...Typography.body, color: C.textMuted, marginTop: Spacing.md },
    emptyTitle: { ...Typography.h3, color: C.text, marginTop: Spacing.lg },
    emptySub: { ...Typography.body, color: C.textSecondary, marginTop: Spacing.xs, textAlign: "center" },

    // Create screen
    createContent: { padding: Spacing.xxl, paddingBottom: 100, alignItems: "center" },
    createIllustration: {
      width: 120, height: 120, borderRadius: 60,
      backgroundColor: C.primarySurface, alignItems: "center", justifyContent: "center", marginBottom: Spacing.xl,
    },
    createTitle: { ...Typography.h2, color: C.text, textAlign: "center" },
    createSub: { ...Typography.body, color: C.textSecondary, textAlign: "center", marginTop: Spacing.sm, marginBottom: Spacing.xl, lineHeight: 22 },
    formCard: { width: "100%", backgroundColor: C.surface, borderRadius: Radius.xl, padding: Spacing.xxl, ...Shadows.md },
    label: { ...Typography.captionBold, color: C.text, marginBottom: Spacing.xs, marginTop: Spacing.md },
    input: { backgroundColor: C.surfaceAlt, borderRadius: Radius.md, paddingHorizontal: Spacing.md, height: 48, ...Typography.body, color: C.text, borderWidth: 1, borderColor: C.borderLight },
    inputMulti: { height: 88, textAlignVertical: "top", paddingTop: Spacing.sm },
    primaryBtn: { flexDirection: "row", backgroundColor: C.primary, height: 52, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", gap: Spacing.sm, ...Shadows.md },
    primaryBtnText: { ...Typography.button, color: C.textOnPrimary },

    // Dashboard header
    dashHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
    dashHeaderLeft: { flexDirection: "row", alignItems: "center", gap: Spacing.md, flex: 1 },
    storeIconBox: { width: 52, height: 52, borderRadius: Radius.lg, backgroundColor: C.primarySurface, alignItems: "center", justifyContent: "center" },
    storeLogo: { width: 52, height: 52, borderRadius: Radius.lg },
    dashTitle: { ...Typography.h3, color: C.text },
    dashSub: { ...Typography.caption, color: C.textMuted, marginTop: 2 },
    statusBadge: { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full },
    statusActive: { backgroundColor: C.successLight },
    statusInactive: { backgroundColor: C.surfaceAlt },
    statusText: { ...Typography.small, fontWeight: "600" as const },

    // Stats
    statsRow: { flexDirection: "row", marginHorizontal: Spacing.lg, marginBottom: Spacing.md, backgroundColor: C.surface, borderRadius: Radius.lg, padding: Spacing.md, ...Shadows.sm },
    statBox: { flex: 1, alignItems: "center" },
    statValue: { ...Typography.h3, color: C.text },
    statLabel: { ...Typography.small, color: C.textMuted, marginTop: 2 },
    statDivider: { width: 1, backgroundColor: C.border, marginVertical: 4 },

    // Capacity bar
    capacityBarBg: { height: 6, backgroundColor: C.surfaceAlt, borderRadius: Radius.full, overflow: "hidden" },
    capacityBarFill: { height: 6, borderRadius: Radius.full },

    // Sections
    section: { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg },
    card: { backgroundColor: C.surface, borderRadius: Radius.lg, padding: Spacing.lg, ...Shadows.sm },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.md },
    sectionTitle: { ...Typography.bodyBold, color: C.text },

    // Edit controls
    editBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.sm, backgroundColor: C.primarySurface },
    editBtnText: { ...Typography.captionBold, color: C.primary },
    editActions: { flexDirection: "row", gap: Spacing.sm },
    cancelBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.sm, borderWidth: 1, borderColor: C.border },
    cancelBtnText: { ...Typography.captionBold, color: C.textSecondary },
    saveBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.sm, backgroundColor: C.primary, minWidth: 52, alignItems: "center" },
    saveBtnText: { ...Typography.captionBold, color: C.textOnPrimary },

    // Detail fields
    detailLabel: { ...Typography.small, color: C.textMuted, marginTop: Spacing.md, marginBottom: 2 },
    detailValue: { ...Typography.body, color: C.text },
    detailMuted: { ...Typography.small, color: C.textMuted },
    toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: Spacing.lg, paddingTop: Spacing.lg, borderTopWidth: 1, borderTopColor: C.border },

    // Products
    emptyProducts: { alignItems: "center", paddingVertical: Spacing.xxl, gap: Spacing.sm },
    productRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    productInfo: { flex: 1 },
    productName: { ...Typography.bodyBold, color: C.text },
    productPrice: { ...Typography.captionBold, color: C.primaryDark, marginTop: 2 },
    productStock: { ...Typography.small, color: C.textMuted, marginTop: 1 },
    stockBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full, marginLeft: Spacing.sm },
    stockBadgeIn: { backgroundColor: C.successLight },
    stockBadgeOut: { backgroundColor: C.errorLight },
    stockBadgeText: { ...Typography.small, fontWeight: "600" as const },

    // Image picker (create + edit)
    imagePicker: { width: "100%", height: 120, borderRadius: Radius.lg, overflow: "hidden", backgroundColor: C.surfaceAlt, borderWidth: 2, borderColor: C.border, borderStyle: "dashed", marginBottom: Spacing.lg, alignItems: "center", justifyContent: "center" },
    imagePreview: { width: "100%", height: "100%" },
    imageEmpty: { alignItems: "center", justifyContent: "center", gap: Spacing.xs },
    imageEmptyText: { ...Typography.caption, color: C.textMuted },

    // Danger zone
    dangerCard: { backgroundColor: C.errorLight, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: C.error, marginBottom: Spacing.xxxl, opacity: 0.9 },
    dangerTitle: { ...Typography.bodyBold, color: C.error },
    dangerSub: { ...Typography.caption, color: C.error, marginTop: Spacing.xs, marginBottom: Spacing.lg, opacity: 0.8 },
    deleteBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.xs, paddingVertical: Spacing.md, borderRadius: Radius.md, borderWidth: 1.5, borderColor: C.error },
    deleteBtnText: { ...Typography.bodyBold, color: C.error },
  });
}
