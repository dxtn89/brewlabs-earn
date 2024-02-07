/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from "react";
import { Token } from "@brewlabs/sdk";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import { formatEther, formatUnits, parseUnits } from "ethers/lib/utils.js";
import { motion } from "framer-motion";
import { Oval } from "react-loader-spinner";
import { toast } from "react-toastify";
import ReactPlayer from "react-player";

import {
  MinusSVG,
  NFTFillSVG,
  PlusSVG,
  QuestionSVG,
  checkCircleSVG,
  chevronLeftSVG,
} from "@components/dashboard/assets/svgs";
import CurrencyDropdown from "@components/CurrencyDropdown";
import LogoIcon from "@components/LogoIcon";
import FlaskNftAbi from "config/abi/nfts/flaskNft.json";

import StyledButton from "views/directory/StyledButton";

import { rarities } from "config/constants/nft";
import { DashboardContext } from "contexts/DashboardContext";
import useActiveWeb3React from "@hooks/useActiveWeb3React";
import { useTokenApprove } from "@hooks/useApprove";
import { getNativeSymbol, getNetworkLabel, handleWalletError } from "lib/bridge/helpers";
import { useAppDispatch } from "state";
import { fetchFlaskNftUserDataAsync } from "state/nfts";
import { useFlaskNftData } from "state/nfts/hooks";
import { useTokenBalances } from "state/wallet/hooks";
import { deserializeToken } from "state/user/hooks/helpers";
import { getFlaskNftAddress } from "utils/addressHelpers";
import multicall from "utils/multicall";

import { useFlaskNft } from "../hooks/useFlaskNft";

