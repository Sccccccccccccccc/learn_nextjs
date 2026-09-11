/**
 * MingCute 图标（line 版）内联 SVG。
 * 取自 @iconify-json/mingcute 的 `back-line` / `bear-line` / `pencil-line`，
 * 对应 douLog 里 `~icons/mingcute/*` 的那几个。
 *
 * 尺寸写成 1em，父级用 font-size 控制大小 —— MainNav 的「图标默认 0 号字、
 * hover 展开到 0.9em」就是靠这个生效的。
 */

export const BackIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      d="M3.076 5.617A1 1 0 0 1 4 5h10a7 7 0 1 1 0 14H5a1 1 0 1 1 0-2h9a5 5 0 1 0 0-10H6.414l1.793 1.793a1 1 0 0 1-1.414 1.414l-3.5-3.5a1 1 0 0 1-.217-1.09"
    />
  </svg>
);

export const BearIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M18.5 2a3.5 3.5 0 0 1 1.796 6.505A9 9 0 1 1 3 12c0-1.24.25-2.42.704-3.495a3.5 3.5 0 1 1 4.8-4.8A9 9 0 0 1 12 2.999c1.24 0 2.42.25 3.495.704A3.5 3.5 0 0 1 18.5 2M12 5a7 7 0 1 0 0 14a7 7 0 0 0 0-14m0 7a1.5 1.5 0 0 1 1.012 2.608a.5.5 0 0 0 .488.392a1 1 0 1 1 0 2a2.5 2.5 0 0 1-1.5-.5a2.5 2.5 0 0 1-1.5.5a1 1 0 1 1 0-2a.5.5 0 0 0 .488-.392A1.5 1.5 0 0 1 12 12M9 9a1 1 0 0 1 .993.883L10 10v1a1 1 0 0 1-1.993.117L8 11v-1a1 1 0 0 1 1-1m6 0a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1M5.5 4a1.5 1.5 0 0 0-.817 2.758a9 9 0 0 1 2.075-2.075A1.5 1.5 0 0 0 5.5 4m13 0a1.5 1.5 0 0 0-1.258.683a9 9 0 0 1 2.075 2.075A1.499 1.499 0 0 0 18.5 4"
    />
  </svg>

);

export const PencilIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      d="M16.035 3.015a3 3 0 0 1 4.099-.135l.144.135l.707.707a3 3 0 0 1 .135 4.098l-.135.144L9.773 19.177a1.5 1.5 0 0 1-.562.354l-.162.047l-4.454 1.028a1 1 0 0 1-1.22-1.088l.02-.113l1.027-4.455a1.5 1.5 0 0 1 .29-.598l.111-.125zm-.707 3.535l-8.99 8.99l-.636 2.758l2.758-.637l8.99-8.99l-2.122-2.12Zm3.536-2.121a1 1 0 0 0-1.32-.083l-.094.083l-.708.707l2.122 2.121l.707-.707a1 1 0 0 0 .083-1.32l-.083-.094z"
    />
  </svg>
);
