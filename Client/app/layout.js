import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import StoreProvider from "@/store/provider";

export const metadata = {
  title: "Smart Abacus Academy | India's #1 Abacus & Mental Arithmetic Training",
  description: "Smart Abacus Academy — Empowering young minds with world-class Abacus, Mental Math, Vedic Mathematics, Speed Reading and Brain Gym programs. 15+ years of excellence, 10,000+ students, 50+ centres across India.",
  keywords: "abacus classes, mental arithmetic, smart abacus, abacus training, vedic math, speed reading, kids education, math olympiad, abacus academy India",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <StoreProvider>
          <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
