import React, { useState } from 'react';
import {
  View, Text, TextInput, Image, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, StyleSheet,
} from 'react-native';
import { useImagePicker } from '../hooks/useImagePicker';
import { createProductWithImage } from '../api/products';
import { PickedImage } from '../api/types';

type Props = {
  commerceAreaId: number;       // haýsy dükana goşulýar
  onCreated?: () => void;       // üstünlikden soň (mysal: yzyna gaýtmak)
};

export default function AddProductScreen({ commerceAreaId, onCreated }: Props) {
  const { pickImages, picking } = useImagePicker();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState<PickedImage | null>(null);
  const [saving, setSaving] = useState(false);

  const onPickImage = async () => {
    const imgs = await pickImages(false);
    if (imgs.length) setImage(imgs[0]);
  };

  const onSubmit = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Boş meýdan', 'Ady we bahasy hökman');
      return;
    }
    try {
      setSaving(true);
      await createProductWithImage(
        {
          product_name: name.trim(),
          price: Number(price),
          stock: stock ? Number(stock) : 0,
          commerce_area_id: commerceAreaId,
        },
        image // null bolsa surat ýüklenmeýär
      );
      Alert.alert('Üstünlik', 'Product goşuldy');
      // Formy arassalaýarys
      setName(''); setPrice(''); setStock(''); setImage(null);
      onCreated?.();
    } catch (e: any) {
      Alert.alert('Ýalňyşlyk', e.message);
    } finally {
      setSaving(false);
    }
  };

  const busy = saving || picking;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>Täze product</Text>

      {/* Surat saýlamak */}
      <TouchableOpacity style={s.imageBox} onPress={onPickImage} disabled={busy}>
        {image ? (
          <Image source={{ uri: image.uri }} style={s.image} />
        ) : (
          <View style={s.imagePlaceholder}>
            <Text style={s.plus}>＋</Text>
            <Text style={s.imageHint}>Surat goşmak</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Ady */}
      <Text style={s.label}>Ady *</Text>
      <TextInput
        style={s.input} value={name} onChangeText={setName}
        placeholder="Mysal: Samsung A55" editable={!busy}
      />

      {/* Bahasy */}
      <Text style={s.label}>Bahasy (TMT) *</Text>
      <TextInput
        style={s.input} value={price} onChangeText={setPrice}
        placeholder="350" keyboardType="numeric" editable={!busy}
      />

      {/* Stock */}
      <Text style={s.label}>Sany (stock)</Text>
      <TextInput
        style={s.input} value={stock} onChangeText={setStock}
        placeholder="10" keyboardType="numeric" editable={!busy}
      />

      {/* Ýatda saklamak */}
      <TouchableOpacity
        style={[s.btn, busy && s.btnDisabled]} onPress={onSubmit} disabled={busy}>
        {saving
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.btnText}>Goşmak</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  imageBox: {
    width: '100%', height: 200, borderRadius: 12, backgroundColor: '#f5f5f5',
    overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: '#e0e0e0',
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  plus: { fontSize: 36, color: '#aaa' },
  imageHint: { color: '#999', marginTop: 4 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
  },
  btn: {
    backgroundColor: '#2563eb', paddingVertical: 15, borderRadius: 10,
    alignItems: 'center', marginTop: 24,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
