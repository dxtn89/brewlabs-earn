/* eslint-disable react-hooks/exhaustive-deps */
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { useAccount } from "wagmi";
import { InfoSVG, checkCircleSVG } from "@components/dashboard/assets/svgs";
import { useContext, useState } from "react";
import DropDown from "@components/dashboard/TokenList/Dropdown";
import StyledInput from "@components/StyledInput";
import StyledButton from "views/directory/StyledButton";
import { DashboardContext } from "contexts/DashboardContext";
import { getBep20Contract } from "utils/contractHelpers";
import { useActiveChainId } from "@hooks/useActiveChainId";
import { useSigner } from "utils/wagmi";
import { CommunityContext } from "contexts/CommunityContext";
import { toast } from "react-toastify";
import { handleWalletError } from "lib/bridge/helpers";
import { useSwitchNetwork } from "@hooks/useSwitchNetwork";
import { NETWORKS } from "config/constants/networks";

const PollModal = ({ open, setOpen, community }) => {
  const coreCurrency = community.currencies[community.coreChainId];

  const { address: account } = useAccount();

  const [isFeeToVote, setIsFeeToVote] = useState(0);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitClicked, setSubmitClicked] = useState(false);
  const [choiceCount, setChoiceCount] = useState(2);
  const [options, setOptions] = useState([]);

  const durations = [7, 14, 30].filter((data, i) => i <= community.maxProposal);
  const { pending, setPending }: { pending: boolean; setPending: (pending: boolean) => {} } =
    useContext(DashboardContext);
  const { chainId } = useActiveChainId();
  const { data: signer } = useSigner();
  const { addPoll }: any = useContext(CommunityContext);
  const { canSwitch, switchNetwork } = useSwitchNetwork();

  const showError = (errorMsg: string) => {
    if (errorMsg) toast.error(errorMsg);
  };

  const onSubmitPoll = async () => {
    if (
      !title ||
      !description ||
      title.length > 35 ||
      description.length > 1000 ||
      options.slice(0, choiceCount).filter((option) => option.length > 50 || !option).length
    )
      return;
    setPending(true);
    try {
      if (community.feeToProposal.type === "Yes") {
        const tokenContract = getBep20Contract(chainId, community.currencies[chainId].address, signer);
        const estimateGas = await tokenContract.estimateGas.transfer(
          community.feeToProposal.address,
          community.feeToProposal.amount
        );

        const tx = await tokenContract.transfer(community.feeToProposal.address, community.feeToProposal.amount, {
          gasLimit: Math.ceil(Number(estimateGas) * 1.2),
        });
        await tx.wait();
      }
      const durations = [3600 * 24 * 7, 3600 * 24 * 14, 3600 * 24 * 30];
      await addPoll(
        {
          title,
          description,
          isFeeToVote: isFeeToVote === 0,
          duration: durations[duration] * 1000,
          owner: account.toLowerCase(),
          createdTime: Date.now(),
          voted: new Array(choiceCount).fill([]),
          options: options.slice(0, choiceCount),
        },
        community.pid
      );
      setOpen(false);
    } catch (e: any) {
      console.log(e);
      handleWalletError(e, showError);
    }
    setPending(false);
  };

  return (
    <Dialog
      open={open}
      className="fixed inset-0 z-[100] overflow-y-auto bg-gray-300 bg-opacity-90 font-brand backdrop-blur-[2px] dark:bg-zinc-900 dark:bg-opacity-80"
      onClose={() => setOpen(false)}
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
          <div className="primary-shadow relative w-[calc(100vw-24px)] max-w-[720px] rounded bg-[#18181B] p-[38px_12px_40px_12px] text-white md:p-[38px_47px_40px_64px] ">
            <div className="flex justify-between">
              <div className="flex-1 overflow-hidden">
                <div className="text-xl text-primary">New poll</div>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                  By <span className="text-[#FFFFFF80]">{account}</span>
                </div>
              </div>
              <div className="primary-shadow flex h-16 w-16 items-center justify-center overflow-hidden rounded bg-[#0E2130]">
                <img src={community.logo} alt={""} className="w-10 rounded" />
              </div>
            </div>

            <div className="mt-4 flex flex-col items-end justify-end text-sm xsm:flex-row xsm:items-center">
              {community.feeToVote.type === "Sometimes" ? (
                <div className="flex items-center">
                  <div className="relative mr-3">
                    Fee to vote?
                    <div
                      className="absolute -left-5 top-0.5 cursor-pointer text-tailwind transition hover:text-white [&>*:first-child]:!h-3.5 [&>*:first-child]:!w-3.5"
                      id="A small fee is charged on each user wallet vote sent to project nominated address."
                    >
                      {InfoSVG}
                    </div>
                  </div>
                  <DropDown
                    value={isFeeToVote}
                    setValue={setIsFeeToVote}
                    values={["Yes", "No"]}
                    type={"secondary"}
                    width="w-[72px]"
                    className="primary-shadow !rounded-lg !bg-[#FFFFFF1A]   !p-[6px_10px] text-sm text-primary"
                  />
                </div>
              ) : (
                ""
              )}
              <div className="my-2 flex items-center xsm:my-0">
                <div className="mx-3">Duration</div>
                <DropDown
                  value={duration}
                  setValue={setDuration}
                  values={durations.map((data) => data + " Days")}
                  type={"secondary"}
                  width="w-[100px]"
                  className="primary-shadow !rounded-lg !bg-[#FFFFFF1A] !p-[6px_10px] text-sm text-primary"
                />
              </div>
            </div>

            <div>
              <div className="flex flex-col items-start xsm:flex-row xsm:items-center">
                <div>Poll title</div>
                <div
                  className={`mb-2 ml-0 font-roboto text-xs font-medium xsm:mb-0 xsm:ml-5 ${
                    title.length > 35 ? "text-[#DC4545]" : "text-[#FFFFFF80]"
                  }`}
                >
                  Max characters for poll title 35.
                </div>
              </div>

              <StyledInput
                value={title}
                setValue={setTitle}
                placeholder="Write your title here"
                className="w-full !rounded-none !bg-[#202023]"
                isValid={!submitClicked || title}
              />
            </div>
            <div className="mt-[18px]">
              <div className="flex flex-col items-start justify-between xsm:flex-row xsm:items-center">
                <div>Poll description</div>
                <div
                  className={`font-roboto text-xs font-medium ${
                    description.length > 1000 ? "text-[#DC4545]" : "text-[#FFFFFF80]"
                  } mb-2 xsm:mb-0`}
                >
                  Max characters per poll description 1000.
                </div>
              </div>
              <StyledInput
                type={"textarea"}
                value={description}
                setValue={setDescription}
                placeholder="Write about your poll here..."
                className="h-[120px] w-full !rounded-none !bg-[#202023]"
                isValid={!submitClicked || description}
              />
            </div>

            <div className="mt-2 flex flex-col font-roboto sm:flex-row">
              <div className="w-full sm:w-[160px]">
                <div className="flex items-center justify-between">
                  <div>Poll choices</div>
                  <DropDown
                    value={choiceCount - 2}
                    setValue={(e) => setChoiceCount(e + 2)}
                    values={[2, 3, 4, 5]}
                    type={"secondary"}
                    width="w-14"
                    className="primary-shadow !rounded-lg !bg-[#FFFFFF1A]   !p-[6px_10px] text-sm text-primary"
                  />
                </div>
                <div className="mt-1 text-sm text-[#FFFFFF80]">Max characters per choice 50.</div>
              </div>
              <div className="ml-0 mt-4 flex-1 sm:ml-5 sm:mt-0">
                {new Array(choiceCount).fill("").map((data, i) => (
                  <div key={i} className="mb-1.5 flex text-sm">
                    <div className="mt-2 text-[#FFFFFF80]">{String.fromCharCode(65 + i)}</div>
                    <div className="mx-2 flex-1">
                      <StyledInput
                        value={options[i]}
                        setValue={(e) => {
                          let temp = [...options];
                          temp[i] = e;
                          setOptions(temp);
                        }}
                        placeholder={`What is option ${String.fromCharCode(65 + i)}?`}
                        className="h-8 w-full !rounded-none !bg-[#202023] !px-2"
                        isValid={!submitClicked || options[i]}
                      />
                    </div>
                    <div
                      className={`mt-2 ${
                        options[i] ? (options[i].length > 50 ? "text-[#DC4545]" : "text-white") : "text-tailwind"
                      } [&>svg]:!h-4 [&>svg]:!w-4`}
                    >
                      {checkCircleSVG}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex flex-col justify-end font-roboto text-xs text-[#FFFFFF80] sm:flex-row">
              <ul className="max-w-full list-disc sm:max-w-[200px]">
                <li>
                  Submit community proposal fee {community.feeToProposal.amount / Math.pow(10, coreCurrency.decimals)}{" "}
                  {coreCurrency.symbol} token.
                </li>
              </ul>
              <ul className="mx-0 max-w-full list-disc sm:mx-4 sm:max-w-[240px]">
                <li>You can only post one proposal or poll at a time.</li>
                <li>Proposals or polls with profanities will be removed.</li>
              </ul>
              {Object.keys(community.currencies).includes(chainId.toString()) ? (
                <StyledButton
                  className={`mt-4 !w-fit whitespace-nowrap ${
                    pending ? "p-[10px_40px_10px_12px]" : "p-[10px_12px]"
                  } !font-normal sm:mt-0`}
                  onClick={() => {
                    setSubmitClicked(true);
                    onSubmitPoll();
                  }}
                  disabled={pending}
                  pending={pending}
                >
                  <span className="!font-roboto font-bold">Submit</span>&nbsp;my poll
                </StyledButton>
              ) : (
                <StyledButton
                  className="!w-fit whitespace-nowrap p-[10px_12px]"
                  onClick={() => {
                    switchNetwork(community.coreChainId);
                  }}
                  disabled={!canSwitch}
                >
                  Switch {NETWORKS[community.coreChainId].chainName}
                </StyledButton>
              )}
            </div>

            <button
              onClick={() => {
                setOpen(false);
              }}
              className="absolute -right-2 -top-2 rounded-full bg-white p-2 dark:bg-zinc-900 sm:dark:bg-zinc-800"
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6 dark:text-slate-400" />
            </button>
          </div>
        </motion.div>
      </div>
      <ReactTooltip
        anchorId={"A small fee is charged on each user wallet vote sent to project nominated address."}
        place="top"
        content="A small fee is charged on each user wallet vote sent to project nominated address."
      />
    </Dialog>
  );
};

export default PollModal;
