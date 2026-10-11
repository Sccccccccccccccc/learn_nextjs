// 这个文件是客户端实例配置，我们只需要在文件中配置一些客户端的实例即可。

import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
    baseURL: "http://localhost:3000", //项目地址
})
export const { signIn, signUp, useSession } = authClient