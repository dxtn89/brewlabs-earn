import React, { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { DashboardSVG, NFTSVG, NavSVG, SwapSVG } from "./assets/svgs";
import Notification from "@components/Notification";
import { SwapContext } from "contexts/SwapContext";

const NavButton = ({ setValue }: { setValue?: any; value: number }) => {
  const [open, setOpen] = useState(false);
  const nav: any = useRef();
  const menus = [
    {
      icon: DashboardSVG,
      text: "Dashboard",
    },
    {
      icon: SwapSVG,
      text: "Swap",
    },
    {
      icon: NFTSVG,
      text: "NFT",
    },
  ];

  useEffect(() => {
    document.addEventListener("mouseup", function (event) {
      if (nav && nav.current && !nav.current.contains(event.target)) {
        setOpen(false);
      }
    });
  }, []);

  const { swapFeeData }: any = useContext(SwapContext);
  const { collectiblePairs } = swapFeeData;

  return (
    <div className="relative z-10 cursor-pointer" onClick={() => setOpen(!open)} ref={nav}>
      <div
        className={`${
          open ? "flex items-center justify-center border-brand text-brand" : "hover:text-white"
        }  relative rounded-full border border-transparent text-brand transition`}
      >
        {NavSVG}
        <Notification count={collectiblePairs.length} className="-right-2 top-0.5" />
      </div>
      <div
        className={`rounded-bl-0 primary-shadow absolute  -right-[7px] top-[57px] overflow-hidden  rounded-[8px_8px_8px_0px] bg-brand transition-all ${
          open ? "h-20 w-[208px]" : "h-0 w-0"
        }`}
      >
        <div className="flex px-2 py-1.5">
          {menus.map((data, i) => {
            return (
              <div
                key={i}
                className="relative flex w-[64px] flex-col items-center rounded-lg p-1.5 text-black transition hover:bg-[rgba(255,255,255,0.4)]"
                onClick={() => setValue(i)}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-black">
                  {data.icon}
                </div>
                <div className="mt-1 font-brand text-xs font-semibold leading-none">{data.text}</div>
                {i === 1 ? (
                  <Notification
                    count={collectiblePairs.length}
                    className="right-0 top-0 !bg-[#0E2130] !text-[#ffde00]"
                  />
                ) : (
                  ""
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NavButton;
