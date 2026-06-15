import { useLogin } from '@/informations/loginContext';
import { useApiCreate } from '@/informations/providerData';
import { useThemeColors, type ThemeColors, Radius } from '@/informations/theme';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CartBadge({ count }: { count: number }) {
    const C = useThemeColors();
    const styles = useMemo(() => mkBadgeStyles(C), [C]);
    if (count === 0) return null;
    return (
        <View style={styles.badge}>
            <Text style={styles.text}>{count > 9 ? '9+' : count}</Text>
        </View>
    );
}

function mkBadgeStyles(C: ThemeColors) {
    return StyleSheet.create({
        badge: {
            position: 'absolute', top: -4, right: -10,
            backgroundColor: C.badge, borderRadius: 10,
            minWidth: 18, height: 18,
            alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
        },
        text: { color: '#fff', fontSize: 10, fontWeight: '700' as const },
    });
}

export default function TabLayout() {
    const C = useThemeColors();
    const { users } = useLogin();
    const { cart } = useApiCreate();
    const insets = useSafeAreaInsets();
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: C.surface,
                    borderTopWidth: 0,
                    elevation: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -3 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom + 6,
                    paddingTop: 6,
                },
                tabBarActiveTintColor: C.primary,
                tabBarInactiveTintColor: C.textMuted,
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'home' : 'home-outline'} size={focused ? 26 : 24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="post"
                options={{
                    tabBarLabel: 'Add',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'add-circle' : 'add-circle-outline'} size={focused ? 28 : 26} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="cart"
                options={{
                    tabBarLabel: 'Cart',
                    href: users ? '/(tab)/cart' : null,
                    tabBarIcon: ({ color, focused }) => (
                        <View>
                            <Feather name="shopping-bag" size={focused ? 26 : 24} color={color} />
                            <CartBadge count={cartCount} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="login"
                options={{
                    tabBarLabel: 'Profile',
                    href: users ? null : '/(tab)/login',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'person' : 'person-outline'} size={focused ? 26 : 24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="logout"
                options={{
                    tabBarLabel: 'Profile',
                    href: users ? '/(tab)/logout' : null,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'person' : 'person-outline'} size={focused ? 26 : 24} color={color} />
                    ),
                }}
            />

            {/* Hidden routes */}
            <Tabs.Screen name="category" options={{ href: null }} />
            <Tabs.Screen name="brands" options={{ href: null }} />
            <Tabs.Screen name="orders" options={{ href: null }} />
            <Tabs.Screen name="commerce_area" options={{ href: null }} />
            <Tabs.Screen name="product" options={{ href: null }} />
        </Tabs>
    );
}
