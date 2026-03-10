import { useState } from 'react'
import '../App.css'
import type { PlayerItem } from '../types/card'
import { t, type Language } from '../i18n'

type GameProps = {
    onStart: () => void;
    players: string[];
    deckData: {
        description_Thai: string;
        description_Eng:  string;
        hasItem: boolean;
        cardId: string;
        itemLabel_thai: string;
        itemLabel_eng: string;
    }[];
    onOpenSetting: () => void;
    onOpenHowToPlay: () => void;
    language: Language;
};

function shuffle<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
}

export default function Game(props: GameProps) {

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    // [Claude] shuffle index array แทน string array
    // เพราะ deck ตอนนี้คือ deckData ที่มีทั้งสองภาษา
    const [deckIndices, setDeckIndices] = useState<number[]>(() =>
        shuffle(props.deckData.map((_, i) => i))
    );
    const [currentCardIndex, setCurrentCardIndex] = useState<number | null>(null);
    const [numberCardLeft, setNumberCardLeft] = useState(props.deckData.length);
    const [isGameOver, setIsGameOver] = useState(false);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [playerItems, setPlayerItems] = useState<Record<number, PlayerItem[]>>(
        () => Object.fromEntries(props.players.map((_, i) => [i, []]))
    );

    // [Claude] ดึงข้อมูลไพ่ปัจจุบันจาก index
    const currentCardData = currentCardIndex !== null ? props.deckData[currentCardIndex] : null;
    // แสดงข้อความตามภาษา
    const currentCardText = currentCardData
        ? (props.language === "th" ? currentCardData.description_Thai : currentCardData.description_Eng)
        : null;

    function drawCard() {
        if (isGameOver) return;
        if (deckIndices.length === 0) { setIsGameOver(true); return; }

        const remaining = [...deckIndices];
        const drawnIndex = remaining.pop()!;
        const drawingIndex = currentPlayerIndex;
        const cardData = props.deckData[drawnIndex];

        setDeckIndices(remaining);
        setNumberCardLeft(remaining.length);
        setCurrentCardIndex(drawnIndex);

        if (cardData?.hasItem) {
            const newItem: PlayerItem = {
                cardId: cardData.cardId,
                label_thai: cardData.itemLabel_thai,
                label_eng:  cardData.itemLabel_eng,
            };
            setPlayerItems(prev => {
                const updated = { ...prev };
                for (const playerIdx in updated) {
                    updated[playerIdx] = updated[playerIdx].filter(
                        item => item.cardId !== cardData.cardId
                    );
                }
                updated[drawingIndex] = [...updated[drawingIndex], newItem];
                return updated;
            });
        }

        setCurrentPlayerIndex((prev) => (prev + 1) % props.players.length);
        if (remaining.length === 0) setIsGameOver(true);
    }

    function skipTurn() {
        setCurrentPlayerIndex((prev) => (prev + 1) % props.players.length);
    }

    function handleRestart() {
        setDeckIndices(shuffle(props.deckData.map((_, i) => i)));
        setCurrentCardIndex(null);
        setNumberCardLeft(props.deckData.length);
        setIsGameOver(false);
        setCurrentPlayerIndex(0);
        setIsDrawerOpen(false);
        setPlayerItems(Object.fromEntries(props.players.map((_, i) => [i, []])));
    }

    function handleBackToMenu() {
        props.onStart();
    }

    // [Claude] หลังจาก drawCard() advance turn แล้ว:
    //   currentPlayerIndex = คนที่กำลังจะจั่วต่อไป
    //   lastDrawingIndex   = คนที่เพิ่งจั่วไปแล้ว (คำนวณย้อนกลับ)
    //
    // ใช้ lastDrawingIndex กับ "ไพ่ของ [ชื่อ]" และ highlight ใน drawer
    // เพื่อให้ทุกอย่างสอดคล้องกัน: ไพ่ที่แสดง = item ที่เก็บ = กรอบสีส้ม

    const lastDrawingIndex = currentCardIndex !== null
        ? (currentPlayerIndex - 1 + props.players.length) % props.players.length
        : currentPlayerIndex;

    const lastDrawingName =
        props.players[lastDrawingIndex] ||
        `Player ${String.fromCharCode(65 + lastDrawingIndex)}`;

    const nextPlayerName =
        props.players[currentPlayerIndex] ||
        `Player ${String.fromCharCode(65 + currentPlayerIndex)}`;

    const txt = t[props.language];

    return (
        <div className="min-h-screen flex flex-col">

            {/* ===== GAME OVER POPUP ===== */}
            {isGameOver && (
                <div className="popup-backdrop">
                    <div className="popup">
                        <h2 style={{ fontSize: "32px" }}>🎴</h2>
                        <h3 style={{ fontSize: "22px", fontWeight: "bold" }}>{txt.gameOver}</h3>
                        <p style={{ color: "#666", marginBottom: "8px" }}>{txt.deckEmpty}</p>
                        <button className="full_button" onClick={handleRestart}>{txt.playAgain}</button>
                        <button className="full_button" onClick={handleBackToMenu}>{txt.backToMenu}</button>
                    </div>
                </div>
            )}

            {/* ===== HEADER ===== */}
            <div className="p-4">
                <div className='flex gap-2'>
                    <div className="logo_app">logo_app</div>
                    <div className="rounded-button1">{txt.cardsLeft(numberCardLeft)}</div>
                </div>
            </div>

            {/* ===== PLAY AREA ===== */}
            <div className="flex-1 p-4 flex flex-col gap-3">
                <div className="Play_area">
                    <p className="play-area-label">
                        {currentCardIndex !== null ? txt.cardOf(lastDrawingName) : "\u00a0"}
                    </p>
                    {currentCardIndex !== null ? (
                        <p className="play-area-card-text">{currentCardText}</p>
                    ) : (
                        <p className="play-area-empty">—</p>
                    )}
                    {/* [Claude] draw_button แทน full_button — สูง 2.3× สำหรับผู้เล่นที่มึนเมา */}
                    <button className="draw_button" onClick={drawCard}>
                        {txt.drawCard}
                        <span className="draw_button_sub">{txt.drawCardSub}</span>
                    </button>
                </div>

                <div className="turn-bar">
                    <span className="turn-bar-label">{txt.nextTurn}</span>
                    <span className="turn-bar-name">{nextPlayerName}</span>
                </div>

                <div className="flex gap-3">
                    <button className="half_button" onClick={props.onOpenHowToPlay}>{txt.howToPlay}</button>
                    <button className="half_button" onClick={skipTurn}>{txt.skipTurn}</button>
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
                    <span className="drawer-tab-label">{txt.drawerTab}</span>
                </div>
            )}

            {/* ===== DRAWER PANEL ===== */}
            <div className={`drawer-panel ${isDrawerOpen ? "open" : ""}`}>
                <div className="drawer-pill" />
                <div className="p-4 space-y-4">

                    <p className="text-center font-bold text-lg">{txt.playerInfo}</p>

                    <div className="grid grid-cols-2 gap-3">
                        {props.players.map((player, index) => {
                            const name = player || String.fromCharCode(65 + index);
                            const items = playerItems[index] ?? [];
                            const isActive = index === lastDrawingIndex;
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
                                                <span key={i} className="item-tag">
                                                    {props.language === "th" ? item.label_thai : item.label_eng}
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

                    <p className="text-center text-sm text-gray-500">{txt.gameEndsWhenDeckEmpty}</p>

                    <div className='flex gap-2'>
                        <button
                            className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xl flex-shrink-0"
                            onClick={props.onOpenSetting}
                        >⚙️</button>
                        <button className="full_button" onClick={handleBackToMenu}>{txt.backToMenu}</button>
                    </div>

                </div>
            </div>

        </div>
    );
}
