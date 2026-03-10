import { useState } from 'react'
import './menu.css'

type GameProps = {
    onStart: () => void;  // function สำหรับกลับไปหน้า menu
    players: string[];    // รายชื่อผู้เล่นที่รับมาจาก App
    deck: string[];       // ไพ่ทั้งหมดที่รับมาจาก App
};

// ฟังก์ชัน shuffle: สับไพ่แบบสุ่ม
// <T> หมายความว่า ใช้กับ array อะไรก็ได้ ไม่ใช่แค่ string
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


    // ฟังก์ชันจั่วไพ่
    function drawCard() {
        // [Claude] ถ้าเกมจบแล้ว → หยุดทันที ป้องกันการกดทะลุ popup
        if (isGameOver) return;

        if (deck.length === 0) {
            setIsGameOver(true);
            return;
        }

        const remainingDeck = [...deck];
        const drawnCard = remainingDeck.pop();

        setDeck(remainingDeck);
        setNumberCardLeft(remainingDeck.length);
        setCurrentCard(drawnCard ?? null);

        // เวียนตาไปคนถัดไป
        // % คือ modulo — วนกลับมาที่ 0 เมื่อถึงคนสุดท้าย
        setCurrentPlayerIndex((prev) => (prev + 1) % props.players.length);

        if (remainingDeck.length === 0) {
            setIsGameOver(true);
        }
    }

    // [Claude] ฟังก์ชัน skip: ข้ามไปคนถัดไปโดยไม่จั่วไพ่
    // ใช้เมื่อผู้เล่นพัก หรือไปเข้าห้องน้ำ
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
    }

    function handleBackToMenu() {
        props.onStart();
    }

    // ดึงชื่อผู้เล่นคนปัจจุบัน ถ้าไม่มีชื่อให้ใช้ "A", "B", ...
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
                        <button className="full_button" onClick={handleRestart}>
                            ▶ เล่นอีกรอบ
                        </button>
                        <button className="full_button" onClick={handleBackToMenu}>
                            ← กลับหน้าหลัก
                        </button>
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

                {/* การ์ดหลัก */}
                <div className="Play_area">
                    <p style={{ fontSize: "16px", color: "#888" }}>ไพ่ของคุณ:</p>
                    <h2 style={{ fontSize: "28px", fontWeight: "bold" }}>
                        {currentCard ?? "—"}
                    </h2>
                    <button className="full_button" onClick={drawCard}>
                        จั่วไพ่
                    </button>
                </div>

                {/* [Claude] แถบบอกคิว — แสดงบนหน้าเกมโดยตรง ไม่ต้องเปิด drawer */}
                <div className="turn-bar">
                    <span className="turn-bar-label">ตาของ:</span>
                    <span className="turn-bar-name">{currentPlayerName}</span>
                </div>

                {/* [Claude] ปุ่มสองปุ่มเสริม — จัดเรียงแนวนอน */}
                <div className="flex gap-3">

                    {/* ปุ่ม How to play — ว่างไว้ก่อน ยังไม่มีหน้า how to play */}
                    <button className="half_button">
                        📖 How to play
                    </button>

                    {/* [Claude] ปุ่ม Skip — ข้ามตาผู้เล่นคนนี้โดยไม่จั่วไพ่ */}
                    <button className="half_button" onClick={skipTurn}>
                        ⏭ Skip turn
                    </button>

                </div>

            </div>

            {/* ===== DRAWER BACKDROP ===== */}
            <div
                className={`drawer-backdrop ${isDrawerOpen ? "open" : ""}`}
                onClick={() => setIsDrawerOpen(false)}
            />

            {/* ===== DRAWER TAB — ปุ่มเปิด drawer ===== */}
            {!isDrawerOpen && (
                <div
                    className="drawer-tab"
                    onClick={() => setIsDrawerOpen(true)}
                >
                    <span className="drawer-tab-arrow">↑</span>
                    <span className="drawer-tab-label">ข้อมูลผู้เล่น</span>
                </div>
            )}

            {/* ===== DRAWER PANEL ===== */}
            <div className={`drawer-panel ${isDrawerOpen ? "open" : ""}`}>
                <div className="drawer-pill" />
                <div className="p-4 space-y-4">

                    <p className="text-center font-bold text-lg">ข้อมูลผู้เล่น</p>

                    {/* แสดงผู้เล่นทั้งหมด — ไฮไลต์คนที่กำลังเล่น */}
                    <div className="grid grid-cols-4 gap-2">
                        {props.players.map((player, index) => (
                            <div
                                key={index}
                                style={{
                                    fontWeight: index === currentPlayerIndex ? "bold" : "normal",
                                    background: index === currentPlayerIndex ? "#EEA444" : "#f5f5f5",
                                    padding: "8px 4px",
                                    borderRadius: "6px",
                                    textAlign: "center",
                                    fontSize: "14px"
                                }}
                            >
                                {player || String.fromCharCode(65 + index)}
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-sm text-gray-500">เกมจบเมื่อไพ่หมด</p>

                    <div className='flex gap-2'>
                        <button className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xl flex-shrink-0">
                            ⚙️
                        </button>
                        <button className="full_button" onClick={handleBackToMenu}>
                            ← กลับหน้าหลัก
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
}
