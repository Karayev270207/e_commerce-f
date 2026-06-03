import { useApiCreate } from '@/informations/providerData';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/informations/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PostScreen() {
  const { loading, postProduct } = useApiCreate();
  const [image, setImage] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Required', 'Please grant photo library access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImage(result.assets[0].base64);
    }
  };

  const handleSubmit = async () => {
    if (!name || !category || !price) {
      Alert.alert('Missing Fields', 'Please fill in all product details.');
      return;
    }
    if (isNaN(Number(price))) {
      Alert.alert('Invalid Price', 'Please enter a valid number for price.');
      return;
    }

    await postProduct({ image, name, category, price: Number(price) });
    Alert.alert('✅ Success', 'Product has been posted!');
    setImage('');
    setName('');
    setCategory('');
    setPrice('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* ─── Header ─── */}
          <Text style={styles.title}>Sell a Product</Text>
          <Text style={styles.subtitle}>List your item for the world to see</Text>

          {/* ─── Image Picker ─── */}
          <Pressable
            style={({ pressed }) => [styles.imagePicker, pressed && { opacity: 0.8 }]}
            onPress={pickImage}
          >
            {image ? (
              <View style={styles.imagePreviewWrap}>
                <Image
                  source={{ uri: 'data:image/png;base64,' + image }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                  <Ionicons name="camera" size={24} color="#fff" />
                  <Text style={styles.changeText}>Change Photo</Text>
                </View>
              </View>
            ) : (
              <View style={styles.imageEmpty}>
                <MaterialCommunityIcons
                  name="camera-plus-outline"
                  size={48}
                  color={Colors.textMuted}
                />
                <Text style={styles.imageEmptyText}>Tap to add photo</Text>
              </View>
            )}
          </Pressable>

          {/* ─── Form ─── */}
          <View style={styles.formCard}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Wireless Headphones"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Electronics"
              placeholderTextColor={Colors.textMuted}
              value={category}
              onChangeText={setCategory}
            />

            <Text style={styles.label}>Price (TMT)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 250"
              placeholderTextColor={Colors.textMuted}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && styles.submitBtnPressed,
                loading && styles.submitDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={20} color="#fff" />
                  <Text style={styles.submitText}>Publish Product</Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xxl, paddingBottom: 100 },

  title: { ...Typography.h1, color: Colors.text },
  subtitle: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2, marginBottom: Spacing.lg },

  // Image picker
  imagePicker: {
    width: '100%',
    height: 200,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginBottom: Spacing.xxl,
  },
  imagePreviewWrap: { flex: 1 },
  imagePreview: { width: '100%', height: '100%' },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeText: { ...Typography.captionBold, color: '#fff', marginTop: 4 },
  imageEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imageEmptyText: { ...Typography.caption, color: Colors.textMuted, marginTop: Spacing.sm },

  // Form
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    ...Shadows.md,
  },
  label: { ...Typography.captionBold, color: Colors.text, marginBottom: Spacing.xs, marginTop: Spacing.md },
  input: {
    backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, height: 48,
    ...Typography.body, color: Colors.text,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  submitBtn: {
    flexDirection: 'row', backgroundColor: Colors.primary, height: 52,
    borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center',
    marginTop: Spacing.xxl, gap: Spacing.sm, ...Shadows.md,
  },
  submitBtnPressed: { backgroundColor: Colors.primaryDark, transform: [{ scale: 0.98 }] },
  submitDisabled: { opacity: 0.7 },
  submitText: { ...Typography.button, color: Colors.textOnPrimary },
});
