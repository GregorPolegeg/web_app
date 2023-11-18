import React, { FC } from "react";
import { Control, Controller, FieldValues, RegisterOptions } from "react-hook-form";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

interface FormInputFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: string;
  rules?: RegisterOptions;
  type?: string;
  placeholder?: string;
  icon?: JSX.Element;
  defaultValue?: string;
  toggleVisibility?: () => void;
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isVisible?: boolean;
}

export const FormInputField: FC<FormInputFieldProps<any>> = ({
  control,
  name,
  rules,
  type = "text",
  placeholder,
  icon,
  defaultValue = "",
  value,
  onChange,
  toggleVisibility,
  isVisible,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <div className="relative mb-5">
          {icon && <label className="absolute top-1/4 text-xl">{icon}</label>}
          <input
            {...field}
            type={isVisible !== undefined ? (isVisible ? "text" : "password") : type}
            placeholder={placeholder}
            className="without-ring w-full border-b border-gray-400 p-2 pl-8"
            required={!!rules?.required}
          />
          {toggleVisibility && (
            <span className="absolute right-3 top-1/4 cursor-pointer" onClick={toggleVisibility}>
              {isVisible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          )}
          {error && <p className="text-red-500">{error.message}</p>}
        </div>
      )}
    />
  );
};
