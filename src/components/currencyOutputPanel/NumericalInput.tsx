import { useEffect, useState } from "react";
import { escapeRegExp } from "../../utils";

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`); // match escaped "." characters via in a non-capturing group
let searchTimeout;

const NumericalInput = ({
  value,
  onUserInput,
  placeholder,
  decimals = 18,
  disable = false,
  size,
}: {
  value: string | number;
  onUserInput: (input: string) => void;
  placeholder?: string;
  error?: boolean;
  fontSize?: string;
  align?: "right" | "left";
  decimals?: number;
  isZap?: boolean;
  disable?: boolean;
  size?: string;
}) => {
  const enforcer = (nextUserInput: string) => {
    if (nextUserInput === "" || inputRegex.test(escapeRegExp(nextUserInput))) {
      onUserInput(nextUserInput);
    }
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.validity.valid) {
      enforcer(e.target.value.replace(/,/g, "."));
    }
  };

  return (
    <input
      value={value}
      onChange={handleOnChange}
      inputMode="decimal"
      placeholder={placeholder || "0.0"}
      pattern={`^[0-9]*[.,]?[0-9]{0,${decimals}}$`}
      className={`w-full max-w-[250px] truncate bg-transparent ${
        size === "sm" ? "" : "sm:text-4xl"
      } text-2xl outline-0`}
      maxLength={79}
      disabled={disable}
    />
  );
};

export default NumericalInput;
