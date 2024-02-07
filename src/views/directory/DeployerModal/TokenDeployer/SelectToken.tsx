import ChainSelect from "views/swap/components/ChainSelect";

const SelectToken = ({ showNext, showPrev }) => {
  showNext(true);
  showPrev(false);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="mb-1">Select deployment network</h3>

      <ChainSelect id="chain-select" />
      <div className="py-6 text-xs text-gray-500">
        *Right now we only support standard ERC20 token deployment. A standard token is a streamline, simple, gas
        friendly and inexpensive token to distribute. It has no complexities to confuse users, it is a basic token ERC20
        by all definitions. A standard token uses all recognized ERC20 token development libraries.
      </div>
    </div>
  );
};

export default SelectToken;
