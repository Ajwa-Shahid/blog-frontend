"use client";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import { ThemeProvider } from "../Components/Constants/context/ThemeContext";
import { AuthProvider } from "../Components/Constants/context/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  );
}
