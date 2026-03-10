import { useState } from 'react';
import './App.css'
import Game from './components/Game'
import Menu, { loadPlayers, clearPlayers } from './components/Menu';
import { SettingPopup, HowToPlayPopup, DeckPopup } from './components/Popups';
import deckOriginal from './data/deck-original.json';
import type { Deck_type } from './types/card';
import { loadLanguage, saveLanguage, type Language } from './i18n';

// [Claude] รวม deck ทั้งหมดที่มีไว้ที่เดียว
// ทีหลังเพิ่ม deck ใหม่ แค่เพิ่มใน array นี้ได้เลย
const ALL_DECKS: Deck_type[] = [
    deckOriginal as Deck_type,
];

export default function App() {
    const [currentPage, setCurrentPage] = useState("menu");
    const [players, setPlayers] = useState<string[]>(() => loadPlayers());

    // popup states
    const [isSettingOpen, setIsSettingOpen] = useState(false);
    const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
    const [isDeckOpen, setIsDeckOpen] = useState(false);

    // [Claude] language โหลดจาก localStorage — รีเฟรชก็ยังอยู่
    const [language, setLanguage] = useState<Language>(() => loadLanguage());
    const [theme, setTheme] = useState<"light" | "dark">("light");

    function handleLanguageChange(lang: Language) {
        setLanguage(lang);
        saveLanguage(lang); // [Claude] save ทันทีเมื่อเปลี่ยน
    }

    // [Claude] deck states
    const [selectedDeckId, setSelectedDeckId] = useState(ALL_DECKS[0].id);

    // [Claude] cardCounts: เก็บจำนวนไพ่ที่ผู้เล่นปรับเอง { cardId: count }
    // ถ้า cardId ไม่มีใน object นี้ → ใช้ maxCopies จาก JSON แทน (default)
    const [cardCounts, setCardCounts] = useState<Record<string, number>>({});

    function handleCardCountChange(cardId: string, count: number) {
        setCardCounts(prev => ({ ...prev, [cardId]: count }));
    }

    // [Claude] buildDeck: สร้าง deck โดยใช้ cardCounts ที่ผู้เล่นปรับ
    // ถ้าไม่มีใน cardCounts → ใช้ maxCopies จาก JSON
    function buildDeck(input_deck: Deck_type): string[] {
        const result: string[] = [];
        input_deck.cards.forEach(card => {
            if (!card.enabled) return;
            const count = cardCounts[card.id] ?? card.maxCopies;
            for (let i = 0; i < count; i++) {
                result.push(card.description_Thai);
            }
        });
        return result;
    }

    function buildDeckData(input_deck: Deck_type) {
        const result: { description_Thai: string; hasItem: boolean; cardId: string; itemLabel: string }[] = [];
        input_deck.cards.forEach(card => {
            if (!card.enabled) return;
            const count = cardCounts[card.id] ?? card.maxCopies;
            for (let i = 0; i < count; i++) {
                result.push({
                    description_Thai: card.description_Thai,
                    hasItem: card.hasItem ?? false,
                    cardId: card.id,
                    itemLabel: card.itemLabel ?? "",
                });
            }
        });
        return result;
    }

    const activeDeck = ALL_DECKS.find(d => d.id === selectedDeckId) ?? ALL_DECKS[0];

    return (
        <>
            {/* Popups — อยู่ที่ App level ทับได้ทุกหน้า */}
            <SettingPopup
                isOpen={isSettingOpen}
                onClose={() => setIsSettingOpen(false)}
                language={language}
                theme={theme}
                onLanguageChange={handleLanguageChange}
                onThemeChange={setTheme}
                onClearPlayers={() => setPlayers(clearPlayers())}
            />
            <HowToPlayPopup
                isOpen={isHowToPlayOpen}
                onClose={() => setIsHowToPlayOpen(false)}
                language={language}
            />
            <DeckPopup
                isOpen={isDeckOpen}
                onClose={() => setIsDeckOpen(false)}
                decks={ALL_DECKS}
                cardCounts={cardCounts}
                onCardCountChange={handleCardCountChange}
                selectedDeckId={selectedDeckId}
                onDeckSelect={setSelectedDeckId}
                language={language}
            />

            {currentPage === "menu" && (
                <Menu
                    onStart={() => setCurrentPage("game")}
                    players={players}
                    setPlayers={setPlayers}
                    onOpenSetting={() => setIsSettingOpen(true)}
                    onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
                    onOpenDeck={() => setIsDeckOpen(true)}
                    language={language}
                />
            )}

            {currentPage === "game" && (
                <Game
                    onStart={() => setCurrentPage("menu")}
                    players={players}
                    deck={buildDeck(activeDeck)}
                    deckData={buildDeckData(activeDeck)}
                    onOpenSetting={() => setIsSettingOpen(true)}
                    onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
                    language={language}
                />
            )}
        </>
    );
}
