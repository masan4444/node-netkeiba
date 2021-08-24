import { URLSearchParams } from "url";
import axiosBase from "axios";
import axiosCookieJarSupport from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { domain } from "../const";
import { client } from "../lib";

const login = async (loginId: string, password: string): Promise<boolean> => {
  axiosCookieJarSupport(axiosBase);
  const clientWithJar = axiosBase.create({
    jar: true,
    withCredentials: true,
  });

  const form = new URLSearchParams();
  form.append("pid", "login");
  form.append("action", "auth");
  form.append("login_id", loginId);
  form.append("pswd", password);

  const cookiejar = (await clientWithJar
    .post(`https://regist.${domain}/account/`, form)
    .then((res) => res.config.jar)) as CookieJar;
  const cookie = cookiejar.getCookieStringSync(`https://${domain}`);
  client.defaults.headers = { common: { Cookie: cookie } };

  return cookie.includes("nkauth");
};

export default login;
