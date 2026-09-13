import styles from "./GeometricBackground.module.css";

export default function GeometricBackground() {
  return (
    <div aria-hidden className={styles.bg}>
      <div
        className={styles.shape}
        style={{ width: 220, height: 220, top: "10%", left: "8%", transform: "rotate(20deg)" }}
      />
      <div
        className={styles.shape}
        style={{ width: 160, height: 160, bottom: "16%", right: "12%", transform: "rotate(-15deg)" }}
      />
      <div
        className={styles.shape}
        style={{ width: 120, height: 120, top: "58%", left: "18%", transform: "rotate(45deg)" }}
      />
      <div
        className={styles.shape}
        style={{ width: 90, height: 90, top: "18%", right: "28%", transform: "rotate(-30deg)" }}
      />
    </div>
  );
}
