/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import clsx from "clsx";
import Link from "next/link";
import { useMediaQuery } from "react-responsive";

import { CommunityContext } from "contexts/CommunityContext";
import { navigationData, navigationExtraData } from "config/constants/navigation";
import { setGlobalState } from "state";

import Notification from "@components/Notification";
import Soon from "@components/Soon";

import LogoIcon from "../LogoIcon";
import DynamicHeroIcon, { IconName } from "../DynamicHeroIcon";
import ConnectWallet from "../wallet/ConnectWallet";
import { usePools } from "state/pools/hooks";
import { useFarms } from "state/farms/hooks";
import { useFarms as useZaps } from "state/zap/hooks";
import { useAccount } from "wagmi";
import { useIndexes } from "state/indexes/hooks";

const Navigation = ({ slim }: { slim?: boolean }) => {
  const router = useRouter();

  const { newProposalCount }: any = useContext(CommunityContext);
  const { address: account } = useAccount();

  const { pools } = usePools();
  const { data: farms } = useFarms();
  const { data: zaps } = useZaps(account);
  const { indexes } = useIndexes();

  const indexCount = indexes
    .filter((data) => data.visible)
    .filter((data) => +data.userData?.stakedUsdAmount > 0).length;

  const allPools = [...pools.filter((p) => p.visible), ...farms.filter((p) => p.visible), ...zaps];
  const investCount = allPools.filter((data) => data.userData?.stakedBalance.gt(0)).length;

  // Close the mobile navigation when navigating
  useEffect(() => {
    router.events.on("routeChangeStart", () => setGlobalState("mobileNavOpen", false));
  }, [router.events]);

  const isMd = useMediaQuery({ query: "(max-height: 768px)" });

  return (
    <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-zinc-900">
      <div className={`flex flex-1 flex-col pb-4 pt-5 ${!slim ? "overflow-hidden" : ""}`}>
        <div className={`flex flex-shrink-0 items-center px-4`}>
          <LogoIcon classNames="w-12 text-dark dark:text-brand" />
        </div>
        <nav
          className={`mt-5 flex flex-1 flex-col justify-between ${!slim ? "overflow-hidden" : ""}`}
          aria-label="Sidebar"
        >
          <div className={`flex-1 space-y-1 px-2 font-brand tracking-wider ${!slim ? "overflow-y-scroll" : ""}`}>
            {navigationData.map((item) => (
              <Link href={item.href} passHref key={item.name} className="flex flex-col">
                <motion.div
                  layout="position"
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  data-tip={item.name}
                  className={clsx(
                    item.href === router.pathname
                      ? "bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-400"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-500 dark:hover:bg-gray-800",
                    "group tooltip tooltip-right flex items-center rounded-md px-2 py-2 text-sm font-medium"
                  )}
                >
                  {item.svg ? (
                    <div
                      className={clsx(
                        slim
                          ? "flex h-5 w-5 scale-[85%] items-center justify-center text-gray-500 dark:text-gray-400"
                          : "mr-3 flex h-7 w-7 items-center justify-center text-gray-600 group-hover:text-gray-500 dark:text-gray-500 [&>*:first-child]:!h-[22px] [&>*:first-child]:!w-[22px]"
                      )}
                    >
                      {item.svg}
                    </div>
                  ) : (
                    <DynamicHeroIcon
                      icon={item.icon as IconName}
                      className={clsx(
                        slim
                          ? "h-5 w-5 text-gray-500 dark:text-gray-400"
                          : "mr-3 h-7 w-7 text-gray-600 group-hover:text-gray-500 dark:text-gray-500"
                      )}
                    />
                  )}
                  <span className={`${clsx(slim ? "sr-only" : "relative")}`}>
                    {item.name}
                    {item.isBeta ? (
                      <Soon text={"Beta"} className="!-right-12 !-top-3 !rounded !px-0.5 !py-0.5 !text-[10px]" />
                    ) : item.isNew ? (
                      <Soon text={"New"} className="!-right-12 !-top-3 !rounded !px-0.5 !py-0.5 !text-[10px]" />
                    ) : (
                      ""
                    )}
                    {item.name === "Communities" ? (
                      <Notification count={newProposalCount} className="-right-7 -top-1" />
                    ) : (
                      ""
                    )}

                    {item.name === "Invest" ? <Notification count={investCount} className="-right-8 -top-1" /> : ""}
                    {item.name === "Indexes" ? <Notification count={indexCount} className="-right-8 -top-1" /> : ""}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
          <div
            className={clsx(
              slim ? "items-center p-2" : "px-5",
              `flex ${isMd && !slim ? "mx-auto w-full max-w-[200px] justify-between" : "flex-col justify-end"}`
            )}
          >
            {navigationExtraData.map((item) => (
              <a
                className="mb-2 flex items-center gap-2 text-sm"
                href={item.href}
                target={"_blank"}
                rel={"noreferrer"}
                key={item.name}
              >
                <div>
                  {item.svg ? (
                    <div
                      className={`flex h-5 w-5 flex-shrink-0 scale-[90%] items-center justify-center text-gray-600 hover:text-primary`}
                    >
                      {item.svg}
                    </div>
                  ) : (
                    <DynamicHeroIcon icon={item.icon} className={`h-5 w-5  flex-shrink-0 hover:text-primary`} />
                  )}
                </div>
                <span className={isMd ? "hidden" : clsx(slim && "sr-only")}>
                  Visit&nbsp;
                  <span className="dark:text-primary">{item.name}</span>
                </span>
              </a>
            ))}
          </div>
        </nav>
      </div>

      {/* {!slim && <ThemeSwitcher />} */}
      {!slim && <ConnectWallet />}
    </div>
  );
};

export default Navigation;
