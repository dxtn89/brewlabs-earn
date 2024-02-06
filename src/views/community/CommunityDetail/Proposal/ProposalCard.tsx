import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";

import { CommunityContext } from "contexts/CommunityContext";
import { DashboardContext } from "contexts/DashboardContext";
import { useActiveChainId } from "hooks/useActiveChainId";
import useENSName from "hooks/ENS/useENSName";
import useTokenBalances from "hooks/useTokenMultiChainBalance";
import { handleWalletError } from "lib/bridge/helpers";
import { getBep20Contract } from "utils/contractHelpers";
import { showError } from "utils/functions";
import { useSigner } from "utils/wagmi";

import CountDown from "components/CountDown";
import { BellSVG, InfoSVG, RequirementSVG } from "components/dashboard/assets/svgs";
import StyledButton from "views/directory/StyledButton";

const ProposalCard = ({ proposal, community, index }: { proposal: any; community: any; index: number }) => {
  const { address: account } = useAccount();
  const name = useENSName(proposal.owner);
  const { voteOrAgainst }: any = useContext(CommunityContext);
  const { chainId } = useActiveChainId();
  const { data: signer } = useSigner();

  const [isVoted, setIsVoted] = useState("none");
  const { pending, setPending }: any = useContext(DashboardContext);
  const [detailOpen, setDetailOpen] = useState(false);

  async function onVoteOrAgainst(account: string, pid: number, index: number, type: string) {
    if ([...proposal.yesVoted, ...proposal.noVoted].includes(account?.toLowerCase())) {
      toast.error("Already voted");
      return;
    }
    setPending(true);
    try {
      if (community.feeToVote.type === "Yes" || (community.feeToVote.type === "Sometimes" && proposal.isFeeToVote)) {
        const tokenContract = getBep20Contract(chainId, community.currencies[chainId].address, signer);
        const estimateGas = await tokenContract.estimateGas.transfer(
          community.feeToVote.address,
          community.feeToVote.amount
        );

        const tx = await tokenContract.transfer(community.feeToVote.address, community.feeToVote.amount, {
          gasLimit: Math.ceil(Number(estimateGas) * 1.2),
        });
        await tx.wait();
      }
      await voteOrAgainst(account, pid, index, type);
      setIsVoted(type);
      setTimeout(() => {
        setIsVoted("none");
      }, 5000);
    } catch (e) {
      console.log(e);
      handleWalletError(e, showError);
    }
    setPending(false);
  }

  let yesAddresses = new Object(),
    noAddresses = new Object();
  let yesTokens = new Object(),
    noTokens = new Object();

  Object.keys(community.currencies).map((key, i) => (yesAddresses[key] = [...proposal.yesVoted]));
  Object.keys(community.currencies).map((key, i) => (noAddresses[key] = [...proposal.noVoted]));
  Object.keys(community.currencies).map(
    (key, i) => (yesTokens[key] = [...proposal.yesVoted].map((data) => community.currencies[key]))
  );
  Object.keys(community.currencies).map(
    (key, i) => (noTokens[key] = [...proposal.noVoted].map((data) => community.currencies[key]))
  );
  const { totalBalance: yesBalance } = useTokenBalances(yesTokens, yesAddresses);
  const { totalBalance: noBalance } = useTokenBalances(noTokens, noAddresses);

  const totalBalance = yesBalance + noBalance;

  const totalSupply = community.totalSupply / Math.pow(10, community.currencies[community.coreChainId].decimals);
  const totalVotePercent = (totalBalance / totalSupply) * 100;

  const duration = proposal.duration;

  const isNew =
    ![...proposal.yesVoted, ...proposal.noVoted].includes(account?.toLowerCase()) &&
    proposal.createdTime + duration >= Date.now();
  const isExcalmation =
    account &&
    community.members.includes(account.toLowerCase()) &&
    ![...proposal.yesVoted, ...proposal.noVoted].includes(account.toLowerCase());

  return (
    <div
      className={`primary-shadow relative mb-3 flex w-full justify-end rounded bg-[#B9B8B80D] p-[20px_12px_32px_40px] md:p-[20px_20px_32px_60px]`}
    >
      {isExcalmation && proposal.createdTime + duration >= Date.now() ? (
        <div className="absolute left-2.5 top-[22px] text-primary md:left-5 [&>svg]:!h-5 [&>svg]:!w-5 [&>svg]:!opacity-100">
          {InfoSVG}
        </div>
      ) : (
        ""
      )}
      <div className="flex w-full max-w-[1100px] flex-col items-center justify-between md:flex-row">
        <div className="flex w-full flex-1 flex-wrap md:w-fit">
          <div>
            <div
              className={`text-xl ${
                totalVotePercent < community.quoroumReq && proposal.createdTime + duration < Date.now()
                  ? "text-[#FFFFFFBF]"
                  : "text-primary"
              }`}
            >
              Proposal #{index + 1}
            </div>
            <div className="w-[110px] overflow-hidden text-ellipsis text-sm text-white">
              {name.loading ? proposal.owner : name.ENSName ?? proposal.owner}
            </div>
            <div className="mt-3 flex items-center text-sm">
              <div
                className={`[>svg]:!w-[22px] ${
                  totalVotePercent < community.quoroumReq ? "text-tailwind" : "text-green"
                } [&>svg]:!h-5 [&>svg]:!w-5`}
              >
                {RequirementSVG}
              </div>
              <div className={`ml-2.5 ${totalVotePercent < community.quoroumReq ? "text-[#FFFFFFBF]" : "text-green"}`}>
                {totalVotePercent.toFixed(2)}%
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm">
              <div className="text-tailwind [&>svg]:!h-5 [&>svg]:!w-5">{BellSVG}</div>
              <div className="ml-2.5 text-[#FFFFFFBF]">
                {proposal.createdTime + proposal.duration >= Date.now() ? (
                  <CountDown time={proposal.createdTime + proposal.duration} />
                ) : (
                  "Time elapsed"
                )}
              </div>
            </div>
          </div>
          {isNew ? (
            <div className="mx-4 mt-[5px] flex h-4 w-12 items-center justify-center rounded-[12px] bg-primary text-[10px] font-bold text-black xl:mx-10">
              New
            </div>
          ) : (
            <div className="mx-4 mt-[5px] h-4 w-12 xl:mx-10" />
          )}

          <div className="mt-4 w-full flex-none md:mt-0 md:w-fit md:flex-1">
            <div
              className={`text-xl ${
                totalVotePercent < community.quoroumReq && proposal.createdTime + duration < Date.now()
                  ? "text-[#FFFFFFBF]"
                  : "text-white"
              }`}
            >
              <span
                className={
                  totalVotePercent < community.quoroumReq && proposal.createdTime + duration < Date.now()
                    ? "text-[#FFFFFFBF]"
                    : "text-primary"
                }
              >
                {proposal.createdTime + duration < Date.now()
                  ? totalVotePercent >= community.quoroumReq
                    ? "RESOLVED"
                    : "FAILED"
                  : "OPEN"}
                :
              </span>
              &nbsp;{proposal.title}
            </div>
            <div className="w-full max-w-full text-sm text-[#FFFFFF80] md:max-w-[400px]">
              <div className={`${detailOpen ? "line-clamp-[100]" : "line-clamp-[5]"} overflow-hidden text-ellipsis`}>
                {proposal.description.split("\n").map((data: any, i: number) => {
                  return data === "" ? <br key={i} /> : <p>{data}</p>;
                })}
              </div>
              <div className="cursor-pointer text-right hover:text-white" onClick={() => setDetailOpen(!detailOpen)}>
                {detailOpen ? "(show less)" : "(details)"}
              </div>
            </div>
          </div>
        </div>
        {proposal.createdTime + duration < Date.now() ? (
          totalVotePercent >= community.quoroumReq ? (
            <div className="ml-0 mr-0 mt-4 flex h-full flex-col items-center md:ml-4 md:mt-0 md:items-end xl:mr-14">
              <StyledButton className="!h-fit !w-fit p-[10px_12px] hover:!opacity-100">
                Passed: {yesBalance >= noBalance ? "For" : "Against"}
              </StyledButton>
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-[50px] text-right text-sm  leading-none">For</div>
                    <div className="mx-2 h-1.5 w-20">
                      <div
                        className="h-full bg-primary"
                        style={{ width: (totalBalance ? yesBalance / totalBalance : 0) * 80 + "px" }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-right text-xs">
                    {((totalBalance ? yesBalance / totalBalance : 0) * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-[50px] text-right text-sm  leading-none">Against</div>
                    <div className="mx-2 h-1.5 w-20">
                      <div
                        className="h-full bg-danger"
                        style={{ width: (totalBalance ? noBalance / totalBalance : 0) * 80 + "px" }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-right text-xs">
                    {((totalBalance ? noBalance / totalBalance : 0) * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="ml-0 mr-0 mt-4 flex flex-row md:ml-4 md:mt-0 md:flex-col xl:mr-14">
              <StyledButton className="!h-fit !bg-[#C4C4C4] p-[10px_12px] !text-[#202023] hover:!opacity-100">
                Quorum not met
              </StyledButton>
            </div>
          )
        ) : (
          <div className="ml-0 mr-0 mt-4 flex flex-row md:ml-4 md:mt-0 md:flex-col xl:mr-14">
            <div className="relative">
              <StyledButton
                className={`!h-fit ${pending ? "p-[10px_40px_10px_12px]" : "p-[10px_12px]"} whitespace-nowrap`}
                onClick={() => onVoteOrAgainst(account, community.pid, proposal.index, "yesVoted")}
                disabled={pending}
                pending={pending}
              >
                {proposal.yesVoted.includes(account?.toLowerCase()) ? "I'm for it!" : "For"}
              </StyledButton>
              {isVoted === "yesVoted" ? (
                <div className="absolute my-1.5 whitespace-nowrap text-sm text-white">Vote recorded!</div>
              ) : (
                ""
              )}
            </div>
            <div className="relative ml-4 mt-0 md:ml-0 md:mt-8">
              <StyledButton
                className={`!h-fit !bg-[#27272A] ${
                  pending ? "p-[10px_40px_10px_12px]" : "p-[10px_12px]"
                } whitespace-nowrap text-primary`}
                onClick={() => onVoteOrAgainst(account, community.pid, proposal.index, "noVoted")}
                disabled={pending}
                pending={pending}
              >
                {proposal.noVoted.includes(account?.toLowerCase()) ? "I'm against it" : "Against"}
              </StyledButton>
              {isVoted === "noVoted" ? (
                <div className="absolute my-1.5 whitespace-nowrap text-sm text-white">Vote recorded!</div>
              ) : (
                ""
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalCard;
