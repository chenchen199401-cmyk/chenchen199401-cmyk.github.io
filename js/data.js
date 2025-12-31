/**
 * 医学生电脑硬件配置推荐网站 - 数据文件
 * 包含 CPU、GPU、内存、固态硬盘的配置和价格数据
 */

// CPU 数据
const cpuData = [
  // 工作站/HEDT 级别
  { brand: 'AMD', model: 'Threadripper 7995WX', tier: '工作站旗舰', cores: 96, threads: 192, score: 100000, price: 80000, note: '目前地表最强算力，价格极高' },
  { brand: 'AMD', model: 'Threadripper 7980X', tier: 'HEDT旗舰', cores: 64, threads: 128, score: 67500, price: 35000, note: '顶级发烧友/渲染主力' },
  { brand: 'AMD', model: 'Threadripper 7970X', tier: 'HEDT高端', cores: 32, threads: 64, score: 46500, price: 18000, note: '32核高频，兼顾视窗操作' },
  { brand: 'AMD', model: 'Threadripper 7960X', tier: 'HEDT入门', cores: 24, threads: 48, score: 37000, price: 11000, note: 'TR系列入门款' },
  { brand: 'Intel', model: 'Xeon w9-3495X', tier: '工作站旗舰', cores: 56, threads: 112, score: 60000, price: 26000, note: 'Intel最强工作站' },
  { brand: 'Intel', model: 'Xeon w9-3475X', tier: '工作站高端', cores: 36, threads: 72, score: 38000, price: 17000, note: '36核高主频' },
  { brand: 'Intel', model: 'Xeon w7-3465X', tier: '工作站中端', cores: 28, threads: 56, score: 32000, price: 13500, note: '对标AMD 7960X' },
  
  // 消费级 Intel
  { brand: 'Intel', model: 'Core Ultra 9 285K', tier: '消费级旗舰', cores: 24, threads: 24, score: 41558, price: 3279, note: '最新一代旗舰' },
  { brand: 'Intel', model: 'Core Ultra 7 265K', tier: '消费级高端', cores: 20, threads: 20, score: 36309, price: 1538, note: '性价比高端' },
  { brand: 'Intel', model: 'Core Ultra 5 245K', tier: '消费级中高', cores: 14, threads: 14, score: 24935, price: 1189, note: '主流选择' },
  { brand: 'Intel', model: 'i9-14900K', tier: '消费级旗舰', cores: 24, threads: 32, score: 38497, price: 2490, note: '上一代旗舰' },
  { brand: 'Intel', model: 'i7-14700K', tier: '消费级高端', cores: 20, threads: 28, score: 34805, price: 1904, note: '游戏生产力兼顾' },
  // 同款无核显版本（便于按用户习惯搜索）
  { brand: 'Intel', model: 'i7-14700KF', tier: '消费级高端', cores: 20, threads: 28, score: 34805, price: 1904, note: '同 i7-14700K（无核显），游戏生产力兼顾' },
  { brand: 'Intel', model: 'i5-14600K', tier: '消费级中高', cores: 14, threads: 20, score: 23983, price: 1320, note: '热门全能U' },
  { brand: 'Intel', model: 'i5-12600KF', tier: '消费级中端', cores: 10, threads: 16, score: 17500, price: 1099, note: '老款神U' },
  { brand: 'Intel', model: 'i5-12400F', tier: '消费级入门', cores: 6, threads: 12, score: 12000, price: 699, note: '千元内装机首选' },
  { brand: 'Intel', model: 'i3-12100F', tier: '消费级亮机', cores: 4, threads: 8, score: 8400, price: 469, note: '办公首选' },
  
  // 消费级 AMD
  // 推荐方案常用（部分跑分为区间估算值，用于“跨档推荐”）
  { brand: 'AMD', model: 'Ryzen 9 7900X', tier: '消费级高端', cores: 12, threads: 24, score: 28500, price: 2200, note: '转录组主流推荐；R23 为估算值' },
  { brand: 'AMD', model: 'Ryzen 9 9950X3D', tier: '消费级旗舰', cores: 16, threads: 32, score: 42377, price: 4350, note: '游戏+生产力双料王' },
  { brand: 'AMD', model: 'Ryzen 9 9950X', tier: '消费级旗舰', cores: 16, threads: 32, score: 42103, price: 3049, note: '多核性能强' },
  { brand: 'AMD', model: 'Ryzen 9 9900X', tier: '消费级高端', cores: 12, threads: 24, score: 32626, price: 2479, note: '12核高性能' },
  { brand: 'AMD', model: 'Ryzen 7 9800X3D', tier: '游戏特化', cores: 8, threads: 16, score: 23157, price: 2769, note: '当前最强游戏CPU' },
  { brand: 'AMD', model: 'Ryzen 7 9700X', tier: '消费级中高', cores: 8, threads: 16, score: 23190, price: 1509, note: '能效比优秀' },
  { brand: 'AMD', model: 'Ryzen 5 9600X', tier: '消费级中端', cores: 6, threads: 12, score: 16284, price: 1234, note: '新一代中端' },
  { brand: 'AMD', model: 'Ryzen 5 7500F', tier: '消费级主流', cores: 6, threads: 12, score: 13686, price: 754, note: '目前性价比之王' }
];

