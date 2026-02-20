import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { FriendsProvider } from "@/contexts/FriendsContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { LogoProvider } from "@/contexts/LogoContext";
import { DrinkingGameProvider } from "@/contexts/DrinkingGameContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GameLobby from "./pages/GameLobby";
import Spectator from "./pages/Spectator";
import AdminUpload from "./pages/AdminUpload";
import AdminPromoCodes from "./pages/AdminPromoCodes";
import AdminFreeTrials from "./pages/AdminFreeTrials";
import AdminSubscriptions from "./pages/AdminSubscriptions";
import AdminSubscriptionAnalytics from "./pages/AdminSubscriptionAnalytics";
import AdminShitoCards from "./pages/AdminShitoCards";
import AdminLogoSettings from "./pages/AdminLogoSettings";
import AdminGameAssets from "./pages/AdminGameAssets";
import AdminDataMigration from "./pages/AdminDataMigration";
import AdminCardParser from "./pages/AdminCardParser";

import Login from "./pages/Login";

import Checkout from "./pages/Checkout";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";
import DeckBuilder from "./pages/DeckBuilder";
import BoardEditor from "./pages/BoardEditor";
import Tournament from "./pages/Tournament";
import DropDeuceRules from "./pages/DropDeuceRules";
import DropADeuceRules from "./pages/DropADeuceRules";
import LetThatShitGoRules from "./pages/LetThatShitGoRules";
import ShitoCallingCards from "./pages/ShitoCallingCards";
import AdultShitoGame from "./pages/AdultShitoGame";
import PartyPack from "./pages/PartyPack";
import PracticeMode from "./pages/PracticeMode";


const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <LogoProvider>
        <AuthProvider>
          <FriendsProvider>
            <NotificationsProvider>
              <DrinkingGameProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/lobby" element={<GameLobby />} />
                      <Route path="/spectator" element={<Spectator />} />
                      <Route path="/practice" element={<PracticeMode />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/leaderboard" element={<Leaderboard />} />
                      <Route path="/tournaments" element={<Tournament />} />
                      <Route path="/drop-deuce-rules" element={<DropDeuceRules />} />
                      <Route path="/drop-a-deuce-rules" element={<DropADeuceRules />} />
                      <Route path="/drop-deuce-party-pack" element={<PartyPack />} />
                      <Route path="/let-that-shit-go-rules" element={<LetThatShitGoRules />} />
                      <Route path="/shito-calling-cards" element={<ShitoCallingCards />} />
                      <Route path="/adult-shito" element={<AdultShitoGame />} />

                      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
                      <Route path="/admin" element={<ProtectedRoute><AdminUpload /></ProtectedRoute>} />
                      <Route path="/admin/upload" element={<ProtectedRoute><AdminUpload /></ProtectedRoute>} />
                      <Route path="/admin/logo" element={<ProtectedRoute><AdminLogoSettings /></ProtectedRoute>} />
                      <Route path="/admin/promo-codes" element={<ProtectedRoute><AdminPromoCodes /></ProtectedRoute>} />
                      <Route path="/admin/free-trials" element={<ProtectedRoute><AdminFreeTrials /></ProtectedRoute>} />
                      <Route path="/admin/subscriptions" element={<ProtectedRoute><AdminSubscriptions /></ProtectedRoute>} />
                      <Route path="/admin/subscription-analytics" element={<ProtectedRoute><AdminSubscriptionAnalytics /></ProtectedRoute>} />
                      <Route path="/admin/data-migration" element={<ProtectedRoute><AdminDataMigration /></ProtectedRoute>} />

                      <Route path="/admin/deck-builder" element={<ProtectedRoute><DeckBuilder /></ProtectedRoute>} />
                      <Route path="/admin/board-editor" element={<ProtectedRoute><BoardEditor /></ProtectedRoute>} />
                      <Route path="/admin/shito-cards" element={<ProtectedRoute><AdminShitoCards /></ProtectedRoute>} />
                      <Route path="/admin/game-assets" element={<ProtectedRoute><AdminGameAssets /></ProtectedRoute>} />
                      <Route path="/admin/card-parser" element={<ProtectedRoute><AdminCardParser /></ProtectedRoute>} />
                      <Route path="*" element={<NotFound />} />

                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </DrinkingGameProvider>
            </NotificationsProvider>
          </FriendsProvider>
        </AuthProvider>
      </LogoProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
