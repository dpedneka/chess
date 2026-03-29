import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container
} from '@mui/material';

const Header = () => {
  // Navigation items array for easy mapping
  const navItems = ['Play', 'Puzzles', 'Learn', 'Watch'];

  return (
    <AppBar position="static" sx={{ backgroundColor: '#262421', color: '#fff' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>

          {/* Logo & Site Name */}
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 4,
              display: 'flex',
              alignItems: 'center',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
              gap: 1
            }}
          >
            <span style={{ fontSize: '2rem' }}>♞</span> ChessArena
          </Typography>

          {/* Center Navigation Links (Hidden on extra small screens) */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item}
                sx={{
                  color: '#b0afa9', // Subtle grey-ish white
                  display: 'block',
                  fontWeight: 'bold',
                  '&:hover': {
                    color: '#ffffff',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)'
                  }
                }}
              >
                {item}
              </Button>
            ))}
          </Box>

          {/* Right Side: Auth Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              sx={{
                color: '#fff',
                fontWeight: 'bold',
                display: { xs: 'none', sm: 'block' } // Hide login text on very small screens
              }}
            >
              Log In
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#81b64c', // A friendly "chess board green"
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#6c9a40',
                }
              }}
            >
              Sign Up
            </Button>
          </Box>

        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;