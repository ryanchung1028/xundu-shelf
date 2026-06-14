import { readFile, mkdir, writeFile } from "node:fs/promises";

const sourcePath = new URL("../叙事文学书单.md", import.meta.url);
const outPath = new URL("../src/books.js", import.meta.url);

const titleHints = {
  "伊利亚特": { title: "The Iliad", author: "Homer" },
  "奥德赛": { title: "The Odyssey", author: "Homer" },
  "三国演义": { title: "Romance of the Three Kingdoms", author: "Luo Guanzhong" },
  "水浒传": { title: "Water Margin", author: "Shi Nai'an" },
  "西游记": { title: "Journey to the West", author: "Wu Cheng'en" },
  "红楼梦": { title: "Dream of the Red Chamber", author: "Cao Xueqin" },
  "罗密欧与朱丽叶": { title: "Romeo and Juliet", author: "William Shakespeare" },
  "仲夏夜之梦": { title: "A Midsummer Night's Dream", author: "William Shakespeare" },
  "威尼斯商人": { title: "The Merchant of Venice", author: "William Shakespeare" },
  "哈姆莱特": { title: "Hamlet", author: "William Shakespeare" },
  "李尔王": { title: "King Lear", author: "William Shakespeare" },
  "奥瑟罗": { title: "Othello", author: "William Shakespeare" },
  "麦克白": { title: "Macbeth", author: "William Shakespeare" },
  "堂吉诃德": { title: "Don Quixote", author: "Miguel de Cervantes" },
  "鲁滨逊漂流记": { title: "Robinson Crusoe", author: "Daniel Defoe" },
  "格林童话": { title: "Grimms' Fairy Tales", author: "Brothers Grimm", ambiguous: true },
  "弗兰肯斯坦": { title: "Frankenstein", author: "Mary Shelley" },
  "红与黑": { title: "The Red and the Black", author: "Stendhal" },
  "安徒生童话": { title: "Andersen's Fairy Tales", author: "Hans Christian Andersen", ambiguous: true },
  "爱伦·坡短篇小说集": { title: "Tales of Edgar Allan Poe", author: "Edgar Allan Poe", ambiguous: true },
  "呼啸山庄": { title: "Wuthering Heights", author: "Emily Bronte" },
  "简爱": { title: "Jane Eyre", author: "Charlotte Bronte" },
  "包法利夫人": { title: "Madame Bovary", author: "Gustave Flaubert" },
  "悲惨世界": { title: "Les Miserables", author: "Victor Hugo" },
  "爱丽丝梦游奇境记": { title: "Alice's Adventures in Wonderland", author: "Lewis Carroll" },
  "爱丽丝镜中奇遇记": { title: "Through the Looking-Glass", author: "Lewis Carroll" },
  "罪与罚": { title: "Crime and Punishment", author: "Fyodor Dostoevsky" },
  "群魔": { title: "Demons", author: "Fyodor Dostoevsky" },
  "卡拉马佐夫兄弟": { title: "The Brothers Karamazov", author: "Fyodor Dostoevsky" },
  "莫泊桑短篇小说集": { title: "Maupassant Short Stories", author: "Guy de Maupassant", ambiguous: true },
  "契诃夫中短篇小说集": { title: "Chekhov Short Stories", author: "Anton Chekhov", ambiguous: true },
  "快乐王子及其他故事": { title: "The Happy Prince and Other Tales", author: "Oscar Wilde" },
  "莎乐美": { title: "Salome", author: "Oscar Wilde" },
  "萧伯纳戏剧集": { title: "George Bernard Shaw Plays", author: "George Bernard Shaw", ambiguous: true },
  "欧·亨利短篇小说集": { title: "O. Henry Short Stories", author: "O. Henry", ambiguous: true },
  "我是猫": { title: "I Am a Cat", author: "Natsume Soseki" },
  "窄门": { title: "Strait is the Gate", author: "Andre Gide" },
  "卡夫卡短篇小说集": { title: "Kafka Short Stories", author: "Franz Kafka", ambiguous: true },
  "审判": { title: "The Trial", author: "Franz Kafka" },
  "城堡": { title: "The Castle", author: "Franz Kafka" },
  "都柏林人": { title: "Dubliners", author: "James Joyce" },
  "青年艺术家画像": { title: "A Portrait of the Artist as a Young Man", author: "James Joyce" },
  "芥川龙之介短篇小说集": { title: "Akutagawa Short Stories", author: "Ryunosuke Akutagawa", ambiguous: true },
  "德米安": { title: "Demian", author: "Hermann Hesse" },
  "悉达多": { title: "Siddhartha", author: "Hermann Hesse" },
  "荒原狼": { title: "Steppenwolf", author: "Hermann Hesse" },
  "纳尔齐思与歌尔德蒙": { title: "Narcissus and Goldmund", author: "Hermann Hesse" },
  "呐喊": { title: "Call to Arms", author: "Lu Xun" },
  "彷徨": { title: "Wandering", author: "Lu Xun" },
  "故事新编": { title: "Old Tales Retold", author: "Lu Xun" },
  "达洛卫夫人": { title: "Mrs Dalloway", author: "Virginia Woolf" },
  "到灯塔去": { title: "To the Lighthouse", author: "Virginia Woolf" },
  "奥兰多": { title: "Orlando", author: "Virginia Woolf" },
  "雷雨": { title: "Thunderstorm", author: "Cao Yu" },
  "银河铁道之夜": { title: "Night on the Galactic Railroad", author: "Kenji Miyazawa" },
  "恶心": { title: "Nausea", author: "Jean-Paul Sartre" },
  "萨特戏剧集": { title: "Sartre Plays", author: "Jean-Paul Sartre", ambiguous: true },
  "卡利古拉": { title: "Caligula", author: "Albert Camus" },
  "局外人": { title: "The Stranger", author: "Albert Camus" },
  "鼠疫": { title: "The Plague", author: "Albert Camus" },
  "骆驼祥子": { title: "Rickshaw Boy", author: "Lao She" },
  "茶馆": { title: "Teahouse", author: "Lao She" },
  "小径分岔的花园": { title: "The Garden of Forking Paths", author: "Jorge Luis Borges" },
  "围城": { title: "Fortress Besieged", author: "Qian Zhongshu" },
  "人间失格": { title: "No Longer Human", author: "Osamu Dazai" },
  "雪国": { title: "Snow Country", author: "Yasunari Kawabata" },
  "麦田里的守望者": { title: "The Catcher in the Rye", author: "J. D. Salinger" },
  "老人与海": { title: "The Old Man and the Sea", author: "Ernest Hemingway" },
  "分成两半的子爵": { title: "The Cloven Viscount", author: "Italo Calvino" },
  "树上的男爵": { title: "The Baron in the Trees", author: "Italo Calvino" },
  "不存在的骑士": { title: "The Nonexistent Knight", author: "Italo Calvino" },
  "看不见的城市": { title: "Invisible Cities", author: "Italo Calvino" },
  "如果在冬夜，一个旅人": { title: "If on a winter's night a traveler", author: "Italo Calvino" },
  "等待戈多": { title: "Waiting for Godot", author: "Samuel Beckett" },
  "洛丽塔": { title: "Lolita", author: "Vladimir Nabokov" },
  "没有人给他写信的上校": { title: "No One Writes to the Colonel", author: "Gabriel Garcia Marquez" },
  "百年孤独": { title: "One Hundred Years of Solitude", author: "Gabriel Garcia Marquez" },
  "一桩事先张扬的凶杀案": { title: "Chronicle of a Death Foretold", author: "Gabriel Garcia Marquez" },
  "霍乱时期的爱情": { title: "Love in the Time of Cholera", author: "Gabriel Garcia Marquez" },
  "法国中尉的女人": { title: "The French Lieutenant's Woman", author: "John Fowles" },
  "情人": { title: "The Lover", author: "Marguerite Duras" },
  "棋王·树王·孩子王": { title: "The King of Chess", author: "Ah Cheng", ambiguous: true },
  "黄金时代": { title: "The Golden Age", author: "Wang Xiaobo" },
};

