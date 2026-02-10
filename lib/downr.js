import axios from "axios";

export default class DownrScraper {
  constructor() {
    this.baseURL = "https://downr.org";
    this.headers = {
      accept: "*/*",
      "content-type": "application/json",
      origin: "https://downr.org",
      referer: "https://downr.org/",
      "user-agent":
        "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36",
    };
  }

  async getSessionCookie() {
    const baseCookie =
      "_ga=GA1.1.536005378.1770437315; _clck=17lj13q%5E2%5Eg3d";

    const res = await axios.get(
      `${this.baseURL}/.netlify/functions/analytics`,
      { headers: { ...this.headers, cookie: baseCookie } }
    );

    const sess = res.headers["set-cookie"]?.[0]?.split(";")[0];
    return sess ? `${baseCookie}; ${sess}` : baseCookie;
  }

  async fetch(url) {
    const cookie = await this.getSessionCookie();

    const res = await axios.post(
      `${this.baseURL}/.netlify/functions/nyt`,
      { url },
      { headers: { ...this.headers, cookie } }
    );

    return res.data;
  }
      } 
