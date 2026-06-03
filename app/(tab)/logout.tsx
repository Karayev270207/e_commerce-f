import { useLogin } from "@/informations/loginContext";
import {
    Colors,
    Radius,
    Shadows,
    Spacing,
    Typography,
} from "@/informations/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  const { logout, users, isLoading } = useLogin();
  const router = useRouter();

  // Handle navigation when user logs out
  useEffect(() => {
    // Only redirect if this is from logout, not from initial app load
    // Check if we're already on the login screen
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
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  // Return loading state while checking auth
  if (!users) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Profile Header ─── */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>
            {(users.username ?? users.email)?.[0]?.toUpperCase() ?? "U"}
          </Text>
        </View>
        <Text style={styles.name}>
          {users.username ? `${users.username} ${users.surname ?? ""}` : "User"}
        </Text>
        <Text style={styles.email}>{users.email}</Text>
      </View>

      {/* ─── Menu Items ─── */}
      <View style={styles.menuCard}>
        <MenuItem
          icon="bag-handle-outline"
          label="My Orders"
          onPress={() =>
            Alert.alert("Coming Soon", "Order history will be available soon!")
          }
        />
        <View style={styles.menuDivider} />
        <MenuItem
          icon="heart-outline"
          label="Wishlist"
          onPress={() =>
            Alert.alert("Coming Soon", "Wishlist feature is on the way!")
          }
        />
        <View style={styles.menuDivider} />
        <MenuItem
          icon="settings-outline"
          label="Settings"
          onPress={() =>
            Alert.alert("Coming Soon", "Settings will be available soon!")
          }
        />
        <View style={styles.menuDivider} />
        <MenuItem
          icon="help-circle-outline"
          label="Help & Support"
          onPress={() =>
            Alert.alert("Support", "Contact us at support@shophub.com")
          }
        />
      </View>

      {/* ─── Logout ─── */}
      <Pressable
        style={({ pressed }) => [
          styles.logoutBtn,
          pressed && styles.logoutBtnPressed,
        ]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={22} color={Colors.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={22} color={Colors.text} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.xxl,
  },

  // Profile
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    alignItems: "center",
    ...Shadows.md,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  avatarLetter: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textOnPrimary,
  },
  name: { ...Typography.h2, color: Colors.text },
  email: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },

  // Menu
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
    marginBottom: Spacing.xxl,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  menuLabel: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
    marginLeft: Spacing.md,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.errorLight,
    height: 52,
    borderRadius: Radius.md,
    gap: Spacing.sm,
  },
  logoutBtnPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  logoutText: { ...Typography.button, color: Colors.error },
});
