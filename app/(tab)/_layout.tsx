import { useLogin } from '@/informations/loginContext';
import { useApiCreate } from '@/informations/providerData';
import { Colors } from '@/informations/theme';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// ─── Cart Badge ───
function CartBadge({ count }: { count: number }) {
    if (count === 0) return null;
    return (
        <View style={badgeStyles.badge}>
            <Text style={badgeStyles.text}>{count > 9 ? '9+' : count}</Text>
        </View>
    );
}

const badgeStyles = StyleSheet.create({
    badge: {
        position: 'absolute',
        top: -4,
        right: -10,
        backgroundColor: Colors.badge,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    text: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
});

export default function TabLayout() {
    const { users } = useLogin();
    const { cart } = useApiCreate();
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Colors.surface,
                    borderTopWidth: 0,
                    elevation: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -3 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    height: 65,
                    paddingBottom: 8,
                    paddingTop: 6,
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textMuted,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'home' : 'home-outline'}
                            size={focused ? 26 : 24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="category"
                options={{
                    tabBarLabel: 'Shop',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'grid' : 'grid-outline'}
                            size={focused ? 26 : 24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="post"
                options={{
                    tabBarLabel: 'Sell',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'add-circle' : 'add-circle-outline'}
                            size={focused ? 28 : 26}
                            color={color}
                        />
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
                            <Feather
                                name="shopping-bag"
                                size={focused ? 26 : 24}
                                color={color}
                            />
                            <CartBadge count={cartCount} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="login"
                options={{
                    tabBarLabel: users ? 'Profile' : 'Login',
                    href: users ? null : '/(tab)/login',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'person' : 'person-outline'}
                            size={focused ? 26 : 24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="logout"
                options={{
                    tabBarLabel: 'Account',
                    href: users ? '/(tab)/logout' : null,
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialCommunityIcons
                            name={focused ? 'account-circle' : 'account-circle-outline'}
                            size={focused ? 26 : 24}
                            color={color}
                        />
                    ),
                }}
            />
            {/* Hide brands from tabs — it's merged into home */}
            <Tabs.Screen
                name="brands"
                options={{ href: null }}
            />
        </Tabs>
    );
}
