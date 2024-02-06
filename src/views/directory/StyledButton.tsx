import React, { ReactElement } from "react";
import { Oval } from "react-loader-spinner";

const StyledButton = ({
  onClick,
  disabled,
  children,
  type,
  boxShadow,
  className,
  pending,
}: {
  onClick?: any;
  disabled?: boolean;
  children?: any;
  type?: string;
  boxShadow?: boolean;
  className?: string;
  pending?: boolean;
}): ReactElement => {
  const renderLoading = () => {
    return (
      <div className="absolute right-2 top-0 flex h-full items-center">
        <Oval width={21} height={21} color={"white"} secondaryColor="black" strokeWidth={3} strokeWidthSecondary={3} />
      </div>
    );
  };
  const base =
    "flex items-center justify-center disabled:cursor-[not-allowed] font-brand rounded relative primary-shadow text-sm transition w-full h-full p-2 ";

  return type === "secondary" ? (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`border border-[#FFFFFF80] bg-[#B9B8B81A] font-medium  enabled:hover:bg-[#b9b8b837] disabled:bg-transparent disabled:opacity-70 ${base} ${className}`}
    >
      {children}
      {pending ? renderLoading() : ""}
    </button>
  ) : type === "quaternary" ? (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`border border-[#FFFFFF80] bg-[#B9B8B81A] font-medium enabled:hover:border-green enabled:hover:shadow-[0_1px_4px_rgba(47,211,93,0.75)] disabled:opacity-70 ${base} ${className}`}
    >
      {children}
      {pending ? renderLoading() : ""}
    </button>
  ) : type === "teritary" ? (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${
        boxShadow ? "staking-button-shadow border-[#EEBB19]" : "border-transparent"
      } border bg-[#B9B8B81A] font-medium text-[#FFFFFFBF]  enabled:hover:border-transparent enabled:hover:bg-dark enabled:hover:text-brand  disabled:opacity-70 ${base} ${className}`}
    >
      {children}
      {pending ? renderLoading() : ""}
    </button>
  ) : type === "quinary" ? (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`border border-[#FFFFFF80] bg-[#B9B8B81A] font-medium  hover:border-[#FFFFFFBF] hover:shadow-[0_1px_4px_rgba(255,255,255,0.75)]  disabled:opacity-70 ${base} ${className}`}
    >
      {children}
      {pending ? renderLoading() : ""}
    </button>
  ) : type === "senary" ? (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`border border-primary bg-transparent font-medium text-[#FFFFFFBF]  hover:shadow-[0_1px_4px_#EEBB19]  disabled:opacity-70 ${base} ${className}`}
    >
      {children}
      {pending ? renderLoading() : ""}
    </button>
  ) : type === "truenft" ? (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`bg-[#1B212D] font-medium text-[#FFFFFFBF]  hover:text-brand  disabled:opacity-70 ${base} ${className}`}
    >
      {children}
      {pending ? renderLoading() : ""}
    </button>
  ) : type === "danger" ? (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`bg-danger font-semibold text-black  hover:text-white  disabled:opacity-70 ${base} ${className}`}
    >
      {children}
      {pending ? renderLoading() : ""}
    </button>
  ) : type === "deployer" ? (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`border border-[#FFFFFF40] bg-transparent text-[#FFFFFFBF]   disabled:opacity-70 ${base} ${className}`}
    >
      {children}
      {pending ? renderLoading() : ""}
    </button>
  ) : type === "default" ? (
    <button type="button" onClick={onClick} disabled={disabled} className={`${className} ${base}`}>
      {children}
      {pending ? renderLoading() : ""}
    </button>
  ) : (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`bg-primary font-semibold text-black enabled:hover:opacity-70 disabled:bg-[#2F2F31] disabled:text-black ${base} ${className}`}
    >
      {children}
      {pending ? renderLoading() : ""}
    </button>
  );
};

export default StyledButton;
