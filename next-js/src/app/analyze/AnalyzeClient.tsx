"use client";

import React, { useEffect, useMemo, useState } from "react";
import Board from "@/components/board";
import GameSession from "@/lib/session";

type Props = {
    pgn: string;
};

export default function AnalyzeClient({ pgn }: Props) {
    const [game] = useState(() => new GameSession(false));
    const [moves, setMoves] = useState<string[]>([]);
    const [index, setIndex] = useState(0);

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
        game.trigger("move", game.getPosition());
        setIndex(safe);
    };

    const next = () => goTo(index + 1);
    const prev = () => goTo(index - 1);

    return (
        <div>
            <div style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={prev} disabled={index === 0}>
                    Previous
                </button>
                <button onClick={next} disabled={index === moves.length}>
                    Next
                </button>
                <div style={{ marginLeft: 12 }}>
                    Move: {index} / {moves.length}
                </div>
            </div>

            <Board game={game} isOnline={false} />

            <div style={{ marginTop: 12 }}>
                <strong>Moves</strong>
                <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>
                    {moves.map((m, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i + 1)}
                            style={{
                                margin: 4,
                                padding: "4px 8px",
                                background: i + 1 === index ? "#1976d2" : "#eee",
                                color: i + 1 === index ? "#fff" : "#000",
                                border: "none",
                                borderRadius: 4,
                                cursor: "pointer",
                            }}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
