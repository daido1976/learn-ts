import puppeteer from "puppeteer-core";

declare global {
  interface Window {
    ufret_chord_datas: string[];
  }
}

const browser = await puppeteer.launch({
  // Use system-installed Chrome
  channel: "chrome",
});

const page = await browser.newPage();

await page.goto("https://www.ufret.jp/song.php?data=2461", {
  waitUntil: "networkidle2",
});

const pageTitle = await page.title();
// 正規表現でページのタイトルから曲タイトルとアーティストを抽出
const match =
  /(.*?) \/ (.*?) ギターコード\/ウクレレコード\/ピアノコード - U-フレット/.exec(
    pageTitle
  );

if (!match) {
  throw new Error("Could not extract title and artist");
}

const title = match[1];
const artist = match[2];
const ufret_chord_datas = await page.evaluate(() => {
  return window.ufret_chord_datas;
});
const score = ufret_chord_datas.join("").replaceAll("\r", "\n");

console.log({ title, artist, score });
console.log(score);

await browser.close();
