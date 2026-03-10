// types/card.ts

export type Card_type = {
    id: string;
    title: string;
    description_Eng: string;
    description_Thai: string;
    maxCopies: number;
    enabled: boolean;
    hasItem: boolean;
    itemLabel_thai: string;
    itemLabel_eng: string;
};

export type Deck_type = {
    id: string;
    name: string;
    // [Claude] คำอธิบาย deck สั้นๆ — แสดงในหน้าดูไพ่
    deck_description_thai: string;
    deck_description_eng: string;
    cards: Card_type[];
};

export type PlayerItem = {
    cardId: string;
    label_thai: string;
    label_eng: string;
};
