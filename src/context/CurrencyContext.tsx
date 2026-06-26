import React, { createContext, useContext, useState, useEffect } from "react";

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  rate: number; // rate relative to USD
  flag: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", rate: 1.0, flag: "🇺🇸" },
  EUR: { code: "EUR", symbol: "€", name: "Euro", rate: 0.92, flag: "🇪🇺" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", rate: 0.79, flag: "🇬🇧" },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 158.5, flag: "🇯🇵" },
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 1.37, flag: "🇨🇦" },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 1.51, flag: "🇦🇺" },
  KES: { code: "KES", symbol: "Ksh", name: "Kenyan Shilling", rate: 129.5, flag: "🇰🇪" },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 83.5, flag: "🇮🇳" },
  CHF: { code: "CHF", symbol: "CHF", name: "Swiss Franc", rate: 0.89, flag: "🇨🇭" },
  AED: { code: "AED", symbol: "AED", name: "UAE Dirham", rate: 3.67, flag: "🇦🇪" }
};

interface CurrencyContextType {
  currency: string;
  setCurrency: (code: string) => void;
  currencyInfo: CurrencyInfo;
  convertPrice: (usdPrice: number) => number;
  formatPrice: (usdPrice: number) => string;
  convertArbitrary: (amount: number, from: string, to: string) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<string>(() => {
    return localStorage.getItem("uptown_currency") || "USD";
  });

  const currencyInfo = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.USD;

  const setCurrency = (code: string) => {
    if (SUPPORTED_CURRENCIES[code]) {
      setCurrencyState(code);
      localStorage.setItem("uptown_currency", code);
    }
  };

  const convertPrice = (usdPrice: number): number => {
    return usdPrice * currencyInfo.rate;
  };

  const formatPrice = (usdPrice: number): string => {
    const converted = convertPrice(usdPrice);
    // Format appropriately: whole numbers for some, decimals for others
    if (currencyInfo.code === "JPY") {
      return `${currencyInfo.symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${currencyInfo.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })}`;
  };

  const convertArbitrary = (amount: number, from: string, to: string): number => {
    const fromInfo = SUPPORTED_CURRENCIES[from] || SUPPORTED_CURRENCIES.USD;
    const toInfo = SUPPORTED_CURRENCIES[to] || SUPPORTED_CURRENCIES.USD;
    
    // Convert to USD first, then to target currency
    const amountInUSD = amount / fromInfo.rate;
    return amountInUSD * toInfo.rate;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        currencyInfo,
        convertPrice,
        formatPrice,
        convertArbitrary
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
