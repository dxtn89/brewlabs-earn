import { Oval } from "react-loader-spinner";

const LoadingPage = () => {
  return (
    <div className="w-full bg-[#18181b80] absolute left-0 top-0 z-[1000] h-full min-h-screen backdrop-blur">
      <div className="flex h-full max-h-screen w-full items-center justify-center">
        <Oval
          width={80}
          height={80}
          color={"#3F3F46"}
          secondaryColor="black"
          strokeWidth={4}
          strokeWidthSecondary={4}
        />
      </div>
    </div>
  );
};

export default LoadingPage;
