// import { useState } from 'react';



export default function Menu() {
    return (
        <>
            {/* HEADER logo, language and light/dark mode */}
            <div className="flex gap-6">
                <div>
                    <div className="logo_app">logo_app</div>
                </div>
                <div className="flex gap-2">
                    <div className="Language_button">Language</div>
                    <div className="display_mode_button">Light/Dark mode</div>
                </div>
            </div>

            {/* MAIN AREA player setup */}
            <div className="player_setup">player setup</div>
            
            {/* MAIN AREA How to play and Deck */}
            <div className="flex gap-6">
                <div className="how_to_play_button">How to play</div>
                <div className="deck_button">Deck</div>
            </div>
            {/* MAIN AREA Play button */}
            <div>
                <div className="gamestart_button">Let's Play!!!</div>
            </div>
            {/* FOOTER terms and service */}
            <div>
                <div className="teams_area">Terms of service</div>
            </div>
        </>

    );
}