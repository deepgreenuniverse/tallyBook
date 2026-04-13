import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RecordItem {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  note: string;
  date: string;
}

const STORAGE_KEY = '@accounting_records';

export const StorageService = {
  // 获取所有记录
  async getRecords(): Promise<RecordItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get records:', error);
      return [];
    }
  },

  // 保存记录
  async saveRecords(records: RecordItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Failed to save records:', error);
    }
  },

  // 添加记录
  async addRecord(record: Omit<RecordItem, 'id'>): Promise<RecordItem> {
    const records = await this.getRecords();
    const newRecord: RecordItem = {
      ...record,
      id: Date.now().toString(),
    };
    records.unshift(newRecord);
    await this.saveRecords(records);
    return newRecord;
  },

  // 删除记录
  async deleteRecord(id: string): Promise<void> {
    const records = await this.getRecords();
    const filtered = records.filter((r) => r.id !== id);
    await this.saveRecords(filtered);
  },

  // 清除所有记录
  async clearRecords(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
};

// 收支类型定义
export const EXPENSE_CATEGORIES = [
  { id: 'food', name: '餐饮', icon: 'restaurant' },
  { id: 'transport', name: '交通', icon: 'car' },
  { id: 'shopping', name: '购物', icon: 'cart' },
  { id: 'entertainment', name: '娱乐', icon: 'game-controller' },
  { id: 'medical', name: '医疗', icon: 'medkit' },
  { id: 'education', name: '教育', icon: 'school' },
  { id: 'other', name: '其他', icon: 'ellipsis-horizontal' },
];

export const INCOME_CATEGORIES = [
  { id: 'salary', name: '工资', icon: 'wallet' },
  { id: 'bonus', name: '奖金', icon: 'gift' },
  { id: 'investment', name: '投资', icon: 'trending-up' },
  { id: 'other', name: '其他', icon: 'ellipsis-horizontal' },
];
