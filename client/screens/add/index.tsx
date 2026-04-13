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
import { useTheme } from '@/contexts/ThemeContext';
import { StorageService, RENOVATION_CATEGORIES } from '@/utils/renovation';

export default function AddRecordPage() {
  const { colors, theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [customNote, setCustomNote] = useState('');

  const currentCategory = RENOVATION_CATEGORIES.find((c) => c.id === selectedCategory);

  // 格式化金额（加千分位）
  const formatAmountInput = (value: string) => {
    const cleaned = value.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
    if (parts[1] && parts[1].length > 2) parts[1] = parts[1].slice(0, 2);
    if (parts[0].length > 7) parts[0] = parts[0].slice(0, 7);
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length > 1 ? intPart + '.' + parts[1] : intPart;
  };

  const handleAmountChange = (value: string) => {
    const rawValue = value.replace(/,/g, '');
    const numValue = parseFloat(rawValue);
    if (rawValue && numValue > 9999999) return;
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
      subCategory: selectedSubCategory || customNote || '其他',
      room: '',
      note: customNote,
      date: new Date().toISOString(),
    });

    setAmount('');
    setSelectedCategory('');
    setSelectedSubCategory('');
    setCustomNote('');
    Toast.show({ type: 'success', text1: '已记录' });
  };

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <LinearGradient
        colors={theme === 'dark' ? ['#1A1A2E', '#16213E', '#0F3460'] : ['#F5F6FA', '#FFFFFF', '#F0F0F5']}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* 标题 */}
          <Text style={[styles.title, { color: colors.text }]}>记一笔</Text>

          {/* 金额 */}
          <View style={styles.amountCard}>
            <BlurView intensity={theme === 'dark' ? 30 : 20} tint={theme} style={[styles.amountBlur, { backgroundColor: colors.cardBg }]}>
              <View style={styles.amountRow}>
                <Text style={[styles.currency, { color: colors.textMuted }]}>¥</Text>
                <TextInput
                  style={[styles.amountInput, { color: colors.text }]}
                  placeholder="0.00"
                  placeholderTextColor={theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
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
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>类别（可选）</Text>
            <View style={styles.categoryGrid}>
              {RENOVATION_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.categoryItem,
                    { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                    selectedCategory === cat.id && { borderColor: cat.color, backgroundColor: `${cat.color}15` },
                  ]}
                  onPress={() => {
                    setSelectedCategory(selectedCategory === cat.id ? '' : cat.id);
                    setSelectedSubCategory('');
                  }}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={18}
                    color={selectedCategory === cat.id ? cat.color : colors.textMuted}
                  />
                  <Text style={[styles.categoryText, { color: selectedCategory === cat.id ? colors.text : colors.textSecondary }]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* 细项（选中类别后显示） */}
          {currentCategory && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>细项（可选）</Text>
              <View style={styles.subGrid}>
                {currentCategory.subCategories.map((sub) => (
                  <Pressable
                    key={sub}
                    style={[
                      styles.subItem,
                      { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                      selectedSubCategory === sub && { backgroundColor: colors.cardBg, borderColor: colors.primary },
                    ]}
                    onPress={() => setSelectedSubCategory(selectedSubCategory === sub ? '' : sub)}
                  >
                    <Text style={[styles.subText, { color: selectedSubCategory === sub ? colors.text : colors.textSecondary }]}>
                      {sub}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* 备注 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>备注（可选，限20字）</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder, color: colors.text }]}
              placeholder="补充说明..."
              placeholderTextColor={colors.textMuted}
              value={customNote}
              onChangeText={(v) => setCustomNote(v.slice(0, 20))}
              maxLength={20}
            />
            <Text style={[styles.charCount, { color: colors.textMuted }]}>{customNote.length}/20</Text>
          </View>

          {/* 提交 */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <LinearGradient colors={theme === 'dark' ? ['#E94560', '#FF6B6B'] : ['#E94560', '#FF7B7B']} style={styles.submitGradient}>
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
  title: { fontSize: 28, fontWeight: '700', marginTop: 60, marginBottom: 24 },
  amountCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 32 },
  amountBlur: { padding: 24 },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  currency: { fontSize: 32, marginRight: 8 },
  amountInput: { fontSize: 48, fontWeight: '700', minWidth: 200, textAlign: 'center', letterSpacing: 2 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, marginBottom: 10 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  categoryText: { fontSize: 13 },
  subGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  subText: { fontSize: 13 },
  textInput: {
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  charCount: { fontSize: 11, textAlign: 'right', marginTop: 6 },
  submitBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 16 },
  submitGradient: { paddingVertical: 16, alignItems: 'center' },
  submitText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
});
