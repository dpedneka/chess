"use client";

import React, { useEffect, useMemo, useState } from "react";
import Board from "@/components/board";
import GameSession from "@/lib/session";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

type Props = {};

export default function AnalyzeClient({ }: Props) {
    const [game] = useState(() => new GameSession(false));
    const [moves, setMoves] = useState<string[]>([]);
    const [index, setIndex] = useState(0);
    const [pgn, setPgn] = useState<string>("");

    useEffect(() => {
        // Fetch PGN file on client side
        const fetchPgn = async () => {
            try {
                const response = await fetch('/pgn/15-46_27-03-2024_Daniel Fridman_vs_Carlsen Magnus_45min.pgn');
                const pgnContent = await response.text();
                setPgn(pgnContent);
            } catch (error) {
                console.error("Could not fetch PGN file:", error);
            }
        };

        fetchPgn();
    }, []);

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

    const getMaterialCount = () => {
        const board = (game.chess as any).board();
        let whiteMaterial = 0;
        let blackMaterial = 0;
        const pieceValues: { [key: string]: number } = {
            p: 1,
            n: 3,
            b: 3,
            r: 5,
            q: 9,
            k: 0,
        };

        for (const row of board) {
            for (const piece of row) {
                if (!piece) continue;
                const value = pieceValues[piece.type] || 0;
                if (piece.color === "w") {
                    whiteMaterial += value;
                } else {
                    blackMaterial += value;
                }
            }
        }

        return { whiteMaterial, blackMaterial };
    };

    const { whiteMaterial, blackMaterial } = getMaterialCount();
    const total = whiteMaterial + blackMaterial || 1;
    const whitePercentage = (whiteMaterial / total) * 100;
    const blackPercentage = (blackMaterial / total) * 100;

    return (
        <div>
            <div style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={prev} disabled={index === 0} title="Previous move" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", justifyContent: "center", opacity: index === 0 ? 0.5 : 1 }}>
                    <NavigateBeforeIcon />
                </button>
                <button onClick={next} disabled={index === moves.length} title="Next move" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", justifyContent: "center", opacity: index === moves.length ? 0.5 : 1 }}>
                    <NavigateNextIcon />
                </button>
                <div style={{ marginLeft: 12 }}>
                    Move: {index} / {moves.length}
                </div>
            </div>

            {/* Material/Score Bar */}
            <div style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ display: "flex", height: 24, borderRadius: 4, overflow: "hidden", flex: 1, border: "1px solid #ccc", backgroundColor: "#f0f0f0" }}>
                    <div style={{ width: `${whitePercentage}%`, backgroundColor: "#fff", transition: "width 0.3s ease" }} />
                    <div style={{ width: `${blackPercentage}%`, backgroundColor: "#333", transition: "width 0.3s ease" }} />
                </div>
                <div style={{ fontSize: 12, minWidth: 60, textAlign: "right" }}>
                    <div style={{ color: "#fff", backgroundColor: "#fff", color: "#000", padding: "2px 6px", borderRadius: 2, marginBottom: 2 }}>W: {whiteMaterial}</div>
                    <div style={{ color: "#333", backgroundColor: "#333", color: "#fff", padding: "2px 6px", borderRadius: 2 }}>B: {blackMaterial}</div>
                </div>
            </div>

            <Board game={game} isOnline={false} />

            <div style={{ marginTop: 12 }}>
                <strong>Moves</strong>
                <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>
                    {moves.map((m, i) => {
                        const isWhiteMove = i % 2 === 0;
                        return (
                            <button
                                key={i}
                                onClick={() => goTo(i + 1)}
                                style={{
                                    margin: 4,
                                    padding: "4px 8px",
                                    background: i + 1 === index ? (isWhiteMove ? "#f5f5f5" : "#333") : (isWhiteMove ? "#f9f9f9" : "#e0e0e0"),
                                    color: i + 1 === index ? (isWhiteMove ? "#000" : "#fff") : (isWhiteMove ? "#000" : "#333"),
                                    border: i + 1 === index ? (isWhiteMove ? "2px solid #000" : "2px solid #fff") : "1px solid #ccc",
                                    borderRadius: 4,
                                    cursor: "pointer",
                                    fontWeight: i + 1 === index ? "bold" : "normal",
                                }}
                            >
                                {isWhiteMove ? "W: " : "B: "}{m}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
