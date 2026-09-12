"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { login } from "@/server/auth-actions";
import { DEMO_ACCOUNT, type LoginState } from "@/server/auth-shared";
import { AlertIcon, LogoIcon, ShieldIcon } from "@/components/admin/icons";
import styles from "./LoginForm.module.css";

const initialState: LoginState = {};

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={`admin-btn admin-btn--primary ${styles.submit}`} disabled={pending}>
      {pending ? "登录中…" : "登 录"}
    </button>
  );
};

const LoginForm = () => {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>
            <LogoIcon size={22} />
          </span>
          <div>
            <h1 className={styles.brandTitle}>DouLog 管理后台</h1>
            <p className={styles.brandDesc}>用演示账号登录，先跑通内容管理流程</p>
          </div>
        </div>

        <form action={formAction} className={styles.form}>
          <div className="admin-field">
            <label className="admin-label admin-label--required" htmlFor="email">
              邮箱
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="admin-input"
              defaultValue={DEMO_ACCOUNT.email}
              autoComplete="username"
              required
            />
          </div>

          <div className="admin-field">
            <label className="admin-label admin-label--required" htmlFor="password">
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="admin-input"
              defaultValue={DEMO_ACCOUNT.password}
              autoComplete="current-password"
              required
            />
          </div>

          {state.error ? (
            <p className={styles.error}>
              <AlertIcon size={14} />
              {state.error}
            </p>
          ) : null}

          <SubmitButton />

          <p className={styles.demo}>
            <ShieldIcon size={14} />
            演示账号：{DEMO_ACCOUNT.email} / {DEMO_ACCOUNT.password}
          </p>
        </form>

        <div className={styles.footer}>
          <Link href="/index">返回博客前台</Link>
          <span>·</span>
          <span>v0.1.0 初始化版本</span>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
