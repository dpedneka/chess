export type BoardTheme = {
    id: string;
    name: string;
    light: string;
    dark: string;
};

export const THEMES: BoardTheme[] = [
    {
        id: "classic",
        name: "Classic Blue",
        light: "rgb(217 227 232)",
        dark: "rgb(149 176 191)",
    },
    {
        id: "wooden",
        name: "Wooden",
        light: "#F0D9B5",
        dark: "#B58863",
    },
    {
        id: "dark",
        name: "Dark",
        light: "#E8E8E8",
        dark: "#4A4A4A",
    },
    {
        id: "chesscom",
        name: "Chess.com",
        light: "#FFFFF0",
        dark: "#BACA44",
    },
    {
        id: "ocean",
        name: "Ocean",
        light: "#E0F2F1",
        dark: "#00897B",
    },
];

export const DEFAULT_THEME_ID = "classic";

export function getThemeById(id?: string): BoardTheme {
    if (!id) return THEMES.find((t) => t.id === DEFAULT_THEME_ID)!;
    return THEMES.find((t) => t.id === id) || THEMES[0];
}
