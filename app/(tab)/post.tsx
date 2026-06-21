import { getBrands } from "@/informations/apiPort";
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
import { TypeBrand, TypeCategory } from "@/informations/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
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

type Mode = "choose" | "product";

export default function PostScreen() {
  const router = useRouter();
  const C = useThemeColors();
  const styles = useMemo(() => mkStyles(C), [C]);
  const { users } = useLogin();
  const { myArea, initialized, loadMyArea } = useCommerceArea();
  const [mode, setMode] = useState<Mode>("choose");

  useEffect(() => {
    if (users?.id && !initialized) loadMyArea(users.id);
  }, [users?.id, initialized, loadMyArea]);

  if (mode === "product") {
    return (
      <ProductForm onBack={() => setMode("choose")} commerceAreaId={myArea?.id ?? null} />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.chooseHeader}>
        <Text style={styles.chooseTitle}>What would you like to do?</Text>
        <Text style={styles.chooseSub}>
          {users?.username ? `Hello, ${users.username}` : "Choose an action"}
        </Text>
      </View>

      <View style={styles.cardRow}>
        {/* Add Product */}
        <Pressable
          style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
          onPress={() => setMode("product")}
        >
          <View style={[styles.cardIconBox, { backgroundColor: C.primarySurface }]}>
            <Ionicons name="add-circle" size={40} color={C.primary} />
          </View>
          <Text style={styles.cardTitle}>Add Product</Text>
          <Text style={styles.cardDesc}>List a new item for sale</Text>
          {myArea && (
            <View style={styles.cardBadge}>
              <Ionicons name="storefront-outline" size={12} color={C.primary} />
              <Text style={styles.cardBadgeText}>{myArea.area_name}</Text>
            </View>
          )}
        </Pressable>

        {/* Commerce Area */}
        <Pressable
          style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
          onPress={() => router.push("/(tab)/commerce_area")}
        >
          <View style={[styles.cardIconBox, { backgroundColor: C.accentSurface }]}>
            <MaterialCommunityIcons name="storefront-outline" size={40} color={C.accent} />
          </View>
          <Text style={styles.cardTitle}>Commerce Area</Text>
          <Text style={styles.cardDesc}>
            {myArea ? "Manage your store" : "Create your store"}
          </Text>
          {myArea && (
            <View style={[styles.cardBadge, { backgroundColor: C.successLight }]}>
              <View style={styles.activeDot} />
              <Text style={[styles.cardBadgeText, { color: C.success }]}>
                {myArea.is_active ? "Active" : "Inactive"}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ─── Picker Modal ────────────────────────────────────────────────────────────
function PickerModal<T extends { id: number; label: string }>({
  visible, title, items, selectedId, onSelect, onClose,
}: {
  visible: boolean;
  title: string;
  items: T[];
  selectedId: number | null;
  onSelect: (item: T) => void;
  onClose: () => void;
}) {
  const C = useThemeColors();
  const styles = useMemo(() => mkPickerStyles(C), [C]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>{title}</Text>
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: Spacing.xxl }}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.option, selectedId === item.id && styles.optionActive]}
              onPress={() => { onSelect(item); onClose(); }}
            >
              <Text style={[styles.optionText, selectedId === item.id && styles.optionTextActive]}>
                {item.label}
              </Text>
              {selectedId === item.id && (
                <Ionicons name="checkmark" size={20} color={C.primary} />
              )}
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

// ─── Product Form ─────────────────────────────────────────────────────────────
function ProductForm({
  onBack, commerceAreaId,
}: {
  onBack: () => void;
  commerceAreaId: number | null;
}) {
  const C = useThemeColors();
  const styles = useMemo(() => mkFormStyles(C), [C]);
  const { loading, postProduct, categories } = useApiCreate();
  const { myArea } = useCommerceArea();

  const [imageUri, setImageUri] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TypeCategory | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<TypeBrand | null>(null);
  const [brands, setBrands] = useState<TypeBrand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [linkToArea, setLinkToArea] = useState(false);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setBrandsLoading(true);
        const data = await getBrands();
        setBrands(data);
      } catch {
        // non-fatal
      } finally {
        setBrandsLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission Required", "Please grant photo library access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], allowsEditing: true, quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri)
    };
  };

  const handleSubmit = async () => {
    if (!name.trim() || !price.trim() || !description.trim()) {
      Alert.alert("Missing Fields", "Name, price and description are required.");
      return;
    }
    if (isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert("Invalid Price", "Please enter a valid price.");
      return;
    }
    try {
      await postProduct({
        imageUri: imageUri || undefined,
        name: name.trim(),
        price: Number(price),
        description: description.trim(),
        stock: Number(stock),
        category_id: selectedCategory?.id ?? undefined,
        brand_id: selectedBrand?.id ?? undefined,
        commerce_area_id: linkToArea && commerceAreaId ? commerceAreaId : undefined,
      });
      Alert.alert("Success", "Product has been published!", [
        { text: "Add Another", onPress: resetForm },
        { text: "Done", onPress: onBack },
      ]);
    } catch (err: any) {
      Alert.alert("Failed", err?.response?.data?.message ?? err?.message ?? "Could not publish product.");
    }
  };

  const resetForm = () => {
    setImageUri(""); setName(""); setPrice(""); setStock("1");
    setDescription(""); setSelectedCategory(null); setSelectedBrand(null);
    setLinkToArea(false);
  };

  const categoryItems = (categories ?? []).map((c) => ({ id: c.id, label: c.category_name, category_name: c.category_name }));
  const brandItems = brands.map((b) => ({ id: b.id, label: b.brand_name, brand_name: b.brand_name }));

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Pressable onPress={onBack} style={styles.backRow}>
            <Ionicons name="arrow-back" size={20} color={C.primary} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Add Product</Text>
          <Text style={styles.subtitle}>Fill in the details below</Text>

          {/* Image picker */}
          <Pressable
            style={({ pressed }) => [styles.imagePicker, pressed && { opacity: 0.8 }]}
            onPress={pickImage}
          >
            {imageUri ? (
              <View style={{ flex: 1 }}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
                <View style={styles.imageOverlay}>
                  <Ionicons name="camera" size={22} color="#fff" />
                  <Text style={styles.changeText}>Change</Text>
                </View>
              </View>
            ) : (
              <View style={styles.imageEmpty}>
                <MaterialCommunityIcons name="camera-plus-outline" size={44} color={C.textMuted} />
                <Text style={styles.imageEmptyText}>Tap to add photo</Text>
              </View>
            )}
          </Pressable>

          {/* Form card */}
          <View style={styles.card}>
            {myArea && (
              <Pressable style={styles.areaToggleRow} onPress={() => setLinkToArea((v) => !v)}>
                <View style={styles.areaToggleLeft}>
                  <Ionicons
                    name="storefront-outline"
                    size={18}
                    color={linkToArea ? C.primary : C.textMuted}
                  />
                  <View style={{ marginLeft: Spacing.sm }}>
                    <Text style={[styles.areaToggleLabel, linkToArea && { color: C.primary }]}>
                      Add to {myArea.area_name}
                    </Text>
                    <Text style={styles.areaToggleCaption}>
                      {linkToArea ? "Listed in your commerce area" : "Regular product (not in store)"}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={linkToArea}
                  onValueChange={setLinkToArea}
                  trackColor={{ false: C.borderLight, true: C.primarySurface }}
                  thumbColor={linkToArea ? C.primary : C.textMuted}
                />
              </Pressable>
            )}

            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Wireless Headphones"
              placeholderTextColor={C.textMuted}
              value={name}
              onChangeText={setName}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Price (TMT) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={C.textMuted}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={styles.label}>Stock</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  placeholderTextColor={C.textMuted}
                  value={stock}
                  onChangeText={setStock}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.label}>Category</Text>
            <Pressable style={styles.pickerBtn} onPress={() => setShowCatPicker(true)}>
              <Text style={[styles.pickerBtnText, !selectedCategory && { color: C.textMuted }]}>
                {selectedCategory?.category_name ?? "Select category..."}
              </Text>
              <Ionicons name="chevron-down" size={18} color={C.textMuted} />
            </Pressable>

            <Text style={styles.label}>Brand</Text>
            <Pressable style={styles.pickerBtn} onPress={() => setShowBrandPicker(true)} disabled={brandsLoading}>
              {brandsLoading ? (
                <ActivityIndicator size="small" color={C.primary} />
              ) : (
                <>
                  <Text style={[styles.pickerBtnText, !selectedBrand && { color: C.textMuted }]}>
                    {selectedBrand?.brand_name ?? "Select brand..."}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={C.textMuted} />
                </>
              )}
            </Pressable>

            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Describe your product"
              placeholderTextColor={C.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && styles.submitPressed,
                loading && styles.submitDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={C.textOnPrimary} />
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={20} color={C.textOnPrimary} />
                  <Text style={styles.submitText}>Publish Product</Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerModal
        visible={showCatPicker}
        title="Select Category"
        items={categoryItems}
        selectedId={selectedCategory?.id ?? null}
        onSelect={(item) => setSelectedCategory({ id: item.id, category_name: (item as any).category_name })}
        onClose={() => setShowCatPicker(false)}
      />
      <PickerModal
        visible={showBrandPicker}
        title="Select Brand"
        items={brandItems}
        selectedId={selectedBrand?.id ?? null}
        onSelect={(item) => setSelectedBrand({ id: item.id, brand_name: (item as any).brand_name })}
        onClose={() => setShowBrandPicker(false)}
      />
    </SafeAreaView>
  );
}

