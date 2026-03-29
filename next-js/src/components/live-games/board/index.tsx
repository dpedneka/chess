import { Chessboard } from "react-chessboard";
import { useEffect, useState } from "react";
import GameSession from "@/lib/session";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import styles from "./board.module.css";
import { ReplayOutlined } from "@mui/icons-material";

const LiveBoard = ({ pgnPath, theme }: { pgnPath: string, theme: any }) => {
    const [position, setPosition] = useState<string>("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    const [game] = useState(() => new GameSession(false));
    // const theme = getThemeById("wooden");

    const [moves, setMoves] = useState<string[]>([]);
    const [index, setIndex] = useState(0);

    const goTo = (i: number) => {
        const chessAny = (game.chess as any);
        if (!moves || moves.length === 0) return;
        const safe = Math.max(0, Math.min(i, moves.length));

        // reset and play moves up to safe
        chessAny.reset();
        for (let k = 0; k < safe; k++) {
            try {
                chessAny.move(moves[k]);
            } catch (err) {
                console.warn("Error applying move", moves[k], err);
            }
        }

        const newPosition = game.getPosition();
        game.trigger("move", newPosition);
        setPosition(newPosition);
        setIndex(safe);
    };

    const next = () => goTo(index + 1);
    const prev = () => goTo(index - 1);

    const reset = () => goTo(0);

    useEffect(() => {
        const loadPgnGame = async () => {
            try {
                // Fetch PGN file
                const response = await fetch(pgnPath);
                const pgnContent = await response.text();

                // Parse PGN to extract moves (similar to AnalyzeClient logic)
                const sanitizeAndExtract = (raw: string) => {
                    const lines = raw.split(/\r?\n/);
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

                    // strip move numbers and results
                    const tokens = movesOnly.split(/\s+/).filter(Boolean);
                    const sanTokens: string[] = [];
                    for (const t of tokens) {
                        if (/^(?:1-0|0-1|1\/2-1\/2|\*)$/.test(t)) continue;
                        if (/^\d+\.(?:\.\.)?$/.test(t)) continue;
                        if (/^\d+\.$/.test(t)) continue;
                        sanTokens.push(t);
                    }
                    return sanTokens;
                };

                const sanMoves = sanitizeAndExtract(pgnContent);
                setMoves(sanMoves);

                // Reset to the starting position (0th move)
                const chessAny = (game.chess as any);
                chessAny.reset();
                game.trigger("move", game.getPosition());
                setIndex(0);
                setPosition(game.getPosition());

            } catch (error) {
                console.error("Could not load PGN game:", error);
                setPosition("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"); // Fallback to starting position
            }
        };

        loadPgnGame();
    }, [game]);

    return (
        <div className={styles.liveBoard}>
            <Chessboard
                options={{
                    animationDurationInMs: 200,
                    position,
                    boardOrientation: "white",
                    lightSquareStyle: { backgroundColor: theme.light },
                    darkSquareStyle: { backgroundColor: theme.dark },
                    onPieceDrop: () => false, // Disable piece dropping
                    onSquareClick: () => { }, // Empty click handler
                    boardStyle: {
                        borderRadius: "4px",
                        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)",
                    }
                }}
            />
            <div className={styles.buttonCont}>
                <button onClick={prev} disabled={index === 0} title="Previous move" className={styles.button} style={{ opacity: index === 0 ? 0.5 : 1 }}>
                    <NavigateBeforeIcon />
                </button>
                <button onClick={next} disabled={index === moves.length} title="Next move" className={styles.button} style={{ opacity: index === moves.length ? 0.5 : 1 }}>
                    <NavigateNextIcon />
                </button>
                <button onClick={reset} disabled={index === moves.length} title="Reset game" className={styles.button} style={{ opacity: index === moves.length ? 0.5 : 1 }}>
                    <ReplayOutlined />
                </button>
                <div style={{ marginLeft: 12 }}>
                    Move: {index} / {moves.length}
                </div>
            </div>
        </div>
    );
}

export default LiveBoard;