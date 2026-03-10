import { useState } from 'react'
import './menu.css'
import type { PlayerItem } from '../types/card'

type GameProps = {
    onStart: () => void;
    players: string[];
    deck: string[];
    // [Claude] deckData: ข้อมูลเต็มของไพ่แต่ละใบ สำหรับตรวจ hasItem และดึง itemLabel
    deckData: {
        description_Thai: string;
        hasItem: boolean;
        cardId: string;
        itemLabel: string;   // [Claude] เพิ่ม itemLabel — ข้อความสั้นสำหรับ badge ใน drawer
    }[];
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

    // [Claude] playerItems: เก็บ item ของผู้เล่นแต่ละคน
    // key = index ผู้เล่น, value = array ของ item ที่ถืออยู่
    const [playerItems, setPlayerItems] = useState<Record<number, PlayerItem[]>>(
        () => Object.fromEntries(props.players.map((_, i) => [i, []]))
    );

    // [Claude] หาข้อมูลไพ่จาก description_Thai ที่จั่วได้
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

        // [Claude] ตรวจว่าไพ่ที่จั่วได้มี hasItem มั้ย
        if (drawnCard) {
            const cardData = findCardData(drawnCard);

            if (cardData?.hasItem) {
                const newItem: PlayerItem = {
                    cardId: cardData.cardId,
                    label: cardData.itemLabel,  // [Claude] ใช้ itemLabel แทน description_Thai
                };

                setPlayerItems(prev => {
                    const updated = { ...prev };

                    // [Claude] ลบ item ชนิดเดียวกันออกจากผู้เล่นทุกคนก่อน
                    // เพราะ item แต่ละ cardId อยู่กับคนเดียวเท่านั้น
                    for (const playerIdx in updated) {
                        updated[playerIdx] = updated[playerIdx].filter(
                            item => item.cardId !== cardData.cardId
                        );
                    }

                    // [Claude] เพิ่ม item ให้ผู้เล่นคนปัจจุบัน
                    updated[currentPlayerIndex] = [
                        ...updated[currentPlayerIndex],
                        newItem
                    ];

                    return updated;
                });
            }
        }

        // เวียนตาไปคนถัดไป
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
        // [Claude] reset item ทุกคนกลับเป็น array ว่าง
        setPlayerItems(Object.fromEntries(props.players.map((_, i) => [i, []])));
    }

    function handleBackToMenu() {
        props.onStart();
    }

    const currentPlayerName =
        props.players[currentPlayerIndex] ||
        `Player ${String.fromCharCode(65 + currentPlayerIndex)}`;

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
                    <p style={{ fontSize: "16px", color: "#888" }}>ไพ่ของคุณ:</p>
                    <h2 style={{ fontSize: "28px", fontWeight: "bold" }}>
                        {currentCard ?? "—"}
                    </h2>
                    <button className="full_button" onClick={drawCard}>จั่วไพ่</button>
                </div>

                <div className="turn-bar">
                    <span className="turn-bar-label">ตาของ:</span>
                    <span className="turn-bar-name">{currentPlayerName}</span>
                </div>

                <div className="flex gap-3">
                    <button className="half_button">📖 How to play</button>
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

                    {/* [Claude] grid 2 คอลัมน์ — แต่ละช่องคือผู้เล่น 1 คน พร้อม item */}
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

                                    {/* [Claude] แสดง item badge หรือขีดถ้าไม่มี */}
                                    {items.length > 0 ? (
                                        <div className="player-card-items">
                                            {items.map((item, i) => (
                                                <span key={i} className="item-tag">
                                                    {item.label}
                                                </span>
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
                        <button className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xl flex-shrink-0">⚙️</button>
                        <button className="full_button" onClick={handleBackToMenu}>← กลับหน้าหลัก</button>
                    </div>

                </div>
            </div>

        </div>
    );
}
