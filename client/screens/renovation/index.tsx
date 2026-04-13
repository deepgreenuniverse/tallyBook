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
  RenovationRecord,
  RENOVATION_CATEGORIES,
  ROOMS,
  getCategoryInfo,
} from '@/utils/renovation';

export default function RenovationPage() {
  const [records, setRecords] = useState<RenovationRecord[]>([]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [budget, setBudget] = useState(0);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  // 初始化加载
  useEffect(() => {
    const init = async () => {
      const [data, savedBudget] = await Promise.all([
        StorageService.getRecords(),
        StorageService.getBudget(),
      ]);
      setRecords(data);
      setBudget(savedBudget);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 统计数据
  const totalExpense = records.reduce((sum, r) => sum + r.amount, 0);
  const budgetRemaining = budget > 0 ? budget - totalExpense : 0;
  const budgetPercent = budget > 0 ? Math.min((totalExpense / budget) * 100, 100) : 0;

  // 按类别统计
  const categoryStats = RENOVATION_CATEGORIES.map((cat) => ({
    ...cat,
    total: records.filter((r) => r.category === cat.id).reduce((sum, r) => sum + r.amount, 0),
  })).filter((c) => c.total > 0);

  // 获取当前选中的类别
  const currentCategory = RENOVATION_CATEGORIES.find((c) => c.id === selectedCategory);

  // 提交记录
  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('提示', '请输入有效金额');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('提示', '请选择大类');
      return;
    }
    if (!selectedSubCategory) {
      Alert.alert('提示', '请选择细分类目');
      return;
    }
    if (!selectedRoom) {
      Alert.alert('提示', '请选择空间区域');
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

    setAmount('');
    setNote('');
    setSelectedCategory('');
    setSelectedSubCategory('');
    setSelectedRoom('');
    const data = await StorageService.getRecords();
    setRecords(data);
  };

  // 删除记录
  const handleDelete = (id: string) => {
    Alert.alert('删除确认', '确定要删除这笔支出吗？', [
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

  // 设置预算
  const handleSetBudget = async () => {
    const num = parseFloat(budgetInput);
    if (!num || num <= 0) {
      Alert.alert('提示', '请输入有效预算金额');
      return;
    }
    await StorageService.setBudget(num);
    setBudget(num);
    setShowBudgetModal(false);
    setBudgetInput('');
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
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <Screen style={styles.container}>
      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F3460']}
        style={StyleSheet.absoluteFill}
      />

      {/* 光斑装饰 */}
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />

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
          <View style={styles.header}>
            <Text style={styles.title}>装修记账</Text>
            <TouchableOpacity
              style={styles.budgetBtn}
              onPress={() => {
                setBudgetInput(budget > 0 ? budget.toString() : '');
                setShowBudgetModal(true);
              }}
            >
              <Ionicons name="settings-outline" size={22} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>

          {/* 总支出汇总 */}
          <View style={styles.totalCard}>
            <BlurView intensity={40} tint="dark" style={styles.totalBlur}>
              <Text style={styles.totalLabel}>累计支出</Text>
              <Text style={styles.totalValue}>¥{formatAmount(totalExpense)}</Text>
              <Text style={styles.totalCount}>{records.length} 笔支出</Text>
            </BlurView>
          </View>

          {/* 总预算卡片 */}
          {budget > 0 && (
            <View style={styles.budgetCard}>
              <BlurView intensity={40} tint="dark" style={styles.budgetBlur}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetLabel}>总预算</Text>
                  <Text style={styles.budgetValue}>¥{formatAmount(budget)}</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBg}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${budgetPercent}%`,
                          backgroundColor: budgetPercent > 90 ? '#FF6B6B' : budgetPercent > 70 ? '#FFA94D' : '#6BCB77',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{budgetPercent.toFixed(0)}%</Text>
                </View>
                <View style={styles.budgetFooter}>
                  <View>
                    <Text style={styles.budgetSubLabel}>已花费</Text>
                    <Text style={[styles.budgetSubValue, { color: '#FF6B6B' }]}>
                      ¥{formatAmount(totalExpense)}
                    </Text>
                  </View>
                  <View style={styles.budgetDivider} />
                  <View>
                    <Text style={styles.budgetSubLabel}>剩余</Text>
                    <Text
                      style={[
                        styles.budgetSubValue,
                        { color: budgetRemaining >= 0 ? '#6BCB77' : '#FF6B6B' },
                      ]}
                    >
                      ¥{formatAmount(Math.abs(budgetRemaining))}
                      {budgetRemaining < 0 && ' 超支'}
                    </Text>
                  </View>
                </View>
              </BlurView>
            </View>
          )}

          {/* 金额输入 */}
          <View style={styles.amountCard}>
            <BlurView intensity={30} tint="dark" style={styles.amountBlur}>
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
            </BlurView>
          </View>

          {/* 类别选择 */}
          <View style={styles.sectionCard}>
            <BlurView intensity={25} tint="dark" style={styles.sectionBlur}>
              <Text style={styles.sectionTitle}>选择大类</Text>
              <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoryRow}>
                  {RENOVATION_CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat.id}
                      style={[
                        styles.categoryItem,
                        selectedCategory === cat.id && styles.categoryItemActive,
                        { borderColor: selectedCategory === cat.id ? cat.color : 'rgba(255,255,255,0.1)' },
                      ]}
                      onPress={() => {
                        setSelectedCategory(cat.id);
                        setSelectedSubCategory('');
                      }}
                    >
                      <View
                        style={[
                          styles.categoryIconBg,
                          { backgroundColor: `${cat.color}20` },
                        ]}
                      >
                        <Ionicons
                          name={cat.icon as any}
                          size={20}
                          color={selectedCategory === cat.id ? cat.color : 'rgba(255,255,255,0.6)'}
                        />
                      </View>
                      <Text
                        style={[
                          styles.categoryName,
                          selectedCategory === cat.id && { color: '#FFF' },
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                </ScrollView>
              </View>

              {/* 细分类目 */}
              {currentCategory && (
                <>
                  <Text style={styles.sectionTitle}>选择细分类目</Text>
                  <View style={styles.subCategoryGrid}>
                    {currentCategory.subCategories.map((sub) => (
                      <Pressable
                        key={sub}
                        style={[
                          styles.subCategoryItem,
                          selectedSubCategory === sub && {
                            backgroundColor: `${currentCategory.color}30`,
                            borderColor: currentCategory.color,
                          },
                        ]}
                        onPress={() => setSelectedSubCategory(sub)}
                      >
                        <Text
                          style={[
                            styles.subCategoryText,
                            selectedSubCategory === sub && { color: '#FFF' },
                          ]}
                        >
                          {sub}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}

              {/* 空间区域 */}
              <Text style={styles.sectionTitle}>选择空间区域</Text>
              <View style={styles.roomGrid}>
                {ROOMS.map((room) => (
                  <Pressable
                    key={room}
                    style={[
                      styles.roomItem,
                      selectedRoom === room && styles.roomItemActive,
                    ]}
                    onPress={() => setSelectedRoom(room)}
                  >
                    <Text
                      style={[
                        styles.roomText,
                        selectedRoom === room && { color: '#FFF' },
                      ]}
                    >
                      {room}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* 备注 */}
              <TextInput
                style={styles.noteInput}
                placeholder="备注（可选）"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={note}
                onChangeText={setNote}
              />

              {/* 提交按钮 */}
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <LinearGradient
                  colors={['#E94560', '#FF6B6B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitText}>记一笔</Text>
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>
          </View>

          {/* 支出明细 */}
          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>支出明细</Text>
              <Text style={styles.listCount}>{records.length} 笔</Text>
            </View>

            {records.length === 0 ? (
              <View style={styles.emptyCard}>
                <BlurView intensity={20} tint="dark" style={styles.emptyBlur}>
                  <Ionicons name="receipt-outline" size={48} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.emptyText}>暂无支出记录</Text>
                  <Text style={styles.emptySubtext}>开始记录你的装修花费吧</Text>
                </BlurView>
              </View>
            ) : (
              <>
                {/* 分类汇总 */}
                {categoryStats.length > 0 && (
                  <View style={styles.summaryCard}>
                    <BlurView intensity={25} tint="dark" style={styles.summaryBlur}>
                      <Text style={styles.summaryTitle}>分类汇总</Text>
                      <View style={styles.summaryGrid}>
                        {categoryStats.slice(0, 4).map((cat) => (
                          <View key={cat.id} style={styles.summaryItem}>
                            <View style={[styles.summaryDot, { backgroundColor: cat.color }]} />
                            <Text style={styles.summaryName}>{cat.name}</Text>
                            <Text style={styles.summaryAmount}>¥{formatAmount(cat.total)}</Text>
                          </View>
                        ))}
                      </View>
                      {categoryStats.length > 4 && (
                        <Text style={styles.summaryMore}>+{categoryStats.length - 4} 更多</Text>
                      )}
                    </BlurView>
                  </View>
                )}

                {/* 记录列表 */}
                {records.map((record) => {
                  const catInfo = getCategoryInfo(record.category);
                  return (
                    <View key={record.id} style={styles.recordCard}>
                      <BlurView intensity={20} tint="dark" style={styles.recordBlur}>
                        <TouchableOpacity
                          style={styles.recordContent}
                          onLongPress={() => handleDelete(record.id)}
                        >
                          <View
                            style={[
                              styles.recordIcon,
                              { backgroundColor: `${catInfo.color}20` },
                            ]}
                          >
                            <Ionicons
                              name={catInfo.icon as any}
                              size={18}
                              color={catInfo.color}
                            />
                          </View>
                          <View style={styles.recordInfo}>
                            <Text style={styles.recordCategory}>{record.subCategory}</Text>
                            <Text style={styles.recordMeta}>
                              {catInfo.name} · {record.room}
                            </Text>
                            {record.note ? (
                              <Text style={styles.recordNote} numberOfLines={1}>
                                {record.note}
                              </Text>
                            ) : null}
                          </View>
                          <View style={styles.recordRight}>
                            <Text style={styles.recordAmount}>
                              -{formatAmount(record.amount)}
                            </Text>
                            <Text style={styles.recordDate}>{formatDate(record.date)}</Text>
                          </View>
                        </TouchableOpacity>
                      </BlurView>
                    </View>
                  );
                })}
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 预算设置弹窗 */}
      <Modal visible={showBudgetModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowBudgetModal(false)}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modalCard}>
                <BlurView intensity={40} tint="dark" style={styles.modalBlur}>
                  <Text style={styles.modalTitle}>设置装修预算</Text>
                  <View style={styles.modalInput}>
                    <Text style={styles.modalCurrency}>¥</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      placeholder="输入总预算"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      keyboardType="decimal-pad"
                      value={budgetInput}
                      onChangeText={setBudgetInput}
                      autoFocus
                    />
                  </View>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={() => setShowBudgetModal(false)}
                    >
                      <Text style={styles.modalCancelText}>取消</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleSetBudget}>
                      <LinearGradient
                        colors={['#E94560', '#FF6B6B']}
                        style={styles.modalConfirmGradient}
                      >
                        <Text style={styles.modalConfirmText}>确定</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
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
  // 光斑
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.2,
  },
  orb1: {
    width: 250,
    height: 250,
    backgroundColor: '#E94560',
    top: -80,
    right: -80,
  },
  orb2: {
    width: 180,
    height: 180,
    backgroundColor: '#0F3460',
    bottom: 200,
    left: -60,
  },
  // 头部
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  budgetBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 总支出汇总
  totalCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  totalBlur: {
    padding: 24,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FF6B6B',
    letterSpacing: -1,
  },
  totalCount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 6,
  },
  // 预算卡片
  budgetCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  budgetBlur: {
    padding: 20,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  budgetValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progressBg: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    width: 40,
  },
  budgetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetSubLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  budgetSubValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  budgetDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
  },
  // 金额输入
  amountCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  amountBlur: {
    padding: 24,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.5)',
    marginRight: 4,
  },
  amountText: {
    fontSize: 52,
    fontWeight: '700',
    color: '#FFFFFF',
    minWidth: 180,
    textAlign: 'center',
  },
  // 表单卡片
  sectionCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  sectionBlur: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 12,
    marginTop: 16,
  },
  // 类别选择
  categoryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 20,
  },
  categoryItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minWidth: 72,
  },
  categoryItemActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  categoryIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  // 细分类目
  subCategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subCategoryItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  subCategoryText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  // 空间区域
  roomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roomItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  roomItemActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  roomText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  // 备注
  noteInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#FFFFFF',
    marginTop: 20,
  },
  // 提交按钮
  submitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 20,
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
  // 列表区域
  listSection: {
    paddingHorizontal: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listCount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  // 空状态
  emptyCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  emptyBlur: {
    padding: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 6,
  },
  // 分类汇总
  summaryCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  summaryBlur: {
    padding: 16,
  },
  summaryTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  summaryName: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
  },
  summaryAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  summaryMore: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 10,
    textAlign: 'center',
  },
  // 记录卡片
  recordCard: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
  },
  recordBlur: {
    overflow: 'hidden',
    borderRadius: 14,
  },
  recordContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
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
  recordMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  recordNote: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  recordRight: {
    alignItems: 'flex-end',
  },
  recordAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  recordDate: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 3,
  },
  // 弹窗
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  modalCard: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalBlur: {
    padding: 28,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  modalCurrency: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.5)',
    marginRight: 8,
  },
  modalTextInput: {
    flex: 1,
    fontSize: 24,
    color: '#FFFFFF',
    paddingVertical: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  modalConfirmBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalConfirmGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
