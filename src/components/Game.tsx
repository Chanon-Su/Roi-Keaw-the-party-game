import { useState } from 'react'
import '../App.css'
import type { PlayerItem } from '../types/card'
import logo from '../assets/logo.png'
import { t, type Language, type FlipSpeed, FLIP_SPEED_CONFIG } from '../i18n'

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
    flipSpeed: FlipSpeed;
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

    // [Claude] Flip animation state
    // isFlipped     = ไพ่พลิกอยู่ด้านหน้า (แสดงข้อความ) หรือหลังไพ่
    // isAnimating   = กำลัง animate อยู่ — ปุ่มจั่วจะ disabled ช่วงนี้
    // displayCard   = ข้อมูลไพ่ที่แสดงบนหน้าไพ่ (แยกจาก currentCardIndex
    //                 เพื่อให้อัพเดตได้ตอนไพ่หันหลัง ไม่กระตุก)
    const [isFlipped, setIsFlipped] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [displayCardIndex, setDisplayCardIndex] = useState<number | null>(null);
    const [displayPlayerName, setDisplayPlayerName] = useState<string>("");

    function drawCard() {
        // [Claude] Guard triple-tap: ถ้ากำลัง animate หรือเกมจบแล้ว ไม่ทำอะไร
        if (isAnimating || isGameOver) return;
        if (deckIndices.length === 0) { setIsGameOver(true); return; }

        const remaining = [...deckIndices];
        const drawnIndex = remaining.pop()!;
        const drawingIndex = currentPlayerIndex;
        const cardData = props.deckData[drawnIndex];
        const drawingName = props.players[drawingIndex] ?? "";

        // อัพเดต game state ทันที
        setDeckIndices(remaining);
        setNumberCardLeft(remaining.length);
        setCurrentCardIndex(drawnIndex);
        setCurrentPlayerIndex((prev) => (prev + 1) % props.players.length);
        if (remaining.length === 0) setIsGameOver(true);

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

        // [Claude] Flip animation sequence:
        //
        // ถ้าไพ่กำลังหน้าอยู่ (isFlipped = true) → พลิกกลับก่อน (325ms)
        //   แล้วค่อยอัพเดตข้อความตอนหันหลัง (ผู้เล่นไม่เห็น)
        //   แล้วพลิกหน้าอีกรอบ
        //
        // ถ้าไพ่หันหลังอยู่ (isFlipped = false) → พลิกหน้าเลย
        //
        // ทุก sequence ล็อก isAnimating ตลอด จนปลด lock หลังจบ +200ms

        setIsAnimating(true);

        // [Claude] ดึง timing จาก config ตาม flipSpeed ที่ user เลือก
        const cfg = FLIP_SPEED_CONFIG[props.flipSpeed];
        const halfFlip = Math.round(cfg.flipDuration * 1000 / 2);

        if (isFlipped) {
            // 1. พลิกกลับ (หันหลัง)
            setIsFlipped(false);
            setTimeout(() => {
                // 2. สลับข้อความตอนหันหลัง — ผู้เล่นมองไม่เห็น
                setDisplayCardIndex(drawnIndex);
                setDisplayPlayerName(drawingName);
                // 3. พลิกหน้า
                setIsFlipped(true);
                // 4. ปลด lock หลัง animation เสร็จ
                setTimeout(() => setIsAnimating(false), cfg.lockMs);
            }, halfFlip);
        } else {
            // ครั้งแรก หรือหลัง reset — พลิกหน้าเลย
            setDisplayCardIndex(drawnIndex);
            setDisplayPlayerName(drawingName);
            setIsFlipped(true);
            setTimeout(() => setIsAnimating(false), cfg.lockMs);
        }
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
        // [Claude] reset flip state กลับเป็นหลังไพ่
        setIsFlipped(false);
        setIsAnimating(false);
        setDisplayCardIndex(null);
        setDisplayPlayerName("");
    }

    function handleBackToMenu() {
        props.onStart();
    }

    // [Claude] lastDrawingIndex ยังคงใช้สำหรับ highlight ใน drawer
    const lastDrawingIndex = currentCardIndex !== null
        ? (currentPlayerIndex - 1 + props.players.length) % props.players.length
        : currentPlayerIndex;

    // [Claude] displayCard = ข้อมูลที่แสดงบนหน้าไพ่ตอนพลิก
    // แยกจาก currentCardIndex เพื่อให้สลับข้อความตอนไพ่หันหลัง (ไม่กระตุก)
    const displayCardData = displayCardIndex !== null ? props.deckData[displayCardIndex] : null;
    const displayCardText = displayCardData
        ? (props.language === "th" ? displayCardData.description_Thai : displayCardData.description_Eng)
        : null;

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
            <div className="app-header">
                <img src={logo} alt="ROI-KAEW" className="app-logo" />
                <div style={{ flex: 1 }} />
                <div className="pill-badge">{txt.cardsLeft(numberCardLeft)}</div>
            </div>

            {/* ===== PLAY AREA ===== */}
            {/* pb-24 = 96px — เว้นพื้นที่ให้ drawer tab (44px + 20px bottom + buffer) */}
            <div className="flex-1 p-4 pb-24 flex flex-col gap-3">

                {/* [Claude] 3D Flip Card
                    โครงสร้าง:
                      .flip-container  → perspective สำหรับ 3D
                        .flip-inner    → ตัวที่หมุน (transform: rotateY)
                          .flip-front  → หลังไพ่ (pattern)
                          .flip-back   → หน้าไพ่ (ข้อความ)
                    
                    isFlipped = true  → rotateY(180deg) → เห็นหน้าไพ่
                    isFlipped = false → rotateY(0deg)   → เห็นหลังไพ่        */}
                <div className="flip-container">
                    <div
                        className={`flip-inner${isFlipped ? " flipped" : ""}`}
                        style={{ "--flip-dur": `${FLIP_SPEED_CONFIG[props.flipSpeed].flipDuration}s` } as React.CSSProperties}
                    >

                        {/* หลังไพ่ */}
                        <div className="flip-face flip-front Play_area">
                            <div className="card-back-pattern">
                                <div className="card-back-center">
                                    <span className="card-back-logo">RK</span>
                                </div>
                            </div>
                        </div>

                {/* หน้าไพ่ — ข้อความ */}
                        <div className="flip-face flip-back Play_area">
                            {/* [Claude] label แสดงชื่อผู้เล่น — ใหญ่ขึ้น + เข้มขึ้น + bold ชื่อ */}
                            <p className="play-area-label">
                                {displayPlayerName
                                    ? <>{txt.cardOfPrefix}<span className="play-area-label-name">{displayPlayerName}</span>{txt.cardOfSuffix}</>
                                    : "\u00a0"}
                            </p>
                            <p className="play-area-card-text">
                                {displayCardText ?? ""}
                            </p>
                        </div>

                    </div>
                </div>

                {/* [Claude] UX order: อ่านข้อมูล → ตัดสินใจ → กด
                    card → turn bar → secondary → draw (ล่างสุด = thumb zone) */}
                <div className="turn-bar">
                    <span className="turn-bar-label">{txt.nextTurn}</span>
                    <span className="turn-bar-name">{nextPlayerName}</span>
                </div>

                <div className="flex gap-3">
                    <button className="half_button" onClick={props.onOpenHowToPlay}>{txt.howToPlay}</button>
                    <button className="half_button" onClick={skipTurn}>{txt.skipTurn}</button>
                </div>

                {/* draw button — ล่างสุดเสมอ ห่างจาก drawer tab */}
                <button
                    className={`draw_button${isAnimating ? " draw_button--locked" : ""}`}
                    onClick={drawCard}
                    disabled={isAnimating}
                >
                    {txt.drawCard}
                    <span className="draw_button_sub">
                        {isAnimating ? "..." : txt.drawCardSub}
                    </span>
                </button>
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

                    <p className="drawer-title">{txt.playerInfo}</p>

                    <div className="grid grid-cols-2 gap-3">
                        {props.players.map((player, index) => {
                            const name = player || String.fromCharCode(65 + index);
                            const items = playerItems[index] ?? [];
                            const isActive = index === lastDrawingIndex;
                            return (
                                <div
                                    key={index}
                                    className={`player-card${isActive ? " player-card--active" : ""}`}
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

                    <p className="drawer-footer-note">{txt.gameEndsWhenDeckEmpty}</p>

                    <div className='flex gap-2'>
                        <button className="btn-icon-header" onClick={props.onOpenSetting}>⚙️</button>
                        <button className="full_button" style={{marginTop:0, flex:1}} onClick={handleBackToMenu}>{txt.backToMenu}</button>
                    </div>

                </div>
            </div>

        </div>
    );
}
