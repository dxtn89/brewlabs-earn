/* eslint-disable react-hooks/exhaustive-deps */

import contracts from "config/constants/contracts";
import { useActiveChainId } from "@hooks/useActiveChainId";

import StyledButton from "../../StyledButton";
import ChainSelect from "../ChainSelect";
import DropDown from "views/directory/IndexDetail/Dropdowns/Dropdown";

const SelectToken = ({ setStep, tokenType, setTokenType }) => {
  const { chainId } = useActiveChainId();

  const isSupportedChain = Object.keys(contracts.tokenFactory).includes(chainId.toString());

  const tokenTypes = ["Standard Token"];

  return (
    <div>
      <div className="mt-2 text-white">
        <div className="mb-1">1.Select deployment network:</div>
        <ChainSelect />
      </div>
      <div>
        <div className="mb-1 text-white">2. Type of token:</div>
      </div>
      <div className="mt-1">
        <DropDown
          defaultValue={"What type of token are you seeking to deploy?"}
          value={tokenType}
          setValue={setTokenType}
          data={tokenTypes}
          height={"44px"}
          rounded={"12px"}
          className="!bg-[#18181A] !pl-4 !pr-[18px] !text-base !text-white"
          bodyClassName="!bg-none !bg-[#18181A]"
          itemClassName={`hover:!bg-[#28282b] !justify-start !px-4`}
          chevronClassName={"!text-brand [&>svg]:!h-3.5 [&>svg]:!w-3.5"}
        />
      </div>

      <div className="py-6 text-sm text-[#FFFFFF80]">
        *A standard token is a streamline, simple, gas friendly and inexpensive token to distribute. It has no
        complexities to confuse users, it is a basic token ERC20 by all definitions. A standard token uses all
        recognized ERC20 token development libraries.
      </div>
      <div className="mb-5 h-[1px] w-full bg-[#FFFFFF80]" />
      <div className="mx-auto h-12 max-w-[500px]">
        <StyledButton
          type="primary"
          onClick={() => {
            setStep(2);
          }}
          disabled={!isSupportedChain || tokenType === -1}
        >
          {tokenType === -1 ? "Select type of token" : isSupportedChain ? "Next" : "Not support current chain"}
        </StyledButton>
      </div>
    </div>
  );
};

export default SelectToken;
