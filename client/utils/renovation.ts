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
    subCategories: ['地板', '瓷砖', '门窗', '橱柜', '衣柜', '洁具', '灯具', '开关插座', '窗帘', '楼梯', '阳光房', '其他'],
  },
  {
    id: 'material_aux',
    name: '辅材',
    icon: 'construct',
    color: '#FFA94D',
    subCategories: ['水泥沙', '电线水管', '腻子油漆', '龙骨板材', '防水材料', '保温材料', '粘结剂', '网格布', '其他'],
  },
  {
    id: 'labor',
    name: '人工费',
    icon: 'people',
    color: '#FFD93D',
    subCategories: ['拆改清运', '水电改造', '泥工贴砖', '砌墙粉墙', '木工制作', '油漆涂刷', '安装人工', '保洁开荒', '其他'],
  },
  {
    id: 'furniture',
    name: '家具',
    icon: 'bed-outline',
    color: '#6BCB77',
    subCategories: ['沙发', '茶几', '电视柜', '餐桌椅', '床/床垫', '床头柜', '衣柜', '书桌柜', '鞋柜', '餐边柜', '其他'],
  },
  {
    id: 'appliance',
    name: '家电',
    icon: 'tv-outline',
    color: '#4ECDC4',
    subCategories: ['冰箱', '洗衣机', '烘干机', '电视', '中央空调', '挂机空调', '地暖', '新风系统', '热水器', '油烟机', '洗碗机', '蒸烤箱', '净水器', '其他'],
  },
  {
    id: 'design',
    name: '设计费',
    icon: 'pencil',
    color: '#4D96FF',
    subCategories: ['量房定金', '设计方案', '效果图', '施工图', '监理费', '其他'],
  },
  {
    id: 'management',
    name: '管理费',
    icon: 'folder',
    color: '#9B59B6',
    subCategories: ['物业押金', '垃圾清运', '搬运费', '保护材料', '验收检测', '其他'],
  },
  {
    id: 'other',
    name: '其他',
    icon: 'ellipsis-horizontal',
    color: '#95A5A6',
    subCategories: ['保险', '税费', '软装配饰', '绿植装饰', '搬家费', '其他'],
  },
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
};

// 获取类别信息
export const getCategoryInfo = (categoryId: string) => {
  return RENOVATION_CATEGORIES.find((c) => c.id === categoryId) || RENOVATION_CATEGORIES[7];
};
