const Soon = ({ className, text = "Soon", fade = false }: { className?: string; text?: string; fade?: boolean }) => (
  <div
    className={`${className} absolute -right-3 -top-2 z-10 flex h-4 w-10 items-center justify-center rounded-[30px] bg-primary font-brand text-xs font-bold text-black ${
      fade ? "animate-flicker" : ""
    }`}
  >
    {text}
  </div>
);

export default Soon;
