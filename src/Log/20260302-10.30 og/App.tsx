import { useState } from 'react';
import './menu.css'
import Game from './game'
import Menu from './menu';
import deckOriginal from "../data/deck-original.json";
import type { Deck_type } from "../types/card.ts";

console.log(deckOriginal);

export default function App() {
    // manager page flow and default set to "menu"
    const [currentPage, setCurrentPage] = useState("menu");

    // player name : menu -> app -> game
    // app will holding player list
    const [players, setPlayers] = useState<string[]>(["", "", "", ""]);

    // Deck zone
    // Deck for contain 52 card
    const [deck, setDeck] = useState<string[]>(() =>
        buildDeck(deckOriginal)
    );



    // fuction สำหรับการสร้าง deck ขึ้นมา
    function buildDeck(input_deck: Deck_type) {
        const result_deck: string[] = [];

        input_deck.cards.forEach(card => {
            if (!card.enabled) return;

            for (let i = 0; i < card.maxCopies; i++) {
                result_deck.push(card.description_Thai);
            }
        });

        return result_deck
        // return [...result_deck].sort(() => Math.random() - 0.5);;
    }

    // setDeck(shuffle(buildDeck(deckOriginal)));


    // console.log(buildDeck(deckOriginal));

    return (
        <>
            {/* {เงื่อนไข && สิ่งที่อยากให้แสดง} */}
            {/* ใช้ and ในการแสดงผลแทน ถ้าไม่ใช้and ก็จะเป็น if แทน */}
            {/* {currentPage === "game" && <Game />} */}
            {currentPage === "menu" && (
                <Menu
                    onStart={() => setCurrentPage("game")}
                    players={players}
                    setPlayers={setPlayers}
                />
            )}

            {currentPage === "game" && (
                <Game
                    onStart={() => setCurrentPage("menu")}
                    players={players}
                    deck={buildDeck(deckOriginal)}

                />
            )}

        </>
    );
}

