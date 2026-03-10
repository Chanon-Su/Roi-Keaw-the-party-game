// i18n.ts
// [Claude] ไฟล์นี้เก็บข้อความ UI ทั้งหมดของแอป
// อยากแก้ข้อความ → แก้ที่นี่ที่เดียว ไม่ต้องไล่หาทุกไฟล์
// อยากเพิ่มภาษาใหม่ → เพิ่ม key ใหม่ใน type Language และเพิ่ม object ด้านล่าง

export type Language = "th" | "en";

// [Claude] key สำหรับเก็บภาษาใน localStorage
export const LANGUAGE_STORAGE_KEY = "cardgame_language";

export function loadLanguage(): Language {
    try {
        const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (saved === "th" || saved === "en") return saved;
    } catch { }
    return "th"; // default
}

export function saveLanguage(lang: Language) {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

// ==========================================
// ข้อความทั้งหมด แยกตามภาษา
// ==========================================

export const t = {
    th: {
        // --- Menu ---
        addPlayer:       "+ เพิ่มผู้เล่น",
        startGame:       "▶ เริ่มเกม",
        howToPlay:       "📖 วิธีเล่น",
        deck:            "🃏 สำรับ",
        playerPlaceholder: (n: number) => `ผู้เล่น ${n}`,
        maxPlayersHint:  (n: number) => `ผู้เล่นสูงสุด ${n} คนแล้ว`,
        minPlayersHint:  (n: number) => `ผู้เล่นขั้นต่ำ ${n} คน`,
        fillNamesHint:   "* กรุณากรอกชื่อผู้เล่นให้ครบทุกคนก่อนเริ่ม",
        footer:          "Terms of service · Privacy · Contact us",

        // --- Game ---
        cardsLeft:       (n: number) => `เหลือ ${n} ใบ`,
        cardOf:          (name: string) => `ไพ่ของ ${name} :`,
        cardOfEmpty:     "ไพ่ของ — :",
        drawCard:        "จั่วไพ่",
        nextTurn:        "ตาถัดไปคือตาของ :",
        skipTurn:        "⏭ ข้ามตา",
        playerInfo:      "ข้อมูลผู้เล่น",
        gameEndsWhenDeckEmpty: "เกมจบเมื่อไพ่หมด",
        backToMenu:      "← กลับหน้าหลัก",

        // --- Game Over popup ---
        gameOver:        "Game Over",
        deckEmpty:       "ไพ่หมดแล้ว!",
        playAgain:       "▶ เล่นอีกรอบ",

        // --- Drawer ---
        drawerTab:       "ข้อมูลผู้เล่น",

        // --- Setting popup ---
        settings:        "⚙️ ตั้งค่า",
        language:        "ภาษา / Language",
        theme:           "ธีม / Theme",
        lightTheme:      "☀️ Light",
        darkTheme:       "🌙 Dark",
        dataSection:     "ข้อมูล / Data",
        clearPlayers:    "🗑 ล้างชื่อผู้เล่น",
        clearConfirm:    "ล้างชื่อผู้เล่นทั้งหมด?",

        // --- How to Play popup ---
        howToPlayTitle:  "📖 วิธีเล่น",
        howToPlayComingSoon: "🚧 เนื้อหากำลังจะมา",

        // --- Deck popup ---
        selectDeck:      "🃏 เลือกสำรับ",
        viewCards:       "ดูไพ่ →",
        selectThisDeck:  "เลือกสำรับนี้",
        deckSelected:    "✓ กำลังใช้อยู่",
        totalCards:      (n: number) => `${n} ใบรวม`,
        resetCounts:     "🔄 รีเซ็ตจำนวนทั้งหมด",
        hasItem:         "📌 มี item",
        back:            "← กลับ",
    },

    en: {
        // --- Menu ---
        addPlayer:       "+ Add Player",
        startGame:       "▶ Start Game",
        howToPlay:       "📖 How to Play",
        deck:            "🃏 Deck",
        playerPlaceholder: (n: number) => `Player ${n}`,
        maxPlayersHint:  (n: number) => `Maximum ${n} players reached`,
        minPlayersHint:  (n: number) => `Minimum ${n} players`,
        fillNamesHint:   "* Please fill in all player names before starting",
        footer:          "Terms of service · Privacy · Contact us",

        // --- Game ---
        cardsLeft:       (n: number) => `${n} cards left`,
        cardOf:          (name: string) => `${name}'s card :`,
        cardOfEmpty:     "— 's card :",
        drawCard:        "Draw Card",
        nextTurn:        "Next up :",
        skipTurn:        "⏭ Skip Turn",
        playerInfo:      "Player Info",
        gameEndsWhenDeckEmpty: "Game ends when deck runs out",
        backToMenu:      "← Back to Menu",

        // --- Game Over popup ---
        gameOver:        "Game Over",
        deckEmpty:       "Deck is empty!",
        playAgain:       "▶ Play Again",

        // --- Drawer ---
        drawerTab:       "Player Info",

        // --- Setting popup ---
        settings:        "⚙️ Settings",
        language:        "ภาษา / Language",
        theme:           "ธีม / Theme",
        lightTheme:      "☀️ Light",
        darkTheme:       "🌙 Dark",
        dataSection:     "Data",
        clearPlayers:    "🗑 Clear Players",
        clearConfirm:    "Clear all player names?",

        // --- How to Play popup ---
        howToPlayTitle:  "📖 How to Play",
        howToPlayComingSoon: "🚧 Content coming soon",

        // --- Deck popup ---
        selectDeck:      "🃏 Select Deck",
        viewCards:       "View →",
        selectThisDeck:  "Select this deck",
        deckSelected:    "✓ Selected",
        totalCards:      (n: number) => `${n} cards total`,
        resetCounts:     "🔄 Reset all counts",
        hasItem:         "📌 Has item",
        back:            "← Back",
    },
} as const;
