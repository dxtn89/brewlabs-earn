import RequireAlert from "@components/RequireAlert";
import { escapeRegExp } from "../../utils";

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`); // match escaped "." characters via in a non-capturing group

const StyledInput = ({
  value,
  setValue,
  className = "",
  placeholder,
  type = "text",
  isValid = true,
  requireText = "Please input field",
  onClick,
}: {
  value: any;
  setValue: any;
  className?: string;
  placeholder?: string;
  type?: string;
  isValid?: boolean | string;
  requireText?: string;
  onClick?: any;
}) => {
  const enforcer = (nextUserInput) => {
    if (nextUserInput === "" || inputRegex.test(escapeRegExp(nextUserInput))) {
      setValue(nextUserInput);
    }
  };

  const handleOnChange = (e) => {
    if (e.currentTarget.validity.valid) {
      enforcer(e.target.value.replace(/,/g, "."));
    }
  };

  return (
    <>
      {type === "number" ? (
        <input
          value={value}
          onChange={handleOnChange}
          inputMode="decimal"
          placeholder={placeholder || "0.00"}
          pattern={`^[0-9]*[.,]?[0-9]{0,18}$`}
          className={`${className} primary-shadow focusShadow relative z-10 h-10 rounded border-none bg-[#B9B8B81A] p-[16px_14px] text-sm text-white outline-none`}
          maxLength={79}
          onClick={onClick}
        />
      ) : type === "text" ? (
        <input
          type={"text"}
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          className={`${className} primary-shadow focusShadow relative z-10 h-10 rounded border-none bg-[#B9B8B81A] p-[16px_14px] text-sm text-white outline-none`}
          onClick={onClick}
        />
      ) : (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          className={`${className} primary-shadow focusShadow relative z-10 h-10 rounded border-none bg-[#B9B8B81A] p-[16px_14px] text-sm text-white outline-none`}
          onClick={onClick}
        />
      )}

      {!isValid ? <RequireAlert text={requireText} value={isValid} /> : ""}
    </>
  );
};

export default StyledInput;
