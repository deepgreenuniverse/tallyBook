import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RenovationRecord {
  id: string;
  amount: number;
  category: string;
  subCategory: string;
  room: string;
  note: string;
  date: string;
}

const STORAGE_KEY = '@renovation_records';
const BUDGET_KEY = '@renovation_budget';

// 装修支出类别
export const RENOVATION_CATEGORIES = [
  {
    id: 'material_main',
    name: '主材',
    icon: 'cube',
    color: '#FF6B6B',
    subCategories: ['地板', '瓷砖', '门窗', '橱柜', '衣柜', '洁具', '灯具', '其他'],
  },
  {
    id: 'material_aux',
    name: '辅材',
    icon: 'construct',
    color: '#FFA94D',
    subCategories: ['水泥沙', '电线水管', '腻子油漆', '龙骨板材', '防水材料', '其他'],
  },
  {
    id: 'labor',
    name: '人工费',
    icon: 'people',
    color: '#FFD93D',
    subCategories: ['拆改清运', '水电改造', '泥工贴砖', '木工制作', '油漆涂刷', '安装人工', '其他'],
  },
  {
    id: 'furniture',
    name: '家具家电',
    icon: 'bed',
    color: '#6BCB77',
    subCategories: ['沙发', '床床垫', '餐桌椅', '书桌柜', '冰箱洗衣机', '空调电视', '其他'],
  },
  {
    id: 'design',
    name: '设计费',
    icon: 'pencil',
    color: '#4D96FF',
    subCategories: ['量房定金', '设计方案', '效果图', '施工图', '其他'],
  },
  {
    id: 'management',
    name: '管理费',
    icon: 'folder',
    color: '#9B59B6',
    subCategories: ['监理费', '物业押金', '垃圾清运', '搬运费', '其他'],
  },
  {
    id: 'other',
    name: '其他',
    icon: 'ellipsis-horizontal',
    color: '#95A5A6',
    subCategories: ['验收检测', '保险', '税费', '其他'],
  },
];

// 房间/区域分类
export const ROOMS = [
  '客厅', '餐厅', '厨房', '卫生间', '主卧', '次卧', '书房', '阳台', '玄关', '全屋', '其他',
];

export const StorageService = {
  // 获取所有记录
  async getRecords(): Promise<RenovationRecord[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get records:', error);
      return [];
    }
  },

  // 保存记录
  async saveRecords(records: RenovationRecord[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Failed to save records:', error);
    }
  },

  // 添加记录
  async addRecord(record: Omit<RenovationRecord, 'id'>): Promise<RenovationRecord> {
    const records = await this.getRecords();
    const newRecord: RenovationRecord = {
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

  // 获取/设置预算
  async getBudget(): Promise<number> {
    try {
      const budget = await AsyncStorage.getItem(BUDGET_KEY);
      return budget ? parseFloat(budget) : 0;
    } catch {
      return 0;
    }
  },

  async setBudget(amount: number): Promise<void> {
    try {
      await AsyncStorage.setItem(BUDGET_KEY, amount.toString());
    } catch (error) {
      console.error('Failed to save budget:', error);
    }
  },

  // 清除所有记录
  async clearRecords(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
};

// 获取类别信息
export const getCategoryInfo = (categoryId: string) => {
  return RENOVATION_CATEGORIES.find((c) => c.id === categoryId) || RENOVATION_CATEGORIES[6];
};
