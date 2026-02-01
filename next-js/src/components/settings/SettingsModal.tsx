"use client";
import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
} from "@mui/material";
import { THEMES, getThemeById } from "@/lib/themes";

type Props = {
    open: boolean;
    onClose: () => void;
    value?: string;
    onChange?: (themeId: string) => void;
};

export default function SettingsModal({ open, onClose, value, onChange }: Props) {
    const [themeId, setThemeId] = useState<string>(value || THEMES[0].id);

    useEffect(() => {
        if (value) setThemeId(value);
    }, [value]);

    const handleChange = (e: SelectChangeEvent<string>) => {
        const id = e.target.value as string;
        setThemeId(id);
        if (onChange) onChange(id);
        // persist
        try {
            localStorage.setItem("boardTheme", id);
        } catch (err) {
            // ignore
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Settings</DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{ mt: 1 }}>
                    <InputLabel id="theme-select-label">Board Theme</InputLabel>
                    <Select
                        labelId="theme-select-label"
                        value={themeId}
                        label="Board Theme"
                        onChange={handleChange}
                    >
                        {THEMES.map((t) => (
                            <MenuItem value={t.id} key={t.id}>
                                {t.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
