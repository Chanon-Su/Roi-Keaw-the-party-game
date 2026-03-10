// components/Popups.tsx
import { useState } from 'react'
import '../App.css'
import type { Deck_type, Card_type } from '../types/card'
import { t, type Language } from '../i18n'

// ==========================================
// SETTING POPUP
// ==========================================

type SettingPopupProps = {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
    theme: "light" | "dark";
    onLanguageChange: (lang: Language) => void;
    onThemeChange: (theme: "light" | "dark") => void;
    onClearPlayers: () => void;
};

export function SettingPopup(props: SettingPopupProps) {
    if (!props.isOpen) return null;
    const txt = t[props.language];

    function handleClear() {
        const confirmed = window.confirm(txt.clearConfirm);
        if (confirmed) {
            props.onClearPlayers();
            props.onClose();
        }
    }

    return (
        <div className="popup-backdrop">
            <div className="popup popup-settings">
                <button className="popup-close-btn" onClick={props.onClose}>✕</button>
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

                <div className="setting-divider" />

                <div className="setting-section">
                    <p className="setting-label">{txt.dataSection}</p>
                    <button className="setting-clear-btn" onClick={handleClear}>{txt.clearPlayers}</button>
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
                <button className="popup-back-btn" onClick={() => setView("select")}>{txt.back}</button>
                <button className="popup-close-btn" onClick={props.onClose}>✕</button>

                <h3 className="popup-title">🃏 {previewDeck?.name}</h3>
                <p className="popup-subtitle">{previewDeck ? txt.totalCards(totalCards(previewDeck)) : ""}</p>

                <div className="popup-fullscreen-scroll">
                <div className="card-edit-list">
                    {previewDeck?.cards.filter(c => c.enabled).map((card: Card_type) => {
                        const count = props.cardCounts[card.id] ?? card.maxCopies;
                        return (
                            <div key={card.id} className="card-edit-row">
                                <div className="card-edit-info">
                                    <p className="card-edit-name">{card.description_Thai}</p>
                                    {card.hasItem && (
                                        <span className="card-edit-item-badge">{txt.hasItem}</span>
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
                    onClick={() => previewDeck?.cards.forEach(c => props.onCardCountChange(c.id, c.maxCopies))}
                >
                    {txt.resetCounts}
                </button>
                </div>
            </div>
        </div>
    );
}
