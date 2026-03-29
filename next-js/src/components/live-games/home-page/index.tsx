import Board from "@/components/board";
import styles from "./home.module.css";
import { useEffect, useState } from "react";
import GameSession from "@/lib/session";
import LiveBoard from "../board";
import { getThemeById } from "@/lib/themes";

const LiveGamesHomePage = () => {
    const [game] = useState(() => new GameSession(false));
    const [pgn, setPgn] = useState<string>("");
    const [moves, setMoves] = useState<string[]>([]);
    const [index, setIndex] = useState(0);

    const liveGames = [
        {
            id: 1,
            pgnPath: "/pgn/15-46_27-03-2024_Daniel Fridman_vs_Carlsen Magnus_45min.pgn"
        },
        {
            id: 2,
            pgnPath: "/pgn/18-46_27-03-2024_Carlsen Magnus_vs_M. Vachier-Lagrave_45min.pgn"
        },
        {
            id: 3,
            pgnPath: "/pgn/15-46_27-03-2024_Daniel Fridman_vs_Carlsen Magnus_45min.pgn"
        },
        {
            id: 4,
            pgnPath: "/pgn/15-46_27-03-2024_Daniel Fridman_vs_Carlsen Magnus_45min.pgn"
        }
    ]; // Will come from API in the future

    useEffect(() => {
        if (!pgn) return;

        // Sanitize PGN and parse SAN tokens ourselves (avoid loadPgn parser errors)
        try {
            const sanitizeAndExtract = (raw: string) => {
                const lines = raw.split(/\r?\n/);
                // collect header lines (optional)
                const headerLines = lines.filter((l) => /^\s*\[.*\]\s*$/.test(l));
                const nonHeader = lines.filter((l) => !/^\s*\[.*\]\s*$/.test(l)).join(" ");

                // strip brace comments like { ... }
                let movesOnly = nonHeader.replace(/\{[^}]*\}/g, " ");
                // remove nested parentheses (variations) iteratively
                while (/\([^()]*\)/.test(movesOnly)) {
                    movesOnly = movesOnly.replace(/\([^()]*\)/g, " ");
                }
                // remove NAGs like $5
                movesOnly = movesOnly.replace(/\$\d+/g, " ");
                // collapse whitespace
                movesOnly = movesOnly.replace(/\s+/g, " ").trim();

                // strip move numbers (e.g., "1." or "1...") and results
                const tokens = movesOnly.split(/\s+/).filter(Boolean);
                const sanTokens: string[] = [];
                for (const t of tokens) {
                    if (/^(?:1-0|0-1|1\/2-1\/2|\*)$/.test(t)) continue;
                    if (/^\d+\.(?:\.\.)?$/.test(t)) continue; // move numbers
                    // sometimes move numbers appear as '1...' or '1.' or '1.' with trailing
                    if (/^\d+\.$/.test(t)) continue;
                    sanTokens.push(t);
                }
                return sanTokens;
            };

            const sanMoves = sanitizeAndExtract(pgn);
            setMoves(sanMoves);
            // reset board and leave at starting position
            const chessAny = (game.chess as any);
            chessAny.reset();
            game.trigger("move", game.getPosition());
            setIndex(0);
        } catch (e) {
            console.error("Failed to load PGN into chess instance:", e);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pgn]);

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                {
                    liveGames.map(lgame => (
                        <div key={lgame.id} className={styles.gameCard}>
                            <h3>Live Game #{lgame.id}</h3>
                            {/* Placeholder for game details */}
                            <LiveBoard
                                pgnPath={lgame.pgnPath}
                                theme={getThemeById("wooden")}
                            />
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

export default LiveGamesHomePage