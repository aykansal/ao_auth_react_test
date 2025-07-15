import {
  ConnectButton,
  useActiveAddress,
  useConnection,
} from "@arweave-wallet-kit/react";
import { fixConnection, WAuthProviders } from "@wauth/strategy";
import { useEffect, useState } from "react";
import { getActiveWAuthProvider, getStrategy } from "../lib/strategy";

export function Wauth() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [connectedWallets, setConnectedWallets] = useState<any[]>([]);
  const [isLoadingWallets, setIsLoadingWallets] = useState(false);
  const [isAddingWallet, setIsAddingWallet] = useState(false);

  const address = useActiveAddress();
  const { connected, disconnect } = useConnection();

  const githubStrategy = getStrategy(WAuthProviders.Github);
  githubStrategy.onAuthDataChange((data) => {
    console.log("[app] auth data changed", data);
    setAccessToken(data.accessToken);
    setEmail(data.email);
  });
  const googleStrategy = getStrategy(WAuthProviders.Google);
  googleStrategy.onAuthDataChange((data) => {
    console.log("[app] auth data changed", data);
    setAccessToken(data.accessToken);
    setEmail(data.email);
  });
  const discordStrategy = getStrategy(WAuthProviders.Discord);
  discordStrategy.onAuthDataChange((data) => {
    console.log("[app] auth data changed", data);
    setAccessToken(data.accessToken);
    setEmail(data.email);
  });

  // Function to fetch connected wallets
  const fetchConnectedWallets = async () => {
    try {
      setIsLoadingWallets(true);
      const strategy = getStrategy(getActiveWAuthProvider());
      const wallets = await strategy.getConnectedWallets();
      setConnectedWallets(wallets || []);
    } catch (error) {
      console.error("Error fetching connected wallets:", error);
      setConnectedWallets([]);
    } finally {
      setIsLoadingWallets(false);
    }
  };

  // Function to add a connected wallet
  const addConnectedWallet = async () => {
    try {
      setIsAddingWallet(true);

      if (!window.arweaveWallet) {
        alert(
          "No Arweave wallet found. Please install an Arweave wallet extension."
        );
        return;
      }

      await window.arweaveWallet.disconnect();

      // Connect to the wallet with required permissions
      await window.arweaveWallet.connect([
        "ACCESS_ADDRESS",
        "ACCESS_PUBLIC_KEY",
        "SIGNATURE",
      ]);

      const strategy = getStrategy(getActiveWAuthProvider());
      const result = await strategy.addConnectedWallet(window.arweaveWallet);

      console.log("Wallet connected:", result);

      // Refresh the connected wallets list
      await fetchConnectedWallets();

      alert("Wallet connected successfully!");
    } catch (error) {
      console.error("Error adding connected wallet:", error);
      alert(`Failed to connect wallet: ${error}`);
    } finally {
      setIsAddingWallet(false);
    }
  };

  // Function to remove a connected wallet
  const removeConnectedWallet = async (
    walletId: string,
    walletAddress: string
  ) => {
    try {
      const confirmRemove = confirm(
        `Are you sure you want to disconnect wallet ${walletAddress.slice(
          0,
          8
        )}...${walletAddress.slice(-8)}?`
      );
      if (!confirmRemove) return;

      const strategy = getStrategy(getActiveWAuthProvider());
      await strategy.removeConnectedWallet(walletId);

      console.log("Wallet disconnected:", walletId);

      // Refresh the connected wallets list
      await fetchConnectedWallets();

      alert("Wallet disconnected successfully!");
    } catch (error) {
      console.error("Error removing connected wallet:", error);
      alert(`Failed to disconnect wallet: ${error}`);
    }
  };

  // without this, on refresh the wallet shows the connected UI even if its disconnected
  useEffect(
    () => fixConnection(address, connected, disconnect),
    [address, connected, disconnect]
  );

  useEffect(() => {
    if (!connected) {
      setAccessToken(null);
      setEmail(null);
      setConnectedWallets([]);
    } else {
      // Fetch connected wallets when user connects
      fetchConnectedWallets();
    }
  }, [connected]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <main>
          <div className="mb-8 flex justify-center">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg">
              <ConnectButton />
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="card">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <span className="mr-3">🔗</span>
                Wallet Connection
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <span className="block text-gray-400 text-sm font-medium mb-2">
                    Address:
                  </span>
                  <span className="font-mono text-green-400 break-all">
                    {address
                      ? `${address.slice(0, 12)}...${address.slice(-12)}`
                      : "Not connected"}
                  </span>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <span className="block text-gray-400 text-sm font-medium mb-2">
                    Status:
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      connected
                        ? "bg-green-900 text-green-300 border border-green-700"
                        : "bg-red-900 text-red-300 border border-red-700"
                    }`}
                  >
                    {connected ? "🟢 Connected" : "🔴 Disconnected"}
                  </span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <span className="mr-3">🔐</span>
                Authentication Data
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <span className="block text-gray-400 text-sm font-medium mb-2">
                    Email:
                  </span>
                  <span className="text-blue-400">
                    {email || "Not available"}
                  </span>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <span className="block text-gray-400 text-sm font-medium mb-2">
                    Access Token:
                  </span>
                  <span className="font-mono text-yellow-400 break-all">
                    {accessToken
                      ? `${accessToken.slice(0, 30)}...`
                      : "Not available"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {connected && (
            <div className="card mt-8">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <span className="mr-3">💼</span>
                Connected Wallets
              </h3>
              <p className="text-gray-400 mb-6">
                These are wallets that are connected to your account
              </p>

              <div className="flex flex-wrap gap-4 mb-6">
                <button
                  onClick={addConnectedWallet}
                  disabled={isAddingWallet}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>
                    {isAddingWallet ? "Adding..." : "Connect Window Wallet"}
                  </span>
                </button>
                <button
                  onClick={fetchConnectedWallets}
                  disabled={isLoadingWallets}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <span>🔄</span>
                  <span>{isLoadingWallets ? "Loading..." : "Refresh"}</span>
                </button>
              </div>

              <div className="space-y-4">
                {isLoadingWallets ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="text-gray-400 mt-2">
                      Loading connected wallets...
                    </p>
                  </div>
                ) : connectedWallets.length > 0 ? (
                  connectedWallets.map((wallet, index) => (
                    <div
                      key={wallet.id || index}
                      className="bg-gray-800 border border-gray-700 rounded-lg p-6"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400 text-sm">
                              Address:
                            </span>
                            <span className="font-mono text-green-400">
                              {wallet.address
                                ? `${wallet.address.slice(
                                    0,
                                    12
                                  )}...${wallet.address.slice(-12)}`
                                : "Unknown"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400 text-sm">
                              Connected:
                            </span>
                            <span className="text-blue-400">
                              {wallet.created
                                ? new Date(wallet.created).toLocaleDateString()
                                : "Unknown"}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            removeConnectedWallet(wallet.id, wallet.address)
                          }
                          className="btn-danger self-start lg:self-center"
                        >
                          ❌ Disconnect
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="mb-4">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-400 mb-2">
                      No connected wallets found.
                    </p>
                    <p className="text-gray-500 text-sm">
                      Click "Connect Window Wallet" to connect your first
                      wallet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