// GPU 数据
const gpuData = [
  // 专业工作站卡
  { model: 'NVIDIA RTX 6000 Ada', vram: 48, vramType: 'GDDR6 ECC', score: 38000, price: 60000, tier: '顶级工作站', note: '目前最强专业卡' },
  { model: 'NVIDIA RTX A6000', vram: 48, vramType: 'GDDR6 ECC', score: 19500, price: 26000, tier: '高端工作站', note: '上一代安培架构' },
  { model: 'AMD Radeon Pro W7900', vram: 48, vramType: 'GDDR6 ECC', score: 16000, price: 24999, tier: '高端工作站', note: '性价比高的大显存卡' },
  { model: 'AMD Radeon Pro W7800', vram: 32, vramType: 'GDDR6 ECC', score: 13500, price: 15999, tier: '中高端工作站', note: '32G大显存入门方案' },
  
  // 消费级 NVIDIA 50系列
  { model: 'NVIDIA RTX 5090', vram: 32, vramType: 'GDDR7', score: 25485, price: 20599, tier: '消费级旗舰', note: '最新旗舰' },
  { model: 'NVIDIA RTX 5080', vram: 16, vramType: 'GDDR7', score: 16066, price: 8119, tier: '消费级高端', note: '性能强劲' },
  { model: 'NVIDIA RTX 5070 Ti', vram: 16, vramType: 'GDDR7', score: 13485, price: 6126, tier: '消费级进阶', note: '16G显存版本' },
  { model: 'NVIDIA RTX 5070', vram: 12, vramType: 'GDDR7', score: 10096, price: 4319, tier: '消费级甜点', note: '主流选择' },
  { model: 'NVIDIA RTX 5060 Ti 16G', vram: 16, vramType: 'GDDR7', score: 7136, price: 3269, tier: '消费级中端', note: '大显存适合AI入门' },
  { model: 'NVIDIA RTX 5060', vram: 8, vramType: 'GDDR6', score: 6529, price: 2169, tier: '消费级主流', note: '入门选择' },
  
  // 消费级 NVIDIA 40系列
  { model: 'NVIDIA RTX 4090', vram: 24, vramType: 'GDDR6X', score: 19481, price: 18400, tier: '上代旗舰', note: '保值率极高(二手)' },
  { model: 'NVIDIA RTX 4080 Super', vram: 16, vramType: 'GDDR6X', score: 14251, price: 6208, tier: '上代高端', note: '二手价格' },
  { model: 'NVIDIA RTX 4070 Ti Super', vram: 16, vramType: 'GDDR6X', score: 11765, price: 4571, tier: '上代次高端', note: '16G大显存(二手)' },
  { model: 'NVIDIA RTX 4070 Super', vram: 12, vramType: 'GDDR6X', score: 10138, price: 3304, tier: '上代甜点', note: '二手价格' },
  { model: 'NVIDIA RTX 4060 Ti 16G', vram: 16, vramType: 'GDDR6', score: 6287, price: 2569, tier: '上代中端', note: 'AI入门卡(二手)' },
  { model: 'NVIDIA RTX 4060', vram: 8, vramType: 'GDDR6', score: 4947, price: 1750, tier: '上代主流', note: '二手价格' },
  
  // 消费级 NVIDIA 30系列
  { model: 'NVIDIA RTX 3090', vram: 24, vramType: 'GDDR6X', score: 10286, price: 5014, tier: '老旗舰', note: '廉价24G显存方案(二手)' },
  { model: 'NVIDIA RTX 3080 Ti', vram: 12, vramType: 'GDDR6X', score: 10086, price: 2550, tier: '老高端', note: '二手价格' },
  { model: 'NVIDIA RTX 3060 12G', vram: 12, vramType: 'GDDR6', score: 4096, price: 1382, tier: '老甜点', note: '12G显存是亮点(二手)' },
  
  // AMD 显卡
  { model: 'AMD RX 9070 XT', vram: 16, vramType: 'GDDR7', score: 14120, price: 4333, tier: 'A卡新旗舰', note: 'AMD最新旗舰' },
  { model: 'AMD RX 9070', vram: 12, vramType: 'GDDR7', score: 12860, price: 4019, tier: 'A卡高端', note: '性能强劲' },
  { model: 'AMD RX 9070 GRE', vram: 12, vramType: 'GDDR7', score: 10686, price: 2999, tier: 'A卡新甜点', note: '性价比极高' },
  { model: 'AMD RX 7900 XTX', vram: 24, vramType: 'GDDR6', score: 15222, price: 4089, tier: 'A卡上代旗舰', note: '24G大显存(二手)' },
  { model: 'AMD RX 7900 XT', vram: 20, vramType: 'GDDR6', score: 13038, price: 3158, tier: 'A卡上代次旗舰', note: '20G大显存(二手)' },
  
  // Intel 显卡
  { model: 'Intel Arc B580', vram: 12, vramType: 'GDDR6', score: 7113, price: 1569, tier: 'I卡新秀', note: '12G显存很良心' }
];

