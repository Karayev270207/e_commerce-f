import { resolveImageUrl } from '@/informations/cloudinary';
import { useThemeColors, type ThemeColors, Radius, Shadows, Spacing, Typography } from '@/informations/theme';
import { Product } from '@/informations/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.lg * 3) / 2;

interface ProductCardProps {
    item: Product;
    onPress: (id: string | number) => void;
}

export default function ProductCard({ item, onPress }: ProductCardProps) {
    const C = useThemeColors();
    const styles = useMemo(() => mkStyles(C), [C]);
    const imageUri = resolveImageUrl(item.image, process.env.EXPO_PUBLIC_API_URL);

    return (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => onPress(item.id)}
        >
            <View style={styles.imageBox}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="image-outline" size={40} color={C.textMuted} />
                    </View>
                )}
            </View>
            <View style={styles.accentBar} />
            <View style={styles.cardBody}>
                <Text style={styles.cardCategory}>{item.category}</Text>
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                {item.description ? (
                    <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                ) : null}
                <Text style={styles.cardPrice}>{item.price} TMT</Text>
            </View>
        </Pressable>
    );
}

function mkStyles(C: ThemeColors) {
    return StyleSheet.create({
        card: {
            width: CARD_WIDTH,
            backgroundColor: C.surface,
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
            height: CARD_WIDTH * 0.8,
            backgroundColor: C.surfaceAlt,
        },
        image: { width: '100%', height: '100%' },
        imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
        accentBar: {
            height: 3,
            backgroundColor: C.primary,
            width: '35%',
            borderBottomRightRadius: Radius.full,
        },
        cardBody: { padding: Spacing.md, paddingTop: Spacing.sm },
        cardCategory: {
            ...Typography.small,
            color: C.accent,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
        },
        cardName: { ...Typography.bodyBold, color: C.text, marginTop: 2 },
        cardDesc: { ...Typography.small, color: C.textSecondary, marginTop: 2, lineHeight: 16 },
        cardPrice: {
            ...Typography.price,
            color: C.primary,
            marginTop: Spacing.xs,
            fontSize: 16,
            fontWeight: '800' as const,
        },
    });
}
