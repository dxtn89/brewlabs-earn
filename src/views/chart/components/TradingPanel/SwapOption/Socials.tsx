import { FlagSVG, LockSVG, PlusSVG, TelegramSVG, WebSiteSVG, checkCircleSVG } from "@components/dashboard/assets/svgs";
import { BridgeToken } from "config/constants/types";
import { addTokenToMetamask, getExplorerLink } from "lib/bridge/helpers";
import Link from "next/link";
import { getExplorerLogo } from "utils/functions";
import { useAccount } from "wagmi";

export default function Socials({ selectedPair, marketInfos }) {
  const { connector, address: account } = useAccount();
  // const account = "0xaE837FD1c51705F3f8f232910dfeCB9180541B27";

  const socials = [
    {
      icon: (
        <img
          src={selectedPair && getExplorerLogo(selectedPair.chainId)}
          alt={""}
          className="h-[18px] w-[18px] rounded-full border border-white bg-white"
        />
      ),
      href: selectedPair && getExplorerLink(selectedPair.chainId, "token", selectedPair.baseToken.address),
    },
    { icon: LockSVG, isActive: false },
    { icon: checkCircleSVG, isActive: marketInfos?.audit?.codeVerified },
    { icon: WebSiteSVG, href: marketInfos?.links?.website ?? "#" },
    { icon: FlagSVG, href: marketInfos?.community ?? "#" },
    { icon: TelegramSVG, href: marketInfos?.links?.telegram ?? "#" },
    {
      icon: <img src={"/images/wallets/metamask.png"} alt={""} className="h-[18px] w-[18px] rounded-full" />,
      action: true,
    },
  ];

  function onAddToMetamask() {
    if (!marketInfos || !marketInfos.address) return;
    addTokenToMetamask(connector, {
      address: marketInfos.address,
      decimals: marketInfos.decimals,
      symbol: marketInfos.symbol,
    } as BridgeToken);
  }

  return (
    <div>
      <div className="primary-shadow mt-2 w-full rounded-[6px] bg-[#B9B8B80D] p-3 font-roboto text-[#FFFFFFBF]">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-bold">Description</div>
          {marketInfos?.audit?.is_contract_renounced ? (
            <div className="rounded-[12px] bg-[#3AFDB7] p-[1px_14px] font-roboto text-[10px] font-bold text-black">
              Ownership renounced
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="line-clamp-[7] overflow-hidden text-ellipsis text-xs">{marketInfos?.info?.description}</div>
        <div className="mb-2 mt-4 flex">
          {socials.map((social: any, i) => {
            if (social.href === "#") return;
            return (
              <a
                key={i}
                className={`mr-1.5 cursor-pointer ${
                  social.href ? "!text-white hover:scale-[1.1]" : social.isActive ? "!text-green" : "!text-tailwind"
                } primary-shadow transition [&>svg]:!h-[18px] [&>svg]:!w-[18px]`}
                target="_blank"
                href={social.href}
                onClick={() => social.action && onAddToMetamask()}
              >
                {social.icon}
              </a>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex justify-end text-[#FFFFFFBF]">
        <a
          href={"https://t.me/MaverickBL"}
          className="mr-2.5 flex cursor-pointer items-center text-xs hover:text-white"
          target="_blank"
        >
          <div className="-mt-1 mr-1 text-tailwind">{PlusSVG}</div>
          <div>UPDATE DETAILS</div>
        </a>
        <Link href={"/communities"} className="flex cursor-pointer items-center text-xs hover:text-white">
          <div className="-mt-1 mr-1 text-tailwind">{PlusSVG}</div>
          <div>ADD COMMUNITY</div>
        </Link>
      </div>
    </div>
  );
}
