"use client";

import { useEffect, useState } from "react";
import styles from "./Footer.module.css";

export default function Footer() {
  const [year, setYear] = useState("");

  useEffect(() => {
    setYear(String(new Date().getFullYear()));
  }, []);

  return <footer className={styles.footer}>© {year} footer </footer>;
}
