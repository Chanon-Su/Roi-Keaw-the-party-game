// types/card.ts
// ไฟล์นี้กำหนด "รูปร่าง" ของข้อมูลที่ใช้ในโปรเจ็กต์
// TypeScript จะใช้สิ่งนี้เพื่อตรวจสอบว่าเราใช้ข้อมูลถูกต้องมั้ย

// [Claude] Card_type: รูปร่างของไพ่แต่ละใบใน JSON
export type Card_type = {
    id: string;                // รหัสไพ่ เช่น "classic-1"
    title: string;             // ชื่อสั้น เช่น "shot-1"
    description_Eng: string;   // คำอธิบายภาษาอังกฤษ
    description_Thai: string;  // คำอธิบายภาษาไทย — ใช้แสดงในเกม
    maxCopies: number;         // จำนวนใบในสำรับ
    enabled: boolean;          // เปิด/ปิดไพ่ใบนี้
    hasItem: boolean;          // [Claude] true → ไพ่ใบนี้สร้าง item ติดตัวผู้เล่น
    itemLabel: string;         // [Claude] ข้อความสั้นที่แสดงใน drawer เช่น "🤝 buddy"
                               //          ถ้า hasItem: false → ใส่ "" ไว้ได้เลย
};

// [Claude] Deck_type: รูปร่างของไฟล์ JSON ทั้งไฟล์
export type Deck_type = {
    id: string;
    name: string;
    cards: Card_type[];
};

// [Claude] PlayerItem: item 1 ชิ้นที่ติดตัวผู้เล่น
export type PlayerItem = {
    cardId: string;   // รหัสไพ่ที่สร้าง item นี้ — ใช้ตรวจว่าซ้ำกันมั้ยเวลาย้าย
    label: string;    // ข้อความที่แสดงใน drawer — มาจาก itemLabel ใน JSON
};
