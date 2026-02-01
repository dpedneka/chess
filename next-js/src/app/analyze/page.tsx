import fs from "fs";
import path from "path";
import AnalyzeClient from "./AnalyzeClient";

const pgnPath = path.join(process.cwd(), "src", "pgn", "18-46_27-03-2024_Carlsen Magnus_vs_M. Vachier-Lagrave_45min.pgn");

const AnalyzePage = async () => {
    let pgn = "";
    try {
        pgn = fs.readFileSync(pgnPath, "utf8");
    } catch (e) {
        console.error("Could not read PGN file:", e);
    }

    return (
        <>
            <AnalyzeClient pgn={pgn} />
        </>
    );
};

export default AnalyzePage;