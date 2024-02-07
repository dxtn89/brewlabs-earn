import { useContext } from "react";
import Link from "next/link";
import { Bars3Icon } from "@heroicons/react/24/outline";
import Notification from "@components/Notification";
import { SwapContext } from "../../../../contexts/SwapContext";

const SubNav = () => {
  const { swapTab, setSwapTab, setAddLiquidityStep, swapFeeData }: any = useContext(SwapContext);
  const { collectiblePairs } = swapFeeData;

  const subNavItems = [
    {
      tabKey: 0,
      component: (
        <>
          <span className="dark:text-primary">Brew</span>Swap
          <img src="/images/logo-vector.svg" className="ml-3" alt="Brew swap" />
        </>
      ),
    },

    {
      tabKey: 1,
      component: (
        <>
          Liquidity tools
          <Notification count={collectiblePairs.length} />
        </>
      ),
    },
  ];

  return (
    <div className="flex items-center">
      <div className="dropdown-hover dropdown">
        <div tabIndex={0} role="button" className="btn m-1">
          <Bars3Icon className="h-5 w-5" />
        </div>

        <ul tabIndex={0} className="dropdown-content menu z-[1] w-48 space-y-2 rounded-xl bg-base-100 p-1 shadow">
          <li>
            <button type="button" onClick={() => setSwapTab(0)} className={`px-4 ${swapTab === 0 && "bg-gray-800"}`}>
              {subNavItems[0].component}
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                setSwapTab(1);
                setAddLiquidityStep("default");
              }}
              className={`px-4 ${swapTab === 1 && "bg-gray-800"}`}
            >
              {subNavItems[1].component}
            </button>
          </li>
          <li>
            <Link href="/tradingPairs" className={`px-4 ${swapTab === 2 ? "bg-gray-800" : ""}`}>
              Pools & analytics
            </Link>
          </li>
        </ul>
      </div>
      <div className=" -ml-2 flex h-12 items-center whitespace-nowrap rounded-r-lg border-2 border-gray-800/20 px-4 py-2 text-sm">
        {subNavItems[swapTab].component}
      </div>
    </div>
  );
};

export default SubNav;
