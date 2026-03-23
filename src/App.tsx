import { useState } from 'react';
import './App.css'
import Game from './components/Game'
import Menu, { loadPlayers, clearPlayers } from './components/Menu';
import { SettingPopup, HowToPlayPopup, DeckPopup } from './components/Popups';
import { ALL_DECKS } from './data/index';
import type { Deck_type } from './types/card';
import { loadLanguage, saveLanguage, type Language, loadFlipSpeed, saveFlipSpeed, type FlipSpeed } from './i18n';

// [Claude] ALL_DECKS มาจาก data/index.ts แล้ว ไม่ต้องประกาศที่นี่

export default function App() {
    const [currentPage, setCurrentPage] = useState("menu");
    const [players, setPlayers] = useState<string[]>(() => loadPlayers());

    const [isSettingOpen, setIsSettingOpen] = useState(false);
    const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
    const [isDeckOpen, setIsDeckOpen] = useState(false);

    const [language, setLanguage] = useState<Language>(() => loadLanguage());
    const [theme, setTheme] = useState<"light" | "dark">(() => {
        const saved = localStorage.getItem("cardgame_theme");
        const t = saved === "dark" ? "dark" : "light";
        // apply ทันทีตอน init ไม่ต้องรอ render รอบแรก
        if (t === "dark") document.getElementById("root")?.classList.add("dark");
        return t;
    });

    const [flipSpeed, setFlipSpeed] = useState<FlipSpeed>(() => loadFlipSpeed());

    function handleFlipSpeedChange(speed: FlipSpeed) {
        setFlipSpeed(speed);
        saveFlipSpeed(speed);
    }

    function handleLanguageChange(lang: Language) {
        setLanguage(lang);
        saveLanguage(lang);
    }

    const [selectedDeckId, setSelectedDeckId] = useState(ALL_DECKS[0].id);
    const [cardCounts, setCardCounts] = useState<Record<string, number>>({});

    function handleCardCountChange(cardId: string, count: number) {
        setCardCounts(prev => ({ ...prev, [cardId]: count }));
    }

    // [Claude] รวม buildDeck และ buildDeckData เป็นอันเดียว
    // เก็บทั้ง description_Thai และ description_Eng — Game เลือกแสดงตาม language
    function buildDeckData(input_deck: Deck_type) {
        const result: {
            description_Thai: string;
            description_Eng: string;
            hasItem: boolean;
            cardId: string;
            itemLabel_thai: string;
            itemLabel_eng: string;
        }[] = [];
        input_deck.cards.forEach(card => {
            if (!card.enabled) return;
            const count = cardCounts[card.id] ?? card.maxCopies;
            for (let i = 0; i < count; i++) {
                result.push({
                    description_Thai: card.description_Thai,
                    description_Eng:  card.description_Eng,
                    hasItem: card.hasItem ?? false,
                    cardId: card.id,
                    itemLabel_thai: card.itemLabel_thai ?? "",
                    itemLabel_eng:  card.itemLabel_eng  ?? "",
                });
            }
        });
        return result;
    }

    const activeDeck = ALL_DECKS.find(d => d.id === selectedDeckId) ?? ALL_DECKS[0];

    // [Claude] sync theme class กับ #root ทุกครั้งที่เปลี่ยน
    // CSS ใช้ .dark selector เพื่อ switch token ทั้งหมด
    function handleThemeChange(t: "light" | "dark") {
        setTheme(t);
        document.getElementById("root")?.classList.toggle("dark", t === "dark");
        localStorage.setItem("cardgame_theme", t);
    }

    return (
        <>
            {/* Popups — อยู่ที่ App level ทับได้ทุกหน้า */}
            <SettingPopup
                isOpen={isSettingOpen}
                onClose={() => setIsSettingOpen(false)}
                language={language}
                theme={theme}
                flipSpeed={flipSpeed}
                isInGame={currentPage === "game"}
                onLanguageChange={handleLanguageChange}
                onThemeChange={handleThemeChange}
                onFlipSpeedChange={handleFlipSpeedChange}
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
                    totalCardCount={buildDeckData(activeDeck).length}
                />
            )}

            {currentPage === "game" && (
                <Game
                    onStart={() => setCurrentPage("menu")}
                    players={players}
                    deckData={buildDeckData(activeDeck)}
                    onOpenSetting={() => setIsSettingOpen(true)}
                    onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
                    language={language}
                    flipSpeed={flipSpeed}
                />
            )}
        </>
    );
}
