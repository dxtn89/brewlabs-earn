import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from "redux-persist";
import { createGlobalState } from "react-hooks-global-state";
import { BridgeToken, NetworkConfig } from "config/constants/types";

import { updateVersion } from "./global/actions";

import deploy from "./deploy";
import farms from "./farms";
import pools from "./pools";
import indexes from "./indexes";
import nfts from "./nfts";

import burn from "./burn/reducer";
import lists from "./lists/reducer";
import mint from "./mint/reducer";
import multicall from "./multicall/reducer";
import swap from "./swap/reducer";
import transactions from "./transactions/reducer";
import user from "./user/reducer";
import prices from "./prices";
import storage from "./storage";
import zap from "./zap";
import home from "./home";
import chart from "./chart";
import wallet from "./wallet";
import pair from "./pair";

const PERSISTED_KEYS: string[] = ["user", "transactions"];

const persistConfig = {
  key: "primary",
  whitelist: PERSISTED_KEYS,
  blacklist: ["profile"],
  storage,
  version: 1,
};

const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({
    farms,
    pools,
    indexes,
    nfts,
    deploy,
    zap,
    user,
    lists,
    prices,
    multicall,
    swap,
    transactions,
    burn,
    mint,
    home,
    chart,
    wallet,
    pair,
  })
);

// eslint-disable-next-line import/no-mutable-exports
let store: ReturnType<typeof makeStore>;

export function makeStore(preloadedState = undefined) {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      process.env.NODE_ENV !== "production"
        ? getDefaultMiddleware({
            thunk: true,
            serializableCheck: {
              ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
          }) // .concat(logger)
        : getDefaultMiddleware({
            thunk: true,
            serializableCheck: {
              ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
          }),
    devTools: process.env.NODE_ENV === "development",
    preloadedState,
  });
}

export const initializeStore = (preloadedState: any = undefined) => {
  let _store = store ?? makeStore(preloadedState);

  // After navigating to a page with an initial Redux state, merge that state
  // with the current state in the store, and create a new store
  if (preloadedState && store) {
    _store = makeStore({
      ...store.getState(),
      ...preloadedState,
    });
    // Reset the current store
    // store = undefined;
  }

  // For SSG and SSR always create a new store
  if (typeof window === "undefined") return _store;

  // Create the store once in the client
  if (!store) {
    store = _store;
  }

  return _store;
};

store = initializeStore();

/**
 * @see https://redux-toolkit.js.org/usage/usage-with-typescript#getting-the-dispatch-type
 */
export type AppDispatch = typeof store.dispatch;
export type AppState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => useDispatch<any>();
// export const useAppDispatch = () => useDispatch();

export default store;

export const persistor = persistStore(store, undefined, () => {
  store.dispatch(updateVersion());
});

export function useStore(initialState: any) {
  return useMemo(() => initializeStore(initialState), [initialState]);
}

const userBridgeNetworkInitial = {
  id: 0,
  name: "",
  image: "",
};

const userState: {
  userPoolsStakeOnly: boolean;
  userBridgeTo: NetworkConfig;
  userBridgeFrom: NetworkConfig;
  userBridgeFromToken: BridgeToken | undefined;
  userBridgeLocked: boolean;
  userBridgeAmount: number;
} = {
  userPoolsStakeOnly: false,
  userBridgeTo: userBridgeNetworkInitial,
  userBridgeFrom: userBridgeNetworkInitial,
  userBridgeFromToken: undefined,
  userBridgeLocked: false,
  userBridgeAmount: 0,
};

// Create a single global state object
const initialState = {
  ...userState,
  modalIsOpen: false,
  mobileNavOpen: false,
  userSidebarOpen: 0,
  userSidebarContent: null,
  sessionChainId: undefined as any,
};

const { useGlobalState, setGlobalState } = createGlobalState(initialState);

export { useGlobalState, setGlobalState };
