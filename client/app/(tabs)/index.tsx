import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { StorageService, RenovationRecord, RENOVATION_CATEGORIES, ROOMS, getCategoryInfo } from '@/utils/renovation';

export default function AddRecordPage() {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');

  const currentCategory = RENOVATION_CATEGORIES.find((c) => c.id === selectedCategory);

  // 提交记录
  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('提示', '请输入金额');
      return;
    }
    if (!selectedCategory || !selectedSubCategory || !selectedRoom) {
      Alert.alert('提示', '请完善信息');
      return;
    }

    await StorageService.addRecord({
      amount: numAmount,
      category: selectedCategory,
      subCategory: selectedSubCategory,
      room: selectedRoom,
      note: note.trim(),
      date: new Date().toISOString(),
    });

    // 重置表单
    setAmount('');
    setNote('');
    setSelectedCategory('');
    setSelectedSubCategory('');
    setSelectedRoom('');
    Alert.alert('成功', '已记录这笔支出');
  };

  return (
    <Screen style={styles.container}>
      <LinearGradient colors={['#1A1A2E', '#16213E', '#0F3460']} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* 标题 */}
          <Text style={styles.title}>记一笔</Text>

          {/* 金额 */}
          <View style={styles.amountCard}>
            <BlurView intensity={30} tint="dark" style={styles.amountBlur}>
              <View style={styles.amountRow}>
                <Text style={styles.currency}>¥</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
            </BlurView>
          </View>

          {/* 类别 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>类别</Text>
            <View style={styles.categoryGrid}>
              {RENOVATION_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.categoryItem,
                    selectedCategory === cat.id && { borderColor: cat.color, backgroundColor: `${cat.color}15` },
                  ]}
                  onPress={() => {
                    setSelectedCategory(cat.id);
                    setSelectedSubCategory('');
                  }}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={18}
                    color={selectedCategory === cat.id ? cat.color : 'rgba(255,255,255,0.5)'}
                  />
                  <Text style={[styles.categoryText, selectedCategory === cat.id && { color: '#FFF' }]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* 细分类目 */}
          {currentCategory && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>细项</Text>
              <View style={styles.subGrid}>
                {currentCategory.subCategories.map((sub) => (
                  <Pressable
                    key={sub}
                    style={[styles.subItem, selectedSubCategory === sub && styles.subItemActive]}
                    onPress={() => setSelectedSubCategory(sub)}
                  >
                    <Text style={[styles.subText, selectedSubCategory === sub && styles.subTextActive]}>
                      {sub}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* 空间 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>空间</Text>
            <View style={styles.roomGrid}>
              {ROOMS.map((room) => (
                <Pressable
                  key={room}
                  style={[styles.roomItem, selectedRoom === room && styles.roomItemActive]}
                  onPress={() => setSelectedRoom(room)}
                >
                  <Text style={[styles.roomText, selectedRoom === room && styles.roomTextActive]}>{room}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* 备注 */}
          <TextInput
            style={styles.noteInput}
            placeholder="备注（可选）"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={note}
            onChangeText={setNote}
          />

          {/* 提交 */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <LinearGradient colors={['#E94560', '#FF6B6B']} style={styles.submitGradient}>
              <Text style={styles.submitText}>记录支出</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFF', marginTop: 60, marginBottom: 24 },
  amountCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  amountBlur: { padding: 20 },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  currency: { fontSize: 32, color: 'rgba(255,255,255,0.5)', marginRight: 8 },
  amountInput: { fontSize: 48, fontWeight: '700', color: '#FFF', minWidth: 160, textAlign: 'center' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  categoryText: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  subGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  subItemActive: { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)' },
  subText: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  subTextActive: { color: '#FFF' },
  roomGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roomItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  roomItemActive: { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)' },
  roomText: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  roomTextActive: { color: '#FFF' },
  noteInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#FFF',
    marginBottom: 24,
  },
  submitBtn: { borderRadius: 14, overflow: 'hidden' },
  submitGradient: { paddingVertical: 16, alignItems: 'center' },
  submitText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
});
