import { useLogin } from '@/informations/loginContext';
import { useApiCreate } from '@/informations/providerData';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/informations/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProductDetail() {
  const router = useRouter();
  const { users } = useLogin();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, addToCart } = useApiCreate();
  const product = products.find((p) => p.id == Number(id));

  if (!users) {
    router.replace('/(tab)/login');
    return null;
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.textMuted} />
        <Text style={styles.notFoundText}>Product not found</Text>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* ─── Product Image ─── */}
        <View style={styles.imageArea}>
          {product.image ? (
            <Image
              source={{ uri: 'data:image/png;base64,' + product.image }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={80} color={Colors.textMuted} />
            </View>
          )}
        </View>

        {/* ─── Product Info ─── */}
        <View style={styles.infoCard}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{product.price} TMT</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {product.description ??
              'High quality product carefully selected for the best shopping experience. Order now and get fast delivery to your doorstep.'}
          </Text>

          {/* ─── Features ─── */}
          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={22} color={Colors.primary} />
              <Text style={styles.featureText}>Quality</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="car" size={22} color={Colors.primary} />
              <Text style={styles.featureText}>Fast Delivery</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="refresh" size={22} color={Colors.primary} />
              <Text style={styles.featureText}>Easy Return</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ─── Bottom Bar ─── */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Price</Text>
          <Text style={styles.bottomPrice}>{product.price} TMT</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
          onPress={handleAddToCart}
        >
          <Ionicons name="bag-add" size={22} color={Colors.textOnPrimary} />
          <Text style={styles.addBtnText}>Add to Cart</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },

  // Image
  imageArea: {
    width: '100%',
    height: 320,
    backgroundColor: Colors.surfaceAlt,
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Info
  infoCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    marginTop: -20,
    padding: Spacing.xxl,
    minHeight: 300,
  },
  category: {
    ...Typography.small,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  name: {
    ...Typography.h1,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  price: {
    ...Typography.price,
    color: Colors.primaryDark,
    marginTop: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  // Features
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.xxl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  featureItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  featureText: {
    ...Typography.small,
    color: Colors.textSecondary,
  },

  notFoundText: {
    ...Typography.h3,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.lg,
  },
  bottomLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  bottomPrice: {
    ...Typography.price,
    color: Colors.text,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  addBtnPressed: {
    backgroundColor: Colors.primaryDark,
    transform: [{ scale: 0.97 }],
  },
  addBtnText: {
    ...Typography.button,
    color: Colors.textOnPrimary,
  },
});
