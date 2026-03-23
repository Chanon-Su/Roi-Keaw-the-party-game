import { useState, useEffect } from 'react'
import '../App.css'
import type { PlayerItem } from '../types/card'
import logo from '../assets/logo.png'
import { t, type Language, type FlipSpeed, FLIP_SPEED_CONFIG, saveGameState, clearGameState, type SavedGameState } from '../i18n'
import SuitIcon from './SuitIcon'

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
    savedState: SavedGameState | null;
    onClearSave: () => void;
    selectedDeckId: string;
    showLog: boolean;
};

function shuffle<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
}

// [Claude] ดอกไพ่ 4 ดอก — ♠♣ dark, ♥♦ red/amber
const SUITS = ["♠", "♥", "♦", "♣"] as const;

// [Claude] Log entry — บันทึกทุกครั้งที่จั่วไพ่
type CardLogEntry = {
    turn: number;        // ใบที่
    suit: string;        // ดอก
    playerName: string;  // ชื่อผู้เล่น
    cardText: string;    // ข้อความไพ่
};

// สร้าง suit array ขนาดเท่า deckData
// ไพ่ที่มี maxCopies=4 จะได้ครบทั้ง 4 ดอก ไม่ซ้ำกัน
// ไพ่ที่มี maxCopies<4 จะสุ่มเลือกจาก 4 ดอก
function assignSuits(deckData: { cardId: string }[]): string[] {
    // นับว่าแต่ละ cardId ถูกใช้ไปกี่ครั้งแล้ว
    const countPerCard: Record<string, number> = {};
    return deckData.map(card => {
        const used = countPerCard[card.cardId] ?? 0;
        countPerCard[card.cardId] = used + 1;
        return SUITS[used % 4];
    });
}

