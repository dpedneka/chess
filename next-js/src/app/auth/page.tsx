"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Container,
    Tab,
    Tabs,
    Alert,
    CircularProgress,
} from "@mui/material";
import { useAuth } from "@/lib/auth-context";
import LockIcon from "@mui/icons-material/Lock";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`auth-tabpanel-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export default function Auth() {
    const router = useRouter();
    const { login, signup, error, isLoading } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [localError, setLocalError] = useState("");

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setLocalError("");
        setEmail("");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError("");

        if (!email || !password) {
            setLocalError("Email and password are required");
            return;
        }

        try {
            await login(email, password);
            router.push("/");
        } catch (err) {
            setLocalError(error || "Login failed");
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError("");

        if (!email || !username || !password) {
            setLocalError("All fields are required");
            return;
        }

        if (password !== confirmPassword) {
            setLocalError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setLocalError("Password must be at least 6 characters");
            return;
        }

        try {
            await signup(email, username, password);
            router.push("/");
        } catch (err) {
            setLocalError(error || "Signup failed");
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
        >
            <Container maxWidth="sm">
                <Card>
                    <CardContent sx={{ p: 4 }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: 3,
                                gap: 2,
                            }}
                        >
                            <LockIcon sx={{ fontSize: 32, color: "primary.main" }} />
                            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                                Chess Arena
                            </Typography>
                        </Box>

                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            variant="fullWidth"
                            sx={{ mb: 2 }}
                        >
                            <Tab label="Login" />
                            <Tab label="Sign Up" />
                        </Tabs>

                        {/* Login Tab */}
                        <TabPanel value={tabValue} index={0}>
                            <form onSubmit={handleLogin}>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    {(localError || error) && (
                                        <Alert severity="error">{localError || error}</Alert>
                                    )}

                                    <TextField
                                        label="Email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        fullWidth
                                        placeholder="your@email.com"
                                        disabled={isLoading}
                                    />

                                    <TextField
                                        label="Password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        fullWidth
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                    />

                                    <Button
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        onClick={handleLogin}
                                        disabled={isLoading}
                                        sx={{ mt: 2 }}
                                    >
                                        {isLoading ? (
                                            <>
                                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                                Logging in...
                                            </>
                                        ) : (
                                            "Login"
                                        )}
                                    </Button>

                                    <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
                                        Demo: Use <strong>test@chess.com</strong> / <strong>password</strong>
                                    </Typography>
                                </Box>
                            </form>
                        </TabPanel>

                        {/* Signup Tab */}
                        <TabPanel value={tabValue} index={1}>
                            <form onSubmit={handleSignup}>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    {(localError || error) && (
                                        <Alert severity="error">{localError || error}</Alert>
                                    )}

                                    <TextField
                                        label="Email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        fullWidth
                                        placeholder="your@email.com"
                                        disabled={isLoading}
                                    />

                                    <TextField
                                        label="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        fullWidth
                                        placeholder="Choose a username"
                                        disabled={isLoading}
                                    />

                                    <TextField
                                        label="Password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        fullWidth
                                        placeholder="Min 6 characters"
                                        disabled={isLoading}
                                    />

                                    <TextField
                                        label="Confirm Password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        fullWidth
                                        placeholder="Confirm your password"
                                        disabled={isLoading}
                                    />

                                    <Button
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        onClick={handleSignup}
                                        disabled={isLoading}
                                        sx={{ mt: 2 }}
                                    >
                                        {isLoading ? (
                                            <>
                                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                                Creating account...
                                            </>
                                        ) : (
                                            "Sign Up"
                                        )}
                                    </Button>
                                </Box>
                            </form>
                        </TabPanel>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}
