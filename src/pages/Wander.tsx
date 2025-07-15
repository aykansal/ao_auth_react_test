// @ts-nocheck
import { useEffect, useRef } from "react";
import { WanderConnect } from "@wanderapp/connect";
import Arweave from "arweave";

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

export function Wander() {
  const wanderRef = useRef<any>(null);

  useEffect(() => {
    async function initAndTestWander() {
      const wander = new WanderConnect({
        clientId: "FREE_TRIAL",
      });
      await window.arweaveWallet.connect([
        "SIGNATURE",
        "ACCESS_ADDRESS",
        "SIGN_TRANSACTION",
      ]);
      const tx = "ghgh ";
      await window.arweaveWallet.sign(tx);
      wander.open();
    }

    initAndTestWander();
  }, []);

  // useEffect(() => {
  //   // Initialize Wander Connect:
  //   const wander = new WanderConnect({
  //     clientId: "FREE_TRIAL",
  //   });

  //   // Keep a reference to the instance:
  //   wanderRef.current = wander;

  //   const handleWalletLoaded = async (e) => {
  //     try {
  //       const { permissions = [] } = e.detail || {};

  //       if (permissions.length === 0) {
  //         // Your app is not connected to the wallet yet, so
  //         // you first need to call `connect()`:
  //         await window.arweaveWallet.connect([
  //           "ACCESS_ADDRESS",
  //           "SIGN_TRANSACTION",
  //           "SIGNATURE",
  //         ]);
  //       }

  //       // Create Arweave transaction:
  //       const tx = await arweave.createTransaction({
  //         data: '<html><head><meta charset="UTF-8"><title>Hello world!</title></head><body></body></html>',
  //       },);

  //       // Sign transaction:
  //       await arweave.transactions.sign(tx);

  //       // TODO: Handle (e.g. post) signed transaction.
  //     } catch (err) {
  //       alert(`Error: ${err.message}`);
  //     }
  //   };

  //   // Wait for the wallet API to be injected and for
  //   // the user to authenticate:
  //   window.addEventListener("arweaveWalletLoaded", handleWalletLoaded);

  //   // Clean up on unmount:
  //   return () => {
  //     wander?.destroy();
  //     wanderRef.current = null;
  //     window.removeEventListener("arweaveWalletLoaded", handleWalletLoaded);
  //   };
  // }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🚀 Wander Connect Demo
          </h1>
          <p className="text-gray-400 text-lg">
            Experience seamless Arweave wallet integration
          </p>
        </div>

        <div className="card max-w-2xl mx-auto">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Wallet Integration Ready
              </h2>
              <p className="text-gray-400">
                Wander Connect is initialized and listening for wallet events.
                Connect your Arweave wallet to begin signing transactions.
              </p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">Active</span>
              </div>
              <p className="text-gray-400 text-sm">
                Wallet connection listener is active and ready to process
                transactions
              </p>
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
              <p className="text-blue-300 text-sm">
                💡 <strong>Next Steps:</strong> Connect an Arweave wallet to
                automatically create and sign a test transaction
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
