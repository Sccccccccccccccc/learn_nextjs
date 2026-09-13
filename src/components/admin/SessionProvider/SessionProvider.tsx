"use client";

import { createContext, useContext } from "react";

/** 后台会话信息（初始化版本先给静态值，接入鉴权后由 layout 传入真实用户） */
export type AdminSession = {
  name: string;
  email: string;
  /** 头像文字，取名字首字 */
  initial: string;
  role: string;
};

export const DEFAULT_ADMIN_SESSION: AdminSession = {
  name: "Admin",
  email: "admin@blog.local",
  initial: "A",
  role: "超级管理员",
};

const SessionContext = createContext<AdminSession>(DEFAULT_ADMIN_SESSION);

export const AdminSessionProvider = ({
  session,
  children,
}: {
  session?: AdminSession;
  children: React.ReactNode;
}) => (
  <SessionContext.Provider value={session ?? DEFAULT_ADMIN_SESSION}>
    {children}
  </SessionContext.Provider>
);

export const useAdminSession = () => useContext(SessionContext);