export default function Game(props: GameProps) {

    const s = props.savedState;

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [deckIndices, setDeckIndices] = useState<number[]>(() =>
        s ? s.deckIndices : shuffle(props.deckData.map((_, i) => i))
    );

    // [Claude] assign ดอกให้ทุก slot ตอนเริ่มเกม — index ตรงกับ deckData
    // restore จาก savedState ถ้า refresh กลางเกม
    const [cardSuits] = useState<string[]>(() =>
        s ? s.cardSuits : assignSuits(props.deckData)
    );

    const [currentCardIndex, setCurrentCardIndex] = useState<number | null>(null);
    const [numberCardLeft, setNumberCardLeft] = useState(
        s ? s.numberCardLeft : props.deckData.length
    );
    const [isGameOver, setIsGameOver] = useState(false);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(
        s ? s.currentPlayerIndex : 0
    );
    const [playerItems, setPlayerItems] = useState<Record<number, PlayerItem[]>>(() =>
        s ? s.playerItems : Object.fromEntries(props.players.map((_, i) => [i, []]))
    );

    const [isFlipped, setIsFlipped] = useState(s ? s.isFlipped : false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [displayCardIndex, setDisplayCardIndex] = useState<number | null>(
        s ? s.displayCardIndex : null
    );
    const [displayPlayerName, setDisplayPlayerName] = useState<string>(
        s ? s.displayPlayerName : ""
    );
    // ดอกของไพ่ที่แสดงอยู่ตอนนี้
    const [displaySuit, setDisplaySuit] = useState<string>(
        s ? s.displaySuit : "♠"
    );
    const [isLastCardDrawn, setIsLastCardDrawn] = useState(
        s ? s.isLastCardDrawn : false
    );

    // [Claude] Log ประวัติไพ่ — reset ทุกรอบ ไม่ persist ใน localStorage
    const [cardLog, setCardLog] = useState<CardLogEntry[]>([]);

    // [Claude] Auto-save game state ทุกครั้งที่ state หลักเปลี่ยน
    // ทำให้ refresh กลางเกมแล้วกลับมาเล่นต่อได้ทันที
    useEffect(() => {
        if (isGameOver) {
            // เกมจบแล้ว — ล้าง save ออก ไม่ต้องเก็บไว้
            clearGameState();
            return;
        }
        saveGameState({
            deckIndices,
            cardSuits,
            currentPlayerIndex,
            playerItems,
            numberCardLeft,
            displayCardIndex,
            displayPlayerName,
            displaySuit,
            isFlipped,
            isLastCardDrawn,
            selectedDeckId: props.selectedDeckId,
            savedAt: Date.now(),
        });
    }, [deckIndices, cardSuits, currentPlayerIndex, playerItems, numberCardLeft,
        displayCardIndex, displayPlayerName, displaySuit, isFlipped, isLastCardDrawn, isGameOver]);

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
        // [Claude] ข้อ 6: ถ้าไพ่หมด → set isLastCardDrawn แทน isGameOver
        // ผู้เล่นจะเห็นไพ่ใบสุดท้ายก่อน แล้วค่อยกด "จบเกม" เอง
        if (remaining.length === 0) setIsLastCardDrawn(true);

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

        // [Claude] เพิ่ม log entry — บันทึกทุกครั้งที่จั่ว
        const drawnSuit = cardSuits[drawnIndex] ?? "♠";
        const drawnText = props.language === "th"
            ? cardData.description_Thai
            : cardData.description_Eng;
        setCardLog(prev => [{
            turn: props.deckData.length - remaining.length,
            suit: drawnSuit,
            playerName: drawingName,
            cardText: drawnText,
        }, ...prev]); // prepend — ใหม่อยู่บน

        setIsAnimating(true);

        const cfg = FLIP_SPEED_CONFIG[props.flipSpeed];
        const halfFlip = Math.round(cfg.flipDuration * 1000 / 2);

        if (isFlipped) {
            setIsFlipped(false);
            setTimeout(() => {
                setDisplayCardIndex(drawnIndex);
                setDisplayPlayerName(drawingName);
                setDisplaySuit(drawnSuit);
                setIsFlipped(true);
                setTimeout(() => setIsAnimating(false), cfg.lockMs);
            }, halfFlip);
        } else {
            setDisplayCardIndex(drawnIndex);
            setDisplayPlayerName(drawingName);
            setDisplaySuit(drawnSuit);
            setIsFlipped(true);
            setTimeout(() => setIsAnimating(false), cfg.lockMs);
        }
    }

    function skipTurn() {
        setCurrentPlayerIndex((prev) => (prev + 1) % props.players.length);
    }

    function handleRestart() {
        props.onClearSave();   // ล้าง save ก่อน — state ใหม่จะถูก save ใหม่อัตโนมัติ
        setDeckIndices(shuffle(props.deckData.map((_, i) => i)));
        setCurrentCardIndex(null);
        setNumberCardLeft(props.deckData.length);
        setIsGameOver(false);
        setCurrentPlayerIndex(0);
        setIsDrawerOpen(false);
        setPlayerItems(Object.fromEntries(props.players.map((_, i) => [i, []])));
        setIsFlipped(false);
        setIsAnimating(false);
        setDisplayCardIndex(null);
        setDisplayPlayerName("");
        setDisplaySuit("♠");
        setIsLastCardDrawn(false);
        setCardLog([]);
    }

    function handleBackToMenu() {
        props.onStart(); // onStart ใน App.tsx จะ clearGameState() ก่อน setCurrentPage
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
                {/* [Claude] Fullscreen button — ซ่อน browser bar เพิ่มพื้นที่หน้าจอ */}
                <button
                    className="btn-icon-header"
                    style={{ marginLeft: 8 }}
                    onClick={() => {
                        if (!document.fullscreenElement) {
                            document.documentElement.requestFullscreen?.();
                        } else {
                            document.exitFullscreen?.();
                        }
                    }}
                    title={txt.fullscreen}
                >
                    ⛶
                </button>
            </div>

            {/* ===== PLAY AREA ===== */}
            {/* ===== PLAY AREA — fixed height ไม่เลื่อน ===== */}
            {/* [Claude] ใช้ overflow-hidden บน container หลัก
                log ใช้ flex-1 + overflow-y-auto เติมพื้นที่ที่เหลือ
                draw button อยู่ล่างสุดเสมอ ไม่ขยับ               */}
            <div className="game-play-area">

                {/* Flip Card */}
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

                        {/* หน้าไพ่ */}
                        <div className="flip-face flip-back Play_area">
                            <div className={`card-suit-corner card-suit-corner--tl suit-color-${displaySuit}`}>
                                <SuitIcon suit={displaySuit} size={18} />
                            </div>
                            <p className="play-area-label">
                                {displayPlayerName
                                    ? <>{txt.cardOfPrefix}<span className="play-area-label-name">{displayPlayerName}</span>{txt.cardOfSuffix}</>
                                    : "\u00a0"}
                            </p>
                            <p className="play-area-card-text">
                                {displayCardText ?? ""}
                            </p>
                            <div className={`card-suit-corner card-suit-corner--br suit-color-${displaySuit}`}>
                                <SuitIcon suit={displaySuit} size={18} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Turn bar */}
                <div className="turn-bar">
                    <span className="turn-bar-label">{txt.nextTurn}</span>
                    <span className="turn-bar-name">{nextPlayerName}</span>
                </div>

                {/* Secondary buttons */}
                <div className="flex gap-3">
                    <button className="half_button" onClick={props.onOpenHowToPlay}>{txt.howToPlay}</button>
                    <button className="half_button" onClick={skipTurn}>{txt.skipTurn}</button>
                </div>

                {/* Log — กรอบคงที่ scroll ภายใน */}
                <div className={`game-log-area${(!props.showLog || cardLog.length === 0) ? " is-empty" : ""}`}>
                    {props.showLog && cardLog.map((entry, i) => (
                        <div key={i} className="card-log-entry">
                            <div className="card-log-header">
                                <span className={`card-log-suit suit-color-${entry.suit}`}>
                                    <SuitIcon suit={entry.suit} size={13} />
                                </span>
                                <span className="card-log-turn">{txt.logTurn(entry.turn)}</span>
                                <span className="card-log-player">{entry.playerName}</span>
                            </div>
                            <p className="card-log-text">{entry.cardText}</p>
                        </div>
                    ))}
                </div>

                {/* spacer — ดัน draw button ลงล่างเมื่อ log ว่าง */}
                <div style={{ flex: 1 }} />

                {/* Draw button — อยู่ล่างสุดเสมอ */}
                <button
                    className={`draw_button${isAnimating ? " draw_button--locked" : ""}${isLastCardDrawn ? " draw_button--end" : ""}`}
                    onClick={isLastCardDrawn ? () => setIsGameOver(true) : drawCard}
                    disabled={isAnimating}
                >
                    {isLastCardDrawn ? txt.endGame : txt.drawCard}
                    <span className="draw_button_sub">
                        {isLastCardDrawn ? txt.endGameSub : isAnimating ? "..." : txt.drawCardSub}
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
                <div className="p-4 space-y-3">

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

                    <div className="drawer-footer-row">
                        <button className="drawer-footer-icon-btn" onClick={props.onOpenSetting} title={txt.settings}>⚙️</button>
                        <button className="drawer-footer-main-btn" onClick={() => setIsDrawerOpen(false)}>
                            {txt.closeDrawer}
                        </button>
                        <button className="drawer-footer-icon-btn drawer-footer-icon-btn--exit" onClick={handleBackToMenu} title={txt.exitGame}>
                            🚪
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
}
