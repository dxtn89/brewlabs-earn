import { useState } from "react";
import { WNATIVE } from "@brewlabs/sdk";
import { formatEther, formatUnits } from "ethers/lib/utils.js";
import Link from "next/link";
import { toast } from "react-toastify";

import CountDown from "@components/CountDown";
import { CircleRightSVG, CircleMinusSVG, CirclePlusSVG } from "@components/dashboard/assets/svgs";
import StyledButton from "views/directory/StyledButton";

import { NFT_RARITY, NFT_RARITY_NAME } from "config/constants/nft";
import useActiveWeb3React from "@hooks/useActiveWeb3React";
import { useFlaskNftContract } from "@hooks/useContract";
import { useSwitchNetwork } from "@hooks/useSwitchNetwork";
import useTokenPrice from "@hooks/useTokenPrice";
import { getNativeSybmol, handleWalletError } from "lib/bridge/helpers";
import { useAppDispatch } from "state";
import { useChainCurrentBlock } from "state/block/hooks";
import { fetchNftUserDataAsync } from "state/nfts";
import { useAllNftData } from "state/nfts/hooks";
import { getChainLogo } from "utils/functions";

import { useNftStaking } from "../hooks/useNftStaking";
import { BLOCK_TIMES, SECONDS_PER_YEAR } from "config";
import { NETWORKS } from "config/constants/networks";
import NFTRarityText from "@components/NFTRarityText";

