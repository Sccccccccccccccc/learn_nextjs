"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { login } from "@/server/auth-actions";
import { DEMO_ACCOUNT, type LoginState } from "@/server/auth-shared";
import { AlertIcon, LogoIcon, ShieldIcon } from "../icons";
import styles from "./LoginForm.module.css";

import { signIn, signUp } from "@/lib/auth-client";
import { useState } from "react";

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

  const [ email, setEmail] = useState(""); // 注册邮箱
  const [ signInEmail, setSignInEmail] = useState("") // 登录邮箱
  const [name, setName] = useState(""); // 用户名
  const [password, setPassword] = useState(""); // 密码
  const [signInPassword, setSignInPassword] = useState(""); // 登录密码

  // 注册
  const signUpHandler = async () => {
    const { data, error } = await signUp.email({
      email,
      password,
      name,
    })

    if (error) {
      // TODO: 提交错误信息反馈
      console.log(error)
    }else {
      console.log(data)
    }
  }

  // 登录
  const signInHandler = async () => {
    const { data, error } = await signIn.email({
      email: signInEmail,
      password: signInPassword,
    })

    if (error) {
      // TODO: 提交错误信息反馈
      console.log(error)
    }else {
      console.log(data)
    }
  }

  return (
    <div>
      <h1>注册</h1>
      <input type="text" placeholder="用户名" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="text" placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={signUpHandler}>注册</button>
      <hr />
      <h1>登录</h1>
      <input type="text" placeholder="邮箱" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} />
      <input type="password" placeholder="密码" value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} />
  
    </div>
  )



  // return (
  //   <div className={styles.page}>
  //     <div className={styles.card}>
  //       <div className={styles.brand}>
  //         <span className={styles.brandMark}>
  //           <LogoIcon size={22} />
  //         </span>
  //         <div>
  //           <h1 className={styles.brandTitle}>管理后台</h1>
  //           <p className={styles.brandDesc}>用演示账号登录，先跑通内容管理流程</p>
  //         </div>
  //       </div>

  //       <form action={formAction} className={styles.form}>
  //         <div className="admin-field">
  //           <label className="admin-label admin-label--required" htmlFor="email">
  //             邮箱
  //           </label>
  //           <input
  //             id="email"
  //             name="email"
  //             type="email"
  //             className="admin-input"
  //             defaultValue={DEMO_ACCOUNT.email}
  //             autoComplete="username"
  //             required
  //           />
  //         </div>

  //         <div className="admin-field">
  //           <label className="admin-label admin-label--required" htmlFor="password">
  //             密码
  //           </label>
  //           <input
  //             id="password"
  //             name="password"
  //             type="password"
  //             className="admin-input"
  //             defaultValue={DEMO_ACCOUNT.password}
  //             autoComplete="current-password"
  //             required
  //           />
  //         </div>

  //         {state.error ? (
  //           <p className={styles.error}>
  //             <AlertIcon size={14} />
  //             {state.error}
  //           </p>
  //         ) : null}

  //         <SubmitButton />

  //         <p className={styles.demo}>
  //           <ShieldIcon size={14} />
  //           演示账号：{DEMO_ACCOUNT.email} / {DEMO_ACCOUNT.password}
  //         </p>
  //       </form>

  //       <div className={styles.footer}>
  //         <Link href="/index">返回博客前台</Link>
  //         <span>·</span>
  //         <span>v0.1.0 初始化版本</span>
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default LoginForm;
