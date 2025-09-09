"use client";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "../Components/Constants/context/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  );
}
