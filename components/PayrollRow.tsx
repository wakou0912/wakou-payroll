"use client";
import NumberInput from "./NumberInput";

interface Props {
  label: string;
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  highlight?: boolean;
  allowNegative?: boolean;
  tag?: string;
}

export default function PayrollRow({
  label,
  value,
  onChange,
  readOnly = false,
  highlight = false,
  allowNegative = false,
  tag,
}: Props) {
  return (
    <div className={`flex items-center gap-2 py-1 px-2 rounded ${highlight ? "bg-blue-50" : ""}`}>
      <span className="flex-1 text-sm text-gray-700">
        {label}
        {tag && (
          <span className="ml-1 text-xs text-gray-400 bg-gray-100 px-1 rounded">{tag}</span>
        )}
      </span>
      {readOnly ? (
        <span className={`w-32 text-right text-sm font-medium ${highlight ? "text-blue-700" : "text-gray-800"}`}>
          {value === 0 ? "—" : `${value.toLocaleString("ja-JP")} 円`}
        </span>
      ) : (
        <div className="w-32 flex items-center gap-1">
          <NumberInput
            value={value}
            onChange={onChange!}
            allowNegative={allowNegative}
            className="text-sm"
          />
          <span className="text-sm text-gray-500">円</span>
        </div>
      )}
    </div>
  );
}
