import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Screen } from '@/components/Screen';
import { StorageService, RENOVATION_CATEGORIES } from '@/utils/renovation';

export default function AddRecordPage() {
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const currentCategory = RENOVATION_CATEGORIES.find((c) => c.id === selectedCategory);

  // 格式化金额（加千分位）
  const formatAmountInput = (value: string) => {
    // 移除非数字和小数点
    const cleaned = value.replace(/[^\d.]/g, '');
    // 只保留一个小数点
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    // 小数点后最多2位
    if (parts[1] && parts[1].length > 2) {
      parts[1] = parts[1].slice(0, 2);
    }
    // 加千分位
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length > 1 ? intPart + '.' + parts[1] : intPart;
  };

  const handleAmountChange = (value: string) => {
    // 去掉分隔符，只保留原始数字
    const rawValue = value.replace(/,/g, '');
    setAmount(rawValue);
  };

  // 提交记录
  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Toast.show({ type: 'error', text1: '请输入金额' });
      return;
    }

    await StorageService.addRecord({
      amount: numAmount,
      category: selectedCategory || 'other',
      subCategory: currentCategory?.subCategories[0] || '其他',
      room: '全屋',
      note: '',
      date: new Date().toISOString(),
    });

    setAmount('');
    setSelectedCategory('');
    Toast.show({ type: 'success', text1: '已记录' });
  };

  return (
    <Screen style={styles.container}>
      <LinearGradient colors={['#1A1A2E', '#16213E', '#0F3460']} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  keyboardType="decimal-pad"
                  value={formatAmountInput(amount)}
                  onChangeText={handleAmountChange}
                  autoFocus
                />
              </View>
            </BlurView>
          </View>

          {/* 类别 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>类别（可选）</Text>
            <View style={styles.categoryGrid}>
              {RENOVATION_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.categoryItem,
                    selectedCategory === cat.id && { borderColor: cat.color, backgroundColor: `${cat.color}15` },
                  ]}
                  onPress={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
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

          {/* 细分类目（选中类别后显示） */}
          {currentCategory && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>细项（可选）</Text>
              <View style={styles.subGrid}>
                {currentCategory.subCategories.map((sub, idx) => (
                  <Pressable key={sub} style={styles.subItem}>
                    <Text style={styles.subText}>{sub}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* 空间（选中类别后显示） */}
          {currentCategory && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>空间（可选）</Text>
              <View style={styles.roomGrid}>
                {['全屋', '客厅', '卧室', '厨房', '卫生间', '阳台'].map((room) => (
                  <Pressable key={room} style={styles.roomItem}>
                    <Text style={styles.roomText}>{room}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

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
  amountCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 32 },
  amountBlur: { padding: 24 },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  currency: { fontSize: 32, color: 'rgba(255,255,255,0.5)', marginRight: 8 },
  amountInput: { fontSize: 48, fontWeight: '700', color: '#FFF', minWidth: 200, textAlign: 'center', letterSpacing: 2 },
  section: { marginBottom: 24 },
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
  subText: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  roomGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roomItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  roomText: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  submitBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 16 },
  submitGradient: { paddingVertical: 16, alignItems: 'center' },
  submitText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
});
