import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { StorageService, RenovationRecord, RENOVATION_CATEGORIES, getCategoryInfo } from '@/utils/renovation';

export default function StatsPage() {
  const [records, setRecords] = useState<RenovationRecord[]>([]);
  const [budget, setBudget] = useState(0);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  // 加载数据
  useEffect(() => {
    const load = async () => {
      const [data, savedBudget] = await Promise.all([
        StorageService.getRecords(),
        StorageService.getBudget(),
      ]);
      setRecords(data);
      setBudget(savedBudget);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 刷新数据（供其他地方调用）
  const refresh = async () => {
    const [data, savedBudget] = await Promise.all([
      StorageService.getRecords(),
      StorageService.getBudget(),
    ]);
    setRecords(data);
    setBudget(savedBudget);
  };

  // 统计数据
  const total = records.reduce((sum, r) => sum + r.amount, 0);
  const remaining = budget > 0 ? budget - total : 0;
  const percent = budget > 0 ? Math.min((total / budget) * 100, 100) : 0;

  // 按类别统计
  const categoryStats = RENOVATION_CATEGORIES.map((cat) => ({
    ...cat,
    total: records.filter((r) => r.category === cat.id).reduce((sum, r) => sum + r.amount, 0),
  })).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);

  // 预算输入格式化
  const handleBudgetInputChange = (value: string) => {
    const cleaned = value.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    // 限制整数部分 7 位（最大 9999999）
    if (parts[0].length > 7) return;
    if (parts[1] && parts[1].length > 2) parts[1] = parts[1].slice(0, 2);
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setBudgetInput(parts.length > 1 ? intPart + '.' + parts[1] : intPart);
  };

  // 设置预算
  const handleSetBudget = async () => {
    // 去掉千分位符号后解析
    const num = parseFloat(budgetInput.replace(/,/g, ''));
    if (!num || num <= 0) {
      Alert.alert('提示', '请输入有效金额');
      return;
    }
    if (num > 9999999) {
      Alert.alert('提示', '预算不能超过 1000 万');
      return;
    }
    await StorageService.setBudget(num);
    setBudget(num);
    setShowBudgetModal(false);
    setBudgetInput('');
  };

  // 删除记录
  const handleDelete = (id: string) => {
    Alert.alert('删除', '确定删除？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await StorageService.deleteRecord(id);
          refresh();
        },
      },
    ]);
  };

  const formatAmount = (num: number) => num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatDate = (str: string) => {
    const d = new Date(str);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <Screen style={styles.container}>
      <LinearGradient colors={['#1A1A2E', '#16213E', '#0F3460']} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* 标题 */}
          <View style={styles.header}>
            <Text style={styles.title}>统计</Text>
            <TouchableOpacity style={styles.budgetBtn} onPress={() => {
              setBudgetInput(budget > 0 ? budget.toString() : '');
              setShowBudgetModal(true);
            }}>
              <Ionicons name="settings-outline" size={22} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>

          {/* 总支出 */}
          <View style={styles.totalCard}>
            <BlurView intensity={40} tint="dark" style={styles.totalBlur}>
              <Text style={styles.totalLabel}>累计支出</Text>
              <Text style={styles.totalValue}>¥{formatAmount(total)}</Text>
              <Text style={styles.totalCount}>{records.length} 笔</Text>
            </BlurView>
          </View>

          {/* 预算进度 */}
          {budget > 0 && (
            <View style={styles.budgetCard}>
              <BlurView intensity={30} tint="dark" style={styles.budgetBlur}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetLabel}>预算</Text>
                  <Text style={styles.budgetAmount}>¥{formatAmount(budget)}</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, {
                    width: `${percent}%`,
                    backgroundColor: percent > 90 ? '#FF6B6B' : percent > 70 ? '#FFA94D' : '#6BCB77',
                  }]} />
                </View>
                <View style={styles.budgetFooter}>
                  <Text style={[styles.remainingText, { color: remaining >= 0 ? '#6BCB77' : '#FF6B6B' }]}>
                    {remaining >= 0 ? `剩余 ¥${formatAmount(remaining)}` : `超支 ¥${formatAmount(Math.abs(remaining))}`}
                  </Text>
                  <Text style={styles.percentText}>{percent.toFixed(0)}%</Text>
                </View>
              </BlurView>
            </View>
          )}

          {/* 分类汇总 */}
          {categoryStats.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>分类支出</Text>
              <View style={styles.categoryList}>
                {categoryStats.map((cat) => (
                  <View key={cat.id} style={styles.categoryItem}>
                    <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                    <Text style={styles.catName}>{cat.name}</Text>
                    <Text style={styles.catAmount}>¥{formatAmount(cat.total)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 支出明细 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>最近记录</Text>
            {records.length === 0 ? (
              <View style={styles.emptyCard}>
                <BlurView intensity={20} tint="dark" style={styles.emptyBlur}>
                  <Ionicons name="receipt-outline" size={40} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.emptyText}>暂无记录</Text>
                </BlurView>
              </View>
            ) : (
              records.slice(0, 10).map((record) => {
                const cat = getCategoryInfo(record.category);
                return (
                  <View key={record.id} style={styles.recordCard}>
                    <BlurView intensity={20} tint="dark" style={styles.recordBlur}>
                      <TouchableOpacity style={styles.recordRow} onLongPress={() => handleDelete(record.id)}>
                        <View style={[styles.recordIcon, { backgroundColor: `${cat.color}20` }]}>
                          <Ionicons name={cat.icon as any} size={16} color={cat.color} />
                        </View>
                        <View style={styles.recordInfo}>
                          <Text style={styles.recordSub}>{record.subCategory}</Text>
                          <Text style={styles.recordMeta}>{cat.name} · {record.room}</Text>
                        </View>
                        <View style={styles.recordRight}>
                          <Text style={styles.recordAmount}>-¥{formatAmount(record.amount)}</Text>
                          <Text style={styles.recordDate}>{formatDate(record.date)}</Text>
                        </View>
                      </TouchableOpacity>
                    </BlurView>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 预算弹窗 */}
      <Modal visible={showBudgetModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowBudgetModal(false)} />
          <View style={styles.modalCard}>
            <BlurView intensity={40} tint="dark" style={styles.modalBlur}>
              <Text style={styles.modalTitle}>设置预算</Text>
              <View style={styles.modalInputWrapper}>
                <Text style={styles.modalCurrency}>¥</Text>
                <TextInput
                  style={styles.modalInputField}
                  placeholder="0.00"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="decimal-pad"
                  value={budgetInput}
                  onChangeText={handleBudgetInputChange}
                  autoFocus
                />
              </View>
              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setShowBudgetModal(false)}>
                  <Text style={styles.modalCancelText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirm} onPress={handleSetBudget}>
                  <LinearGradient colors={['#E94560', '#FF6B6B']} style={styles.modalConfirmGrad}>
                    <Text style={styles.modalConfirmText}>确定</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 60, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFF' },
  budgetBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  totalCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  totalBlur: { padding: 24, alignItems: 'center' },
  totalLabel: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8 },
  totalValue: { fontSize: 42, fontWeight: '700', color: '#FF6B6B', letterSpacing: -1 },
  totalCount: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 },
  budgetCard: { borderRadius: 14, overflow: 'hidden', marginBottom: 20 },
  budgetBlur: { padding: 16 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  budgetLabel: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  budgetAmount: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  progressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  budgetFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  remainingText: { fontSize: 13, fontWeight: '600' },
  percentText: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#FFF', marginBottom: 12 },
  categoryList: { gap: 8 },
  categoryItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10 },
  catDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  catName: { flex: 1, fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  catAmount: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  emptyCard: { borderRadius: 14, overflow: 'hidden' },
  emptyBlur: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 12 },
  recordCard: { borderRadius: 12, overflow: 'hidden', marginBottom: 8 },
  recordBlur: { overflow: 'hidden', borderRadius: 12 },
  recordRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  recordIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  recordInfo: { flex: 1, marginLeft: 10 },
  recordSub: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  recordMeta: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  recordRight: { alignItems: 'flex-end' },
  recordAmount: { fontSize: 14, fontWeight: '600', color: '#FF6B6B' },
  recordDate: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  modalBlur: { padding: 28 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#FFF', textAlign: 'center', marginBottom: 24 },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  modalCurrency: { fontSize: 28, color: 'rgba(255,255,255,0.5)', marginRight: 8 },
  modalInputField: { flex: 1, fontSize: 28, fontWeight: '600', color: '#FFF', paddingVertical: 12, letterSpacing: 1 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalCancel: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12 },
  modalCancelText: { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  modalConfirm: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  modalConfirmGrad: { paddingVertical: 14, alignItems: 'center' },
  modalConfirmText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalCard: { width: '100%', maxWidth: 340, borderRadius: 20, overflow: 'hidden' },
});
