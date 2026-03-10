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

    // deck ที่ถูกสับแล้ว — ใช้ shuffle ตอน init เพื่อสุ่มไพ่ครั้งแรก
    const [deck, setDeck] = useState<string[]>(() => shuffle(props.deck));

    // การ์ดที่ถูกจั่วออกมาครั้งล่าสุด (null = ยังไม่ได้จั่ว)
    const [currentCard, setCurrentCard] = useState<string | null>(null);

    // จำนวนไพ่ที่เหลือ
    const [numberCardLeft, setNumberCardLeft] = useState(props.deck.length);

    // สถานะว่าเกมจบหรือยัง
    const [isGameOver, setIsGameOver] = useState(false);

    // index ของผู้เล่นที่เล่นอยู่ตอนนี้ (เริ่มที่คนแรก = 0)
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);


    // ฟังก์ชันจั่วไพ่
    function drawCard() {
        // ถ้าเกมจบแล้ว → หยุดทันที ไม่ทำอะไรเพิ่ม
        // บรรทัดนี้ป้องกันการกดจั่วไพ่ทะลุ popup
        if (isGameOver) return;

        // ถ้าไพ่หมด → จบเกม
        if (deck.length === 0) {
            setIsGameOver(true);
            return;
        }

        // copy deck ก่อน เพราะ React ไม่ให้แก้ state โดยตรง
        const remainingDeck = [...deck];

        // pop() ดึงไพ่ใบสุดท้ายออกมา และลบออกจาก array
        const drawnCard = remainingDeck.pop();

        // อัพเดตทุก state พร้อมกัน
        setDeck(remainingDeck);
        setNumberCardLeft(remainingDeck.length);
        setCurrentCard(drawnCard ?? null);

        // เวียนตาไปคนถัดไป
        // % คือ modulo — วนกลับมาที่ 0 เมื่อถึงคนสุดท้าย
        // เช่น players = [A,B,C], index = 2 → (2+1) % 3 = 0 → กลับมา A
        setCurrentPlayerIndex((prev) => (prev + 1) % props.players.length);

        // ถ้าจั่วใบสุดท้ายพอดี → จบเกม
        if (remainingDeck.length === 0) {
            setIsGameOver(true);
        }
    }

    // ฟังก์ชันเริ่มเกมใหม่: reset ทุก state กลับไปเริ่มต้น
    function handleRestart() {
        setDeck(shuffle(props.deck));           // สับไพ่ใหม่
        setCurrentCard(null);                   // เคลียร์การ์ดที่แสดง
        setNumberCardLeft(props.deck.length);   // reset จำนวนไพ่
        setIsGameOver(false);                   // ปิด game over popup
        setCurrentPlayerIndex(0);              // เริ่มที่ผู้เล่นคนแรก
    }

    // ฟังก์ชันกลับเมนู: เรียก onStart ที่รับมาจาก App
    function handleBackToMenu() {
        props.onStart();
    }

    // ดึงชื่อผู้เล่นคนปัจจุบัน ถ้าไม่มีชื่อให้ใช้ "A", "B", ...
    const currentPlayerName =
        props.players[currentPlayerIndex] ||
        `Player ${String.fromCharCode(65 + currentPlayerIndex)}`;

    return (
        <div className="min-h-screen flex flex-col">

            {/* ===== GAME OVER POPUP =====
                แสดงทับทุกอย่างบนหน้าจอเมื่อเกมจบ
                popup-backdrop = ฉากมืดปิดคลุมทั้งจอ (position: fixed + inset: 0)
                popup = กล่องขาวตรงกลาง */}
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
            <div className="flex-1 p-4">
                <div className="Play_area">
                    <h2>ไพ่ของคุณ: {currentCard ?? "กดจั่วไพ่เพื่อเริ่ม"}</h2>
                    <button className="full_button" onClick={drawCard}>
                        จั่วไพ่
                    </button>
                </div>
            </div>

            {/* ===== PLAYER INFO DRAWER =====
                Drawer = กล่องที่เลื่อนขึ้น-ลงจากด้านล่าง */}
            <div>
                <div className='slice_bar'>

                    {/* ปุ่มเปิด/ปิด drawer */}
                    <button onClick={() => setIsDrawerOpen(prev => !prev)}>
                        ตาของ: {currentPlayerName} ↑
                    </button>

                    {/* translate-y-0 = แสดง, translate-y-full = ซ่อนใต้จอ */}
                    <div className={isDrawerOpen ? "translate-y-0" : "translate-y-full"}>
                        <div className="p-4 space-y-4">

                            {/* แสดงผู้เล่นทั้งหมด — ไฮไลต์คนที่กำลังเล่น */}
                            <div className="grid grid-cols-4 gap-2">
                                {props.players.map((player, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            fontWeight: index === currentPlayerIndex ? "bold" : "normal",
                                            background: index === currentPlayerIndex ? "#EEA444" : "white",
                                            padding: "8px",
                                            borderRadius: "6px",
                                            textAlign: "center"
                                        }}
                                    >
                                        {player || String.fromCharCode(65 + index)}
                                    </div>
                                ))}
                            </div>

                            <p className="text-center text-sm">เกมจบเมื่อไพ่หมด</p>

                            <div className='flex gap-2'>
                                <button className="w-12 h-12 bg-gray-400 rounded">⚙️</button>
                                <button className="full_button" onClick={handleBackToMenu}>
                                    กลับหน้าหลัก
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
