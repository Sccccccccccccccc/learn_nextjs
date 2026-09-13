import type { ReactNode, SVGProps } from "react";

/**
 * 后台用到的图标：统一 24×24 视框、currentColor 描边、stroke-width 1.8，
 * 视觉上对齐 element-plus 的图标（@element-plus/icons-vue）。
 */

export type AdminIconProps = SVGProps<SVGSVGElement> & {
  /** 渲染尺寸，默认 1em（跟随字号） */
  size?: number | string;
};

const Svg = ({ size = "1em", children, ...props }: AdminIconProps & { children: ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    {children}
  </svg>
);

export const HomeIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <path d="M3.5 10.4 12 3.6l8.5 6.8V20a.9.9 0 0 1-.9.9h-4.4v-5.6H8.8v5.6H4.4a.9.9 0 0 1-.9-.9z" />
  </Svg>
);

export const DocumentIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <path d="M14.2 3.2H7.1A1.9 1.9 0 0 0 5.2 5.1v13.8a1.9 1.9 0 0 0 1.9 1.9h9.8a1.9 1.9 0 0 0 1.9-1.9V7.9z" />
    <path d="M14.2 3.2v4.7h4.6M8.6 12.4h6.8M8.6 16.2h4.6" />
  </Svg>
);

export const CirclePlusIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="M12 8.4v7.2M8.4 12h7.2" />
  </Svg>
);

export const TrendIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <path d="M3.4 16.6 9.1 10l3.2 3.1 5.1-5.6" />
    <path d="M17.6 7.5h3.4v3.4M20.6 19.8H3.6" />
  </Svg>
);

export const LinkIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <path d="M9.6 14.4a3.6 3.6 0 0 1 0-5.1l2.7-2.7a3.6 3.6 0 0 1 5.1 5.1l-1.4 1.4" />
    <path d="M14.4 9.6a3.6 3.6 0 0 1 0 5.1l-2.7 2.7a3.6 3.6 0 0 1-5.1-5.1l1.4-1.4" />
  </Svg>
);

export const UserIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="8.4" r="3.4" />
    <path d="M5.2 20a6.8 6.8 0 0 1 13.6 0" />
  </Svg>
);

export const SettingsIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="2.9" />
    <path d="M19.2 14.4a1.6 1.6 0 0 0 .3 1.8l.1.1a1.9 1.9 0 1 1-2.7 2.7l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a1.9 1.9 0 1 1-3.8 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a1.9 1.9 0 1 1-2.7-2.7l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3.5a1.9 1.9 0 1 1 0-3.8h.2A1.6 1.6 0 0 0 4.8 7.1l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3a1.9 1.9 0 1 1 3.8 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.3a1.9 1.9 0 1 1 0 3.8h-.2a1.6 1.6 0 0 0-1.5 1z" />
  </Svg>
);

export const GridIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <rect x="3.6" y="3.6" width="7" height="7" rx="1.6" />
    <rect x="13.4" y="3.6" width="7" height="7" rx="1.6" />
    <rect x="3.6" y="13.4" width="7" height="7" rx="1.6" />
    <rect x="13.4" y="13.4" width="7" height="7" rx="1.6" />
  </Svg>
);

export const ExternalIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <path d="M14.4 3.6h6v6M20.4 3.6 12 12" />
    <path d="M18.4 14v5.1a1.9 1.9 0 0 1-1.9 1.9H5.2a1.9 1.9 0 0 1-1.9-1.9V7.8a1.9 1.9 0 0 1 1.9-1.9H11" />
  </Svg>
);

export const AlertIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="M12 7.6v5M12 16.1h.01" />
  </Svg>
);

export const ChevronDownIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <path d="m6.4 9.6 5.6 5.2 5.6-5.2" />
  </Svg>
);

export const ChevronRightIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <path d="m9.6 6.4 5.2 5.6-5.2 5.6" />
  </Svg>
);

export const ChevronLeftIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <path d="m14.4 6.4-5.2 5.6 5.2 5.6" />
  </Svg>
);

