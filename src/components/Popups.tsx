// components/Popups.tsx
import { useState } from 'react'
import '../App.css'
import type { Deck_type, Card_type } from '../types/card'
import { t, type Language, type FlipSpeed } from '../i18n'

// ==========================================
// SETTING POPUP
// ==========================================

type SettingPopupProps = {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
    theme: "light" | "dark";
    flipSpeed: FlipSpeed;
    isInGame: boolean;   // [Claude] ข้อ 11: ซ่อนปุ่มล้างชื่อระหว่างเล่นเกม
    onLanguageChange: (lang: Language) => void;
    onThemeChange: (theme: "light" | "dark") => void;
    onFlipSpeedChange: (speed: FlipSpeed) => void;
    onClearPlayers: () => void;
};

export function SettingPopup(props: SettingPopupProps) {
    if (!props.isOpen) return null;
    const txt = t[props.language];

    // [Claude] ข้อ 1: แทน window.confirm ด้วย confirm state ใน component
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    function handleClear() {
        if (showClearConfirm) {
            props.onClearPlayers();
            props.onClose();
            setShowClearConfirm(false);
        } else {
            setShowClearConfirm(true);
        }
    }

    return (
        <div className="popup-backdrop">
            <div className="popup popup-settings">
                <button className="popup-close-btn" onClick={() => { props.onClose(); setShowClearConfirm(false); }}>✕</button>
                <h3 className="popup-title">{txt.settings}</h3>

                <div className="setting-section">
                    <p className="setting-label">{txt.language}</p>
                    <div className="setting-toggle-row">
                        <button className={`setting-toggle-btn ${props.language === "th" ? "active" : ""}`} onClick={() => props.onLanguageChange("th")}>🇹🇭 ไทย</button>
                        <button className={`setting-toggle-btn ${props.language === "en" ? "active" : ""}`} onClick={() => props.onLanguageChange("en")}>🇬🇧 English</button>
                    </div>
                </div>

                <div className="setting-section">
                    <p className="setting-label">{txt.theme}</p>
                    <div className="setting-toggle-row">
                        <button className={`setting-toggle-btn ${props.theme === "light" ? "active" : ""}`} onClick={() => props.onThemeChange("light")}>{txt.lightTheme}</button>
                        <button className={`setting-toggle-btn ${props.theme === "dark" ? "active" : ""}`} onClick={() => props.onThemeChange("dark")}>{txt.darkTheme}</button>
                    </div>
                </div>

                <div className="setting-section">
                    <p className="setting-label">{txt.flipSpeedLabel}</p>
                    <div className="setting-toggle-row">
                        <button className={`setting-toggle-btn ${props.flipSpeed === "slow"   ? "active" : ""}`} onClick={() => props.onFlipSpeedChange("slow")}  >{txt.flipSlow}</button>
                        <button className={`setting-toggle-btn ${props.flipSpeed === "normal" ? "active" : ""}`} onClick={() => props.onFlipSpeedChange("normal")}>{txt.flipNormal}</button>
                        <button className={`setting-toggle-btn ${props.flipSpeed === "fast"   ? "active" : ""}`} onClick={() => props.onFlipSpeedChange("fast")}  >{txt.flipFast}</button>
                    </div>
                </div>

                <div className="setting-divider" />

                {/* [Claude] ข้อ 11: ซ่อนปุ่มล้างชื่อระหว่างเล่นเกม */}
                {!props.isInGame && (
                    <div className="setting-section">
                        <p className="setting-label">{txt.dataSection}</p>

                        {/* [Claude] ข้อ 1: confirm แบบ in-theme — กดครั้งแรก = ถาม, กดครั้งสอง = ยืนยัน */}
                        {showClearConfirm ? (
                            <div className="confirm-box">
                                <p className="confirm-text">{txt.clearConfirm}</p>
                                <div className="confirm-row">
                                    <button className="confirm-cancel-btn" onClick={() => setShowClearConfirm(false)}>{txt.cancel}</button>
                                    <button className="confirm-ok-btn" onClick={handleClear}>{txt.confirmClear}</button>
                                </div>
                            </div>
                        ) : (
                            <button className="setting-clear-btn" onClick={handleClear}>{txt.clearPlayers}</button>
                        )}
                    </div>
                )}
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
    language: Language;
};

export function HowToPlayPopup(props: HowToPlayPopupProps) {
    if (!props.isOpen) return null;
    const txt = t[props.language];

    return (
        <div className="popup-backdrop">
            <div className="popup popup-howtoplay">
                <button className="popup-close-btn" onClick={props.onClose}>✕</button>
                <h3 className="popup-title">{txt.howToPlayTitle}</h3>
                <p style={{ color: "#aaa", fontSize: "14px", marginTop: "8px" }}>{txt.howToPlayComingSoon}</p>
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
    decks: Deck_type[];
    cardCounts: Record<string, number>;
    onCardCountChange: (cardId: string, count: number) => void;
    selectedDeckId: string;
    onDeckSelect: (deckId: string) => void;
    language: Language;
};

export function DeckPopup(props: DeckPopupProps) {
    if (!props.isOpen) return null;
    const txt = t[props.language];

    const [view, setView] = useState<"select" | "edit">("select");
    const [previewDeckId, setPreviewDeckId] = useState(props.selectedDeckId);
    const previewDeck = props.decks.find(d => d.id === previewDeckId);

    // [Claude] ข้อ 14: track ว่ามีการแก้ไขไพ่แล้วหรือยัง
    // ถ้ายังไม่แก้ → ✕ ปิด popup ทั้งหมด (ข้อ 13)
    // ถ้าแก้แล้ว → เปลี่ยนเป็น ✓ ยืนยัน
    const [hasEdited, setHasEdited] = useState(false);

    function handleCardCountChange(cardId: string, count: number) {
        setHasEdited(true);
        props.onCardCountChange(cardId, count);
    }

    function handleConfirm() {
        setHasEdited(false);
        setView("select");
    }

    function handleBack() {
        setHasEdited(false);
        setView("select");
    }

    function totalCards(deck: Deck_type): number {
        return deck.cards
            .filter(c => c.enabled)
            .reduce((sum, c) => sum + (props.cardCounts[c.id] ?? c.maxCopies), 0);
    }

    if (view === "select") {
        return (
            <div className="popup-backdrop">
                <div className="popup popup-fullscreen">
                    <button className="popup-close-btn" onClick={props.onClose}>✕</button>
                    <h3 className="popup-title">{txt.selectDeck}</h3>

                    <div className="popup-fullscreen-scroll">
                    <div className="deck-list">
                        {props.decks.map(deck => {
                            const isSelected = deck.id === props.selectedDeckId;
                            return (
                                <div
                                    key={deck.id}
                                    className={`deck-card ${isSelected ? "selected" : ""}`}
                                >
                                    {/* ซ้าย: ✓ + ชื่อ + จำนวนไพ่ */}
                                    <div className="deck-card-info">
                                        <p className="deck-card-name">
                                            {/* [Claude] ✓ แสดงหน้าชื่อเฉพาะ deck ที่เลือก */}
                                            {isSelected && (
                                                <span className="deck-selected-mark">✓ </span>
                                            )}
                                            {deck.name}
                                        </p>
                                        <p className="deck-card-count">{txt.totalCards(totalCards(deck))}</p>
                                    </div>

                                    {/* ขวา: ปุ่มเลือก + ปุ่มดูไพ่ */}
                                    <div className="deck-card-actions">
                                        <button
                                            className={`deck-select-btn ${isSelected ? "selected" : ""}`}
                                            onClick={() => props.onDeckSelect(deck.id)}
                                            disabled={isSelected}
                                        >
                                            {txt.selectThisDeck}
                                        </button>
                                        <button
                                            className="deck-detail-btn"
                                            onClick={() => {
                                                setPreviewDeckId(deck.id);
                                                setView("edit");
                                            }}
                                        >
                                            {txt.viewCards}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="popup-backdrop">
            <div className="popup popup-fullscreen">
                {/* [Claude] ข้อ 13: ← back = ย้อนหน้า select
                    ข้อ 14: ✕ → ✓ เมื่อมีการแก้ไข */}
                <button className="popup-back-btn" onClick={handleBack}>{txt.back}</button>
                {hasEdited ? (
                    <button className="popup-confirm-btn" onClick={handleConfirm}>✓ {txt.confirmEdit}</button>
                ) : (
                    <button className="popup-close-btn" onClick={props.onClose}>✕</button>
                )}

                <h3 className="popup-title">🃏 {previewDeck?.name}</h3>

                {/* จำนวนรวม + คำเตือนขั้นต่ำ */}
                {previewDeck && (() => {
                    const MIN_CARDS = 12;
                    const total = totalCards(previewDeck);
                    const tooFew = total < MIN_CARDS;
                    const atMin = total === MIN_CARDS;
                    return (
                        <>
                            <p className={`popup-subtitle ${tooFew ? "popup-subtitle--warn" : ""}`}>
                                {txt.totalCards(total)}
                                {tooFew && <span className="deck-min-hint"> — {txt.minCardsHint(MIN_CARDS)}</span>}
                            </p>
                            {/* คำเตือนเด่น — แสดงเมื่อถึงขั้นต่ำพอดี */}
                            {atMin && (
                                <p className="deck-min-warning">{txt.atMinCardsWarning(MIN_CARDS)}</p>
                            )}
                        </>
                    );
                })()}

                {previewDeck && (
                    <p className="deck-description-text">
                        {props.language === "th"
                            ? previewDeck.deck_description_thai
                            : previewDeck.deck_description_eng}
                    </p>
                )}

                <div className="popup-fullscreen-scroll">
                <div className="card-edit-list">
                    {previewDeck && (() => {
                        const MIN_CARDS = 12;
                        const total = totalCards(previewDeck);
                        return previewDeck.cards.filter(c => c.enabled).map((card: Card_type) => {
                            const count = props.cardCounts[card.id] ?? card.maxCopies;
                            // ล็อคปุ่ม − เมื่อการลดจะทำให้ total < MIN_CARDS
                            const canDecrease = count > 0 && total > MIN_CARDS;
                            return (
                                <div key={card.id} className="card-edit-row">
                                    <div className="card-edit-info">
                                        <p className="card-edit-name">
                                            {props.language === "th"
                                                ? card.description_Thai
                                                : card.description_Eng}
                                        </p>
                                    </div>
                                    <div className="card-edit-counter">
                                        <button
                                            className="counter-btn"
                                            onClick={() => handleCardCountChange(card.id, count - 1)}
                                            disabled={!canDecrease}
                                        >−</button>
                                        <span className="counter-num">{count}</span>
                                        <button
                                            className="counter-btn"
                                            onClick={() => handleCardCountChange(card.id, Math.min(card.maxCopies, count + 1))}
                                            disabled={count === card.maxCopies}
                                        >+</button>
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>

                <button
                    className="setting-clear-btn"
                    style={{ marginTop: "12px" }}
                    onClick={() => {
                        previewDeck?.cards.forEach(c => handleCardCountChange(c.id, c.maxCopies));
                    }}
                >
                    {txt.resetCounts}
                </button>
                </div>
            </div>
        </div>
    );
}