// 内存数据
const memoryData = [
  // DDR5 第1梯队
  { gen: 'DDR5', tier: '第1梯队', die: '海力士 A-die', feature: '超频能力最强/轻松7000MHz+', model: '金百达 刃/星刃 6400/6800', price: 749, note: '追求高性能/超频首选' },
  { gen: 'DDR5', tier: '第1梯队', die: '海力士 A-die', feature: '特挑颗粒', model: '芝奇 幻锋戟 7200/7600+', price: 1599, note: '土豪/极限玩家' },
  { gen: 'DDR5', tier: '第1梯队', die: '海力士 A-die', feature: '特挑颗粒', model: '宏碁掠夺者 冰刃/Vesta II', price: 1249, note: '高端玩家' },
  
  // DDR5 第2梯队
  { gen: 'DDR5', tier: '第2梯队', die: '海力士 M-die', feature: '性能均衡/性价比高', model: '光威 天策/龙武 6000/6400', price: 625, note: '不折腾用户的最佳选择' },
  { gen: 'DDR5', tier: '第2梯队', die: '海力士 M-die', feature: '品牌溢价', model: '金士顿 Fury Beast 6000', price: 800, note: '品牌溢价较高' },
  
  // DDR4
  { gen: 'DDR4', tier: '第1梯队', die: '三星 特挑 B-die', feature: '低时序/高电压/DDR4最强', model: '宏碁掠夺者 Apollo (C14)', price: 1000, note: 'D4平台极限超频(二手)' },
  { gen: 'DDR4', tier: '第2梯队', die: '海力士 CJR/DJR', feature: '性价比高/好超频', model: '科赋 Bolt X / CRAS', price: 400, note: 'D4平台最具性价比' },
  { gen: 'DDR4', tier: '第2梯队', die: '长鑫 特挑', feature: '国产颗粒/体质不错', model: '光威 天策系列 3200/3600', price: 350, note: '支持国产/办公游戏够用' }
];

