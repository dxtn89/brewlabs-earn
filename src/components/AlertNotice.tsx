import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";

const AlertNotice = () => (
  <div className="z-90 mx-auto my-8 max-w-6xl">
    <div className="relative rounded-md bg-gray-800 p-4 ring ring-gray-600/10">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="text-yellow-400 h-5 w-5" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-yellow-800 text-sm font-medium">Performance issue</h3>
          <div className="text-yellow-700 mt-2 text-sm">
            <p>
              We are aware of a loading issue, this is impacting a few tools which we are currently investigating.
              Please stand by as we work to resolve this issue. We will report back once the issue is resolved.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AlertNotice;
