// Training program: three progressive phases.
// `plan` has 7 slots (Mon–Sun); `null` marks a rest day.
export const PHASES = [
  {
    id: 'easy', name: '第一階段', label: '養成習慣', weeks: '第1–4週', exPerWeek: 3,
    desc: '每週3次、每次20分鐘。讓身體愛上運動的感覺，養成打開app的習慣。',
    plan: [
      { name: '輕鬆快走', level: 'easy', duration: '20分鐘', burn: 80, tips: '速度以「能說話但有點喘」為準', steps: ['找附近喜歡的路', '舒適步伐快走20分鐘', '結束後拉伸3分鐘'] },
      null,
      { name: '居家核心', level: 'easy', duration: '15分鐘', burn: 55, tips: '不需器材，感受肌肉發力', steps: ['棒式3×20秒', '臀橋3×15下', '貓牛式10次', '仰臥起坐3×10下'] },
      null,
      { name: '快走+爬樓梯', level: 'easy', duration: '25分鐘', burn: 110, tips: '沒有樓梯可延長快走', steps: ['快走15分鐘', '爬樓梯3-4層×3回', '緩和步行5分鐘'] },
      null,
      null,
    ],
  },
  {
    id: 'medium', name: '第二階段', label: '增加強度', weeks: '第5–8週', exPerWeek: 4,
    desc: '每週4次、每次25–35分鐘。加入慢跑和基礎肌力，開始感受體能提升。',
    plan: [
      { name: '慢跑間歇', level: 'medium', duration: '25分鐘', burn: 180, tips: '跑1分鐘走1分鐘，共10組', steps: ['暖身快走5分鐘', '跑1分→走1分×10組', '緩和伸展5分鐘'] },
      null,
      { name: '上半身肌力', level: 'medium', duration: '30分鐘', burn: 130, tips: '保持正確姿勢，不要貪快', steps: ['伏地挺身3×12', '啞鈴划船3×12', '棒式3×30秒'] },
      { name: '慢跑20分鐘', level: 'medium', duration: '20分鐘', burn: 160, tips: '不停歇，速度慢沒關係', steps: ['暖身3分鐘', '慢跑15分鐘', '緩和2分鐘'] },
      null,
      { name: '下半身肌力', level: 'medium', duration: '30分鐘', burn: 140, tips: '深蹲時臀部往後坐', steps: ['深蹲4×15', '弓箭步4×12（左右各）', '臀橋4×20'] },
      null,
    ],
  },
  {
    id: 'hard', name: '第三階段', label: '挑戰進階', weeks: '第9週起', exPerWeek: 5,
    desc: '每週5次、每次30–40分鐘。加入HIIT和高強度訓練，塑形效果開始顯現。',
    plan: [
      { name: 'HIIT燃脂', level: 'hard', duration: '25分鐘', burn: 280, tips: '40秒全力+20秒休息，效率最高', steps: ['暖身5分鐘', '開合跳/波比跳/高抬腿各40秒共3輪', '緩和5分鐘'] },
      { name: '上肢推拉', level: 'hard', duration: '35分鐘', burn: 160, tips: '使用能做8-10下的重量', steps: ['伏地挺身4×15', '反手划船4×12', '肩推3×12'] },
      { name: '跑步5K', level: 'hard', duration: '30分鐘', burn: 280, tips: '速度慢沒關係，不停歇跑完', steps: ['暖身3分鐘', '慢跑25分鐘', '緩和3分鐘'] },
      { name: '下肢爆發', level: 'hard', duration: '35分鐘', burn: 200, tips: '跳躍落地膝蓋微彎保護關節', steps: ['深蹲跳4×10', '保加利亞蹲4×10', '單腳臀橋3×15'] },
      null,
      { name: '全身循環', level: 'hard', duration: '40分鐘', burn: 300, tips: '5個動作一輪，共4輪', steps: ['深蹲15→伏地挺身12→弓箭步跳10→棒式40s→波比跳8', '休息90秒，重複4輪'] },
      null,
    ],
  },
];
