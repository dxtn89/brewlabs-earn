/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Oval } from "react-loader-spinner";

import {
  CircleRightSVG,
  InfoSVG,
  NFTFillSVG,
  QuestionSVG,
  RightSVG,
  checkCircleSVG,
  chevronLeftSVG,
} from "@components/dashboard/assets/svgs";

import { BASE_URL } from "config";
import { NFT_RARITY_NAME, rarities } from "config/constants/nft";
import { DashboardContext } from "contexts/DashboardContext";
import useActiveWeb3React from "@hooks/useActiveWeb3React";
import { useTokenApprove } from "@hooks/useApprove";
import { getNativeSybmol, handleWalletError } from "lib/bridge/helpers";
import { useAppDispatch } from "state";
import { fetchFlaskNftUserDataAsync } from "state/nfts";
import { useFlaskNftData } from "state/nfts/hooks";
import StyledButton from "views/directory/StyledButton";

import MintNFTModal from "./Modals/MintNFTModal";
import UpgradeNFTModal from "./Modals/UpgradeNFTModal";
import NFTRarityText from "@components/NFTRarityText";
import { useActiveNFT } from "./hooks/useActiveNFT";

const NFTActions = () => {
  const dispatch = useAppDispatch();
  const { chainId, account } = useActiveWeb3React();
  const router = useRouter();

  const flaskNft = useFlaskNftData(chainId);
  const { onApprove } = useTokenApprove();

  const { pending, setPending }: any = useContext(DashboardContext);

  const [mintOpen, setMintOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  function onMint() {
    setMintOpen(true);
  }

  function onUpgrade() {
    setUpgradeOpen(true);
  }

  function onGetBrewlabs() {
    window.open(`${BASE_URL}/swap?outputCurrency=${flaskNft.brewsToken.address}`, "_blank");
  }
  function onGetStableCoin() {
    window.open(`${BASE_URL}/swap?outputCurrency=${flaskNft.stableTokens[0].address}`, "_blank");
  }

  const showError = (errorMsg: string) => {
    if (errorMsg) toast.error(errorMsg);
  };

  const handleApprove = async () => {
    if (!account) {
      toast.error("Please connect wallet");
      return;
    }
    setPending(true);

    try {
      await onApprove(flaskNft.brewsToken.address, flaskNft.address);
      dispatch(fetchFlaskNftUserDataAsync(chainId, account));
      toast.success("Brewlabs was approved");
    } catch (error) {
      console.log(error);
      handleWalletError(error, showError, getNativeSybmol(chainId));
    }
    setPending(false);
  };

  const activeRarity = useActiveNFT();

  const isApproved = +flaskNft.userData?.allowances?.[0] >= +flaskNft.mintFee?.brews;

  const actions = [
    {
      name: "Approve",
      button: !isApproved ? "Approve Brewlabs" : "Approved Brewlabs",
      icon: checkCircleSVG,
      action: !isApproved ? handleApprove : () => {},
      info: "To mint a Brewlabs NFT you must approve the transfer of 3500 BREWLABS token as part of the mint fee.",
      essential: {
        align: "",
        datas: [
          {
            text: "Get Brewlabs",
            action: onGetBrewlabs,
            active: true,
          },
        ],
      },
    },
    {
      name: "Mint",
      button: "Mint Brewlabs NFT",
      icon: NFTFillSVG,
      action: onMint,
      info: "Mint a Brewlabs NFT.",
      essential: {
        align: "justify-between",
        datas: [
          {
            text: "Get stablecoin",
            action: onGetStableCoin,
            active: true,
          },
          {
            text: "Find out more",
            action: () => {
              router.push("/nft/findoutmore");
            },
            active: true,
            info: true,
          },
        ],
      },
    },
    {
      name: "Upgrade",
      button: "Upgrade Brewlabs NFT",
      icon: checkCircleSVG,
      action: onUpgrade,
      info: "Combine rarities to upgrade your Brewlabs NFT. Epic and Legendary NFT’s must be minted.",
    },
    activeRarity !== -1
      ? {
          name: "ACTIVE NFT",
          rarity: NFT_RARITY_NAME[activeRarity].toUpperCase(),
          logo: `/images/nfts/brewlabs-flask-nfts/brewlabs-flask-${NFT_RARITY_NAME[activeRarity].toLowerCase()}.png`,
          info: (
            <div>
              <div>
                <span className={`font-bold`}>
                  <NFTRarityText rarity={activeRarity}>{NFT_RARITY_NAME[activeRarity].toUpperCase()}</NFTRarityText>
                </span>{" "}
                Benefit level
              </div>
              <ul className="list-disc pl-5">
                {rarities[activeRarity < 4 ? activeRarity : 4].benefits.slice(1, 4).map((benefit, i) => (
                  <li key={i}>{benefit}</li>
                ))}
              </ul>
            </div>
          ),
          essential: {
            align: "justify-end",
            datas: [
              {
                text: "NFT Staking Info",
                action: () => {
                  router.push("/nft/nftstakinginfo");
                },
                active: true,
              },
            ],
          },
        }
      : {
          name: "NFT",
          icon: QuestionSVG,
          info: "Once your Brewlabs NFT’s are minted you can stake your NFT’s to earn native currency of the network you minted from.",
          essential: {
            align: "justify-end",
            datas: [
              {
                text: "NFT Staking Info",
                action: () => {
                  router.push("/nft/nftstakinginfo");
                },
                active: true,
              },
            ],
          },
        },
  ];

  return (
    <div className="mx-auto flex w-full  max-w-[260px] flex-wrap items-center justify-between px-4 sm:max-w-[600px] xl:sm:max-w-full xl:flex-none">
      <MintNFTModal open={mintOpen} setOpen={setMintOpen} />
      <UpgradeNFTModal open={upgradeOpen} setOpen={setUpgradeOpen} />
      {actions.map((data, i) => {
        return (
          <>
            <div key={i} className="relative mb-[164px] w-[220px]">
              <div className="absolute -top-7 left-0  flex w-full justify-between font-brand text-lg font-bold text-white">
                <div>{data.name}</div>
                <div>
                  <NFTRarityText rarity={activeRarity}>{data.rarity}</NFTRarityText>
                </div>
              </div>
              <div className="primary-shadow flex h-[180px] w-full flex-col items-center justify-center overflow-hidden rounded bg-[#B9B8B80D]">
                {data.logo ? (
                  <img src={data.logo} alt={""} className="w-full" />
                ) : (
                  <div
                    className={`mb-4 flex h-[90px] items-center justify-center ${
                      (i < 2 && isApproved) || (i === 2 && activeRarity !== -1) ? "text-primary" : "text-tailwind"
                    } [&>*:first-child]:!h-20 [&>*:first-child]:!w-20`}
                  >
                    {data.icon}
                  </div>
                )}
                {data.action ? (
                  <div className="relative">
                    <StyledButton
                      type={"primary"}
                      className={`p-[10px_12px] !text-xs !font-normal ${i === 0 && pending && "pr-[36px]"}`}
                      onClick={() => data.action()}
                      disabled={(i === 0 && (pending || isApproved)) || (i === 1 && !isApproved)}
                    >
                      {data.button}
                      {i === 0 && pending && !(mintOpen || upgradeOpen) && (
                        <div className="absolute right-2 top-0 flex h-full items-center">
                          <Oval
                            width={21}
                            height={21}
                            color={"white"}
                            secondaryColor="black"
                            strokeWidth={3}
                            strokeWidthSecondary={3}
                          />
                        </div>
                      )}
                    </StyledButton>
                  </div>
                ) : (
                  ""
                )}
              </div>
              <div className="absolute -bottom-[106px] w-full text-xs leading-[1.2] text-[#FFFFFFBF]">
                <div className="relative h-14">
                  {data.info}
                  <div className="absolute -left-6 top-0 scale-[175%] text-[#ffffff88]">{InfoSVG}</div>
                </div>
                {data.essential ? (
                  <div className={`mt-2.5 flex w-full ${data.essential.align}`}>
                    {data.essential.datas.map((data: any, i: number) => {
                      return (
                        <div className="relative" key={i}>
                          <StyledButton
                            className="!w-fit p-[5px_12px] !text-xs !font-normal enabled:hover:!opacity-100 disabled:!bg-[#202023] disabled:!text-[#FFFFFF80] [&>*:first-child]:enabled:hover:animate-[rightBounce_0.8s_infinite] [&>*:first-child]:enabled:hover:text-yellow"
                            disabled={!data.active}
                            onClick={() => data.action()}
                          >
                            <div className="absolute -right-3.5 animate-none text-tailwind transition-all duration-500 [&>*:first-child]:!h-5 [&>*:first-child]:!w-5 [&>*:first-child]:!opacity-100">
                              {data.info ? InfoSVG : CircleRightSVG}
                            </div>
                            {data.text}
                          </StyledButton>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-[36px]" />
                )}
              </div>
            </div>
            {i !== actions.length - 1 ? (
              <div
                key={data.name}
                className={`mx-4 -mt-[164px] -scale-x-100 text-white ${
                  i === 1 ? "hidden xl:block" : "hidden sm:block"
                }`}
              >
                {chevronLeftSVG}
              </div>
            ) : (
              ""
            )}
          </>
        );
      })}
    </div>
  );
};

export default NFTActions;
