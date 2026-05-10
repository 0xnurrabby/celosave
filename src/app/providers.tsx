"use client";

import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { config } from "@/lib/wagmi";
import { useEffect, useState } from "react";
import { useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

const queryClient = new QueryClient();

function MiniPayAutoConnect({ children }: { children: React.ReactNode }) {
  const { connect } = useConnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && (window as any).ethereum?.isMiniPay) {
      connect({ connector: injected({ target: "metaMask" }) });
    }
  }, [connect]);

  if (!mounted) return null;
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MiniPayAutoConnect>{children}</MiniPayAutoConnect>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