const MintNFTModal = ({ open, setOpen }) => {
  const dispatch = useAppDispatch();
  const { chainId, account } = useActiveWeb3React();

  const flaskNft = useFlaskNftData(chainId);
  const tokenBalances = useTokenBalances(
    account,
    [flaskNft.brewsToken, ...flaskNft.stableTokens].map((t) => deserializeToken(t) as Token)
  );

  const { pending, setPending }: any = useContext(DashboardContext);
  const { onApprove } = useTokenApprove();
  const { onMint } = useFlaskNft();

  const { userData, brewsToken, stableTokens, mintFee } = flaskNft;

  const [selectedCurrency, setSelectedCurrency] = useState(stableTokens[0]);
  const [quantity, setQuantity] = useState(1);
  const [isMinted, setIsMinted] = useState(false);
  const [mintedTokenIds, setMintedTokenIds] = useState([]);
  const [curAnimation, setCurAnimation] = useState(0);

  const currencies = stableTokens;
  const isBrewsApproved = userData ? +userData.allowances[0] >= +mintFee.brews : false;
  const isBrewsValid =
    isBrewsApproved &&
    (userData
      ? +tokenBalances[brewsToken.address]?.toExact() >=
        +formatUnits(mintFee?.brews ?? "0", brewsToken.decimals) * quantity
      : false);

  const index = currencies.findIndex((c) => c.address === selectedCurrency.address);
  const isApproved = userData
    ? +userData.allowances[index + 1] >=
      +parseUnits(formatUnits(mintFee?.stable ?? "0"), selectedCurrency.decimals).toString()
    : false;
  const isValid =
    isApproved &&
    (userData
      ? +tokenBalances[selectedCurrency.address]?.toExact() >= +formatUnits(mintFee?.stable ?? "0") * quantity
      : false);

  const brewsFee = +formatUnits(mintFee?.brews ?? "0", brewsToken.decimals);
  const stableFee = +formatEther(mintFee?.stable ?? "0");

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
      handleWalletError(error, showError, getNativeSymbol(chainId));
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
      handleWalletError(error, showError, getNativeSymbol(chainId));
    }
    setPending(false);
  };

  const handleMint = async () => {
    setPending(true);
    try {
      const receipt = await onMint(quantity, selectedCurrency.address);
      const events = receipt.events;
      dispatch(fetchFlaskNftUserDataAsync(chainId, account));
      toast.success(`${quantity} NFT${quantity > 1 ? "s" : ""} was minted`);

      const tokenIds = events
        .filter((data: any) => data.address.toLowerCase() === getFlaskNftAddress(chainId).toLowerCase())
        .map((data: any) => parseInt(data.args.tokenId));

      const calls = tokenIds.map((data) => {
        return {
          name: "rarityOf",
          address: getFlaskNftAddress(chainId),
          params: [data],
        };
      });

      let _rarities = await multicall(FlaskNftAbi, calls, chainId);
      _rarities = _rarities.map((data) => data[0] / 1);

      setMintedTokenIds(_rarities);
      setCurAnimation(0);
      setIsMinted(true);
    } catch (error) {
      console.log(error);
      handleWalletError(error, showError, getNativeSymbol(chainId));
    }
    setPending(false);
  };

  const renderAction = () => {
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

    if (!isApproved) {
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
      <StyledButton
        className={`overflow-hidden text-ellipsis whitespace-nowrap p-[10px_12px] !font-normal`}
        onClick={handleMint}
        disabled={pending}
      >
        <div className={pending ? "mr-6" : ""}>
          Mint&nbsp;<span className="font-bold">BREWLABS</span>&nbsp;NFT on&nbsp;
          <span className="font-bold">{getNetworkLabel(chainId)}</span>
        </div>
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
      <StyledButton className="p-[10px_12px] !font-normal">
        Get&nbsp;<span className="font-bold">BREWLABS</span>&nbsp;&&nbsp;
        <span className="font-bold">USDC</span>
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
                <div>Mint Brewlabs NFT</div>
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
              <div className="text-tailwind mt-2.5 flex h-[200px] w-[200px] items-center justify-center overflow-hidden rounded bg-[#B9B8B80D]">
                {isMinted && rarities[mintedTokenIds[curAnimation] - 1]?.mintLogo ? (
                  <ReactPlayer
                    className="!h-full !w-full"
                    url={rarities[mintedTokenIds[curAnimation] - 1]?.mintLogo}
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
                <div>
                  <div className="mt-[22px] flex min-w-[300px] items-center justify-between text-sm">
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
                    <div className="text-[#FFFFFF80]">{(brewsFee * quantity).toFixed(2)} BREWLABS</div>
                  </div>
                  <div className="mt-2.5 flex min-w-[300px] items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div
                        className={`mr-3 ${
                          isValid ? "text-primary" : "text-[#FFFFFF80]"
                        } [&>*:first-child]:h-4 [&>*:first-child]:w-4`}
                      >
                        {checkCircleSVG}
                      </div>
                      <div
                        className={`rounded-lg p-[6px_10px] leading-none text-[#18181B] ${
                          isValid ? "bg-primary" : "bg-[#FFFFFF80]"
                        } text-sm`}
                      >
                        Stablecoin
                      </div>
                    </div>
                    <div className="flex items-center text-[#FFFFFF80]">
                      <div className="mr-2">{(stableFee * quantity).toFixed(2)}</div>
                      <CurrencyDropdown
                        currencies={currencies}
                        value={selectedCurrency}
                        setValue={setSelectedCurrency}
                        className="w-[110px] bg-[#17171C]"
                      />
                    </div>
                  </div>
                  <div className="mt-2.5 flex min-w-[300px] items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={`mr-3 ${
                          flaskNft.totalSupply + quantity < flaskNft.maxSupply ? "text-primary" : "text-[#FFFFFF80]"
                        } [&>*:first-child]:h-4 [&>*:first-child]:w-4`}
                      >
                        {NFTFillSVG}
                      </div>
                      <div
                        className={`rounded-lg p-[6px_10px] leading-none text-[#18181B] ${
                          flaskNft.totalSupply + quantity < flaskNft.maxSupply ? "bg-primary" : "bg-[#FFFFFF80]"
                        } text-sm`}
                      >
                        Quantity
                      </div>
                    </div>
                    <div>{quantity}</div>
                    <div className="flex w-[110px] justify-between">
                      <div
                        className="primary-shadow text-tailwind flex h-10 w-10 cursor-pointer items-center justify-center rounded transition-all hover:bg-[#292929] hover:text-white"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        {PlusSVG}
                      </div>
                      <div
                        className="primary-shadow text-tailwind flex h-10 w-10 cursor-pointer items-center justify-center rounded transition-all hover:bg-[#292929] hover:text-white"
                        onClick={() => setQuantity(Math.max(quantity - 1, 1))}
                      >
                        {MinusSVG}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">{renderAction()}</div>
                </div>
              ) : (
                <div className="w-full">
                  <div className="my-4 text-center">
                    Congratulations you minted a {rarities[mintedTokenIds[curAnimation] - 1]?.type.toUpperCase()}&nbsp;
                    <span className="text-primary">BREWLABS</span> NFT
                  </div>
                  <div className="flex flex-col justify-center sm:flex-row">
                    {curAnimation !== mintedTokenIds.length - 1 ? (
                      <StyledButton className="w-full p-[10px_12px] sm:!w-fit">
                        <div className="flex items-center">
                          <div onClick={() => setCurAnimation(Math.min(curAnimation + 1, mintedTokenIds.length))}>
                            Next Mint&nbsp;
                            <span className="font-normal">({flaskNft.maxSupply - flaskNft.totalSupply} remaining)</span>
                          </div>

                          <div className="ml-2 -scale-x-100 [&>*:first-child]:!h-3">{chevronLeftSVG}</div>
                        </div>
                      </StyledButton>
                    ) : (
                      ""
                    )}
                    <div className="mr-0 mt-2 sm:mr-5 sm:mt-0" />
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

export default MintNFTModal;
