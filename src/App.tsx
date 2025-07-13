import React, { useEffect, useState } from "react";
import Board from "./components/board";
import Controls from "./components/controls";
import GameSession from "./lib/session";
import "./components/board/board.scss";
import { Box, useTheme } from "@mui/material";
import Header from "./components/header";

const drawerWidth = 240;

function App() {
  const [game, setGame] = useState<GameSession>();
  const [open, setOpen] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    setGame(new GameSession(true));
  }, []);

  // const onOpenHandler = (open: boolean) => {
  //   setOpen(open);
  // };

  return game ? (
    <Box sx={{ display: "flex" }}>
      <Header
        drawerWidth={drawerWidth}
        game={game}
        // onOpen={onOpenHandler}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginTop: "64px",
          marginLeft: open ? `${drawerWidth}px` : 0,
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <div className="chess" id="container">
          <Board game={game} />
          <Controls game={game} />
        </div>
      </Box>
    </Box>
  ) : (
    <></>
  );
}

export default App;
