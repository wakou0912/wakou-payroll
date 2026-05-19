"use client";
import { useState } from "react";

interface Props {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
  className?: string;
  allowNegative?: boolean;
  disabled?: boolean;
}

export default function NumberInput({
  value,
  onChange,
  placeholder = "0",
  className = "",
  allowNegative = false,
  disabled = false,
}: Props) {
  const [focused, setFocused] = useState(false);

  const display = focused
    ? value === 0 ? "" : String(value)
    : value === 0 ? "" : value.toLocaleString("ja-JP");

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full text-right px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${disabled ? "bg-gray-100 text-gray-500" : "bg-white"} ${className}`}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        setFocused(false);
        const raw = e.target.value.replace(/,/g, "");
        const n = parseInt(raw, 10);
        if (!isNaN(n) && (allowNegative || n >= 0)) {
          onChange(n);
        } else if (raw === "" || raw === "-") {
          onChange(0);
        }
      }}
      onChange={(e) => {
        const raw = e.target.value.replace(/,/g, "");
        if (allowNegative ? /^-?\d*$/.test(raw) : /^\d*$/.test(raw)) {
          const n = parseInt(raw, 10);
          if (!isNaN(n)) onChange(n);
          else if (raw === "" || raw === "-") onChange(0);
        }
      }}
    />
  );
}
