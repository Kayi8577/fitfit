// Built-in food database — common Taiwan foods with typical-serving estimates.
// Values are approximations for one normal serving; users can adjust after
// autofill. `type` is the default meal category, `pro` is protein in grams.
//
// Sources: TFDA food nutrition database ballparks + common chain-store labels,
// rounded to friendly numbers. Editing content here never touches logic.

export const FOODS = [
  // ── 台式早餐 ──
  { name: '蛋餅', cal: 300, pro: 10, type: '早餐', icon: '🥞' },
  { name: '起司蛋餅', cal: 380, pro: 14, type: '早餐', icon: '🥞' },
  { name: '飯糰（傳統）', cal: 550, pro: 12, type: '早餐', icon: '🍙' },
  { name: '蘿蔔糕（2塊）', cal: 280, pro: 5, type: '早餐', icon: '🍘' },
  { name: '燒餅油條', cal: 520, pro: 11, type: '早餐', icon: '🥖' },
  { name: '饅頭夾蛋', cal: 400, pro: 14, type: '早餐', icon: '🥚' },
  { name: '鐵板麵', cal: 480, pro: 12, type: '早餐', icon: '🍝' },
  { name: '吐司夾蛋', cal: 320, pro: 12, type: '早餐', icon: '🍞' },
  { name: '花生厚片', cal: 350, pro: 8, type: '早餐', icon: '🍞' },
  { name: '漢堡（早餐店）', cal: 420, pro: 15, type: '早餐', icon: '🍔' },
  { name: '豆漿（無糖）', cal: 80, pro: 7, type: '早餐', icon: '🥛' },
  { name: '豆漿（含糖）', cal: 150, pro: 7, type: '早餐', icon: '🥛' },
  { name: '米漿', cal: 200, pro: 3, type: '早餐', icon: '🥛' },
  { name: '鹹豆漿', cal: 180, pro: 10, type: '早餐', icon: '🥣' },

  // ── 便當 / 飯類 ──
  { name: '雞腿便當', cal: 850, pro: 35, type: '午餐', icon: '🍱' },
  { name: '排骨便當', cal: 800, pro: 30, type: '午餐', icon: '🍱' },
  { name: '魚排便當', cal: 700, pro: 28, type: '午餐', icon: '🍱' },
  { name: '烤鯖魚便當', cal: 750, pro: 32, type: '午餐', icon: '🐟' },
  { name: '三寶飯', cal: 900, pro: 35, type: '午餐', icon: '🍱' },
  { name: '滷肉飯（小）', cal: 450, pro: 12, type: '午餐', icon: '🍚' },
  { name: '雞肉飯（小）', cal: 400, pro: 15, type: '午餐', icon: '🍚' },
  { name: '咖哩飯', cal: 700, pro: 20, type: '午餐', icon: '🍛' },
  { name: '蝦仁炒飯', cal: 650, pro: 18, type: '午餐', icon: '🍳' },
  { name: '牛肉燴飯', cal: 750, pro: 25, type: '午餐', icon: '🍚' },
  { name: '白飯（1碗）', cal: 280, pro: 5, type: '午餐', icon: '🍚' },
  { name: '糙米飯（1碗）', cal: 260, pro: 6, type: '午餐', icon: '🍚' },
  { name: '地瓜（中）', cal: 160, pro: 2, type: '午餐', icon: '🍠' },

  // ── 麵類 ──
  { name: '牛肉麵', cal: 650, pro: 30, type: '午餐', icon: '🍜' },
  { name: '陽春麵', cal: 350, pro: 10, type: '午餐', icon: '🍜' },
  { name: '乾麵', cal: 450, pro: 12, type: '午餐', icon: '🍜' },
  { name: '麻醬麵', cal: 550, pro: 14, type: '午餐', icon: '🍜' },
  { name: '餛飩麵', cal: 500, pro: 18, type: '午餐', icon: '🍜' },
  { name: '鍋燒意麵', cal: 600, pro: 20, type: '午餐', icon: '🍲' },
  { name: '米粉湯', cal: 350, pro: 10, type: '午餐', icon: '🍜' },
  { name: '炒米粉', cal: 450, pro: 10, type: '午餐', icon: '🍝' },
  { name: '大滷麵', cal: 550, pro: 18, type: '午餐', icon: '🍜' },
  { name: '日式拉麵', cal: 750, pro: 25, type: '晚餐', icon: '🍜' },
  { name: '義大利麵（紅醬）', cal: 650, pro: 20, type: '晚餐', icon: '🍝' },
  { name: '義大利麵（白醬）', cal: 800, pro: 22, type: '晚餐', icon: '🍝' },
  { name: '涼麵', cal: 480, pro: 14, type: '午餐', icon: '🍜' },

  // ── 餃類 / 點心類主食 ──
  { name: '水餃（10顆）', cal: 500, pro: 20, type: '晚餐', icon: '🥟' },
  { name: '鍋貼（10顆）', cal: 700, pro: 20, type: '晚餐', icon: '🥟' },
  { name: '小籠包（8顆）', cal: 550, pro: 18, type: '午餐', icon: '🥟' },
  { name: '肉包', cal: 280, pro: 10, type: '早餐', icon: '🥟' },
  { name: '菜包', cal: 220, pro: 6, type: '早餐', icon: '🥟' },
  { name: '蔥抓餅', cal: 400, pro: 7, type: '點心', icon: '🫓' },
  { name: '蔥抓餅加蛋', cal: 480, pro: 13, type: '點心', icon: '🫓' },

  // ── 夜市 / 小吃 ──
  { name: '鹽酥雞（1份）', cal: 550, pro: 25, type: '點心', icon: '🍗' },
  { name: '雞排', cal: 650, pro: 35, type: '點心', icon: '🍗' },
  { name: '蚵仔煎', cal: 450, pro: 15, type: '晚餐', icon: '🍳' },
  { name: '臭豆腐', cal: 500, pro: 18, type: '點心', icon: '🍢' },
  { name: '大腸包小腸', cal: 550, pro: 15, type: '點心', icon: '🌭' },
  { name: '滷味（1份）', cal: 400, pro: 20, type: '晚餐', icon: '🍢' },
  { name: '肉圓', cal: 450, pro: 10, type: '點心', icon: '🥟' },
  { name: '胡椒餅', cal: 450, pro: 14, type: '點心', icon: '🥧' },
  { name: '車輪餅（紅豆）', cal: 250, pro: 5, type: '點心', icon: '🥮' },
  { name: '雞蛋糕（1份）', cal: 300, pro: 7, type: '點心', icon: '🧇' },
  { name: '地瓜球（1份）', cal: 350, pro: 2, type: '點心', icon: '🍡' },
  { name: '珍珠奶茶（全糖）', cal: 650, pro: 8, type: '點心', icon: '🧋' },
  { name: '珍珠奶茶（半糖）', cal: 550, pro: 8, type: '點心', icon: '🧋' },

  // ── 火鍋 / 燒烤 ──
  { name: '小火鍋（含料）', cal: 800, pro: 35, type: '晚餐', icon: '🍲' },
  { name: '麻辣鍋（1餐）', cal: 1000, pro: 40, type: '晚餐', icon: '🌶️' },
  { name: '燒肉（1餐）', cal: 900, pro: 45, type: '晚餐', icon: '🥩' },
  { name: '薑母鴨（1餐）', cal: 700, pro: 35, type: '晚餐', icon: '🦆' },

  // ── 日式 / 韓式 ──
  { name: '壽司（8貫）', cal: 400, pro: 18, type: '午餐', icon: '🍣' },
  { name: '生魚片（1份）', cal: 180, pro: 25, type: '晚餐', icon: '🍣' },
  { name: '親子丼', cal: 650, pro: 30, type: '午餐', icon: '🍚' },
  { name: '牛丼', cal: 700, pro: 25, type: '午餐', icon: '🍚' },
  { name: '豬排丼', cal: 850, pro: 30, type: '午餐', icon: '🍚' },
  { name: '烏龍麵', cal: 450, pro: 12, type: '午餐', icon: '🍜' },
  { name: '韓式石鍋拌飯', cal: 700, pro: 22, type: '晚餐', icon: '🍚' },
  { name: '韓式炸雞（1份）', cal: 700, pro: 35, type: '晚餐', icon: '🍗' },
  { name: '關東煮（3串）', cal: 150, pro: 8, type: '點心', icon: '🍢' },

  // ── 西式 / 速食 ──
  { name: '大麥克', cal: 550, pro: 26, type: '午餐', icon: '🍔' },
  { name: '麥香雞', cal: 385, pro: 15, type: '午餐', icon: '🍔' },
  { name: '薯條（中）', cal: 330, pro: 4, type: '點心', icon: '🍟' },
  { name: '炸雞（2塊）', cal: 500, pro: 35, type: '晚餐', icon: '🍗' },
  { name: '披薩（2片）', cal: 550, pro: 22, type: '晚餐', icon: '🍕' },
  { name: '潛艇堡（6吋）', cal: 350, pro: 20, type: '午餐', icon: '🥪' },
  { name: '凱薩沙拉', cal: 350, pro: 12, type: '午餐', icon: '🥗' },
  { name: '牛排（1客）', cal: 800, pro: 45, type: '晚餐', icon: '🥩' },

  // ── 超商 ──
  { name: '御飯糰', cal: 200, pro: 5, type: '早餐', icon: '🍙' },
  { name: '三明治（超商）', cal: 280, pro: 10, type: '早餐', icon: '🥪' },
  { name: '茶葉蛋', cal: 75, pro: 7, type: '點心', icon: '🥚' },
  { name: '地瓜（超商）', cal: 180, pro: 2, type: '點心', icon: '🍠' },
  { name: '沙拉（超商）', cal: 150, pro: 8, type: '午餐', icon: '🥗' },
  { name: '雞胸肉（即食）', cal: 130, pro: 25, type: '午餐', icon: '🍗' },
  { name: '無糖優格（1杯）', cal: 100, pro: 9, type: '點心', icon: '🥛' },
  { name: '關東煮蘿蔔', cal: 30, pro: 1, type: '點心', icon: '🍢' },

  // ── 健康 / 健身餐 ──
  { name: '水煮蛋', cal: 75, pro: 7, type: '早餐', icon: '🥚' },
  { name: '水煮雞胸肉（100g）', cal: 120, pro: 23, type: '午餐', icon: '🍗' },
  { name: '鮭魚（1片）', cal: 230, pro: 25, type: '晚餐', icon: '🐟' },
  { name: '健身餐盒', cal: 550, pro: 40, type: '午餐', icon: '🥗' },
  { name: '乳清蛋白（1份）', cal: 120, pro: 24, type: '點心', icon: '🥤' },
  { name: '燕麥（1碗）', cal: 250, pro: 8, type: '早餐', icon: '🥣' },
  { name: '香蕉', cal: 100, pro: 1, type: '點心', icon: '🍌' },
  { name: '蘋果', cal: 80, pro: 0, type: '點心', icon: '🍎' },
  { name: '芭樂', cal: 90, pro: 1, type: '點心', icon: '🍈' },
  { name: '堅果（1把）', cal: 180, pro: 5, type: '點心', icon: '🥜' },
  { name: '酪梨（半顆）', cal: 160, pro: 2, type: '早餐', icon: '🥑' },

  // ── 飲料 ──
  { name: '黑咖啡', cal: 5, pro: 0, type: '早餐', icon: '☕' },
  { name: '拿鐵（中杯）', cal: 180, pro: 9, type: '早餐', icon: '☕' },
  { name: '綠茶（無糖）', cal: 0, pro: 0, type: '點心', icon: '🍵' },
  { name: '奶茶（中杯）', cal: 400, pro: 5, type: '點心', icon: '🧋' },
  { name: '可樂（罐裝）', cal: 140, pro: 0, type: '點心', icon: '🥤' },
  { name: '運動飲料', cal: 150, pro: 0, type: '點心', icon: '🥤' },
  { name: '啤酒（1罐）', cal: 150, pro: 1, type: '晚餐', icon: '🍺' },
  { name: '鮮奶（1杯）', cal: 150, pro: 8, type: '早餐', icon: '🥛' },

  // ── 甜點 / 零食 ──
  { name: '豆花', cal: 250, pro: 7, type: '點心', icon: '🍮' },
  { name: '仙草凍', cal: 150, pro: 1, type: '點心', icon: '🍮' },
  { name: '蛋糕（1片）', cal: 350, pro: 5, type: '點心', icon: '🍰' },
  { name: '菠蘿麵包', cal: 350, pro: 7, type: '點心', icon: '🍞' },
  { name: '巧克力（4格）', cal: 220, pro: 3, type: '點心', icon: '🍫' },
  { name: '洋芋片（1包）', cal: 300, pro: 3, type: '點心', icon: '🍟' },
  { name: '冰淇淋（1球）', cal: 200, pro: 3, type: '點心', icon: '🍨' },
  { name: '餅乾（1包）', cal: 250, pro: 3, type: '點心', icon: '🍪' },
];

// Exact-name lookup, for autofill after a datalist pick.
export function findFood(name) {
  const key = String(name || '').trim();
  return FOODS.find(f => f.name === key) || null;
}

// The user's most-logged foods, for one-tap re-logging.
// `freq` maps name → { count, lastUsed, cal, pro, type, icon }.
// Ranked by count, ties broken by most recent use.
export function topFrequentFoods(freq, n = 8) {
  return Object.entries(freq || {})
    .map(([name, f]) => ({ name, ...f }))
    .sort((a, b) => (b.count - a.count) || String(b.lastUsed).localeCompare(String(a.lastUsed)))
    .slice(0, n);
}

// Keep the frequency map bounded: when it grows past `cap`, drop the
// least-used, oldest entries.
export function pruneFoodFreq(freq, cap = 200) {
  const names = Object.keys(freq);
  if (names.length <= cap) return freq;
  const keep = topFrequentFoods(freq, cap);
  const next = {};
  keep.forEach(({ name, ...f }) => { next[name] = f; });
  return next;
}
