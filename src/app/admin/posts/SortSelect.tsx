"use client";

import type { ChangeEvent } from "react";

/**
 * 排序下拉：选中后立刻提交所属表单（对应 element 的 select change 事件）。
 * 表单本身是 GET 提交，禁用 JS 时点「应用」也能生效。
 */
const SortSelect = ({
  options,
  defaultValue,
}: {
  options: { value: string; label: string }[];
  defaultValue: string;
}) => {
  const change = (event: ChangeEvent<HTMLSelectElement>) => {
    event.currentTarget.form?.requestSubmit();
  };

  return (
    <select
      className="admin-select admin-select--sm"
      name="sort"
      defaultValue={defaultValue}
      onChange={change}
      aria-label="排序方式"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          按{option.label}
        </option>
      ))}
    </select>
  );
};

export default SortSelect;
