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
        duplicateNamesHint: "* ชื่อผู้เล่นซ้ำกัน กรุณาใช้ชื่อที่ต่างกัน",
        tooFewCardsHint: "* ไพ่น้อยเกินไป — กดปุ่ม 🃏 สำรับ เพื่อเพิ่มไพ่",
        minCardsHint:    (n: number) => `ต้องมีอย่างน้อย ${n} ใบ`,
        atMinCardsWarning: (n: number) => `🔒 ถึงจำนวนขั้นต่ำ ${n} ใบแล้ว — ปุ่มลดถูกล็อค`,
        footer:          "Terms of service · Privacy · Contact us",

        // --- Game ---
        cardsLeft:       (n: number) => `เหลือ ${n} ใบ`,
        cardOf:          (name: string) => `ไพ่ของ ${name} :`,
        cardOfPrefix:    "ไพ่ของ ",
        cardOfSuffix:    " :",
        cardOfEmpty:     "ไพ่ของ — :",
        drawCard:        "จั่วไพ่",
        drawCardSub:     "กดเพื่อจั่ว",
        endGame:         "จบเกม",
        endGameSub:      "ไพ่หมดแล้ว — กดเพื่อจบ",
        nextTurn:        "ตาถัดไปคือตาของ :",
        skipTurn:        "⏭ ข้ามตา",
        playerInfo:      "ข้อมูลผู้เล่น",
        gameEndsWhenDeckEmpty: "เกมจบเมื่อไพ่หมด",
        backToMenu:      "← กลับหน้าหลัก",
        exitGame:        "ออกจากเกม",
        closeDrawer:     "↩ กลับไปเล่น",

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
        flipSpeedLabel:  "ความเร็วการพลิกไพ่",
        flipSlow:        "🐌 ช้า",
        flipNormal:      "🐢 ปกติ",
        flipFast:        "🐇 เร็ว",
        clearConfirm:    "ล้างชื่อผู้เล่นทั้งหมด?",
        cancel:          "ยกเลิก",
        confirmClear:    "ล้างเลย",

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
        confirmEdit:     "บันทึก",
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
        duplicateNamesHint: "* Duplicate names — please use unique names",
        tooFewCardsHint: "* Not enough cards — tap 🃏 Deck to add more",
        minCardsHint:    (n: number) => `need at least ${n} cards`,
        atMinCardsWarning: (n: number) => `🔒 Minimum ${n} cards reached — decrease locked`,
        footer:          "Terms of service · Privacy · Contact us",

        // --- Game ---
        cardsLeft:       (n: number) => `${n} cards left`,
        cardOf:          (name: string) => `${name}'s card :`,
        cardOfPrefix:    "",
        cardOfSuffix:    "'s card :",
        cardOfEmpty:     "— 's card :",
        drawCard:        "Draw Card",
        drawCardSub:     "tap to draw",
        endGame:         "End Game",
        endGameSub:      "Deck empty — tap to finish",
        nextTurn:        "Next up :",
        skipTurn:        "⏭ Skip Turn",
        playerInfo:      "Player Info",
        gameEndsWhenDeckEmpty: "Game ends when deck runs out",
        backToMenu:      "← Back to Menu",
        exitGame:        "Exit Game",
        closeDrawer:     "↩ Back to Game",

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
        flipSpeedLabel:  "Card Flip Speed",
        flipSlow:        "🐌 Slow",
        flipNormal:      "🐢 Normal",
        flipFast:        "🐇 Fast",
        clearConfirm:    "Clear all player names?",
        cancel:          "Cancel",
        confirmClear:    "Clear",

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
        confirmEdit:     "Save",
        hasItem:         "📌 Has item",
        back:            "← Back",
    },
} as const;

// ==========================================
// FLIP SPEED
// ==========================================

export type FlipSpeed = "slow" | "normal" | "fast";

// [Claude] ค่าจริงที่ใช้ใน CSS transition และ lock ปุ่ม
// flipDuration = ความเร็วของ CSS rotateY
// lockMs       = ช่วงที่กดปุ่มจั่วไม่ได้ (flipDuration + buffer)
export const FLIP_SPEED_CONFIG: Record<FlipSpeed, { flipDuration: number; lockMs: number }> = {
    slow:   { flipDuration: 0.90, lockMs: 1400 },
    normal: { flipDuration: 0.65, lockMs: 1000 },  // default
    fast:   { flipDuration: 0.45, lockMs:  650 },
};

const FLIP_SPEED_KEY = "cardgame_flip_speed";

export function loadFlipSpeed(): FlipSpeed {
    const saved = localStorage.getItem(FLIP_SPEED_KEY);
    if (saved === "slow" || saved === "fast") return saved;
    return "normal";
}

export function saveFlipSpeed(speed: FlipSpeed) {
    localStorage.setItem(FLIP_SPEED_KEY, speed);
}
