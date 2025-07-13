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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import Replay from "@mui/icons-material/Replay";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChessIcon from "@mui/icons-material/Casino";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";

type Props = {
  game: GameSession;
  drawerWidth: number;
  // onOpen: (open: boolean) => void;
};

function Header({ game, drawerWidth }: Props) {
  const [gameOver, setGameOver] = useState<boolean>(game.isGameOver());
  const [time, setTime] = useState<GameSessionTimer>(game.timer);
  const theme = useTheme();
  // const [open, setOpen] = useState(true);

  const menuItems = [
    { text: "New Game", icon: <ChessIcon /> },
    { text: "Game History", icon: <HistoryIcon /> },
    { text: "Settings", icon: <SettingsIcon /> },
  ];

  // const handleDrawerOpen = () => {
  //   setOpen(true);
  //   onOpen(true);
  // };

  // const handleDrawerClose = () => {
  //   setOpen(false);
  //   onOpen(false);
  // };

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
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: "white",
          color: "black",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            // onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Chess Game
          </Typography>
        </Toolbar>
        <Box sx={{ display: "flex" }}>
          <IconButton
            onClick={() => {
              game.reset();
            }}
          >
            <Replay />
          </IconButton>

          <IconButton
            onClick={() => {
              game.undo();
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          <IconButton
            onClick={() => {
              game.redo();
            }}
          >
            <ChevronRightIcon />
          </IconButton>
          {/* <Typography variant="h6" noWrap component="div">
            {gameOver
              ? `Game Over! Winner: ${game.getLoser()}`
              : `Turn: ${game.getOrientation()}`}
          </Typography>
          <Typography variant="subtitle1" noWrap component="div">
            White: {secondsToTime(time.white)} || Black:{" "}
            {secondsToTime(time.black)}
          </Typography> */}
        </Box>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={true}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          {/* <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton> */}
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
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
