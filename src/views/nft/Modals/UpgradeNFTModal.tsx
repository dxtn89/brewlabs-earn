/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from "react";
import { Token } from "@brewlabs/sdk";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import { formatEther, formatUnits, parseUnits } from "ethers/lib/utils.js";
import { motion } from "framer-motion";
import ReactPlayer from "react-player";
import { toast } from "react-toastify";
import { Oval } from "react-loader-spinner";

import { LighteningSVG, QuestionSVG, checkCircleSVG, chevronLeftSVG } from "@components/dashboard/assets/svgs";
import LogoIcon from "@components/LogoIcon";
import CurrencyDropdown from "@components/CurrencyDropdown";
import DropDown from "@components/dashboard/TokenList/Dropdown";
import StyledButton from "views/directory/StyledButton";

import { NFT_RARITY_NAME, rarities } from "config/constants/nft";
import { DashboardContext } from "contexts/DashboardContext";
import { useTokenApprove } from "@hooks/useApprove";
import useActiveWeb3React from "@hooks/useActiveWeb3React";
import { useFlaskNftContract } from "@hooks/useContract";
import { getNativeSybmol, getNetworkLabel, handleWalletError } from "lib/bridge/helpers";
import { useAppDispatch } from "state";
import { fetchFlaskNftUserDataAsync } from "state/nfts";
import { useFlaskNftData } from "state/nfts/hooks";
import { useTokenBalances } from "state/wallet/hooks";
import { deserializeToken } from "state/user/hooks/helpers";

import { useFlaskNft } from "../hooks/useFlaskNft";