// ─── Style factories ─────────────────────────────────────────────────────────
function mkStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    chooseHeader: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xxl, paddingBottom: Spacing.xl },
    chooseTitle: { ...Typography.h1, color: C.text },
    chooseSub: { ...Typography.body, color: C.textMuted, marginTop: Spacing.xs },
    cardRow: { flexDirection: "row", paddingHorizontal: Spacing.lg, gap: Spacing.lg, marginTop: Spacing.sm },
    actionCard: { flex: 1, backgroundColor: C.surface, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: "center", ...Shadows.md },
    actionCardPressed: { transform: [{ scale: 0.97 }], opacity: 0.9 },
    cardIconBox: { width: 72, height: 72, borderRadius: Radius.lg, alignItems: "center", justifyContent: "center", marginBottom: Spacing.md },
    cardTitle: { ...Typography.bodyBold, color: C.text, textAlign: "center", marginBottom: Spacing.xs },
    cardDesc: { ...Typography.caption, color: C.textMuted, textAlign: "center" },
    cardBadge: {
      flexDirection: "row", alignItems: "center", gap: 4,
      marginTop: Spacing.md, paddingHorizontal: Spacing.sm, paddingVertical: 3,
      borderRadius: Radius.full, backgroundColor: C.primarySurface,
    },
    cardBadgeText: { ...Typography.small, color: C.primary, fontWeight: "600" as const },
    activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.success },
  });
}

