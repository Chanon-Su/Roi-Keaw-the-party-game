// data/index.ts
// [Claude] ใช้ import.meta.glob — Vite จะ auto-detect ทุกไฟล์ .json ใน /data
//
// วิธีเพิ่ม deck ใหม่:
//   1. วางไฟล์ JSON ใน /data โดยใช้เลขนำหน้า เช่น 02_spicy.json
//   2. ไม่ต้องแก้ไฟล์นี้ — Vite จะ detect อัตโนมัติ
//   3. เรียงลำดับตามชื่อไฟล์ 01_ ก่อน 02_ เสมอ

import type { Deck_type } from '../types/card'

// [Claude] import.meta.glob: Vite scan หาทุกไฟล์ .json ใน folder นี้
// eager: true = โหลดทันที ไม่ต้อง lazy load (deck ไม่ใหญ่มาก)
const modules = import.meta.glob<{ default: Deck_type }>('./*.json', { eager: true })

// [Claude] แปลง object เป็น array แล้วเรียงตามชื่อไฟล์ (01_ ก่อน 02_)
// key คือ path เช่น "./01_original.json" → เรียงตาม key ได้เลย
export const ALL_DECKS: Deck_type[] = Object.keys(modules)
    .sort()                          // "./01_..." มาก่อน "./02_..." เสมอ
    .map(key => modules[key].default)
    .filter(Boolean);                // กัน undefined ถ้า JSON เสีย
