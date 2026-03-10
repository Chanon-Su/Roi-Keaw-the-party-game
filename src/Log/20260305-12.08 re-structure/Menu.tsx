import '../App.css'
import { t, type Language } from '../i18n'

// [Claude] ชื่อ key ที่ใช้เก็บใน localStorage
// เก็บเป็น constant เพื่อไม่ให้พิมพ์ผิดทีหลัง
const STORAGE_KEY = "cardgame_players";

// [Claude] ฟังก์ชัน loadPlayers: อ่านชื่อผู้เล่นจาก localStorage
// ถ้าไม่มีข้อมูล (ครั้งแรก หรือล้างแล้ว) → คืนค่า default ["", "", "", ""]
export function loadPlayers(): string[] {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // [Claude] ตรวจว่าเป็น array ของ string จริงๆ ก่อน return
            if (Array.isArray(parsed)) return parsed;
        }
    } catch {
        // ถ้า JSON เสีย → ข้ามไป return default
    }
    return ["", "", "", ""];
}

// [Claude] ฟังก์ชัน savePlayers: บันทึกชื่อผู้เล่นลง localStorage
export function savePlayers(players: string[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
}

// [Claude] ฟังก์ชัน clearPlayers: ล้างชื่อผู้เล่นออกจาก localStorage
// และ return ค่า default กลับมาให้ set state ต่อได้เลย
export function clearPlayers(): string[] {
    localStorage.removeItem(STORAGE_KEY);
    return ["", "", "", ""];
}


type MenuProps = {
    onStart: () => void;
    players: string[];
    setPlayers: React.Dispatch<React.SetStateAction<string[]>>;
    onOpenSetting: () => void;
    onOpenHowToPlay: () => void;
    onOpenDeck: () => void;
    language: Language;
};

export default function Menu(props: MenuProps) {

    const MAX_PLAYERS = 8;
    const MIN_PLAYERS = 2;
    const txt = t[props.language]; // [Claude] shorthand — ใช้ txt.xxx แทน t[language].xxx

    function updatePlayerName(indexToUpdate: number, newName: string) {
        const updatedPlayers = [...props.players];
        updatedPlayers[indexToUpdate] = newName;
        props.setPlayers(updatedPlayers);
        savePlayers(updatedPlayers);
    }

    function addPlayer() {
        if (props.players.length >= MAX_PLAYERS) return;
        const updatedPlayers = [...props.players, ""];
        props.setPlayers(updatedPlayers);
        savePlayers(updatedPlayers);
    }

    function removePlayer(indexToRemove: number) {
        if (props.players.length <= MIN_PLAYERS) return;
        const updatedPlayers = props.players.filter((_, index) => index !== indexToRemove);
        props.setPlayers(updatedPlayers);
        savePlayers(updatedPlayers);
    }

    const allNamesFilled = props.players.every(name => name.trim() !== "");

    const playerCountHint = props.players.length >= MAX_PLAYERS
        ? txt.maxPlayersHint(MAX_PLAYERS)
        : props.players.length <= MIN_PLAYERS
        ? txt.minPlayersHint(MIN_PLAYERS)
        : null;

    return (
        <div className="min-h-screen flex flex-col">

            {/* HEADER */}
            <div className="p-4">
                <div className="flex gap-2">
                    <button className="logo_app">logo_app</button>
                    <button className="rounded-button1" onClick={props.onOpenSetting}>⚙️</button>
                </div>
            </div>

            {/* MAIN AREA */}
            <div className="flex-1 p-4">
                <div className="player_setup">
                    {props.players.map((player, index) => (
                        <div key={index} className='flex items-center'>
                            <input
                                className="player_box"
                                value={player}
                                placeholder={txt.playerPlaceholder(index + 1)}
                                onChange={(e) => updatePlayerName(index, e.target.value)}
                            />
                            <button className="rounded-button2" onClick={() => removePlayer(index)}>-</button>
                        </div>
                    ))}
                </div>

                <button
                    className="full_button"
                    onClick={addPlayer}
                    disabled={props.players.length >= MAX_PLAYERS}
                    style={{ opacity: props.players.length >= MAX_PLAYERS ? 0.4 : 1 }}
                >
                    {txt.addPlayer}
                </button>

                {playerCountHint && (
                    <p className="player-count-hint">{playerCountHint}</p>
                )}

                <div className="flex gap-3" style={{ marginTop: "12px" }}>
                    <button className="half_button" onClick={props.onOpenHowToPlay}>{txt.howToPlay}</button>
                    <button className="half_button" onClick={props.onOpenDeck}>{txt.deck}</button>
                </div>

                <button
                    className="full_button"
                    onClick={props.onStart}
                    disabled={!allNamesFilled}
                    style={{ opacity: allNamesFilled ? 1 : 0.4 }}
                >
                    {txt.startGame}
                </button>

                {!allNamesFilled && (
                    <p className="start-hint">{txt.fillNamesHint}</p>
                )}
            </div>

            {/* FOOTER */}
            <div className="p-4 text-center text-sm text-gray-400">
                <p>{txt.footer}</p>
            </div>

        </div>
    );
}
