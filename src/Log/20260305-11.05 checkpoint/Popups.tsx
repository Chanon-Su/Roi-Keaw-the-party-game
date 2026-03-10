// components/Popups.tsx
import { useState } from 'react'
import './menu.css'
import type { Deck_type, Card_type } from '../types/card'

// ==========================================
// SETTING POPUP
// ==========================================

type SettingPopupProps = {
    isOpen: boolean;
    onClose: () => void;
    language: "th" | "en";
    theme: "light" | "dark";
    onLanguageChange: (lang: "th" | "en") => void;
    onThemeChange: (theme: "light" | "dark") => void;
    onClearPlayers: () => void;
};

export function SettingPopup(props: SettingPopupProps) {
    if (!props.isOpen) return null;

    function handleClear() {
        const confirmed = window.confirm("ล้างชื่อผู้เล่นทั้งหมด?");
        if (confirmed) {
            props.onClearPlayers();
            props.onClose();
        }
    }

    return (
        <div className="popup-backdrop">
            <div className="popup popup-settings">
                <button className="popup-close-btn" onClick={props.onClose}>✕</button>
                <h3 className="popup-title">⚙️ ตั้งค่า</h3>

                <div className="setting-section">
                    <p className="setting-label">ภาษา / Language</p>
                    <div className="setting-toggle-row">
                        <button className={`setting-toggle-btn ${props.language === "th" ? "active" : ""}`} onClick={() => props.onLanguageChange("th")}>🇹🇭 ไทย</button>
                        <button className={`setting-toggle-btn ${props.language === "en" ? "active" : ""}`} onClick={() => props.onLanguageChange("en")}>🇬🇧 English</button>
                    </div>
                </div>

                <div className="setting-section">
                    <p className="setting-label">ธีม / Theme</p>
                    <div className="setting-toggle-row">
                        <button className={`setting-toggle-btn ${props.theme === "light" ? "active" : ""}`} onClick={() => props.onThemeChange("light")}>☀️ Light</button>
                        <button className={`setting-toggle-btn ${props.theme === "dark" ? "active" : ""}`} onClick={() => props.onThemeChange("dark")}>🌙 Dark</button>
                    </div>
                </div>

                <div className="setting-divider" />

                <div className="setting-section">
                    <p className="setting-label">ข้อมูล / Data</p>
                    <button className="setting-clear-btn" onClick={handleClear}>🗑 ล้างชื่อผู้เล่น</button>
                </div>
            </div>
        </div>
    );
}


// ==========================================
// HOW TO PLAY POPUP
// ==========================================

type HowToPlayPopupProps = {
    isOpen: boolean;
    onClose: () => void;
    language: "th" | "en";
};

export function HowToPlayPopup(props: HowToPlayPopupProps) {
    if (!props.isOpen) return null;

    return (
        <div className="popup-backdrop">
            <div className="popup popup-howtoplay">
                <button className="popup-close-btn" onClick={props.onClose}>✕</button>
                {props.language === "th" ? (
                    <>
                        <h3 className="popup-title">📖 วิธีเล่น</h3>
                        <p style={{ color: "#aaa", fontSize: "14px", marginTop: "8px" }}>🚧 เนื้อหากำลังจะมา 555</p>
                    </>
                ) : (
                    <>
                        <h3 className="popup-title">📖 How to Play</h3>
                        <p style={{ color: "#aaa", fontSize: "14px", marginTop: "8px" }}>🚧 Content coming soon</p>
                    </>
                )}
            </div>
        </div>
    );
}


// ==========================================
// DECK POPUP
// [Claude] Full-screen popup สำหรับ custom deck
// มี 2 หน้า: เลือก deck → ดูไพ่และปรับจำนวน
// ==========================================

type DeckPopupProps = {
    isOpen: boolean;
    onClose: () => void;
    decks: Deck_type[];                          // deck ทั้งหมดที่มี
    cardCounts: Record<string, number>;          // จำนวนไพ่ที่ปรับแล้ว { cardId: count }
    onCardCountChange: (cardId: string, count: number) => void;
    selectedDeckId: string;                      // deck ที่เลือกอยู่ตอนนี้
    onDeckSelect: (deckId: string) => void;
};