export const SearchIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <circle cx="11" cy="11" r="6.6" />
    <path d="m16.2 16.2 3.8 3.8" />
  </Svg>
);

export const PencilIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <path d="M15.6 4.6 19.4 8.4 8.6 19.2l-4.4.6.6-4.4z" />
    <path d="m13.8 6.4 3.8 3.8" />
  </Svg>
);

export const TrashIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <path d="M4.4 6.6h15.2M9.4 6.6V4.8a1 1 0 0 1 1-1h3.2a1 1 0 0 1 1 1v1.8" />
    <path d="M6.4 6.6 7.2 19a1.6 1.6 0 0 0 1.6 1.5h6.4A1.6 1.6 0 0 0 16.8 19l.8-12.4" />
    <path d="M10.4 10.4v6M13.6 10.4v6" />
  </Svg>
);

export const RefreshIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <path d="M20 11.2a8 8 0 1 0-.8 4.4" />
    <path d="M20.4 4.8v6h-6" />
  </Svg>
);

export const MenuIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <path d="M4.4 6.6h15.2M4.4 12h15.2M4.4 17.4h15.2" />
  </Svg>
);

export const SunIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="3.8" />
    <path d="M12 2.8v2.2M12 19v2.2M4.5 4.5l1.6 1.6M17.9 17.9l1.6 1.6M2.8 12H5M19 12h2.2M4.5 19.5l1.6-1.6M17.9 6.1l1.6-1.6" />
  </Svg>
);

export const MoonIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <path d="M20.4 14.4A8.4 8.4 0 0 1 9.6 3.6a8.4 8.4 0 1 0 10.8 10.8z" />
  </Svg>
);

export const MonitorIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <rect x="3.4" y="4.4" width="17.2" height="11.6" rx="1.8" />
    <path d="M9 19.6h6M12 16v3.6" />
  </Svg>
);

export const BellIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <path d="M17.6 10.6a5.6 5.6 0 1 0-11.2 0c0 4.2-1.6 5.6-1.6 5.6h14.4s-1.6-1.4-1.6-5.6" />
    <path d="M13.7 19a2 2 0 0 1-3.4 0" />
  </Svg>
);

export const CloseIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <path d="M6.6 6.6l10.8 10.8M17.4 6.6 6.6 17.4" />
  </Svg>
);

export const InboxIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <path d="M3.6 12.6 6.2 5a1.8 1.8 0 0 1 1.7-1.2h8.2A1.8 1.8 0 0 1 17.8 5l2.6 7.6v5.2a1.8 1.8 0 0 1-1.8 1.8H5.4a1.8 1.8 0 0 1-1.8-1.8z" />
    <path d="M3.6 12.6h4l1 2.4h6.8l1-2.4h4" />
  </Svg>
);

export const FireIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <path d="M12 2.8s4.8 3.6 4.8 8.4a4.8 4.8 0 0 1-9.6 0c0-1.4.6-2.6 1.4-3.6" />
    <path d="M12 21.2a4.4 4.4 0 0 0 4.4-4.4c0-2.6-2.6-4.4-4.4-6.6-1.8 2.2-4.4 4-4.4 6.6A4.4 4.4 0 0 0 12 21.2z" />
  </Svg>
);

export const ShieldIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <path d="M12 3.2 5.2 5.8v5.6c0 4 2.9 7.7 6.8 9.4 3.9-1.7 6.8-5.4 6.8-9.4V5.8z" />
    <path d="m9.2 12 2 2 3.6-3.8" />
  </Svg>
);

export const SparkIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <path d="M12 3.4 13.9 9l5.7 1.9-5.7 1.9L12 18.5l-1.9-5.7L4.4 10.9 10.1 9z" />
    <path d="M18.6 3.4v2.4M17.4 4.6h2.4" />
  </Svg>
);

export const LogoIcon = (props: AdminIconProps) => (
  <Svg {...props}>
    <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2" />
    <path d="M8.4 15.8 12 8.2l3.6 7.6" />
    <path d="M9.9 13.4h4.2" />
  </Svg>
);
