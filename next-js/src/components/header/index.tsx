import React, { useState } from "react";
import GameSession from "../../lib/session";
import { GameSessionTimer } from "../../lib/types";
import { secondsToTime, useInitialEffect } from "../../lib/utils";
import "./header.scss";

import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  Divider,
  Avatar,
  Badge,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Replay from "@mui/icons-material/Replay";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CasinoIcon from "@mui/icons-material/Casino";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import VideogameAssetIcon from "@mui/icons-material/VideogameAsset";

type Props = {
  game: GameSession;
  drawerWidth: number;
  isOnline?: boolean;
  playerColor?: "white" | "black";
  onOpenSettings?: () => void;
  // onOpen: (open: boolean) => void;
};

function Header({ game, drawerWidth, isOnline, playerColor, onOpenSettings }: Props) {
  const [gameOver, setGameOver] = useState<boolean>(game.isGameOver());
  const [time, setTime] = useState<GameSessionTimer>(game.timer);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();

  const menuItems = [
    { text: "New Game", icon: <CasinoIcon />, color: "#2E7D32" },
    { text: "Game History", icon: <HistoryIcon />, color: "#1976D2" },
    { text: "My Profile", icon: <PersonIcon />, color: "#F57C00" },
    { text: "Achievements", icon: <EmojiEventsIcon />, color: "#D32F2F" },
  ];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  // Observers
  useInitialEffect(() => {
    game.onTimerChange((timer) => setTime(timer));
  });

  useInitialEffect(() => {
    game.onBoardChange(() => {
      setGameOver(game.isGameOver());
    });
  });

  return (
    <>
      <CssBaseline />
      {/* Header AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          background: "linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: 3 }}>
          {/* Left Section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Tooltip title="Toggle Menu">
              <IconButton
                color="inherit"
                aria-label="toggle drawer"
                onClick={handleDrawerToggle}
                edge="start"
                sx={{
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                {drawerOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            </Tooltip>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <VideogameAssetIcon sx={{ fontSize: 28, color: "#fff" }} />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  background: "linear-gradient(135deg, #fff 0%, #e0e0e0 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                ChessMaster
              </Typography>
            </Box>
            {isOnline && (
              <Badge
                badgeContent={playerColor === "white" ? "♔" : "♚"}
                sx={{
                  ml: 2,
                  "& .MuiBadge-badge": {
                    backgroundColor: playerColor === "white" ? "#FFF" : "#000",
                    color: playerColor === "white" ? "#000" : "#FFF",
                    fontSize: "14px",
                    fontWeight: "bold",
                  },
                }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: "rgba(255, 255, 255, 0.2)" }}>
                  <PersonIcon />
                </Avatar>
              </Badge>
            )}
          </Box>

          {/* Center Section - Game Status */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                {gameOver ? "Game Over" : "Game Status"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#fff", fontWeight: 600 }}>
                {gameOver ? `Game Finished` : `Turn: ${game.getOrientation()}`}
              </Typography>
            </Box>
            <Divider sx={{ height: 30, bgcolor: "rgba(255,255,255,0.2)" }} orientation="vertical" />
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                Time Remaining
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Typography variant="body2" sx={{ color: "#fff", fontWeight: 600 }}>
                  ⚪ {secondsToTime(time.white)}
                </Typography>
                <Typography variant="body2" sx={{ color: "#ccc", fontWeight: 600 }}>
                  ⚫ {secondsToTime(time.black)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Right Section - Actions */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Tooltip title="Reset Game">
              <IconButton
                onClick={() => game.reset()}
                sx={{
                  color: "inherit",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <Replay />
              </IconButton>
            </Tooltip>
            <Tooltip title="Undo Move">
              <IconButton
                onClick={() => game.undo()}
                sx={{
                  color: "inherit",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Redo Move">
              <IconButton
                onClick={() => game.redo()}
                sx={{
                  color: "inherit",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Tooltip>
            <Divider sx={{ height: 30, bgcolor: "rgba(255,255,255,0.2)", my: 1 }} orientation="vertical" />
            <Tooltip title="Settings">
              <IconButton
                onClick={() => {
                  if (typeof onOpenSettings === "function") onOpenSettings();
                }}
                sx={{
                  color: "inherit",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#f5f5f5",
            borderRight: "1px solid #e0e0e0",
          },
        }}
        variant="temporary"
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerClose}
      >
        <Toolbar /> {/* Add spacing for AppBar */}
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a237e", mb: 1 }}>
            Menu
          </Typography>
          <Divider />
        </Box>

        {/* Main Menu Items */}
        <List>
          {menuItems.map((item, index) => (
            <ListItem
              key={item.text}
              sx={{
                py: 1.5,
                px: 2,
                mb: 0.5,
                borderRadius: 1,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(26, 35, 126, 0.08)",
                  transform: "translateX(4px)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: item.color,
                  minWidth: 40,
                  fontSize: 20,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  sx: {
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: "#333",
                  },
                }}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Bottom Menu Items */}
        <List sx={{ mt: "auto", pb: 2 }}>
          <ListItem
            sx={{
              py: 1.5,
              px: 2,
              borderRadius: 1,
              cursor: "pointer",
              transition: "all 0.3s ease",
              backgroundColor: "rgba(211, 47, 47, 0.08)",
              "&:hover": {
                backgroundColor: "rgba(211, 47, 47, 0.15)",
                transform: "translateX(4px)",
              },
            }}
          >
            <ListItemIcon sx={{ color: "#D32F2F", minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                sx: {
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: "#D32F2F",
                },
              }}
            />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}

export default Header;

// <div className="header" data-testid="header">
//   <h1>Play chess</h1>

//   <h2>
//     {gameOver
//       ? `Whoops! The game is over. The winner is: ${game.getLoser()}`
//       : `Turn: ${game.getOrientation()}`}
//   </h2>
//   <h3>
//     White: {secondsToTime(time.white)} || Black: {secondsToTime(time.black)}
//   </h3>
// </div>
