import type { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect, useMemo } from "react";

import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Leaderboard from "@/components/Leaderboard";
import { getLeaderboard, LeaderboardItem } from "@/lib/clicker-anchor-client";

import {
  airdrop,
  getCurrentGame,
  saveClick,
} from "../lib/clicker-anchor-client";

import FAQItem from "@/components/FaqItem";
import ExternalLink from "@/components/ExternalLink";

const Home: NextPage = () => {
  const metaTitle = "DEROULTTE";
  const metaDescription =
    "DEROULTTE is an open-source game being developed to learn and demonstrate techniques for integrating with Solana programs and Solana NFTs.";
  const metaAbsoluteUrl = "https://solana-clicker.netlify.app/";
  const metaImageUrl = "https://solana-clicker.netlify.app/home.png";

  const [clicks, setClicks] = useState(0);
  const [effect, setEffect] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isGameReady, setIsGameReady] = useState(false);
  const [solanaExplorerLink, setSolanaExplorerLink] = useState("");
  const [gameError, setGameError] = useState("");
  const [gameAccountPublicKey, setGameAccountPublicKey] = useState("");
  const [leaders, setLeaders] = useState<LeaderboardItem[]>([]);

  const { connected } = useWallet();
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallet = useAnchorWallet();

  async function handleClick() {
    setGameError("");
    if (wallet) {
      try {
        await saveClick({ wallet, endpoint, gameAccountPublicKey });
        setClicks(clicks + 1);
        setEffect(true);
      } catch (e) {
        if (e instanceof Error) {
          setGameError(e.message);
        }
      }
    }
  }

  useEffect(() => {
    async function initGame() {
      if (wallet) {
        const gameState = await getCurrentGame({ wallet, endpoint });
        setIsGameReady(connected && gameState.isReady);
        setClicks(gameState.clicks);
        setGameAccountPublicKey(gameState.gameAccountPublicKey);
        setSolanaExplorerLink(
          `https://explorer.solana.com/address/${gameAccountPublicKey}/anchor-account?cluster=${network}`
        );
        setGameError(gameState.errorMessage);
      } else {
        setIsGameReady(false);
        setClicks(0);
        setGameAccountPublicKey("");
        setSolanaExplorerLink("");
        setGameError("");
      }
    }
    setIsConnected(connected);
    initGame();
  }, [connected, endpoint, network, wallet, gameAccountPublicKey]);

  // airdrop test SOL if on devnet and player has less than 1 test SOL
  useEffect(() => {
    async function fetchTestSol(): Promise<void> {
      if (wallet) {
        try {
          await airdrop({ wallet, endpoint });
        } catch (e) {
          if (e instanceof Error) {
            console.error(`Unable to airdrop 1 test SOL due to ${e.message}`);
          }
        }
      }
    }
    fetchTestSol();
  }, [connected, wallet, endpoint]);

  // For leaderboard, persist expensive "retrieve all game data" via useState()
  useEffect(() => {
    (async function getLeaderboardData() {
      if (wallet) {
        setLeaders(await getLeaderboard({ wallet, endpoint }));
      }
    })();
  }, [wallet, endpoint]);

  return (
    <div className="flex items-center flex-col sm:p-4 p-1">
      <Head>
        <title>{metaTitle}</title>
        <meta name="title" content={metaTitle} />
        <meta name="description" content={metaDescription} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:url" content={metaAbsoluteUrl} />
        <meta property="og:image" content={metaImageUrl} />
        <meta property="og:description" content={metaDescription} />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={metaImageUrl} />
      </Head>

      <div className="navbar mb-2 bg-base-300 text-base-content rounded-box sm:p-4">
        <div className="flex-1 text-xl font-mono">__ <b>DEROULETTE</b> __</div>
        <div>
          <WalletMultiButton />
        </div>
        <div className="badge badge-accent badge-outline flex-none XXXml-2">
          <a href="#devnet">Connected</a>
        </div>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="p-4 flex flex-col items-center gap-3">
            <div className="flex flex-col items-center p-2">
              {isGameReady && gameError && (
                <div className="alert alert-error shadow-lg">
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current flex-shrink-0 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{gameError}</span>
                  </div>
                </div>
              )}
              {isGameReady && (
                <div
                  onAnimationEnd={() => {
                    setEffect(false);
                  }}
                  className={`${effect && "animate-wiggle"}`}
                >
                  {clicks} <b>CLICKS</b> 
                </div>
              )}
            </div>
            <button
              disabled={!isGameReady}
              onClick={() => {
                handleClick();
              }}
              className="btn btn-lg bg-primary hover:bg-primary-focus text-primary-content border-primary-focus border-4 h-48 w-48 rounded-full"
            >
              Click Me
            </button>

            {isGameReady && (
              <div>
              </div>
            )}

            {!isConnected && (
              <p className="p-2 text-center">
                To play game, please click{" "}
                <span className="font-bold">Select Wallet</span> above to choose
                your Solana wallet.
              </p>
            )}

            <p>
              {" "}
              <a className="underline" href="#faqs">
                
              </a>{" "}
            </p>

            {!isGameReady && isConnected && (
              <div>
                <p className="p-2">Game initializing...</p>
              </div>
            )}
          </div>

          {wallet && (
            <Leaderboard
              leaders={leaders}
              walletPublicKeyString={wallet.publicKey.toBase58()}
              clicks={clicks}
            />
          )}
        </div>
      </div>

    </div>
  );
};

export default Home;
