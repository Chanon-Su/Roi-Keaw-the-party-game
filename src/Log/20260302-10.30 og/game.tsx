import { useState } from 'react'
import './menu.css'
// import type { Deck_type } from "../types/card.ts";

type GameProps = {
    onStart: () => void;
    players: string[];
    deck: string[];
};

// because app will restrtgame so suffle the deck at first.
function shuffle<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
}

// function Game({ onStart, players }: GameProps) { wrong
// props = {onStart,players}
export default function Game(props: GameProps) {
    // props.onStart ex. for call valuable
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    // console.log(props.deck);

    // const for import deck
    const [deck, setDeck] = useState<string[]>(() => shuffle(props.deck));
    // the card from draw phase
    const [currentCard, setCurrentCard] = useState<string | null>(null);
    // number of card left
    const [numberCardLeft, setnumberCardleft] = useState(deck.length);
    // Check for is game over?
    const [isGameOver, setIsGameOver] = useState(false);


    function drawCard() {
        // Don't put the suffle in this function cause game flow

        // if game over make state to true
        if (deck.length === 0) {
            setIsGameOver(true);
            return;
        }

        // duplicate the deck cause react not allow to modify STATE
        // props.deck เป็นการอ่านอย่างเดียว?
        const remainingDeck = [...deck];

        // The card that was drawn
        const drawnCard = remainingDeck.pop();

        // update numberDeckCardLeft
        setnumberCardleft(remainingDeck.length)

        // update the deck to remainingdeck(the poped deck)
        setDeck(remainingDeck);

        // output the drawncard and if drawncard = null -> outuput = null
        setCurrentCard(drawnCard || null);

        function handleRestart() {

        }
        function handleBackToMenu() {
            
        }


    }


    return (

        <div className="min-h-screen flex flex-col">
            <div className="p-4">Header
                <div className='flex gap-2'>
                    <div className="logo_app">logo_app</div>
                    {/* คิดทำ แสดงจำนวนไพ่ไว้ก่อน */}
                    <div className="rounded-button1">เหลือ {numberCardLeft} ใบ</div>
                </div>

            </div>
            <div className="flex-1 p-4 h-110">Play area

                {/* {isGameOver && (
                    <div className="popup-backdrop">
                        <div className="popup">
                            <h2>🎴 Game Over</h2>
                            <p>No cards left</p>

                            <button onClick={handleRestart}>
                                Play again
                            </button>

                            <button onClick={handleBackToMenu}>
                                Back to menu
                            </button>
                        </div>
                    </div>
                )} */}

                <div className="Play_area">
                    {/* <button>pick a card</button> */}
                    <button className="full_button" onClick={() => drawCard()}>
                        pick a card
                    </button>

                    <h2>your card is: {currentCard}</h2>

                </div>

            </div>
            {/* <div className="p-4">
                <button className='half_button' >info</button>
                <button className="full_button" onClick={onStart}>back</button>
            </div> */}

            <div>
                <div className='slice_bar'>
                    <button
                        // toggle boolean drawer
                        onClick={() => setIsDrawerOpen(prev => !prev)}


                    >
                        Player infomation
                    </button>
                    <div
                        className={`
                    ${isDrawerOpen ? "translate-y-0" : "translate-y-full"}`}
                    >
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-4 gap-2">

                                {/* player infomation */}
                                {props.players.map((player, index) => (
                                    <div
                                        key={index}
                                    // className="bg-gray-400 p-4 text-center rounded"
                                    >
                                        Player: {player || String.fromCharCode(65 + index)}
                                    </div>
                                ))}

                            </div>

                            <p className="text-center text-sm">
                                Game will over when card out
                            </p>

                            <div className='flex flex'>
                                <button className="w-12 h-12 bg-gray-400 rounded">
                                    ⚙️
                                </button>
                                <button className="full_button" onClick={props.onStart}>Back to Menu</button>
                            </div>


                        </div>
                    </div>



                </div>
            </div>


        </div>

    );
}

