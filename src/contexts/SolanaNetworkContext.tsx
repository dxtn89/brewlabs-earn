import React, { useState } from "react";
import { useSlowRefreshEffect } from "@hooks/useRefreshEffect";


const SolanaNetworkContext: any = React.createContext({ userData: {}, fetchUserData: () => { }, changeAvatar: () => { } });
const instance = axios.create({ baseURL: API_URL });

const SolanaNetworkContextProvider = ({ children }: any) => {
  const { address: account } = useAccount();
  const [userData, setUserData] = useState<any>({});

  async function fetchUserData() {
    try {
      const result = await instance.post("/getuserinfo", { userId: account.toLowerCase() });
      if (result.data) setUserData(result.data);
      else setUserData({});
    } catch (e) {
      console.log(e);
    }
  }

  async function changeAvatar(deployer: string, logo: string) {
    try {
      const result = await instance.post("/setuserdeployer", {
        userId: account.toLowerCase(),
        deployer: deployer.toLowerCase(),
        logo,
        name: userData.name ?? "Brewlabs",
      });
      fetchUserData();
    } catch (e) {
      console.log(e);
    }
  }
  useSlowRefreshEffect(() => {
    if (!account) return;
    fetchUserData();
  }, [account]);
  return <SolanaNetworkContext.Provider value={{ userData, fetchUserData, changeAvatar }}>{children}</SolanaNetworkContext.Provider>;
};

export { SolanaNetworkContext, SolanaNetworkContextProvider };
