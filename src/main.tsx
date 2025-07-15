import { createRoot } from "react-dom/client";
import "./index.css";
import { WAuthProviders } from "@wauth/strategy";
import { getStrategy } from "./lib/strategy.ts";
import { ArweaveWalletKit } from "@arweave-wallet-kit/react";
import { type Strategy } from "@arweave-wallet-kit/core/strategy";
import { HashRouter } from "react-router";
// import { Suspense } from "react";
import App from "./App.tsx";
// import Home from "./pages/Landing.tsx";
// import { Wander } from "./pages/Wander.tsx";
// import { Wauth } from "./pages/Wauth.tsx";

export default function Main() {
  const strategies = [
    getStrategy(WAuthProviders.Github),
    getStrategy(WAuthProviders.Google),
    getStrategy(WAuthProviders.Discord),
  ];
  return (
    <ArweaveWalletKit
      config={{
        appInfo: {
          name: "WAuth Demo",
          logo: "4R-dRRMdFerUnt8HuQzWT48ktgKsgjQ0uH6zlMFXVw",
        },
        strategies: strategies as Strategy[],
        permissions: ["ACCESS_ADDRESS", "SIGN_TRANSACTION", "SIGNATURE"],
      }}
      theme={{
        displayTheme: "dark",
        accent: { r: 110, g: 169, b: 100 },
      }}
    >
      {/* <Suspense fallback={<div>Loading...</div>}> */}
        <HashRouter>
          <App />
          {/* <Routes>
            <Route element={<App />}>
              <Route index element={<Home />} />
              <Route path="wander" element={<Wander />} />
              <Route path="wauth" element={<Wauth />} />
            </Route>
          </Routes> */}
        </HashRouter>
      {/* </Suspense> */}
    </ArweaveWalletKit>
  );
}

createRoot(document.getElementById("root")!).render(<Main />);
