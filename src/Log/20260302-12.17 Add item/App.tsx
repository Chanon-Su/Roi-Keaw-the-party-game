import { useState } from 'react';
import './menu.css'
import Game from './game'
import Menu from './menu';
import deckOriginal from "../data/deck-original.json";
import type { Deck_type } from "../types/card.ts";

export default function App() {
    const [currentPage, setCurrentPage] = useState("menu");
    const [players, setPlayers] = useState<string[]>(["", "", "", ""]);

    // สร้าง deck (array ของ description_Thai) สำหรับแสดงในเกม
    function buildDeck(input_deck: Deck_type) {
        const result_deck: string[] = [];
        input_deck.cards.forEach(card => {
            if (!card.enabled) return;
            for (let i = 0; i < card.maxCopies; i++) {
                result_deck.push(card.description_Thai);
            }
        });
        return result_deck;
    }

    // [Claude] buildDeckData: สร้าง array ของข้อมูลไพ่เต็มๆ สำหรับตรวจ hasItem
    // deck (string[]) แค่เก็บข้อความ ไม่รู้ว่าไพ่มี hasItem มั้ย
    // deckData เก็บ hasItem และ cardId ไว้ด้วย เพื่อให้ Game ใช้ตรวจสอบได้
    function buildDeckData(input_deck: Deck_type) {
        const result: { description_Thai: string; hasItem: boolean; cardId: string; itemLabel: string }[] = [];
        input_deck.cards.forEach(card => {
            if (!card.enabled) return;
            for (let i = 0; i < card.maxCopies; i++) {
                result.push({
                    description_Thai: card.description_Thai,
                    hasItem: card.hasItem ?? false,
                    cardId: card.id,
                    itemLabel: card.itemLabel ?? "",  // [Claude] ดึง itemLabel จาก JSON
                });
            }
        });
        return result;
    }

    return (
        <>
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
                    // [Claude] ส่ง deckData ไปให้ Game ใช้ตรวจ hasItem
                    deckData={buildDeckData(deckOriginal)}
                />
            )}
        </>
    );
}
