/* eslint-disable consistent-return */
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useAccount, useNetwork, useSwitchNetwork as useSwitchNetworkWallet } from "wagmi";

import { ConnectorNames } from "config/constants/wallets";
import replaceBrowserHistory from "utils/replaceBrowserHistory";
import { setGlobalState } from "state";

import { useSolanaNetwork } from "contexts/SolanaNetworkContext";

export function useSwitchNetworkLocal() {
  const { query } = useRouter();

  return useCallback((chainId: number) => {
    if (+(query?.chainId ?? 0) === chainId) return;
    setGlobalState("sessionChainId", chainId);
    replaceBrowserHistory("chainId", chainId);
    window.location.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function useSwitchNetworkSolana() {
  return useCallback((chainId: number) => {
    setGlobalState("sessionChainId", chainId);
    replaceBrowserHistory("chainId", chainId);
    window.location.reload();
  }, []);
}

export function useSwitchNetwork() {
  const [loading, setLoading] = useState(false);
  const {
    switchNetworkAsync: _switchNetworkAsync,
    isLoading: _isLoading,
    switchNetwork: _switchNetwork,
    ...switchNetworkArgs
  } = useSwitchNetworkWallet();

  const { isConnected: isEVMConnected, connector } = useAccount();
  const { chain: EVMChain } = useNetwork();

  const switchNetworkLocal = useSwitchNetworkLocal();
  const switchNetworkSolana = useSwitchNetworkSolana();
  const isLoading = _isLoading || loading;

  const switchNetworkAsync = useCallback(
    async (chainId: number) => {
      if (isEVMConnected && typeof _switchNetworkAsync === "function") {
        if (isLoading) return;
        setLoading(true);
        return _switchNetworkAsync(chainId)
          .then((c) => {
            // well token pocket
            if (window.ethereum?.["isTokenPocket"] === true) {
              switchNetworkLocal(chainId);
              window.location.reload();
            }
            return c;
          })
          .catch(() => {
            // TODO: review the error
            toast.error("Error connecting, please retry and confirm in wallet!");
          })
          .finally(() => setLoading(false));
      }
      return new Promise(() => {
        switchNetworkLocal(chainId);
      });
    },
    [isEVMConnected, _switchNetworkAsync, isLoading, setLoading, switchNetworkLocal]
  );

  const { isSolanaNetwork, setIsSolanaNetwork } = useSolanaNetwork();
  const switchNetwork = useCallback(
    (chainId: number) => {
      if (chainId === 900 || chainId === 901) {
        setIsSolanaNetwork(true);
        switchNetworkSolana(chainId);
        return;
      } else {
        setIsSolanaNetwork(false);
        if (chainId === EVMChain.id) {
          setGlobalState("sessionChainId", chainId);
          replaceBrowserHistory("chainId", chainId);
        }
        else if (isEVMConnected && typeof _switchNetwork === "function") {
          return _switchNetwork(chainId);
        }
        return switchNetworkLocal(chainId);
      }
    },
    [_switchNetwork, isEVMConnected, switchNetworkLocal, setIsSolanaNetwork, switchNetworkSolana, EVMChain]
  );

  const canSwitch = useMemo(
    () =>
      isEVMConnected
        ? !!_switchNetworkAsync &&
          connector?.id !== ConnectorNames.WalletConnect &&
          !(
            typeof window !== "undefined" &&
            // @ts-ignore // TODO: add type later
            (window.ethereum?.isSafePal || window.ethereum?.isMathWallet)
          )
        : true,
    [_switchNetworkAsync, isEVMConnected, connector]
  );

  return {
    ...switchNetworkArgs,
    switchNetwork,
    switchNetworkAsync,
    isLoading,
    canSwitch,
  };
}
