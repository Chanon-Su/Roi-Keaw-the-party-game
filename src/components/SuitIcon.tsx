// src/components/SuitIcon.tsx
//
// [Claude] SVG ดอกไพ่ — ออกแบบให้ swap ได้ง่ายในอนาคต
//
// วิธี custom ดอกใหม่:
// 1. เพิ่ม key ใหม่ใน SUIT_PATHS เช่น "🍜" สำหรับ theme อาหาร
// 2. วาด SVG path ใน viewBox="0 0 24 24"
// 3. เปลี่ยน SUITS array ใน Game.tsx ให้ใช้ key ใหม่
//
// สีถูกกำหนดใน App.css ผ่าน class .suit-♠ .suit-♥ .suit-♦ .suit-♣
// ไม่ hardcode สีที่นี่ เพื่อให้ theme-aware

export type SuitKey = "♠" | "♥" | "♦" | "♣";

// [Claude] SVG path ของแต่ละดอก — viewBox 0 0 24 24
// อยากเปลี่ยนดีไซน์ → แก้ที่นี่ที่เดียว ไม่กระทบส่วนอื่น
const SUIT_PATHS: Record<string, string> = {
    // ♠ โพดำ — spade
    "♠": "M12 2 C12 2 4 8 4 13 C4 16.3 7 18 9.5 17 C8.5 19 7 20 5 21 L19 21 C17 20 15.5 19 14.5 17 C17 18 20 16.3 20 13 C20 8 12 2 12 2Z",
    // ♥ โพแดง — heart
    "♥": "M12 21 C12 21 3 14 3 8.5 C3 5.4 5.4 3 8.5 3 C10.2 3 11.7 3.8 12 5 C12.3 3.8 13.8 3 15.5 3 C18.6 3 21 5.4 21 8.5 C21 14 12 21 12 21Z",
    // ♦ ข้าวหลาม — diamond
    "♦": "M12 2 L22 12 L12 22 L2 12 Z",
    // ♣ ดอกจิก — club
    "♣": "M12 17 C10 17 8 15.5 8 13.5 C8 12.2 8.8 11.1 10 10.6 C9.2 10 8.5 9 8.5 7.8 C8.5 5.7 10.1 4 12 4 C13.9 4 15.5 5.7 15.5 7.8 C15.5 9 14.8 10 14 10.6 C15.2 11.1 16 12.2 16 13.5 C16 15.5 14 17 12 17Z M9 21 L15 21 L14 17 L10 17 Z",
};

type SuitIconProps = {
    suit: string;
    size?: number;        // px — default 20
    className?: string;
};

export default function SuitIcon({ suit, size = 20, className = "" }: SuitIconProps) {
    const path = SUIT_PATHS[suit];

    // ถ้าไม่มี path (future custom suit ที่ยังไม่ได้ใส่) — fallback เป็น text
    if (!path) {
        return (
            <span
                className={className}
                style={{ fontSize: size * 0.85, lineHeight: 1, display: "inline-block" }}
            >
                {suit}
            </span>
        );
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={className}
            fill="currentColor"
            aria-hidden="true"
        >
            <path d={path} />
        </svg>
    );
}
