import { useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { DashboardContext } from "contexts/DashboardContext";
import useENSName from "hooks/ENS/useENSName";
import { getBalances } from "hooks/useTokenMultiChainBalance";

import CountDown from "components/CountDown";
import { BellSVG, InfoSVG, RequirementSVG } from "components/dashboard/assets/svgs";
import StyledButton from "views/directory/StyledButton";
import ViewPollModal from "./ViewPollModal";

const PollCard = ({ poll, community, index }: { poll: any; community: any; index: number }) => {
  const { address: account } = useAccount();
  const name = useENSName(poll.owner);
  const [isVoted, setIsVoted] = useState(false);
  const [votedOption, setVotedOption] = useState(-1);
  const { pending }: any = useContext(DashboardContext);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewOptionOpen, setViewOptionOpen] = useState(false);
  const [totalSupply, setTotalSupply] = useState(0);
  const [totalVotePercent, setTotalVotePercent] = useState(0);
  const [totalVoted, setTotalVoted] = useState([]);
  const [balancesByVote, setBalancesByVote] = useState([]);

  const stringifiedPoll = JSON.stringify(poll);

  useEffect(() => {
    let addresses = new Object(),
      tokens = new Object();

    let totalVoted = [];

    Object.keys(community.currencies).map((key) => {
      let temp = [];
      poll.voted.map((vote) => {
        temp = [...temp, ...vote];
        totalVoted = [...totalVoted, ...vote];
      });
      addresses[key] = temp;
      tokens[key] = new Array(temp.length).fill(community.currencies[key]);
    });

    setTotalVoted(totalVoted);
    const _totalSupply = community.totalSupply / Math.pow(10, community.currencies[community.coreChainId].decimals);
    setTotalSupply(_totalSupply);

    getBalances(tokens, addresses)
      .then((result) => {
        const { totalBalance, balances }: any = result;
        let _balancesByVote = [];
        for (let i = 0; i < poll.voted.length; i++) {
          let balance = 0;
          for (let k = 0; k < poll.voted[i].length; k++) {
            for (let j = 0; j < balances[community.coreChainId].length; j++) {
              if (poll.voted[i][k] === balances[community.coreChainId][j].account)
                balance += balances[community.coreChainId][j].balance;
            }
          }
          _balancesByVote.push({
            balance,
            percent: balance / totalBalance,
            index: i,
          });
        }

        setBalancesByVote(_balancesByVote);

        const _totalVotePercent = (totalBalance / _totalSupply) * 100;
        setTotalVotePercent(_totalVotePercent);
      })
      .catch((e) => console.log(e));
  }, [stringifiedPoll]);

  const duration = poll.duration;

  const isNew = !totalVoted.includes(account?.toLowerCase()) && poll.createdTime + duration >= Date.now();
  const isExcalmation =
    account && community.members.includes(account.toLowerCase()) && !totalVoted.includes(account.toLowerCase());

  const topBalance = balancesByVote.sort((a, b) => b.balance - a.balance)[0];

  useEffect(() => {
    if (!account) {
      setVotedOption(-1);
      return;
    }
    let _voted = -1;
    poll.voted.map((votes, i) => {
      if (votes.includes(account.toLowerCase())) _voted = i;
    });
    setVotedOption(_voted);
  }, [stringifiedPoll, account]);

  return (
    <>
      <ViewPollModal
        open={viewOptionOpen}
        setOpen={setViewOptionOpen}
        community={community}
        poll={poll}
        setIsVoted={setIsVoted}
      />
      <div
        className={`primary-shadow relative mb-3 flex w-full justify-end rounded bg-[#B9B8B80D] p-[20px_12px_32px_40px] md:p-[20px_20px_32px_60px]`}
      >
        {isExcalmation && poll.createdTime + duration >= Date.now() ? (
          <div className="absolute left-2.5 top-[22px] text-primary md:left-5 [&>svg]:!h-5 [&>svg]:!w-5 [&>svg]:!opacity-100">
            {InfoSVG}
          </div>
        ) : (
          ""
        )}
        <div className="flex w-full max-w-[1100px] flex-col justify-between md:flex-row">
          <div className="flex w-full flex-1 flex-wrap md:w-fit">
            <div>
              <div
                className={`text-xl ${
                  totalVotePercent < community.quoroumReq && poll.createdTime + duration < Date.now()
                    ? "text-[#FFFFFFBF]"
                    : "text-primary"
                }`}
              >
                Proposal #{index + 1}
              </div>
              <div className="w-[110px] overflow-hidden text-ellipsis text-sm text-white">
                {name.loading ? poll.owner : name.ENSName ?? poll.owner}
              </div>
              <div className="mt-3 flex items-center text-sm">
                <div
                  className={`[>svg]:!w-[22px] ${
                    totalVotePercent < community.quoroumReq ? "text-tailwind" : "text-green"
                  } [&>svg]:!h-5 [&>svg]:!w-5`}
                >
                  {RequirementSVG}
                </div>
                <div
                  className={`ml-2.5 ${totalVotePercent < community.quoroumReq ? "text-[#FFFFFFBF]" : "text-green"}`}
                >
                  {totalVotePercent.toFixed(2)}%
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm">
                <div className="text-tailwind [&>svg]:!h-5 [&>svg]:!w-5">{BellSVG}</div>
                <div className="ml-2.5 text-[#FFFFFFBF]">
                  {poll.createdTime + poll.duration >= Date.now() ? (
                    <CountDown time={poll.createdTime + poll.duration} />
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
                  totalVotePercent < community.quoroumReq && poll.createdTime + duration < Date.now()
                    ? "text-[#FFFFFFBF]"
                    : "text-white"
                }`}
              >
                <span
                  className={
                    totalVotePercent < community.quoroumReq && poll.createdTime + duration < Date.now()
                      ? "text-[#FFFFFFBF]"
                      : "text-primary"
                  }
                >
                  {poll.createdTime + duration < Date.now()
                    ? totalVotePercent >= community.quoroumReq
                      ? "RESOLVED"
                      : "FAILED"
                    : "OPEN"}
                  :
                </span>
                &nbsp;{poll.title}
              </div>
              <div className="w-full max-w-full text-sm text-[#FFFFFF80] md:max-w-[400px]">
                <div className={`${detailOpen ? "line-clamp-[100]" : "line-clamp-[5]"} overflow-hidden text-ellipsis`}>
                  {poll.description.split("\n").map((data: any, i: number) => {
                    return data === "" ? <br key={i} /> : <p>{data}</p>;
                  })}
                </div>
                <div className="cursor-pointer text-right hover:text-white" onClick={() => setDetailOpen(!detailOpen)}>
                  {detailOpen ? "(show less)" : "(details)"}
                </div>
              </div>
            </div>
          </div>
          {poll.createdTime + duration < Date.now() ? (
            totalVotePercent >= community.quoroumReq ? (
              <div className="ml-0 mr-0 mt-4 flex h-full flex-col items-center md:ml-4 md:mt-0 md:items-end xl:mr-14">
                <StyledButton className="!h-fit !w-fit p-[10px_12px] hover:!opacity-100">
                  Passed: {poll.options[topBalance.index]}
                </StyledButton>
                <div className="mt-2 font-roboto text-sm text-[#FFFFFFBF]">
                  Option {String.fromCharCode(65 + votedOption)} - {poll.options[votedOption]}
                </div>
                <div className="mt-1">
                  {poll.options.map((option, i) => (
                    <div className="mt-2 flex items-center justify-between" key={i}>
                      <div className="flex items-center">
                        <div className="w-[50px] text-right text-sm  leading-none">{option}</div>
                        <div className="mx-2 h-1.5 w-20">
                          <div
                            className="h-full bg-primary"
                            style={{ width: (balancesByVote[i]?.percent ?? 0) * 80 + "px" }}
                          />
                        </div>
                      </div>
                      <div className="w-12 text-right text-xs">
                        {((balancesByVote[i]?.percent ?? 0) * 100).toFixed(2)}%
                      </div>
                    </div>
                  ))}
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
              <div className="relative mt-4 flex flex-col items-start md:items-end">
                {votedOption === -1 ? (
                  <StyledButton
                    className="!h-fit p-[10px_12px] !font-roboto"
                    disabled={pending}
                    onClick={() => setViewOptionOpen(true)}
                  >
                    View poll options
                  </StyledButton>
                ) : (
                  <>
                    <StyledButton className="!h-fit !w-fit p-[10px_12px] !font-roboto">
                      Option {String.fromCharCode(65 + votedOption)}
                    </StyledButton>
                    <div className="mt-2 font-roboto text-sm text-[#FFFFFFBF]">
                      Option {String.fromCharCode(65 + votedOption)} - {poll.options[votedOption]}
                    </div>
                  </>
                )}
                {isVoted ? (
                  <div className="absoluste my-1.5 whitespace-nowrap text-sm text-white">Vote recorded!</div>
                ) : (
                  ""
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PollCard;