// 固态硬盘数据
const ssdData = [
  // 顶级
  { rank: 1, model: 'Intel 傲腾 P5801X', capacity: '400G', read4k: 401.4, price: 6250, note: '企业级SLC/极度昂贵/发烧专用' },
  { rank: 2, model: 'Intel 傲腾 900P', capacity: '480G', read4k: 351.4, price: 1750, note: '绝版神盘(二手)' },
  
  // 消费级旗舰
  { rank: 8, model: 'Solidigm P44 Pro', capacity: '2TB', read4k: 67.0, price: 1099, note: '消费级旗舰/原海力士/强烈推荐' },
  { rank: 9, model: '三星 990 Pro', capacity: '2TB', read4k: 62.5, price: 1199, note: '消费级旗舰/性能标杆' },
  { rank: 10, model: '西部数据 SN850X', capacity: '2TB', read4k: 59.1, price: 1099, note: '消费级旗舰/游戏性能强' },
  
  // 高性价比
  { rank: 13, model: '爱国者 P7000D', capacity: '2TB', read4k: 54.5, price: 799, note: '国产高性价比方案' },
  { rank: 14, model: '英睿达 T500 Pro', capacity: '2TB', read4k: 53.3, price: 1059, note: '带独立缓存/美光原厂' },
  { rank: 15, model: '宏碁掠夺者 GM7000', capacity: '2TB', read4k: 51.0, price: 849, note: '有独缓/发热量较大' },
  { rank: 16, model: '西部数据 SN770', capacity: '2TB', read4k: 43.0, price: 829, note: '无缓盘中的强者/游戏盘' },
  
  // 主流国产
  { rank: 20, model: '朗科 NV7000-t', capacity: '2TB', read4k: 36.2, price: 689, note: '高性价比国产方案' },
  { rank: 24, model: '致态 TiPlus 7100', capacity: '2TB', read4k: 32.9, price: 899, note: '国产之光/无缓盘标杆' },
  { rank: 25, model: '致态 TiPlus 7100', capacity: '1TB', read4k: 32.5, price: 499, note: '1TB版本' },
  { rank: 27, model: '宏碁掠夺者 GM7', capacity: '2TB', read4k: 32.3, price: 799, note: '无缓盘/低温/推荐' }
];

// 推荐方案配置
const recommendedConfigs = {
  office: {
    name: '办公学习',
    description: '研一新生、R语言绘图、熟悉Linux命令',
    budget: '3000-4000元',
    minBudget: 3000,
    maxBudget: 4000,
    specs: {
      cores: '4+',
      memory: '16GB',
      storage: '512GB',
      gpu: '亮机卡/核显'
    },
    config: {
      cpu: { model: 'Intel i3-12100F', price: 469 },
      gpu: { model: '亮机卡/核显', price: 0 },
      memory: { model: '16GB DDR4 3200', price: 250 },
      ssd: { model: '致态 TiPlus 7100 512GB', price: 299 },
      other: { model: '主板+电源+散热+机箱', price: 1500 }
    }
  },
  
  entry: {
    name: '入门科研',
    description: '学习/轻量脚本/绘图/小体积数据(<10G)',
    budget: '5000-6000元',
    minBudget: 5000,
    maxBudget: 6000,
    specs: {
      cores: '6核12线程',
      memory: '32GB',
      storage: '2TB',
      gpu: 'RTX 3060 12G'
    },
    config: {
      cpu: { model: 'AMD Ryzen 5 7500F', price: 754 },
      gpu: { model: 'RTX 3060 12G', price: 1382 },
      memory: { model: '32GB DDR5 6000 (16G×2)', price: 650 },
      ssd: { model: '致态 TiPlus 7100 2TB', price: 899 },
      other: { model: 'B650M主板+650W电源+风冷+机箱', price: 1800 }
    }
  },
  
  transcriptome: {
    name: '转录组/表观组',
    description: 'RNA-seq/ChIP-seq/ATAC-seq/分子对接',
    budget: '9000-11000元',
    minBudget: 9000,
    maxBudget: 11000,
    specs: {
      cores: '12核24线程',
      memory: '64GB',
      storage: '1TB SSD + 4TB HDD',
      gpu: 'RTX 4070 Super'
    },
    config: {
      cpu: { model: 'AMD Ryzen 9 7900X', price: 2200 },
      gpu: { model: 'RTX 4070 Super', price: 3304 },
      memory: { model: '64GB DDR5 6000 (32G×2)', price: 1300 },
      ssd: { model: 'Solidigm P44 Pro 1TB + 4TB HDD', price: 1100 },
      other: { model: 'B650主板+750W电源+PA120散热+机箱', price: 2400 }
    }
  },
  
  singlecell: {
    name: '单细胞/空间组学',
    description: 'Seurat/Scanpy/深度学习/AlphaFold',
    budget: '18000-25000元',
    minBudget: 18000,
    maxBudget: 25000,
    specs: {
      cores: '16核32线程',
      memory: '96GB',
      storage: '2TB SSD + 16TB HDD',
      gpu: 'RTX 4090 / RTX 3090'
    },
    config: {
      cpu: { model: 'AMD Ryzen 9 9950X', price: 3049 },
      gpu: { model: 'RTX 4090 D', price: 14000 },
      memory: { model: '96GB DDR5 (48G×2)', price: 2200 },
      ssd: { model: '三星 990 Pro 2TB + 16TB HDD', price: 2799 },
      other: { model: 'X670E主板+1000W电源+360水冷+机箱', price: 4500 }
    }
  },
  
  genome: {
    name: '基因组组装/服务器',
    description: 'de novo组装/Hi-C/大规模MD模拟',
    budget: '50000元+',
    minBudget: 50000,
    maxBudget: 100000,
    specs: {
      cores: '32核64线程+',
      memory: '256GB ECC',
      storage: 'NAS 50TB+',
      gpu: '双卡 RTX 4090 / A6000'
    },
    config: {
      cpu: { model: 'AMD Threadripper 7970X', price: 18000 },
      gpu: { model: '双卡 RTX 4090', price: 36000 },
      memory: { model: '256GB ECC DDR5 (64G×4)', price: 10000 },
      ssd: { model: 'NAS系统 + 企业级存储', price: 8000 },
      other: { model: 'TRX50主板+1200W电源+散热+机箱', price: 12000 }
    }
  }
};