function mkPickerStyles(C: ThemeColors) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: C.overlay },
    sheet: {
      backgroundColor: C.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
      maxHeight: "60%", padding: Spacing.xxl, paddingTop: Spacing.md,
    },
    sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: "center", marginBottom: Spacing.md },
    sheetTitle: { ...Typography.h3, color: C.text, marginBottom: Spacing.lg },
    option: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderRadius: Radius.md, marginBottom: Spacing.xs },
    optionActive: { backgroundColor: C.primarySurface },
    optionText: { ...Typography.body, color: C.text },
    optionTextActive: { color: C.primary, fontWeight: "600" as const },
  });
}

function mkFormStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    content: { padding: Spacing.xxl, paddingBottom: 100 },
    backRow: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, marginBottom: Spacing.lg },
    backText: { ...Typography.bodyBold, color: C.primary },
    title: { ...Typography.h1, color: C.text },
    subtitle: { ...Typography.caption, color: C.textSecondary, marginTop: 2, marginBottom: Spacing.lg },
    imagePicker: {
      width: "100%", height: 180, borderRadius: Radius.lg, overflow: "hidden",
      backgroundColor: C.surfaceAlt, borderWidth: 2, borderColor: C.border,
      borderStyle: "dashed", marginBottom: Spacing.xxl,
    },
    imagePreview: { width: "100%", height: "100%" },
    imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
    changeText: { ...Typography.captionBold, color: "#fff", marginTop: 4 },
    imageEmpty: { flex: 1, alignItems: "center", justifyContent: "center" },
    imageEmptyText: { ...Typography.caption, color: C.textMuted, marginTop: Spacing.sm },
    card: { backgroundColor: C.surface, borderRadius: Radius.xl, padding: Spacing.xxl, ...Shadows.md },
    areaToggleRow: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      borderWidth: 1, borderColor: C.borderLight, borderRadius: Radius.md,
      paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginBottom: Spacing.lg,
      backgroundColor: C.surfaceAlt,
    },
    areaToggleLeft: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: Spacing.md },
    areaToggleLabel: { ...Typography.captionBold, color: C.text },
    areaToggleCaption: { ...Typography.small, color: C.textMuted, marginTop: 2 },
    label: { ...Typography.captionBold, color: C.text, marginBottom: Spacing.xs, marginTop: Spacing.md },
    input: { backgroundColor: C.surfaceAlt, borderRadius: Radius.md, paddingHorizontal: Spacing.md, height: 48, ...Typography.body, color: C.text, borderWidth: 1, borderColor: C.borderLight },
    inputMulti: { height: 88, textAlignVertical: "top", paddingTop: Spacing.sm },
    row: { flexDirection: "row" },
    pickerBtn: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: C.surfaceAlt, borderRadius: Radius.md, paddingHorizontal: Spacing.md, height: 48, borderWidth: 1, borderColor: C.borderLight },
    pickerBtnText: { ...Typography.body, color: C.text },
    submitBtn: { flexDirection: "row", backgroundColor: C.primary, height: 52, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", marginTop: Spacing.xxl, gap: Spacing.sm, ...Shadows.md },
    submitPressed: { backgroundColor: C.primaryDark, transform: [{ scale: 0.98 }] },
    submitDisabled: { opacity: 0.7 },
    submitText: { ...Typography.button, color: C.textOnPrimary },
  });
}
