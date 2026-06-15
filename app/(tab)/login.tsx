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
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const C = useThemeColors();
  const styles = useMemo(() => mkStyles(C), [C]);
  const { login, register, isLoading, users } = useLogin();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [surname, setSurname] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (users) {
        const timer = setTimeout(() => {
          router.replace("/(tab)/category");
        }, 0);
        return () => clearTimeout(timer);
      }
    }, [users, router]),
  );

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) {
      setError("Please fill in email and password");
      return;
    }
    if (isRegister && (!username || !surname)) {
      setError("Please fill in all fields");
      return;
    }
    const result = isRegister
      ? await register({ email, password, username, surname })
      : await login(email, password);
    if (!result.success) setError(result.error ?? "Something went wrong");
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ─── Top banner ─── */}
          <View style={styles.banner}>
            <View style={styles.logoCircle}>
              <Ionicons name="bag-handle" size={44} color={C.textOnPrimary} />
            </View>
            <Text style={styles.appName}>ShopHub</Text>
            <Text style={styles.appTag}>
              {isRegister ? "Create your account" : "Welcome back!"}
            </Text>
          </View>

          {/* ─── Form card ─── */}
          <View style={styles.card}>
            {error !== "" && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={C.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {isRegister && (
              <>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color={C.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="First name"
                    placeholderTextColor={C.textMuted}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color={C.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="Last name"
                    placeholderTextColor={C.textMuted}
                    value={surname}
                    onChangeText={setSurname}
                    autoCapitalize="words"
                  />
                </View>
              </>
            )}

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={C.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={C.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={C.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={C.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={C.textMuted}
                />
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && styles.submitBtnPressed,
                isLoading && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={C.textOnPrimary} />
              ) : (
                <Text style={styles.submitText}>
                  {isRegister ? "Create Account" : "Sign In"}
                </Text>
              )}
            </Pressable>

            <Pressable
              style={styles.toggleRow}
              onPress={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
            >
              <Text style={styles.toggleText}>
                {isRegister
                  ? "Already have an account? "
                  : "Don't have an account? "}
                <Text style={styles.toggleLink}>
                  {isRegister ? "Sign In" : "Sign Up"}
                </Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function mkStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.primary },
    keyboardView: { flex: 1 },
    scroll: { flexGrow: 1 },

    // Top banner (primary color background)
    banner: {
      alignItems: "center",
      paddingTop: 56,
      paddingBottom: 40,
      paddingHorizontal: Spacing.xxl,
      backgroundColor: C.primary,
    },
    logoCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: C.primaryDark,
      alignItems: "center",
      justifyContent: "center",
      ...Shadows.lg,
      marginBottom: Spacing.md,
    },
    appName: {
      fontSize: 30,
      fontWeight: "800" as const,
      color: C.textOnPrimary,
      letterSpacing: -0.5,
    },
    appTag: {
      ...Typography.body,
      color: C.textOnPrimary,
      opacity: 0.75,
      marginTop: Spacing.xs,
    },

    // Form card (sits on top of the banner)
    card: {
      flex: 1,
      backgroundColor: C.background,
      borderTopLeftRadius: Radius.xl,
      borderTopRightRadius: Radius.xl,
      padding: Spacing.xxl,
      paddingTop: Spacing.xxxl,
      ...Shadows.lg,
    },

    // Error
    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.errorLight,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.sm,
      marginBottom: Spacing.lg,
      gap: Spacing.sm,
    },
    errorText: { ...Typography.caption, color: C.error, flex: 1 },

    // Input
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.surface,
      borderRadius: Radius.md,
      paddingHorizontal: Spacing.md,
      height: 52,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: C.borderLight,
    },
    input: {
      flex: 1,
      marginLeft: Spacing.sm,
      ...Typography.body,
      color: C.text,
    },

    // Submit
    submitBtn: {
      backgroundColor: C.primary,
      height: 52,
      borderRadius: Radius.md,
      alignItems: "center",
      justifyContent: "center",
      marginTop: Spacing.sm,
      ...Shadows.md,
    },
    submitBtnPressed: {
      backgroundColor: C.primaryDark,
      transform: [{ scale: 0.98 }],
    },
    submitBtnDisabled: { opacity: 0.7 },
    submitText: { ...Typography.button, color: C.textOnPrimary },

    // Toggle
    toggleRow: {
      alignItems: "center",
      marginTop: Spacing.lg,
      paddingVertical: Spacing.sm,
    },
    toggleText: { ...Typography.body, color: C.textSecondary },
    toggleLink: { color: C.primary, fontWeight: "700" as const },
  });
}
