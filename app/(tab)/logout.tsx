import { useLogin } from "@/informations/loginContext";
import {
  useThemeColors,
  type ThemeColors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "@/informations/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  const C = useThemeColors();
  const styles = useMemo(() => mkStyles(C), [C]);
  const { logout, users, isLoading } = useLogin();
  const router = useRouter();

  useEffect(() => {
    if (!users) {
      const timer = setTimeout(() => {
        router.replace("/(tab)/login");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [users, router]);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => { await logout(); },
      },
    ]);
  };

  if (!users) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Profile Header ─── */}
      <View style={styles.profileCard}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>
              {(users.username ?? users.email)?.[0]?.toUpperCase() ?? "U"}
            </Text>
          </View>
        </View>
        <Text style={styles.name}>
          {users.username ? `${users.username} ${users.surname ?? ""}` : "User"}
        </Text>
        <Text style={styles.email}>{users.email}</Text>
      </View>

      {/* ─── Menu Items ─── */}
      <View style={styles.menuCard}>
        <MenuItem C={C} icon="bag-handle-outline" label="My Orders"
          onPress={() => router.push("/(tab)/orders")} />
        <View style={styles.menuDivider} />
        <MenuItem C={C} icon="heart-outline" label="Wishlist"
          onPress={() => Alert.alert("Coming Soon", "Wishlist feature is on the way!")} />
        <View style={styles.menuDivider} />
        <MenuItem C={C} icon="settings-outline" label="Settings"
          onPress={() => Alert.alert("Coming Soon", "Settings will be available soon!")} />
        <View style={styles.menuDivider} />
        <MenuItem C={C} icon="help-circle-outline" label="Help & Support"
          onPress={() => Alert.alert("Support", "Contact us at support@shophub.com")} />
      </View>

      {/* ─── Logout ─── */}
      <Pressable
        style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={22} color={C.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function MenuItem({
  C, icon, label, onPress,
}: {
  C: ThemeColors;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const styles = useMemo(() => mkMenuItemStyles(C), [C]);
  return (
    <Pressable
      style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={20} color={C.accent} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
    </Pressable>
  );
}

function mkMenuItemStyles(C: ThemeColors) {
  return StyleSheet.create({
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: Spacing.md,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: Radius.sm,
      backgroundColor: C.accentSurface,
      alignItems: "center",
      justifyContent: "center",
      marginRight: Spacing.md,
    },
    menuLabel: { ...Typography.body, color: C.text, flex: 1 },
  });
}

function mkStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.background,
      padding: Spacing.xxl,
    },

    // Profile
    profileCard: {
      backgroundColor: C.surface,
      borderRadius: Radius.xl,
      padding: Spacing.xxl,
      alignItems: "center",
      ...Shadows.md,
      marginBottom: Spacing.lg,
    },
    avatarRing: {
      width: 84,
      height: 84,
      borderRadius: 42,
      borderWidth: 3,
      borderColor: C.accent,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: Spacing.md,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: C.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarLetter: { fontSize: 28, fontWeight: "800" as const, color: C.textOnPrimary },
    name: { ...Typography.h2, color: C.text },
    email: { ...Typography.caption, color: C.textSecondary, marginTop: 2 },

    // Menu
    menuCard: {
      backgroundColor: C.surface,
      borderRadius: Radius.xl,
      padding: Spacing.lg,
      ...Shadows.sm,
      marginBottom: Spacing.xxl,
    },
    menuDivider: { height: 1, backgroundColor: C.borderLight },

    // Logout
    logoutBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: C.errorLight,
      height: 52,
      borderRadius: Radius.md,
      gap: Spacing.sm,
    },
    logoutBtnPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
    logoutText: { ...Typography.button, color: C.error },
  });
}