function parseRows(markdown) {
  return markdown
    .split("\n")
    .filter((line) => line.startsWith("| ") && !line.includes(":---"))
    .slice(1)
    .map((line, index) => {
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim().replaceAll("<br>", " / "));
      const [title, author, country, language, period, genre] = cells;
      const hint = titleHints[title] ?? {};
      return {
        id: `book-${String(index + 1).padStart(3, "0")}`,
        title,
        author,
        country,
        language,
        period,
        genre,
        queryTitle: hint.title ?? title,
        queryAuthor: hint.author ?? author,
        coverStatus: hint.ambiguous ? "待核验" : "待查询",
        cover: null,
        source: null,
      };
    });
}

function norm(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function scoreDoc(book, doc) {
  if (!doc.cover_i) return 0;
  const wantedTitle = norm(book.queryTitle);
  const gotTitle = norm(doc.title);
  const authorText = norm((doc.author_name ?? []).join(" "));
  const wantedAuthor = norm(book.queryAuthor);

  let score = 0;
  if (gotTitle === wantedTitle) score += 5;
  if (gotTitle.includes(wantedTitle) || wantedTitle.includes(gotTitle)) score += 3;
  if (wantedAuthor && authorText.includes(wantedAuthor.split(" ")[0])) score += 2;
  if (wantedAuthor && wantedAuthor.split(" ").some((part) => part.length > 4 && authorText.includes(part))) score += 2;
  return score;
}

async function fetchCover(book) {
  if (book.coverStatus === "待核验") return book;
  const params = new URLSearchParams({
    title: book.queryTitle,
    author: book.queryAuthor,
    fields: "title,author_name,cover_i,key,first_publish_year",
    limit: "8",
  });
  const response = await fetch(`https://openlibrary.org/search.json?${params}`);
  if (!response.ok) throw new Error(`${book.title}: ${response.status}`);
  const payload = await response.json();
  const ranked = (payload.docs ?? [])
    .map((doc) => ({ doc, score: scoreDoc(book, doc) }))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];
  if (!best || best.score < 5) {
    return {
      ...book,
      coverStatus: "待核验",
      source: ranked[0]
        ? {
            note: "Open Library returned a low-confidence result; cover withheld.",
            matchedTitle: ranked[0].doc.title,
            matchedAuthors: ranked[0].doc.author_name ?? [],
            workUrl: ranked[0].doc.key ? `https://openlibrary.org${ranked[0].doc.key}` : null,
          }
        : null,
    };
  }

  return {
    ...book,
    coverStatus: "已核验",
    cover: `https://covers.openlibrary.org/b/id/${best.doc.cover_i}-L.jpg`,
    source: {
      provider: "Open Library",
      matchedTitle: best.doc.title,
      matchedAuthors: best.doc.author_name ?? [],
      firstPublishYear: best.doc.first_publish_year ?? null,
      workUrl: best.doc.key ? `https://openlibrary.org${best.doc.key}` : null,
    },
  };
}

const markdown = await readFile(sourcePath, "utf8");
const parsed = parseRows(markdown);
const results = [];

for (const [index, book] of parsed.entries()) {
  const result = await fetchCover(book);
  results.push(result);
  console.log(`${index + 1}/${parsed.length} ${result.title}: ${result.coverStatus}`);
  await new Promise((resolve) => setTimeout(resolve, 120));
}

await mkdir(new URL("../src/", import.meta.url), { recursive: true });
await writeFile(
  outPath,
  `window.books = ${JSON.stringify(results, null, 2)};\n`,
  "utf8",
);
