import { Colors, Radius, Shadows, Spacing, Typography } from '@/informations/theme';
import { Product } from '@/informations/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.lg * 3) / 2;

interface ProductCardProps {
    item: Product;
    onPress: (id: string | number) => void;
}

export default function ProductCard({ item, onPress }: ProductCardProps) {
    return (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => onPress(item.id)}
        >
            <View style={styles.imageBox}>
                {item.image ? (
                    <Image
                        source={{ uri: 'data:image/png;base64,' + item.image }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="image-outline" size={40} color={Colors.textMuted} />
                    </View>
                )}
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.cardCategory}>{item.category}</Text>
                <Text style={styles.cardName} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={styles.cardPrice}>{item.price} TMT</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: Colors.surface,
        borderRadius: Radius.lg,
        overflow: 'hidden',
        ...Shadows.md,
    },
    cardPressed: {
        opacity: 0.92,
        transform: [{ scale: 0.97 }],
    },
    imageBox: {
        width: '100%',
        height: CARD_WIDTH * 0.75,
        backgroundColor: Colors.surfaceAlt,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardBody: {
        padding: Spacing.md,
    },
    cardCategory: {
        ...Typography.small,
        color: Colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    cardName: {
        ...Typography.bodyBold,
        color: Colors.text,
        marginTop: 2,
    },
    cardPrice: {
        ...Typography.price,
        color: Colors.primaryDark,
        marginTop: Spacing.xs,
        fontSize: 16,
    },
});
