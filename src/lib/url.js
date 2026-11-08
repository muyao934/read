// 站内链接：都从站点根（/read/）算起，构建出来是 /read/notes/x.html。不要在页面里手写以 / 开头的地址。
const BASE = import.meta.env.BASE_URL.replace(/\/?$/, "/");
export const url = (p) => BASE + p.replace(/^\//, "");
