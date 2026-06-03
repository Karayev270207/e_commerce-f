import { useLogin } from "@/informations/loginContext";
import { useApiCreate } from "@/informations/providerData";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";

export default function RootLayout() {
  const initializeAuth = useLogin((state) => state.initialize);
  const refreshProducts = useApiCreate((state) => state.refreshProducts);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeAuth();
        await refreshProducts();
      } catch (error) {
        console.error("Failed to initialize app:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
  }, [initializeAuth, refreshProducts]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tab)" />
      <Stack.Screen
        name="[id]"
        options={{ presentation: "transparentModal" }}
      />
    </Stack>
  );
}
