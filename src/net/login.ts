import { URLSearchParams } from "url";
import axiosBase from "axios";
import axiosCookieJarSupport from "axios-cookiejar-support";
import { Cookie, CookieJar } from "tough-cookie";
import { domain } from "../const";

const login = async (loginId: string, password: string): Promise<Cookie[]> => {
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
  const cookies = cookiejar.getCookiesSync(`https://${domain}`);

  return cookies;
};

export default login;
