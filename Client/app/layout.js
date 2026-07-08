import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import StoreProvider from "@/store/provider";

export const metadata = {
  title: "Ultra Smart Abacus - Class Management System",
  description: "Class Management System for Ultra Smart Abacus",
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
