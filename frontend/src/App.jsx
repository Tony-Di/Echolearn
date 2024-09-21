import { useState } from 'react'
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Navigate, Routes, Route, useParams } from "react-router-dom";

import { useAuth } from "./hooks";
import { AuthProvider } from "./context/auth";

import LandingPage from "./components/LandingPage"
import HomePage from "./components/HomePage";
import CreateCard from "./components/CreateCard";
import CreateDeck from "./components/CreateDeck";
import ReviewPage from "./components/ReviewPage";
import HelpPage from "./components/HelpPage";
import DeckPage from './components/DeckPage';
import EditPage from './components/EditPage';
import Header from "./components/Header";
import Login from './components/Login';
import SignUp from './components/SignUp';
import FeaturePage from './components/FeaturesPage';
import AboutPage from './components/AboutPage';
import ProfilePage from './components/ProfilePage';
import StatsPage from './components/StatsPage';
import CommunityPage from './components/community'

const queryClient = new QueryClient();

function ErrorPage({ statusCode, errorMessage }) {
  return (
    <>
      <h1 className="mt-20 text-[3rem] font-bold">{statusCode}</h1>
      <p className="mt-2 text-[1.5rem]">{errorMessage}</p>
    </>
  );
}

function AuthenticatedRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cards" element={<CreateCard />} />
      <Route path="/decks" element={<CreateDeck />} />
      <Route path="/review/:deckId" element={<ReviewPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/edit/:cardId" element={<EditPage />} />
      <Route path="/decks/:deckId" element={<DeckPage />} />
      <Route path="/decks/public/:deckId" element={<DeckPage publicAccess={true} />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/stats/:deckId" element={<StatsPage />} />
      <Route path="/community" element={<CommunityPage />} />
      {/* <Route path="*" element={<Navigate to="/error/404/Page%20Not%20Found" />} /> */}
      <Route path="*" element={<ErrorPage statusCode="404" errorMessage="Page not found" />} />
    </Routes>
  );
}

function UnauthenticatedRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/features" element={<FeaturePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function Main() {
  const { isLoggedIn, token } = useAuth();
  console.log("isLoggedIn: " + isLoggedIn);
  console.log("token: " + !!token);

  return (
    <main className="w-full h-full flex flex-col items-center">
      {isLoggedIn ?
        <AuthenticatedRoutes /> :
        <UnauthenticatedRoutes />
      }
    </main>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-w-screen min-h-screen flex flex-col text-[1.2em] font-base text-eWhite bg-eBase">
            <Header />
            <Main />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App;