const NFTCard = ({ nft }: { nft: any }) => {
  const dispatch = useAppDispatch();
  const { account, chainId } = useActiveWeb3React();
  const { canSwitch, switchNetwork } = useSwitchNetwork();

  const { flaskNft: flaskNfts, data } = useAllNftData();
  const flaskNftContract = useFlaskNftContract(chainId);
  const currentBlock = useChainCurrentBlock(nft.chainId);

  const pool = data.find((p) => p.chainId === nft.chainId);
  const flaskNft = flaskNfts.find((p) => p.chainId === nft.chainId);

  const { onStake, onUnstakeNft, onClaim } = useNftStaking(pool?.performanceFee ?? "0");

  const [pending, setPending] = useState(false);
  const ethPrice = useTokenPrice(
    nft.chainId == 97 ? 56 : nft.chainId,
    WNATIVE[nft.chainId == 97 ? 56 : nft.chainId].address
  );
  const brewsPrice = useTokenPrice(nft.chainId, flaskNft.brewsToken.address);

  const isPending = !pool || pool.startBlock > currentBlock;
  const earnings = pool?.userData?.stakedAmount ? +formatEther(pool.userData.earnings) / pool.userData.stakedAmount : 0;

  const apr =
    flaskNft.mintFee && pool?.totalStaked
      ? (((+formatEther(pool?.rewardPerBlock ?? "0") * ethPrice * SECONDS_PER_YEAR) / BLOCK_TIMES[nft.chainId]) * 100) /
        ((+formatUnits(flaskNft.mintFee.stable, flaskNft.stableTokens[0].decimals) +
          +formatUnits(flaskNft.mintFee.brews, flaskNft.brewsToken.decimals) * brewsPrice) *
          (pool?.totalStaked ?? 0))
      : 0;

  const stakingDate = new Date(1696118400000); // Oct 01 2023 00:00:00 GMT
  let date =
    stakingDate.getTime() - new Date(new Date().toLocaleString("en-us", { timeZone: "America/New_York" })).getTime();

  const showError = (errorMsg: string) => {
    if (errorMsg) toast.error(errorMsg);
  };

  const handleStake = async () => {
    if (pending) return;
    if (chainId !== nft.chainId) {
      if (canSwitch) switchNetwork(nft.chainId);
      return;
    }

    setPending(true);
    try {
      const isApprovedForAll = await flaskNftContract.isApprovedForAll(account, pool.address);
      if (!isApprovedForAll) {
        const tx = await flaskNftContract.setApprovalForAll(pool.address, true);
        await tx.wait();
      }

      await onStake([nft.tokenId]);

      dispatch(fetchNftUserDataAsync(chainId, account));
      toast.success(`Brewlabs Flask NFT was staked and Brewlabs Mirror NFT was minted.`);
    } catch (error) {
      console.log(error);
      handleWalletError(error, showError, getNativeSybmol(chainId));
    }
    setPending(false);
  };

  const handleUnStake = async () => {
    if (pending) return;
    if (chainId !== nft.chainId) {
      if (canSwitch) switchNetwork(nft.chainId);
      return;
    }

    setPending(true);
    try {
      await onUnstakeNft(nft.tokenId);

      dispatch(fetchNftUserDataAsync(chainId, account));
      toast.success(`Brewlabs Flask NFT was unstaked and Brewlabs Mirror NFT was burned.`);
    } catch (error) {
      console.log(error);
      handleWalletError(error, showError, getNativeSybmol(chainId));
    }
    setPending(false);
  };

  const handleClaim = async () => {
    if (pending) return;
    if (chainId !== nft.chainId) {
      if (canSwitch) switchNetwork(nft.chainId);
      return;
    }

    setPending(true);
    try {
      await onClaim();

      dispatch(fetchNftUserDataAsync(chainId, account));
      toast.success(`Brewlabs Flask NFT was unstaked and Brewlabs Mirror NFT was burned.`);
    } catch (error) {
      console.log(error);
      handleWalletError(error, showError, getNativeSybmol(chainId));
    }
    setPending(false);
  };

  return (
    <div className="primary-shadow mt-2 cursor-pointer rounded bg-[#B9B8B80D] p-[16px_18px_16px_12px] font-brand  text-[#FFFFFFBF] transition hover:bg-[#b9b8b828] xsm:p-[16px_36px_16px_28px]">
      <div className="hidden items-center justify-between xl:flex">
        <div className="flex w-[300px] items-center justify-center">
          <img src={getChainLogo(nft.chainId)} alt={""} className="h-[30px] w-[30px] rounded-full" />
          <div className="mx-[30px] flex h-[58px] w-[72px] items-center justify-center overflow-hidden rounded">
            <img
              src={`/images/nfts/brewlabs-flask-nfts/brewlabs-flask-${NFT_RARITY_NAME[
                nft.rarity - 1
              ].toLowerCase()}.png`}
              alt={""}
              className="w-full"
            />
          </div>
          <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{nft.name}</div>
        </div>
        <div className="w-[60px]  overflow-hidden text-ellipsis whitespace-nowrap">ID {nft.tokenId}</div>
        <div className={`w-[80px]  uppercase`}>
          <NFTRarityText rarity={nft.rarity - 1}>{NFT_RARITY_NAME[nft.rarity - 1]}</NFTRarityText>
        </div>
        {nft.rarity - 1 > NFT_RARITY.UNCOMMON ? (
          <>
            <div className="w-[116px]">
              {isPending || date > 0 ? (
                <Link href={"/nft/nftstakinginfo"}>
                  <StyledButton className="!w-fit p-[5px_12px] !text-xs !font-normal enabled:hover:!opacity-100  [&>*:first-child]:enabled:hover:animate-[rightBounce_0.8s_infinite] [&>*:first-child]:enabled:hover:text-yellow">
                    <div className="absolute -right-[15px] animate-none text-tailwind transition-all duration-300 [&>*:first-child]:!h-5 [&>*:first-child]:!w-5">
                      {CircleRightSVG}
                    </div>
                    NFT Staking Info
                  </StyledButton>
                </Link>
              ) : (
                <StyledButton
                  className="!w-fit p-[5px_12px] !text-xs !font-normal enabled:hover:!opacity-100  [&>*:first-child]:enabled:hover:text-yellow"
                  onClick={nft.isStaked ? handleUnStake : handleStake}
                  disabled={pending}
                >
                  <div className="absolute -right-[15px] animate-none text-tailwind transition-all duration-300 [&>*:first-child]:!h-5 [&>*:first-child]:!w-5">
                    {nft.isStaked ? CircleMinusSVG : CirclePlusSVG}
                  </div>
                  {nft.isStaked ? "Unstake NFT" : "Stake NFT"}
                </StyledButton>
              )}
            </div>
            <div className="relative w-[90px] text-xs leading-[1.2] text-white">
              {!apr ? "Pending" : `${apr.toFixed(2) ?? "0.00"}%`} APR
              <br />
              <div className="relative text-[10px] font-normal text-[#FFFFFF80]">
                in {NETWORKS[nft.chainId].nativeCurrency.symbol} approx.
              </div>
            </div>
            {isPending && date > 0 ? (
              <div className="relative w-[80px]  leading-[1.2] text-white">
                <CountDown time={date + Date.now()} />
                <div className="absolute right-0 text-[10px] font-normal text-[#FFFFFF80]">Pool opens</div>
              </div>
            ) : (
              <div className="relative w-[80px] overflow-hidden text-ellipsis whitespace-nowrap text-center leading-[1.2] text-white">
                {earnings.toFixed(3)} {getNativeSybmol(nft.chainId)}
                <div className="text-right text-[10px] text-[#FFFFFF80]">${(earnings * ethPrice).toFixed(2)} USD</div>
              </div>
            )}
            <div className="w-[84px]">
              {!isPending && nft.isStaked && (
                <StyledButton
                  className="!w-fit p-[5px_12px] !text-xs !font-normal enabled:hover:!opacity-100  [&>*:first-child]:enabled:hover:text-yellow"
                  onClick={handleClaim}
                  disabled={pending || earnings == 0}
                >
                  <div className="absolute -right-[15px] animate-none text-tailwind transition-all duration-300 [&>*:first-child]:!h-5 [&>*:first-child]:!w-5">
                    {CirclePlusSVG}
                  </div>
                  Harvest
                </StyledButton>
              )}
            </div>
            <div className="w-[104px]">
              <Link
                href={`https://opensea.io/collection/brewlabs-flask-nft-${getNativeSybmol(nft.chainId).toLowerCase()}`}
                target="_blank"
              >
                <StyledButton className="!w-fit p-[5px_12px] !text-xs !font-normal enabled:hover:!opacity-100  [&>*:first-child]:enabled:hover:animate-[rightBounce_0.8s_infinite] [&>*:first-child]:enabled:hover:text-yellow">
                  <div className="absolute -right-4 animate-none text-tailwind transition-all duration-300 [&>*:first-child]:!h-5 [&>*:first-child]:!w-5">
                    {CircleRightSVG}
                  </div>
                  Marketplace
                </StyledButton>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-[116px]" />
            <div className="w-[80px]" />
            <div className="w-[80px]" />
            <div className="w-[84px]" />
            <div className="w-[104px]">
              <Link
                href={`https://opensea.io/collection/brewlabs-flask-nft-${getNativeSybmol(nft.chainId).toLowerCase()}`}
                target="_blank"
              >
                <StyledButton className="!w-fit p-[5px_12px] !text-xs !font-normal enabled:hover:!opacity-100  [&>*:first-child]:enabled:hover:animate-[rightBounce_0.8s_infinite] [&>*:first-child]:enabled:hover:text-yellow">
                  <div className="absolute -right-4 animate-none text-tailwind transition-all duration-300 [&>*:first-child]:!h-5 [&>*:first-child]:!w-5">
                    {CircleRightSVG}
                  </div>
                  Marketplace
                </StyledButton>
              </Link>
            </div>
          </>
        )}
      </div>
      <div className="block xl:hidden">
        <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
          <div className="flex max-w-fit flex-1 items-center justify-center sm:max-w-[360px]">
            <img src={getChainLogo(nft.chainId)} alt={""} className="h-[30px] w-[30px] rounded-full" />
            <div className="mx-4 flex h-[58px] w-[72px] items-center justify-center overflow-hidden rounded sm:mx-[30px]">
              <img src={nft.logo} alt={""} className="w-full" />
            </div>
            <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{nft.name}</div>
            <div className="w-[60px]  overflow-hidden text-ellipsis whitespace-nowrap text-center">
              ID {nft.tokenId}
            </div>
          </div>
          <div className={`mt-4 w-full text-right uppercase sm:mt-0 sm:w-fit`}>
            <NFTRarityText rarity={nft.rarity - 1}>{NFT_RARITY_NAME[nft.rarity - 1]}</NFTRarityText>
          </div>
        </div>
        {nft.rarity - 1 > NFT_RARITY.UNCOMMON ? (
          <>
            <div className="mt-2 flex items-center justify-between">
              <div className="w-fit text-white">
                APR: {!apr ? "Pending" : `${apr.toFixed(2) ?? "0.00"}%`} APR
                <br />
                <span className="text-[10px] font-normal text-[#FFFFFF80]">
                  in {NETWORKS[nft.chainId].nativeCurrency.symbol} approx.
                </span>
              </div>
              {isPending ? (
                <div className="relative w-fit leading-[1.2] text-white">
                  POOL OPEN: <CountDown time={date + Date.now()} />
                  {/* <div className="absolute right-0 text-right text-[10px] text-[#FFFFFF80]">Pool Opens</div> */}
                </div>
              ) : (
                <div className="relative w-fit leading-[1.2] text-white">
                  EARNING: {earnings.toFixed(3)} {getNativeSybmol(nft.chainId)}
                  <div className="absolute right-0 text-right text-[10px] text-[#FFFFFF80]">
                    ${(earnings * ethPrice).toFixed(2)} USD
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex flex-col justify-between xsm:flex-row">
              <div className="relative">
                {isPending ? (
                  <Link href={"/nft/nftstakinginfo"}>
                    <StyledButton className="mb-2 !w-full p-[5px_12px] !text-xs !font-normal enabled:hover:!opacity-100  xsm:mb-0 xsm:!w-fit [&>*:first-child]:enabled:hover:animate-[rightBounce_0.8s_infinite] [&>*:first-child]:enabled:hover:text-yellow">
                      <div className="absolute -right-[15px] animate-none text-tailwind transition-all duration-300 [&>*:first-child]:!h-5 [&>*:first-child]:!w-5">
                        {CircleRightSVG}
                      </div>
                      NFT Staking Info
                    </StyledButton>
                  </Link>
                ) : (
                  <StyledButton
                    className="mb-2 !w-full p-[5px_12px] !text-xs !font-normal enabled:hover:!opacity-100  xsm:mt-0 xsm:!w-fit [&>*:first-child]:enabled:hover:text-yellow"
                    onClick={nft.isStaked ? handleUnStake : handleStake}
                    disabled={pending}
                  >
                    <div className="absolute -right-[15px] animate-none text-tailwind transition-all duration-300 [&>*:first-child]:!h-5 [&>*:first-child]:!w-5">
                      {nft.isStaked ? CircleMinusSVG : CirclePlusSVG}
                    </div>
                    {nft.isStaked ? "Unstake NFT" : "Stake NFT"}
                  </StyledButton>
                )}
              </div>
              <div className="relative">
                {!isPending && nft.isStaked && (
                  <StyledButton
                    className="mb-2 !w-full p-[5px_12px] !text-xs !font-normal enabled:hover:!opacity-100  xsm:mt-0 xsm:!w-fit [&>*:first-child]:enabled:hover:text-yellow"
                    onClick={handleClaim}
                    disabled={pending || earnings == 0}
                  >
                    <div className="absolute -right-[15px] animate-none text-tailwind transition-all duration-300 [&>*:first-child]:!h-5 [&>*:first-child]:!w-5">
                      {CirclePlusSVG}
                    </div>
                    Harvest
                  </StyledButton>
                )}
              </div>
              <Link
                href={`https://opensea.io/collection/brewlabs-flask-nft-${getNativeSybmol(nft.chainId).toLowerCase()}`}
                target="_blank"
                className="relative"
              >
                <StyledButton className="!w-full p-[5px_12px] !text-xs !font-normal enabled:hover:!opacity-100  xsm:!w-fit [&>*:first-child]:enabled:hover:animate-[rightBounce_0.8s_infinite] [&>*:first-child]:enabled:hover:text-yellow">
                  <div className="absolute -right-4 animate-none text-tailwind transition-all duration-300 [&>*:first-child]:!h-5 [&>*:first-child]:!w-5">
                    {CircleRightSVG}
                  </div>
                  Marketplace
                </StyledButton>
              </Link>
            </div>
          </>
        ) : (
          <div className="mt-6 flex flex-col justify-end xsm:flex-row">
            <Link
              href={`https://opensea.io/collection/brewlabs-flask-nft-${getNativeSybmol(nft.chainId).toLowerCase()}`}
              target="_blank"
              className="relative"
            >
              <StyledButton className="!w-full p-[5px_12px] !text-xs !font-normal enabled:hover:!opacity-100  xsm:!w-fit [&>*:first-child]:enabled:hover:animate-[rightBounce_0.8s_infinite] [&>*:first-child]:enabled:hover:text-yellow">
                <div className="absolute -right-4 animate-none text-tailwind transition-all duration-300 [&>*:first-child]:!h-5 [&>*:first-child]:!w-5">
                  {CircleRightSVG}
                </div>
                Marketplace
              </StyledButton>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTCard;