const UpgradeNFTModal = ({ open, setOpen }) => {
  const dispatch = useAppDispatch();
  const { chainId, account } = useActiveWeb3React();

  const flaskNft = useFlaskNftData(chainId);
  const flaskNftContract = useFlaskNftContract(chainId);
  const tokenBalances = useTokenBalances(
    account,
    [flaskNft.brewsToken, ...flaskNft.stableTokens].map((t) => deserializeToken(t) as Token)
  );

  const { pending, setPending }: any = useContext(DashboardContext);
  const { onApprove } = useTokenApprove();
  const { onUpgrade } = useFlaskNft();

  const { userData, brewsToken, stableTokens, upgradeFee } = flaskNft;

  const [selectedCurrency, setSelectedCurrency] = useState(stableTokens[0]);
  const [isMinted, setIsMinted] = useState(false);
  const [rarity, setRarity] = useState(0);
  const [mintedRarity, setMintedRarity] = useState(0);

  const nftCounts = [
    flaskNft.userData ? Math.min(flaskNft.userData.balances.filter((b) => b.rarity === 1).length, 3) : 0,
    flaskNft.userData ? Math.min(flaskNft.userData.balances.filter((b) => b.rarity === 2).length, 3) : 0,
  ];
  const commons = nftCounts.map((c, index) => `${c} ${NFT_RARITY_NAME[index]} NFT${c > 1 ? "'s" : ""}`);

  const currencies = stableTokens;
  const isBrewsApproved = userData ? +userData.allowances[0] >= +upgradeFee.brews : false;
  const isBrewsValid =
    isBrewsApproved &&
    (userData
      ? +tokenBalances[brewsToken.address]?.toExact() >= +formatUnits(upgradeFee.brews, brewsToken.decimals)
      : false);

  const index = currencies.findIndex((c) => c.address === selectedCurrency.address);
  const isStableApproved = userData
    ? +userData.allowances[index + 1] >=
      +parseUnits(formatUnits(upgradeFee?.stable ?? "0"), selectedCurrency.decimals).toString()
    : false;
  const isStableValid =
    isStableApproved &&
    (userData ? +tokenBalances[selectedCurrency.address]?.toExact() >= +formatUnits(upgradeFee?.stable ?? "0") : false);
  const isValid = nftCounts[rarity] === 3;

  const brewsFee = +formatUnits(upgradeFee?.brews ?? "0", brewsToken.decimals);
  const stableFee = +formatEther(upgradeFee?.stable ?? "0");

  useEffect(() => {
    setIsMinted(false);
  }, []);

  useEffect(() => {
    setSelectedCurrency(currencies[0]);
  }, [chainId]);

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
      await onApprove(selectedCurrency.address, flaskNft.address);

      dispatch(fetchFlaskNftUserDataAsync(chainId, account));
      toast.success(`${selectedCurrency.symbol} was approved`);
    } catch (error) {
      console.log(error);
      handleWalletError(error, showError, getNativeSybmol(chainId));
    }
    setPending(false);
  };

  const handleBrewsApprove = async () => {
    if (!account) {
      toast.error("Please connect wallet");
      return;
    }
    setPending(true);

    try {
      await onApprove(brewsToken.address, flaskNft.address);

      dispatch(fetchFlaskNftUserDataAsync(chainId, account));
      toast.success(`BREWLABS was approved`);
    } catch (error) {
      console.log(error);
      handleWalletError(error, showError, getNativeSybmol(chainId));
    }
    setPending(false);
  };

  const handleUpgrade = async () => {
    setPending(true);
    try {
      const isApprovedForAll = await flaskNftContract.isApprovedForAll(account, flaskNft.address);
      if (!isApprovedForAll) {
        const tx = await flaskNftContract.setApprovalForAll(flaskNft.address, true);
        await tx.wait();
      }

      const tokenIds = flaskNft.userData.balances.filter((t) => t.rarity === rarity + 1).map((t) => t.tokenId);
      await onUpgrade(tokenIds.slice(0, 3), selectedCurrency.address);

      dispatch(fetchFlaskNftUserDataAsync(chainId, account));
      toast.success(`Upgraded successfully`);
      setIsMinted(true);
    } catch (error) {
      console.log(error);
      handleWalletError(error, showError, getNativeSybmol(chainId));
    }
    setPending(false);
  };

  const renderAction = () => {
    if (!isValid) {
      return (
        <StyledButton className="p-[10px_12px] !font-normal">
          Need more&nbsp;
          <span className="font-bold">
            {3 - nftCounts[rarity]} {NFT_RARITY_NAME[rarity]} NFTs
          </span>
        </StyledButton>
      );
    }

    if (!isBrewsApproved) {
      return (
        <StyledButton className="p-[10px_12px] !font-normal" onClick={handleBrewsApprove} disabled={pending}>
          Approve&nbsp;<span className="font-bold">BREWLABS</span>
          {pending && (
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
      );
    }

    if (!isStableApproved) {
      return (
        <StyledButton className="p-[10px_12px] !font-normal" onClick={handleApprove} disabled={pending}>
          Approve&nbsp;<span className="font-bold">{selectedCurrency.symbol}</span>
          {pending && (
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
      );
    }

    return isValid && isBrewsValid ? (
      <StyledButton className="!w-fit p-[10px_12px] !font-normal" onClick={handleUpgrade} disabled={pending}>
        Upgrade&nbsp;<span className="font-bold">BREWLABS</span>&nbsp;NFT on &nbsp;
        <span className="font-bold">{getNetworkLabel(chainId)}</span>
        {pending && (
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
    ) : (
      <StyledButton
        className="!w-fit p-[10px_12px] !font-normal disabled:!bg-[#FFFFFF80] disabled:!opacity-100"
        disabled={true}
      >
        Upgrade BREWLABS NFT
      </StyledButton>
    );
  };

  return (
    <Dialog
      open={open}
      className="fixed inset-0 z-50 overflow-y-auto bg-gray-300 bg-opacity-90 font-brand dark:bg-zinc-900 dark:bg-opacity-80"
      onClose={() => {}}
    >
      <div className="flex min-h-full items-center justify-center p-4 ">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.75,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: {
              ease: "easeOut",
              duration: 0.15,
            },
          }}
          exit={{
            opacity: 0,
            scale: 0.75,
            transition: {
              ease: "easeIn",
              duration: 0.15,
            },
          }}
          transition={{ duration: 0.25 }}
        >
          <div className="relative w-[calc(100vw-24px)] max-w-[600px] rounded-lg bg-[#18181B] p-[36px_12px] text-white sm:p-[36px_48px]">
            <div className="flex flex-col-reverse justify-between border-b border-b-[#FFFFFF80] pb-3 xmd:flex-row xmd:items-center">
              <div className="mt-5 flex items-center pl-3 text-xl text-[#FFFFFFBF] xmd:mt-0">
                <LogoIcon classNames="w-9 text-brand mr-3" />
                <div>Upgrade Brewlabs NFT</div>
              </div>
              <div className="h-10 min-w-[130px]">
                <StyledButton
                  type="secondary"
                  onClick={() => {
                    setOpen(false);
                    setIsMinted(false);
                  }}
                >
                  <div className="flex items-center text-[#FFFFFFBF]">
                    {chevronLeftSVG}
                    <div className="ml-2">Back a page</div>
                  </div>
                </StyledButton>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="mt-2.5 flex h-[200px] w-[200px] items-center justify-center overflow-hidden rounded bg-[#B9B8B80D] text-tailwind">
                {isMinted ? (
                  <ReactPlayer
                    className="!h-full !w-full"
                    url={`/images/nfts/brewlabs-flask-nfts/brewlabs-flask-${NFT_RARITY_NAME[rarity].toLowerCase()}.mp4`}
                    playing={true}
                    autoPlay={true}
                    muted={true}
                    loop={true}
                    playsinline={true}
                    controls={false}
                  />
                ) : (
                  QuestionSVG
                )}
              </div>
              {!isMinted ? (
                <div className="w-full">
                  <div className="mx-auto mt-[22px] flex w-full max-w-[360px] flex-col items-center justify-between text-sm xsm:flex-row">
                    <div className="flex items-center">
                      <div
                        className={`mr-3 ${
                          isValid ? "text-primary" : "text-[#FFFFFF80]"
                        } [&>*:first-child]:h-4 [&>*:first-child]:w-4`}
                      >
                        {checkCircleSVG}
                      </div>
                      <DropDown
                        values={commons}
                        value={rarity}
                        setValue={(i) => setRarity(i)}
                        width="w-[160px]"
                        className={`primary-shadow h-fit w-[160px] whitespace-nowrap rounded !border-0 !bg-[#17171C] !p-[10px_14px] text-sm font-normal normal-case ${
                          isValid ? "!text-white" : "!text-[#FFFFFF80]"
                        }`}
                      />
                    </div>
                    <div className="mt-2 flex items-center xsm:mt-0">
                      <div
                        className={`mr-3 ${
                          isValid ? "text-primary" : "text-[#FFFFFF80]"
                        } [&>*:first-child]:h-4 [&>*:first-child]:w-4`}
                      >
                        {LighteningSVG}
                      </div>
                      <div
                        className={`primary-shadow rounded bg-[#17171C] p-[10px_14px] text-sm ${
                          isValid ? "text-white" : "text-[#FFFFFF80]"
                        }`}
                      >
                        {isValid
                          ? `1 ${NFT_RARITY_NAME[rarity + 1]} NFT`
                          : `${3 - nftCounts[rarity]} ${NFT_RARITY_NAME[rarity]} NFT`}
                      </div>
                    </div>
                  </div>
                  <div className="mx-auto mt-[22px] flex w-full max-w-[300px] items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div
                        className={`mr-3 ${
                          isBrewsValid ? "text-primary" : "text-[#FFFFFF80]"
                        } [&>*:first-child]:h-4 [&>*:first-child]:w-4`}
                      >
                        {checkCircleSVG}
                      </div>
                      <div
                        className={`rounded-lg p-[6px_10px] leading-none text-[#18181B] ${
                          isBrewsValid ? "bg-primary" : "bg-[#FFFFFF80]"
                        } text-sm`}
                      >
                        Brewlabs Token
                      </div>
                    </div>
                    <div className="text-[#FFFFFF80]">
                      {brewsFee.toFixed(2)}&nbsp;<span className="text-primary">BREWLABS</span>
                    </div>
                  </div>
                  <div className="mx-auto mt-2.5 flex w-full max-w-[300px] items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div
                        className={`mr-3 ${
                          isStableValid ? "text-primary" : "text-[#FFFFFF80]"
                        } [&>*:first-child]:h-4 [&>*:first-child]:w-4`}
                      >
                        {checkCircleSVG}
                      </div>
                      <div
                        className={`rounded-lg p-[6px_10px] leading-none text-[#18181B] ${
                          isStableValid ? "bg-primary" : "bg-[#FFFFFF80]"
                        } text-sm`}
                      >
                        Stablecoin
                      </div>
                    </div>
                    <div className="flex items-center text-[#FFFFFF80]">
                      <div className="mr-2">{stableFee.toFixed(2)}</div>
                      <CurrencyDropdown
                        currencies={currencies}
                        value={selectedCurrency}
                        setValue={setSelectedCurrency}
                        className="w-[110px] bg-[#17171C]"
                      />
                    </div>
                  </div>

                  <div className="mx-auto mt-6 w-fit">{renderAction()}</div>
                </div>
              ) : (
                <div className="w-full">
                  <div className="my-4 text-center">
                    Congratulations you upgraded a RARE <span className="text-primary">BREWLABS</span> NFT
                  </div>
                  <div className="flex flex-col justify-center sm:flex-row">
                    <StyledButton
                      className="w-full p-[10px_12px] sm:!w-fit"
                      onClick={() => {
                        setOpen(false);
                        setIsMinted(false);
                      }}
                    >
                      Skip&nbsp;<span className="font-normal">and close window</span>
                    </StyledButton>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setOpen(false);
                setIsMinted(false);
              }}
              className="absolute -right-2 -top-2 rounded-full bg-white p-2 dark:bg-zinc-900 sm:dark:bg-zinc-800"
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6 dark:text-slate-400" />
            </button>
          </div>
        </motion.div>
      </div>
    </Dialog>
  );
};

export default UpgradeNFTModal;
