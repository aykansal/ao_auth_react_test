"use client";

import {
  connectWallet,
  getArnsRecord,
  getWalletDetails,
  type WalletDetails,
} from "../lib/arkit";
import { useState } from "react";

const Home = () => {
  const [walletDetails, setWalletDetails] = useState<WalletDetails>();
  const [arns, setArns] = useState();
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Arweave Demo</h1>
          <p className="text-gray-400 text-lg">
            Connect your wallet and explore Arweave ecosystem
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          {walletDetails?.walletAddress && (
            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-3">
                💼 Wallet Details
              </h3>
              <div className="bg-gray-800 p-4 rounded-lg">
                <span className="text-gray-400">Address: </span>
                <span className="text-green-400 font-mono break-all">
                  {walletDetails.walletAddress}
                </span>
              </div>
            </div>
          )}

          {arns && (
            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-3">
                🌐 ArNS Record
              </h3>
              <div className="bg-gray-800 p-4 rounded-lg">
                <pre className="text-green-400 text-sm overflow-auto">
                  {JSON.stringify(arns, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            className="btn-primary"
            onClick={async () => {
              await connectWallet();
              const details = await getWalletDetails();
              console.log(details);
              // setWalletDetails(details);
            }}
          >
            🔗 Connect Wallet
          </button>
          <button
            className="btn-secondary"
            onClick={async () =>
              await getWalletDetails().then((data) => {
                setWalletDetails(data);
              })
            }
          >
            📋 Get Details
          </button>
          <button
            className="btn-secondary"
            onClick={async () =>
              await getArnsRecord({ ARNS_NAME: "aykansal" }).then((data) => {
                // @ts-expect-error ignore
                setArns(data);
              })
            }
          >
            🌐 Get ArNS
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
