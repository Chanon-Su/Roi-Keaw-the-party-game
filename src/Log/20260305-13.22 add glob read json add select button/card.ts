// types/card.ts

export type Card_type = {
    id: string;
    title: string;
    description_Eng: string;
    description_Thai: string;
    maxCopies: number;
    enabled: boolean;
    hasItem: boolean;
    // [Claude] แยก itemLabel เป็นสองภาษา — แสดงใน drawer ตามภาษาที่เลือก
    itemLabel_thai: string;    // เช่น "🤝 เพื่อนร่วมทุก"
    itemLabel_eng: string;     // เช่น "🤝 buddy"
};

export type Deck_type = {
    id: string;
    name: string;
    cards: Card_type[];
};

export type PlayerItem = {
    cardId: string;
    label: string;  // [Claude] ตอน runtime ใส่ค่าตามภาษาที่เลือก
};