export function DeckPopup(props: DeckPopupProps) {
    if (!props.isOpen) return null;

    // [Claude] view: "select" = หน้าเลือก deck, "edit" = หน้าดูไพ่+ปรับจำนวน
    const [view, setView] = useState<"select" | "edit">("select");

    // deck ที่กำลัง preview อยู่ในหน้า edit (อาจต่างจาก selectedDeckId)
    const [previewDeckId, setPreviewDeckId] = useState(props.selectedDeckId);

    const previewDeck = props.decks.find(d => d.id === previewDeckId);

    // [Claude] นับจำนวนไพ่ทั้งหมดใน deck (รวมทุก card × count)
    function totalCards(deck: Deck_type): number {
        return deck.cards
            .filter(c => c.enabled)
            .reduce((sum, c) => sum + (props.cardCounts[c.id] ?? c.maxCopies), 0);
    }

    // =============== หน้า 1: เลือก deck ===============
    if (view === "select") {
        return (
            <div className="popup-backdrop">
                <div className="popup popup-fullscreen">
                    <button className="popup-close-btn" onClick={props.onClose}>✕</button>
                    <h3 className="popup-title">🃏 เลือก Deck</h3>

                    <div className="popup-fullscreen-scroll">
                    <div className="deck-list">
                        {props.decks.map(deck => {
                            const isSelected = deck.id === props.selectedDeckId;
                            return (
                                <div
                                    key={deck.id}
                                    className={`deck-card ${isSelected ? "selected" : ""}`}
                                    onClick={() => {
                                        props.onDeckSelect(deck.id);
                                        setPreviewDeckId(deck.id);
                                    }}
                                >
                                    <div className="deck-card-info">
                                        {/* [Claude] checkmark แสดง deck ที่เลือกใช้อยู่ */}
                                        <p className="deck-card-name">
                                            {isSelected && <span className="deck-selected-mark">✓ </span>}
                                            {deck.name}
                                        </p>
                                        <p className="deck-card-count">{totalCards(deck)} ใบ</p>
                                    </div>
                                    <button
                                        className="deck-detail-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewDeckId(deck.id);
                                            setView("edit");
                                        }}
                                    >
                                        ดูไพ่ →
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    </div> {/* end popup-fullscreen-scroll */}

                </div>
            </div>
        );
    }

    // =============== หน้า 2: ดูไพ่ + ปรับจำนวน ===============
    return (
        <div className="popup-backdrop">
            <div className="popup popup-fullscreen">

                <button className="popup-back-btn" onClick={() => setView("select")}>← กลับ</button>
                <button className="popup-close-btn" onClick={props.onClose}>✕</button>

                <h3 className="popup-title">🃏 {previewDeck?.name}</h3>
                <p className="popup-subtitle">{previewDeck ? totalCards(previewDeck) : 0} ใบรวม</p>

                {/* [Claude] scroll wrapper — แยกออกจาก popup หลักเพื่อไม่ตัดปุ่มกากบาท */}
                <div className="popup-fullscreen-scroll">

                <div className="card-edit-list">
                    {previewDeck?.cards.filter(c => c.enabled).map((card: Card_type) => {
                        const count = props.cardCounts[card.id] ?? card.maxCopies;
                        return (
                            <div key={card.id} className="card-edit-row">
                                <div className="card-edit-info">
                                    <p className="card-edit-name">{card.description_Thai}</p>
                                    {card.hasItem && (
                                        <span className="card-edit-item-badge">📌 มี item</span>
                                    )}
                                </div>
                                <div className="card-edit-counter">
                                    <button
                                        className="counter-btn"
                                        onClick={() => props.onCardCountChange(card.id, Math.max(0, count - 1))}
                                        disabled={count === 0}
                                    >−</button>
                                    <span className="counter-num">{count}</span>
                                    <button
                                        className="counter-btn"
                                        onClick={() => props.onCardCountChange(card.id, Math.min(card.maxCopies, count + 1))}
                                        disabled={count === card.maxCopies}
                                    >+</button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button
                    className="setting-clear-btn"
                    style={{ marginTop: "12px" }}
                    onClick={() => {
                        previewDeck?.cards.forEach(c =>
                            props.onCardCountChange(c.id, c.maxCopies)
                        );
                    }}
                >
                    🔄 รีเซ็ตจำนวนทั้งหมด
                </button>

                </div> {/* end popup-fullscreen-scroll */}

            </div>
        </div>
    );
}