// 根据预算生成配置
function generateConfig(budget, purpose) {
  const config = {
    cpu: null,
    gpu: null,
    memory: null,
    ssd: null,
    total: 0
  };
  
  // 根据用途确定各部件预算比例
  let ratios;
  switch (purpose) {
    case 'office':
      ratios = { cpu: 0.15, gpu: 0, memory: 0.08, ssd: 0.10, other: 0.67 };
      break;
    case 'entry':
      ratios = { cpu: 0.14, gpu: 0.25, memory: 0.12, ssd: 0.16, other: 0.33 };
      break;
    case 'transcriptome':
      ratios = { cpu: 0.20, gpu: 0.30, memory: 0.12, ssd: 0.10, other: 0.28 };
      break;
    case 'singlecell':
      ratios = { cpu: 0.12, gpu: 0.52, memory: 0.08, ssd: 0.10, other: 0.18 };
      break;
    case 'genome':
      ratios = { cpu: 0.22, gpu: 0.42, memory: 0.12, ssd: 0.10, other: 0.14 };
      break;
    default:
      ratios = { cpu: 0.18, gpu: 0.35, memory: 0.10, ssd: 0.12, other: 0.25 };
  }
  
  // 计算各部件预算
  const cpuBudget = budget * ratios.cpu;
  const gpuBudget = budget * ratios.gpu;
  const memBudget = budget * ratios.memory;
  const ssdBudget = budget * ratios.ssd;
  
  // 选择 CPU
  const suitableCpus = cpuData
    .filter(c => c.price <= cpuBudget * 1.2 && c.price >= cpuBudget * 0.5)
    .sort((a, b) => b.score / b.price - a.score / a.price);
  config.cpu = suitableCpus[0] || cpuData.find(c => c.price <= cpuBudget) || cpuData[cpuData.length - 1];
  
  // 选择 GPU (科研只选NVIDIA)
  if (gpuBudget > 0) {
    const suitableGpus = gpuData
      .filter(g => g.model.includes('NVIDIA') && g.price <= gpuBudget * 1.2 && g.price >= gpuBudget * 0.5)
      .sort((a, b) => b.vram - a.vram || b.score - a.score);
    config.gpu = suitableGpus[0] || gpuData.find(g => g.model.includes('NVIDIA') && g.price <= gpuBudget);
  }
  
  // 选择内存
  const memorySize = budget < 6000 ? '16GB' : budget < 15000 ? '32GB' : budget < 30000 ? '64GB' : '128GB';
  const memoryPrice = budget < 6000 ? 250 : budget < 15000 ? 650 : budget < 30000 ? 1300 : 2500;
  config.memory = {
    model: `${memorySize} DDR5`,
    price: memoryPrice,
    capacity: memorySize
  };
  
  // 选择 SSD
  const suitableSsds = ssdData
    .filter(s => s.price <= ssdBudget * 1.3)
    .sort((a, b) => b.read4k - a.read4k);
  config.ssd = suitableSsds[0] || ssdData[ssdData.length - 1];
  
  // 计算总价
  config.total = (config.cpu?.price || 0) + 
                 (config.gpu?.price || 0) + 
                 (config.memory?.price || 0) + 
                 (config.ssd?.price || 0);
  
  return config;
}

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { cpuData, gpuData, memoryData, ssdData, recommendedConfigs, generateConfig };
}

