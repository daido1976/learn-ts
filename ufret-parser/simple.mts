export function parseUfret(html: string) {
  // <title> タグから曲名とアーティスト名を抽出
  const regex =
    /<title>(.*?) \/ (.*?)  ギターコード\/ウクレレコード\/ピアノコード - U-フレット<\/title>/;
  const match = regex.exec(html);
  if (!match) {
    throw new Error("Could not extract title and artist from <title>");
  }

  return {
    score: parseUfretScore(html),
    title: match[1],
    artist: match[2],
  };
}

function parseUfretScore(html: string) {
  const regex = /var\s+ufret_chord_datas\s*=\s*(\[.*?\]);/;
  const match = regex.exec(html);
  if (!match) {
    throw new Error("Could not find ufret_chord_datas in HTML");
  }

  const chordStr = match[1];
  const chordLines = JSON.parse(chordStr) as string[];

  // ♭ を b に、♯ を # に置換し、\r を \n に変換
  const replacedLines = chordLines.map((line) =>
    line.replaceAll("♭", "b").replaceAll("♯", "#").replaceAll("\r", "\n")
  );

  return replacedLines.join("");
}

async function main() {
  // サンプルとして同じ曲（URL）を解析
  const url = "https://www.ufret.jp/song.php?data=2461";

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  const { score, title, artist } = parseUfret(html);

  console.log({ title, artist, score });
  console.log(score);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
