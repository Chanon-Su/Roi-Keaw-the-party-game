import { useState } from 'react'
import './menu.css'

// property
type MenuProps = {
    onStart: () => void;
    players: string[];
    // setPlayers -> send set acorss function
    setPlayers: React.Dispatch<React.SetStateAction<string[]>>; 
};


export default function Menu( props: MenuProps) {

    // const [players, setPlayers] = useState<string[]>(["", "", "", ""]);
    const MAX_PLAYERS = 8;
    const MIN_PLAYERS = 2;



    function addPlayer() {
        if (props.players.length >= MAX_PLAYERS) return;
        // เพิ่ม length และ ใส่ข้อความใหม่โดยที่ข้อความนั้นต้องเป็น "" เพื่อให้ placeholder ติด
        props.setPlayers([...props.players, ""]);
    }


    function removePlayer(indexToRemove: number) {
        if (props.players.length <= MIN_PLAYERS) return;
        // loop หา index ที่ตรงกับ botton -> ลบ
        props.setPlayers(props.players.filter((_, index) => index !== indexToRemove));
    }

    function updatePlayerName(indexToUpdate: number, newName: string) {
        // รับชื่อใหม่มา แล้ว เขียนทับใน index เดิม
        const updatedPlayers = [...props.players];
        updatedPlayers[indexToUpdate] = newName;
        props.setPlayers(updatedPlayers);
    }

    return (
        <>
            <div className="min-h-screen flex flex-col">
                {/* HEADER P-4 = area */}
                <div className="p-4">Header
                    <div className="flex gap-6">
                        <button className="logo_app">logo_app</button>
                        <div className="flex gap-2">
                            {/* <button className="rounded-button1">language</button> */}
                            {/* div = tag , เปิด ด้วย button */}
                            {/* px = pixel, em = Emphasis เทียบหน้าจอ []tage*/}
                            {/* <button className="rounded-button1">light/dark</button> */}
                            <button className="rounded-button1">setting</button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-4 h-110">Main area
                    {/* MAIN AREA player setup */}
                    <div className="player_setup">
                        player setup
                        {/* arrow funciton */}
                        <div>
                            {props.players.map((player, index) => (

                                <div className='flex items-center'>

                                    {/* <div className='player_box' key={index} >
                                        {player}
                                    </div> */}

                                    <input
                                        key={index}
                                        className="player_box"
                                        // ช้อความที่แสดงมาจาก player
                                        value={player}
                                        // placeholder จะทำงานก็ต่อเมื่อ value === "" , ถ้าจะสร้างใหม่ ก็ต้องเป็น ""
                                        placeholder={`Player ${index + 1}`}
                                        // เมื่อมีการพิมพ์ ให้อัพเดทค่าใหม่
                                        onChange={(e) =>
                                            updatePlayerName(index, e.target.value)
                                        }
                                    />
                                    {/* กดปุ่มลบ เมื่อ onclick ให้ใฃ้งาน founction removeplayer */}
                                    <button className="rounded-button2" onClick={() => removePlayer(index)} > - </button>

                                </div>

                            ))}</div>
                    </div>

                    <button className="rounded-button2" onClick={() => addPlayer()}>+</button>



                    {/* MAIN AREA How to play and Deck */}
                    <div className="flex gap-3">
                        <button className="half_button">How to play</button>
                        <button className="half_button">Deck</button>
                    </div>
                    {/* MAIN AREA Play button */}
                    <div>
                        {/* <button className="full_button">Let's play!!!</button> */}
                        <button className="full_button" onClick={props.onStart}>Start Game</button>

                    </div>

                </div>


                <div className="p-4">Footer
                    <div className="teams_area">Terms of service</div>
                </div>

            </div>

        </>

    );
}