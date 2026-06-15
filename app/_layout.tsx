import { useLogin } from "@/informations/loginContext";
import { useApiCreate } from "@/informations/providerData";
import { Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, StyleSheet, Text, View } from "react-native";

export default function RootLayout() {
  const initialize      = useLogin((s) => s.initialize);
  const refreshProducts = useApiCreate((s) => s.refreshProducts);

  const [ready,           setReady]           = useState(false);
  const [serverError,     setServerError]     = useState<string | null>(null);
  const bannerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      // Restore auth session first (local AsyncStorage, always fast)
      await initialize();

      // Try to load products — failure means server unreachable
      try {
        await refreshProducts();
        setServerError(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Cannot reach server";
        setServerError(msg);
        // Fade in the error banner after a short delay
        setTimeout(() => {
          Animated.timing(bannerOpacity, {
            toValue: 1, duration: 400, useNativeDriver: true,
          }).start();
        }, 300);
      } finally {
        setReady(true);
      }
    })();
  }, []); // run once on mount

  if (!ready) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#f2c94c" />
        <Text style={styles.splashText}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {serverError && (
        <Animated.View style={[styles.banner, { opacity: bannerOpacity }]}>
          <Text style={styles.bannerIcon}>⚠</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Server unreachable</Text>
            <Text style={styles.bannerUrl} numberOfLines={1}>
              {process.env.EXPO_PUBLIC_API_URL ?? "URL not set"}
            </Text>
          </View>
        </Animated.View>
      )}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tab)" />
        <Stack.Screen name="[id]" options={{ presentation: "transparentModal" }} />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1, alignItems: "center", justifyContent: "center",
    backgroundColor: "#1a1730",
  },
  splashText: { color: "#e5d3c1", marginTop: 12, fontSize: 14 },
  banner: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#7c2d12",
    paddingHorizontal: 16, paddingVertical: 10,
    gap: 10,
  },
  bannerIcon:  { color: "#fbbf24", fontSize: 18 },
  bannerTitle: { color: "#fef3c7", fontSize: 13, fontWeight: "700" },
  bannerUrl:   { color: "#fde68a", fontSize: 11, opacity: 0.8 },
});
