import { createContext, useContext, useState } from 'react';
import { Icon } from "semantic-ui-react";
// import { useState } from 'react';
import { ethers } from 'ethers';
import { getWalletErrorMessage } from '../../utils/walletErrors';
import { toast } from 'sonner';
import { ConnectWalletButtonProps } from '../../types/trading';
import { TradingPanel } from './TradingPanel';
import { Sidebar } from './Sidebar';

const AuthContext = createContext<{
  account: string | null;
  setAccount: (account: string | null) => void;
}>({
  account: null,
  setAccount: () => {},
});

export const useAuth = () => useContext(AuthContext);

// export const ConnectWalletButton = ({ isNavbar }) => {
//   const [account, setAccount] = useState<string | null>(null);

//   return (
//     <AuthContext.Provider value={{ account, setAccount }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };



export const ConnectWalletButton: React.FC<ConnectWalletButtonProps & { className?: string, isConnected?: boolean, isIconConnected?: boolean }> = ({ className, isConnected, isIconConnected }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask Not Found', {
        description: 'Please install MetaMask to connect.',
        duration: 4000,
        style: {
          background: 'rgba(28, 28, 40, 0.9)',
          backdropFilter: 'blur(8px)',
        },
      });
      return;
    }

    try {
      setLoading(true);
      await checkWalletConnection();

      if (!account) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        toast.success('Wallet Connected Successfully!', {
          description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
          duration: 4000,
          style: {
            background: 'rgba(28, 28, 40, 0.9)',
            backdropFilter: 'blur(8px)',
          },
        });
      }
    } catch (error) {
      console.log('Wallet error:', error);
      const errorMessage = getWalletErrorMessage(error);

      toast.error('Connection Failed', {
        description: errorMessage,
        duration: 4000,
        style: {
          background: 'rgba(28, 28, 40, 0.9)',
          backdropFilter: 'blur(8px)',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);

    toast.info('Wallet Disconnected', {
      description: 'Your wallet has been disconnected.',
      duration: 4000,
      style: {
        background: 'rgba(28, 28, 40, 0.9)',
        backdropFilter: 'blur(8px)',
      },
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <button
      type='button'
      onClick={account ? disconnectWallet : connectWallet}
      disabled={loading}
      className={`${className}
        group relative px-6 py-2.5 rounded-[20px] flex items-center gap-3 text-base font-medium w-full sm:w-auto justify-center overflow-hidden 
        transition-all duration-300
        ${loading
          ? 'cursor-not-allowed opacity-75'
          : 'hover:-translate-y-1 hover:translate-x-1 hover:shadow-[0_4px_0_0_rgba(30,58,138,0.8)]'
        }
      `}
    >
      {/* Glass background */}
      <div className={`
        absolute inset-0 bg-gradient-to-r from-black/80 to-blue-900/50 backdrop-blur-md rounded-[20px]
        transition-opacity duration-300
        ${loading ? 'opacity-50' : 'opacity-100'}
      `} />

      {/* Hover gradient overlay */}
      <div className={`
        absolute inset-0 opacity-0 transition-opacity duration-300 bg-gradient-to-r from-blue-900/30 to-blue-800/30 backdrop-blur-sm rounded-[20px]
        ${!loading && 'group-hover:opacity-100'}
      `} />

      {/* Content */}
      <div className="relative flex justify-center z-10">
        {loading ? (
          <div className="w-5 h-5 relative mr-2 mt-0.5">
            <div className="w-full h-full rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
          </div>
        ) : (
          <Icon
            name={account ? (isIconConnected ? 'check circle' : 'money') : "ethereum"}
            className={`text-white md:text-lg text-sm ${account ? (isIconConnected ? "pb-0.5 sm:pb-5" : "pr-6 pt-0.5 sm:pt-0") : " pr-0 pt-0"}`}
          />
        )}
        <span className={`text-white sm:inline md:mt-0.5 ${isIconConnected ? "hidden" : "pr-0"}`}>
          {loading ? 'Connecting...' : account ? (isConnected ? formatAddress(account) : 'Enter Amount') : 'Connect Wallet'}
        </span>
      </div>

      {/* Glass border */}
      <div className={`
        absolute inset-0 rounded-[20px] border border-blue-500/50 bg-white/5 backdrop-blur-sm transition-all duration-300
        ${loading ? 'opacity-50' : 'opacity-100'}
      `} />

      {/* Shine effect */}
      <div className={`
        absolute inset-0 opacity-0 transition-all duration-300 rounded-[20px]
        ${!loading && 'group-hover:opacity-100'}
      `}>
        <div className="absolute inset-[-100%] bg-gradient-to-r from-transparent via-blue-500/10 to-transparent group-hover:animate-[shine_1.5s_ease-in-out]" />
      </div>
    </button>
  );
}; 

export const MyComponent = () => {
  const [account, setAccount] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ account, setAccount }}>
      <Sidebar />
      <TradingPanel />
    </AuthContext.Provider>
  );
};