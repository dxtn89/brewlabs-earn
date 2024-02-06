import { checkCircleSVG } from "@components/dashboard/assets/svgs";

const Security = ({ size = "normal" }: { size?: string }) => (
  <div
    className={`${
      size === "lg" ? "text-xs" : "text-[10px]"
    } flex items-center justify-center rounded-[12px] bg-[#191D24] p-[8px_10px] font-roboto font-bold leading-none text-white`}
  >
    <div
      className={`mr-2 text-[#2FD35DBF] ${
        size === "lg" ? " [&>svg]:h-3.5 [&>svg]:w-3.5" : " [&>svg]:h-2.5 [&>svg]:w-2.5"
      }`}
    >
      {checkCircleSVG}
    </div>
    <div>Go+ Security</div>
  </div>
);

export default Security;
