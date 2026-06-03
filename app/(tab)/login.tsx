import { useLogin } from "@/informations/loginContext";
import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "@/informations/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const { login, register, isLoading, users } = useLogin();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [surname, setSurname] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useFocusEffect(
    useCallback(() => {
      if (users) {
        // Small delay to ensure router is ready
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

    let result;
    if (isRegister) {
      result = await register({ email, password, username, surname });
    } else {
      result = await login(email, password);
    }

    if (!result.success) {
      setError(result.error ?? "Something went wrong");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* ─── Logo Area ─── */}
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Ionicons
              name="bag-handle"
              size={40}
              color={Colors.textOnPrimary}
            />
          </View>
          <Text style={styles.appName}>ShopHub</Text>
          <Text style={styles.appTag}>
            {isRegister ? "Create your account" : "Welcome back!"}
          </Text>
        </View>

        {/* ─── Form Card ─── */}
        <View style={styles.card}>
          {error !== "" && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {isRegister && (
            <>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={Colors.textMuted}
                />
                <TextInput
                  style={styles.input}
                  placeholder="First name"
                  placeholderTextColor={Colors.textMuted}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={Colors.textMuted}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Last name"
                  placeholderTextColor={Colors.textMuted}
                  value={surname}
                  onChangeText={setSurname}
                  autoCapitalize="words"
                />
              </View>
            </>
          )}

          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={Colors.textMuted}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={Colors.textMuted}
              />
            </Pressable>
          </View>

          {/* ─── Submit Button ─── */}
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
              <ActivityIndicator color={Colors.textOnPrimary} />
            ) : (
              <Text style={styles.submitText}>
                {isRegister ? "Create Account" : "Sign In"}
              </Text>
            )}
          </Pressable>

          {/* ─── Toggle ─── */}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xxl,
  },

  // Logo
  logoArea: {
    alignItems: "center",
    marginBottom: Spacing.xxxl,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.lg,
  },
  appName: {
    ...Typography.h1,
    color: Colors.primary,
    marginTop: Spacing.md,
  },
  appTag: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  // Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    ...Shadows.lg,
  },

  // Error
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.errorLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    flex: 1,
  },

  // Input
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 52,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  input: {
    flex: 1,
    marginLeft: Spacing.sm,
    ...Typography.body,
    color: Colors.text,
  },

  // Submit
  submitBtn: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.sm,
    ...Shadows.md,
  },
  submitBtnPressed: {
    backgroundColor: Colors.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
    ...Typography.button,
    color: Colors.textOnPrimary,
  },

  // Toggle
  toggleRow: {
    alignItems: "center",
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  toggleText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  toggleLink: {
    color: Colors.primary,
    fontWeight: "700",
  },
});
