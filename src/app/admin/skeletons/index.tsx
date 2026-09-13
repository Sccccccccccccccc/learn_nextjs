import "../dashboard.css";

/**
 * 工作台的骨架屏与页面级样式
 * 页面样式走普通 CSS 文件 + `admin-` 前缀，和 globals.css 里的通用类保持一致。
 */
export const DashboardSkeleton = () => (
  <>
    <div className="admin-grid-4">
      {[0, 1, 2, 3].map((index) => (
        <div className="admin-card" key={index}>
          <div style={{ padding: 18 }}>
            <div className="admin-skeleton" style={{ width: 72, height: 13 }} />
            <div className="admin-skeleton" style={{ width: 120, height: 26, marginTop: 12 }} />
            <div className="admin-skeleton" style={{ width: 150, height: 12, marginTop: 10 }} />
          </div>
        </div>
      ))}
    </div>
    <div className="admin-grid-2">
      <div className="admin-card">
        <div className="admin-card__body">
          <div className="admin-skeleton" style={{ height: 180 }} />
        </div>
      </div>
      <div className="admin-card">
        <div className="admin-card__body">
          <div className="admin-skeleton" style={{ height: 180 }} />
        </div>
      </div>
    </div>
  </>
);

export const TableSkeleton = ({ rows = 4 }: { rows?: number }) => (
  <div className="admin-card">
    <div className="admin-card__body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Array.from({ length: rows }).map((_, index) => (
        <div className="admin-skeleton" key={index} style={{ height: 40 }} />
      ))}
    </div>
  </div>
);
