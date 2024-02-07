"use client";

import { forwardRef, useState, InputHTMLAttributes, ChangeEvent } from "react";
import { cn } from "lib/utils";
import Image from "next/image";

import { Input } from "@components/ui/input";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const InputFile = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];

    console.log(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  function getImageData(event: ChangeEvent<HTMLInputElement>) {
    // FileList is immutable, so we need to create a new one
    const dataTransfer = new DataTransfer();

    // Add newly uploaded images
    Array.from(event.target.files!).forEach((image) => dataTransfer.items.add(image));

    const files = dataTransfer.files;
    const displayUrl = URL.createObjectURL(event.target.files![0]);

    return { files, displayUrl };
  }

  const handleRemoveClick = () => {
    setSelectedFile(null);
  };

  return (
    <div className="relative flex w-full  items-center justify-center">
      <label
        htmlFor="dropzone-file"
        className="dark:hover:bg-bray-800 flex h-64 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed  border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-700/70"
      >
        <div className="flex flex-col items-center justify-center pb-6 pt-5">
          {selectedFile ? (
            <Image src={selectedFile} alt="Preview" className="object-contain p-2" width={500} height={500} />
          ) : (
            <>
              <svg
                className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
            </>
          )}
        </div>
        {/* <Input type="file" {...props} ref={ref} accept="image/png, image/jpeg" /> */}
        <Input
          {...props}
          type="file"
          className="opacity-0"
          accept="image/png, image/jpeg"
          onChange={(e) => {
            const { files, displayUrl } = getImageData(e);
            setSelectedFile(displayUrl);
            // onChange(files);
          }}
        />
      </label>
      {selectedFile && (
        <button
          onClick={handleRemoveClick}
          className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-500 text-white"
          aria-label="Remove image"
        >
          X
        </button>
      )}
    </div>
  );
});

InputFile.displayName = "InputFile";

export { InputFile };
