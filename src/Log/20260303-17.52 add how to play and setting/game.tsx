import { useState } from 'react'
import './menu.css'
import type { PlayerItem } from '../types/card'

type GameProps = {
    onStart: () => void;
    players: string[];
    deck: string[];
    deckData: {
        description_Thai: string;
        hasItem: boolean;
        cardId: string;
        itemLabel: string;
    }[];
    // [Claude] รับฟังก์ชันเปิด popup จาก App — เหมือนกับ Menu
    onOpenSetting: () => void;
    onOpenHowToPlay: () => void;
};

function shuffle<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
}

export default function Game(props: GameProps) {

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [deck, setDeck] = useState<string[]>(() => shuffle(props.deck));
    const [currentCard, setCurrentCard] = useState<string | null>(null);
    const [numberCardLeft, setNumberCardLeft] = useState(props.deck.length);
    const [isGameOver, setIsGameOver] = useState(false);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [playerItems, setPlayerItems] = useState<Record<number, PlayerItem[]>>(
        () => Object.fromEntries(props.players.map((_, i) => [i, []]))
    );

    function findCardData(description: string) {
        return props.deckData.find(card => card.description_Thai === description);
    }

    function drawCard() {
        if (isGameOver) return;
        if (deck.length === 0) { setIsGameOver(true); return; }

        const remainingDeck = [...deck];
        const drawnCard = remainingDeck.pop();

        setDeck(remainingDeck);
        setNumberCardLeft(remainingDeck.length);
        setCurrentCard(drawnCard ?? null);

        if (drawnCard) {
            const cardData = findCardData(drawnCard);
            if (cardData?.hasItem) {
                const newItem: PlayerItem = {
                    cardId: cardData.cardId,
                    label: cardData.itemLabel,
                };
                setPlayerItems(prev => {
                    const updated = { ...prev };
                    for (const playerIdx in updated) {
                        updated[playerIdx] = updated[playerIdx].filter(
                            item => item.cardId !== cardData.cardId
                        );
                    }
                    updated[currentPlayerIndex] = [...updated[currentPlayerIndex], newItem];
                    return updated;
                });
            }
        }

        setCurrentPlayerIndex((prev) => (prev + 1) % props.players.length);
        if (remainingDeck.length === 0) setIsGameOver(true);
    }

    function skipTurn() {
        setCurrentPlayerIndex((prev) => (prev + 1) % props.players.length);
    }

    function handleRestart() {
        setDeck(shuffle(props.deck));
        setCurrentCard(null);
        setNumberCardLeft(props.deck.length);
        setIsGameOver(false);
        setCurrentPlayerIndex(0);
        setIsDrawerOpen(false);
        setPlayerItems(Object.fromEntries(props.players.map((_, i) => [i, []])));
    }

    function handleBackToMenu() {
        props.onStart();
    }

    const currentPlayerName =
        props.players[currentPlayerIndex] ||
        `Player ${String.fromCharCode(65 + currentPlayerIndex)}`;

    // [Claude] คนถัดไป — สำหรับ turn-bar
    const nextPlayerIndex = (currentPlayerIndex + 1) % props.players.length;
    const nextPlayerName =
        props.players[nextPlayerIndex] ||
        `Player ${String.fromCharCode(65 + nextPlayerIndex)}`;

    return (
        <div className="min-h-screen flex flex-col">

            {/* ===== GAME OVER POPUP ===== */}
            {isGameOver && (
                <div className="popup-backdrop">
                    <div className="popup">
                        <h2 style={{ fontSize: "32px" }}>🎴</h2>
                        <h3 style={{ fontSize: "22px", fontWeight: "bold" }}>Game Over</h3>
                        <p style={{ color: "#666", marginBottom: "8px" }}>ไพ่หมดแล้ว!</p>
                        <button className="full_button" onClick={handleRestart}>▶ เล่นอีกรอบ</button>
                        <button className="full_button" onClick={handleBackToMenu}>← กลับหน้าหลัก</button>
                    </div>
                </div>
            )}

            {/* ===== HEADER ===== */}
            <div className="p-4">
                <div className='flex gap-2'>
                    <div className="logo_app">logo_app</div>
                    <div className="rounded-button1">เหลือ {numberCardLeft} ใบ</div>
                </div>
            </div>

            {/* ===== PLAY AREA ===== */}
            <div className="flex-1 p-4 flex flex-col gap-3">
                <div className="Play_area">
                    <p style={{ fontSize: "16px", color: "#888" }}>
                        ไพ่ของ {currentCard ? currentPlayerName : "—"} :
                    </p>
                    <h2 style={{ fontSize: "28px", fontWeight: "bold" }}>
                        {currentCard ?? "—"}
                    </h2>
                    <button className="full_button" onClick={drawCard}>จั่วไพ่</button>
                </div>

                <div className="turn-bar">
                    <span className="turn-bar-label">ตาถัดไปคือตาของ :</span>
                    <span className="turn-bar-name">{nextPlayerName}</span>
                </div>

                <div className="flex gap-3">
                    {/* [Claude] เชื่อมปุ่ม How to play กับ onOpenHowToPlay จาก App */}
                    <button className="half_button" onClick={props.onOpenHowToPlay}>📖 How to play</button>
                    <button className="half_button" onClick={skipTurn}>⏭ Skip turn</button>
                </div>
            </div>

            {/* ===== DRAWER BACKDROP ===== */}
            <div
                className={`drawer-backdrop ${isDrawerOpen ? "open" : ""}`}
                onClick={() => setIsDrawerOpen(false)}
            />

            {/* ===== DRAWER TAB ===== */}
            {!isDrawerOpen && (
                <div className="drawer-tab" onClick={() => setIsDrawerOpen(true)}>
                    <span className="drawer-tab-arrow">↑</span>
                    <span className="drawer-tab-label">ข้อมูลผู้เล่น</span>
                </div>
            )}

            {/* ===== DRAWER PANEL ===== */}
            <div className={`drawer-panel ${isDrawerOpen ? "open" : ""}`}>
                <div className="drawer-pill" />
                <div className="p-4 space-y-4">

                    <p className="text-center font-bold text-lg">ข้อมูลผู้เล่น</p>

                    <div className="grid grid-cols-2 gap-3">
                        {props.players.map((player, index) => {
                            const name = player || String.fromCharCode(65 + index);
                            const items = playerItems[index] ?? [];
                            const isActive = index === currentPlayerIndex;
                            return (
                                <div
                                    key={index}
                                    className="player-card"
                                    style={{
                                        border: isActive ? "2px solid #EEA444" : "1px solid #e0e0e0",
                                        background: isActive ? "#FFF8EE" : "#f9f9f9",
                                    }}
                                >
                                    <p className="player-card-name">{name}</p>
                                    {items.length > 0 ? (
                                        <div className="player-card-items">
                                            {items.map((item, i) => (
                                                <span key={i} className="item-tag">{item.label}</span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="player-card-empty">—</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <p className="text-center text-sm text-gray-500">เกมจบเมื่อไพ่หมด</p>

                    <div className='flex gap-2'>
                        {/* [Claude] เชื่อมปุ่ม ⚙️ กับ onOpenSetting จาก App */}
                        <button
                            className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xl flex-shrink-0"
                            onClick={props.onOpenSetting}
                        >
                            ⚙️
                        </button>
                        <button className="full_button" onClick={handleBackToMenu}>← กลับหน้าหลัก</button>
                    </div>

                </div>
            </div>

        </div>
    );
}
