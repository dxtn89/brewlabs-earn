/* eslint-disable react-hooks/exhaustive-deps */
import { ChevronDownSVG } from "@components/dashboard/assets/svgs";
import { useState, useEffect, useRef } from "react";

const DropDown = ({
  defaultValue = null,
  value,
  setValue,
  data,
  className,
  bodyClassName,
  itemClassName,
  chevronClassName,
  rounded = "8px",
  height = "30px",
  isBorder,
}: {
  defaultValue?: string;
  setValue?: any;
  value: number;
  data: any[];
  className?: string;
  bodyClassName?: string;
  itemClassName?: string;
  chevronClassName?: string;
  rounded?: string;
  height?: string;
  isBorder?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const dropRef: any = useRef();

  useEffect(() => {
    document.addEventListener("mouseup", function (event) {
      if (dropRef.current && !dropRef.current.contains(event.target)) {
        setOpen(false);
      }
    });
  }, []);

  return (
    <div
      className={`primary-shadow relative z-[100] flex w-full cursor-pointer items-center justify-between bg-primary px-2 text-sm text-black transition ${className} ${
        isBorder && open ? "border-b border-[#D9D9D980]" : ""
      }`}
      style={{ borderRadius: open ? `${rounded} ${rounded} 0 0` : `${rounded}`, height }}
      ref={dropRef}
      onClick={() => setOpen(!open)}
    >
      <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
        {value === -1 ? defaultValue : data[value]}
      </div>
      <div className={`${open ? "-scale-y-100" : ""} [&>svg]:!h-3 [&>svg]:!w-3 ${chevronClassName}`}>
        {ChevronDownSVG}
      </div>

      <div
        className={`primary-shadow absolute  left-0 w-full overflow-hidden bg-[linear-gradient(180deg,#ffcc32,#e5cc7e)] transition-all ${bodyClassName}`}
        style={{
          borderRadius: `0 0 ${rounded} ${rounded}`,
          height: open ? parseInt(height) * data.length : 0,
          top: height,
        }}
      >
        {data.map((_data, i) => {
          return (
            <div
              key={i}
              className={`flex cursor-pointer items-center justify-center transition-all hover:bg-[#ffde7c] ${itemClassName}`}
              style={{ height }}
              onClick={() => setValue(i)}
            >
              {_data}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DropDown;
