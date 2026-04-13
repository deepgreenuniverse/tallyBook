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
import {
  StorageService,
  RecordItem,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '@/utils/storage';

export default function AccountingPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [recordType, setRecordType] = useState<'income' | 'expense'>('expense');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 统计数据
  const stats = {
    income: records
      .filter((r) => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0),
    expense: records
      .filter((r) => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0),
    balance: 0,
  };
  stats.balance = stats.income - stats.expense;

  // 获取当前类目列表
  const categories =
    recordType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  // 加载数据
  const loadRecords = async () => {
    const data = await StorageService.getRecords();
    setRecords(data);
    setIsLoading(false);
  };

  // 初始化加载
  useEffect(() => {
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 提交记录
  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('提示', '请输入有效金额');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('提示', '请选择类别');
      return;
    }

    await StorageService.addRecord({
      amount: numAmount,
      type: recordType,
      category: selectedCategory,
      note: note.trim(),
      date: new Date().toISOString(),
    });

    setAmount('');
    setNote('');
    setSelectedCategory('');
    const data = await StorageService.getRecords();
    setRecords(data);
  };

  // 删除记录
  const handleDelete = (id: string) => {
    Alert.alert('删除确认', '确定要删除这条记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await StorageService.deleteRecord(id);
          const data = await StorageService.getRecords();
          setRecords(data);
        },
      },
    ]);
  };

  // 格式化金额
  const formatAmount = (num: number) => {
    return num.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // 获取类别信息
  const getCategoryInfo = (categoryId: string, type: 'income' | 'expense') => {
    const list = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    return list.find((c) => c.id === categoryId) || { name: categoryId, icon: 'ellipsis-horizontal' };
  };

  return (
    <Screen style={styles.container}>
      <LinearGradient
        colors={['#0F0C29', '#302B63', '#24243E']}
        style={StyleSheet.absoluteFill}
      />

      {/* 光斑装饰 */}
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />
      <View style={[styles.orb, styles.orb3]} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 标题 */}
          <Text style={styles.title}>记账本</Text>

          {/* 统计卡片 */}
          <View style={styles.statsCard}>
            <BlurView intensity={40} tint="dark" style={styles.statsBlur}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>收入</Text>
                  <Text style={[styles.statValue, { color: '#5ED6A0' }]}>
                    +{formatAmount(stats.income)}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>支出</Text>
                  <Text style={[styles.statValue, { color: '#FF6B6B' }]}>
                    -{formatAmount(stats.expense)}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>结余</Text>
                  <Text
                    style={[
                      styles.statValue,
                      { color: stats.balance >= 0 ? '#5ED6A0' : '#FF6B6B' },
                    ]}
                  >
                    {stats.balance >= 0 ? '+' : ''}
                    {formatAmount(stats.balance)}
                  </Text>
                </View>
              </View>
            </BlurView>
          </View>

          {/* 输入表单 */}
          <View style={styles.formCard}>
            <BlurView intensity={30} tint="dark" style={styles.formBlur}>
              {/* 收支类型切换 */}
              <View style={styles.typeToggle}>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    recordType === 'expense' && styles.typeBtnActive,
                  ]}
                  onPress={() => {
                    setRecordType('expense');
                    setSelectedCategory('');
                  }}
                >
                  <Ionicons
                    name="arrow-down-circle"
                    size={18}
                    color={recordType === 'expense' ? '#FF6B6B' : 'rgba(255,255,255,0.4)'}
                  />
                  <Text
                    style={[
                      styles.typeBtnText,
                      recordType === 'expense' && { color: '#FF6B6B' },
                    ]}
                  >
                    支出
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    recordType === 'income' && styles.typeBtnActive,
                  ]}
                  onPress={() => {
                    setRecordType('income');
                    setSelectedCategory('');
                  }}
                >
                  <Ionicons
                    name="arrow-up-circle"
                    size={18}
                    color={recordType === 'income' ? '#5ED6A0' : 'rgba(255,255,255,0.4)'}
                  />
                  <Text
                    style={[
                      styles.typeBtnText,
                      recordType === 'income' && { color: '#5ED6A0' },
                    ]}
                  >
                    收入
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 金额输入 */}
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>¥</Text>
                <TextInput
                  style={styles.amountText}
                  placeholder="0.00"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              {/* 类别选择 */}
              <Text style={styles.sectionTitle}>选择类别</Text>
              <View style={styles.categoryGrid}>
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.categoryItem,
                      selectedCategory === cat.id && styles.categoryItemActive,
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={22}
                      color={
                        selectedCategory === cat.id
                          ? recordType === 'expense'
                            ? '#FF6B6B'
                            : '#5ED6A0'
                          : 'rgba(255,255,255,0.6)'
                      }
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategory === cat.id && { color: '#FFF' },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* 备注输入 */}
              <TextInput
                style={styles.noteInput}
                placeholder="添加备注（可选）"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={note}
                onChangeText={setNote}
              />

              {/* 提交按钮 */}
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <LinearGradient
                  colors={
                    recordType === 'expense'
                      ? ['#FF6B6B', '#FF8E8E']
                      : ['#5ED6A0', '#7EE8B8']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitText}>记一笔</Text>
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>
          </View>

          {/* 记录列表 */}
          <View style={styles.listSection}>
            <Text style={styles.listTitle}>明细记录</Text>
            {records.length === 0 ? (
              <View style={styles.emptyCard}>
                <BlurView intensity={20} tint="dark" style={styles.emptyBlur}>
                  <Ionicons
                    name="receipt-outline"
                    size={40}
                    color="rgba(255,255,255,0.3)"
                  />
                  <Text style={styles.emptyText}>暂无记录</Text>
                  <Text style={styles.emptySubtext}>开始记录你的第一笔收支吧</Text>
                </BlurView>
              </View>
            ) : (
              records.map((record) => {
                const catInfo = getCategoryInfo(record.category, record.type);
                return (
                  <View key={record.id} style={styles.recordCard}>
                    <BlurView intensity={25} tint="dark" style={styles.recordBlur}>
                      <TouchableOpacity
                        style={styles.recordContent}
                        onLongPress={() => handleDelete(record.id)}
                      >
                        <View
                          style={[
                            styles.recordIcon,
                            {
                              backgroundColor:
                                record.type === 'expense'
                                  ? 'rgba(255,107,107,0.2)'
                                  : 'rgba(94,214,160,0.2)',
                            },
                          ]}
                        >
                          <Ionicons
                            name={catInfo.icon as any}
                            size={20}
                            color={record.type === 'expense' ? '#FF6B6B' : '#5ED6A0'}
                          />
                        </View>
                        <View style={styles.recordInfo}>
                          <Text style={styles.recordCategory}>{catInfo.name}</Text>
                          {record.note ? (
                            <Text style={styles.recordNote} numberOfLines={1}>
                              {record.note}
                            </Text>
                          ) : null}
                        </View>
                        <View style={styles.recordRight}>
                          <Text
                            style={[
                              styles.recordAmount,
                              {
                                color:
                                  record.type === 'expense' ? '#FF6B6B' : '#5ED6A0',
                              },
                            ]}
                          >
                            {record.type === 'expense' ? '-' : '+'}
                            {formatAmount(record.amount)}
                          </Text>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // 光斑装饰
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.25,
  },
  orb1: {
    width: 200,
    height: 200,
    backgroundColor: '#6C63FF',
    top: -50,
    right: -50,
  },
  orb2: {
    width: 150,
    height: 150,
    backgroundColor: '#00D2FF',
    top: 200,
    left: -60,
  },
  orb3: {
    width: 120,
    height: 120,
    backgroundColor: '#FF6B9D',
    bottom: 300,
    right: -30,
  },
  // 标题
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 24,
  },
  // 统计卡片
  statsCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
  },
  statsBlur: {
    padding: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  // 表单卡片
  formCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  formBlur: {
    padding: 24,
  },
  // 类型切换
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  typeBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  typeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
  },
  // 金额输入
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.6)',
    marginRight: 4,
  },
  amountText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    minWidth: 150,
    textAlign: 'center',
  },
  // 类别选择
  sectionTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  categoryItem: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  categoryItemActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  categoryText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 6,
  },
  // 备注输入
  noteInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  // 提交按钮
  submitBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // 记录列表
  listSection: {
    paddingHorizontal: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  emptyCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  emptyBlur: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 6,
  },
  recordCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
  },
  recordBlur: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  recordContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  recordIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recordCategory: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recordNote: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  recordRight: {
    alignItems: 'flex-end',
  },
  recordAmount: {
    fontSize: 17,
    fontWeight: '700',
  },
  recordDate: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
});
