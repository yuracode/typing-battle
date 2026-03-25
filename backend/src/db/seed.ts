import { pool } from './client';

const japaneseTopics = [
  {
    content: 'プログラミングは問題解決の手段です。コードを書く前に、まず何を作りたいかを明確にしましょう。',
    furigana: 'プログラミングはもんだいかいけつのしゅだんです。コードをかくまえに、まずなにをつくりたいかをめいかくにしましょう。',
    romaji: 'puroguramingu wa mondaikaiketsu no shudan desu. koodo wo kaku mae ni, mazu nani wo tsukuritai ka wo meikaku ni shimashou.',
    difficulty: 2
  },
  {
    content: 'データベースとはデータを整理して保存するシステムです。SQLを使うことでデータの検索や更新が効率よく行えます。',
    furigana: 'データベースとはデータをせいりしてほぞんするシステムです。SQLをつかうことでデータのけんさくやこうしんがこうりつよくおこなえます。',
    romaji: 'deetabeesu to wa deeta wo seiri shite hozon suru shisutemu desu. SQL wo tsukau koto de deeta no kensaku ya koushin ga kouritsuyoku okonae masu.',
    difficulty: 3
  },
  {
    content: 'ネットワークの基礎を理解することは、セキュリティを考える上で非常に重要です。IPアドレスとポート番号の関係を覚えましょう。',
    furigana: 'ネットワークのきそをりかいすることは、セキュリティをかんがえるうえでひじょうにじゅうようです。IPアドレスとポートばんごうのかんけいをおぼえましょう。',
    romaji: 'nettowaaaku no kiso wo rikai suru koto wa, sekyuriti wo kangaeru ue de hijou ni juuyou desu. IP adoresu to pooto bangou no kankei wo obe mashou.',
    difficulty: 3
  },
  {
    content: 'オブジェクト指向プログラミングでは、クラスとインスタンスの概念が基本です。継承やポリモーフィズムを活用しましょう。',
    furigana: 'オブジェクトしこうプログラミングでは、クラスとインスタンスのがいねんがきほんです。けいしょうやポリモーフィズムをかつようしましょう。',
    romaji: 'obujekuto shikou puroguramingu de wa, kurasu to insutansu no gainen ga kihon desu. keishou ya porimoofizumu wo katsuyou shimashou.',
    difficulty: 4
  },
  {
    content: 'バージョン管理システムのGitを使うと、チームでの開発がスムーズになります。コミットメッセージは分かりやすく書く習慣をつけましょう。',
    furigana: 'バージョンかんりシステムのGitをつかうと、チームでのかいはつがスムーズになります。コミットメッセージはわかりやすくかくしゅうかんをつけましょう。',
    romaji: 'baashon kanri shisutemu no Git wo tsukau to, chiimu de no kaihatsu ga sumuuzu ni nari masu. komitto messeji wa wakariyasuku kaku shuukan wo tsuke mashou.',
    difficulty: 3
  },
  {
    content: 'アルゴリズムとは問題を解くための手順のことです。効率のよいアルゴリズムを選ぶことで、プログラムの速度が大きく変わります。',
    furigana: 'アルゴリズムとはもんだいをとくためのてじゅんのことです。こうりつのよいアルゴリズムをえらぶことで、プログラムのそくどがおおきくかわります。',
    romaji: 'arugorizumu to wa mondai wo toku tame no tejun no koto desu. kouritu no yoi arugorizumu wo erabu koto de, purogurammu no sokudo ga ooki ku kawari masu.',
    difficulty: 3
  },
  {
    content: '変数とはデータを一時的に記憶しておく箱のようなものです。わかりやすい名前をつけることで、コードが読みやすくなります。',
    furigana: 'へんすうとはデータをいちじてきにきおくしておくはこのようなものです。わかりやすいなまえをつけることで、コードがよみやすくなります。',
    romaji: 'hensuu to wa deeta wo ichijiteki ni kioku shite oku hako no you na mono desu. wakariyasui namae wo tsukeru koto de, koodo ga yomiyasuku nari masu.',
    difficulty: 2
  },
  {
    content: '関数を使うと、同じ処理を何度も書かずに済みます。一つの関数は一つの役割だけを持つように設計するのが良い習慣です。',
    furigana: 'かんすうをつかうと、おなじしょりをなんどもかかずにすみます。ひとつのかんすうはひとつのやくわりだけをもつようにせっけいするのがよいしゅうかんです。',
    romaji: 'kansuu wo tsukau to, onaji shori wo nando mo kakazu ni sumi masu. hitotsu no kansuu wa hitotsu no yakuwari dake wo motsu you ni sekkei suru no ga yoi shuukan desu.',
    difficulty: 3
  },
  {
    content: 'ループ処理を使うと、繰り返しの作業を自動化できます。無限ループにならないよう、終了条件を必ず設定しましょう。',
    furigana: 'ループしょりをつかうと、くりかえしのさぎょうをじどうかできます。むげんループにならないよう、しゅうりょうじょうけんをかならずせっていしましょう。',
    romaji: 'ruupu shori wo tsukau to, kurikaeshi no sagyou wo jidouka deki masu. mugen ruupu ni naranai you, shuuryou jouken wo kanarazu settei shimashou.',
    difficulty: 2
  },
  {
    content: 'エラーが出ても落ち着いて原因を調べましょう。エラーメッセージにはヒントが含まれています。一行ずつ確認することが大切です。',
    furigana: 'エラーがでてもおちついてげんいんをしらべましょう。エラーメッセージにはヒントがふくまれています。いちぎょうずつかくにんすることがたいせつです。',
    romaji: 'eraa ga dete mo ochitsuite genin wo shirabe mashou. eraa messeji ni wa hinto ga fukuma rete i masu. ichigyo zutsu kakunin suru koto ga taisetu desu.',
    difficulty: 2
  },
  {
    content: 'クラウドコンピューティングとは、インターネット経由でサーバーやストレージを利用する仕組みです。近年、多くの企業が採用しています。',
    furigana: 'クラウドコンピューティングとは、インターネットけいゆでサーバーやストレージをりようするしくみです。きんねん、おおくのきぎょうがさいようしています。',
    romaji: 'kuraudo konpyuutingu to wa, intaanetto keiyu de saabaa ya sutoreejii wo riyou suru shikumi desu. kinnen, ooku no kigyou ga saiyou shite i masu.',
    difficulty: 3
  },
  {
    content: 'テストを書く習慣は、バグを早期に発見するために非常に効果的です。コードを書いたら必ずテストも一緒に作成しましょう。',
    furigana: 'テストをかくしゅうかんは、バグをそうきにはっけんするためにひじょうにこうかてきです。コードをかいたらかならずテストもいっしょにさくせいしましょう。',
    romaji: 'tesuto wo kaku shuukan wa, bagu wo souki ni hakken suru tame ni hijou ni koukateki desu. koodo wo kaita ra kanarazu tesuto mo issho ni sakusei shimashou.',
    difficulty: 3
  },
  {
    content: '人工知能とは、コンピュータが人間のように考えたり学習したりする技術です。機械学習やディープラーニングがその代表例です。',
    furigana: 'じんこうちのうとは、コンピュータがにんげんのようにかんがえたりがくしゅうしたりするぎじゅつです。きかいがくしゅうやディープラーニングがそのだいひょうれいです。',
    romaji: 'jinkou chinou to wa, konpyuuta ga ningen no you ni kangae tari gakushuu shitari suru gijutsu desu. kikai gakushuu ya diipu raaningu ga sono daihyourei desu.',
    difficulty: 4
  },
  {
    content: 'セキュリティの基本は、パスワードを使い回さないことです。長く複雑なパスワードを設定し、二段階認証を有効にしましょう。',
    furigana: 'セキュリティのきほんは、パスワードをつかいまわさないことです。ながくふくざつなパスワードをせっていし、にだんかいにんしょうをゆうこうにしましょう。',
    romaji: 'sekyuriti no kihon wa, pasuwaado wo tsukaimawasa nai koto desu. nagaku fukuzatsu na pasuwaado wo settei shi, nidankai ninshou wo yuukou ni shimashou.',
    difficulty: 3
  },
  {
    content: 'Webアプリケーションはフロントエンドとバックエンドに分かれています。フロントエンドはユーザーが見る部分、バックエンドはサーバー側の処理を担います。',
    furigana: 'Webアプリケーションはフロントエンドとバックエンドにわかれています。フロントエンドはユーザーがみるぶぶん、バックエンドはサーバーがわのしょりをにないます。',
    romaji: 'webu apurikeeshon wa furonto endo to bakku endo ni wakare te i masu. furonto endo wa yuuzaa ga miru bubun, bakku endo wa saabaa gawa no shori wo ninai masu.',
    difficulty: 3
  }
];

const codeTopics = [
  // ── Java ──────────────────────────────────────────────
  {
    language: 'java',
    content: `public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    difficulty: 1
  },
  {
    language: 'java',
    content: `public int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}`,
    difficulty: 3
  },
  {
    language: 'java',
    content: `import java.util.ArrayList;
import java.util.List;

List<String> names = new ArrayList<>();
names.add("Alice");
names.add("Bob");
for (String name : names) {
    System.out.println(name);
}`,
    difficulty: 2
  },
  {
    language: 'java',
    content: `public class Calculator {
    public int add(int a, int b) { return a + b; }
    public int sub(int a, int b) { return a - b; }
    public int mul(int a, int b) { return a * b; }
    public double div(int a, int b) {
        if (b == 0) throw new ArithmeticException("zero");
        return (double) a / b;
    }
}`,
    difficulty: 2
  },
  {
    language: 'java',
    content: `public interface Shape {
    double area();
    double perimeter();
}

public class Circle implements Shape {
    private double radius;
    public Circle(double radius) { this.radius = radius; }
    public double area() { return Math.PI * radius * radius; }
    public double perimeter() { return 2 * Math.PI * radius; }
}`,
    difficulty: 3
  },
  {
    language: 'java',
    content: `import java.util.HashMap;
import java.util.Map;

Map<String, Integer> scores = new HashMap<>();
scores.put("Alice", 95);
scores.put("Bob", 82);
scores.put("Carol", 91);
scores.entrySet().stream()
    .sorted(Map.Entry.comparingByValue())
    .forEach(e -> System.out.println(e.getKey() + ": " + e.getValue()));`,
    difficulty: 3
  },
  // ── JavaScript ────────────────────────────────────────
  {
    language: 'javascript',
    content: `const fetchData = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    return data;
};`,
    difficulty: 2
  },
  {
    language: 'javascript',
    content: `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const evens = doubled.filter(n => n % 2 === 0);
console.log(evens);`,
    difficulty: 2
  },
  {
    language: 'javascript',
    content: `function debounce(fn, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}`,
    difficulty: 3
  },
  {
    language: 'javascript',
    content: `const obj = { name: "Alice", age: 25, city: "Tokyo" };
const { name, ...rest } = obj;
console.log(name);
console.log(rest);

const arr = [1, 2, 3];
const copy = [...arr, 4, 5];
console.log(copy);`,
    difficulty: 2
  },
  {
    language: 'javascript',
    content: `class EventEmitter {
    constructor() { this.events = {}; }
    on(event, listener) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(listener);
    }
    emit(event, ...args) {
        (this.events[event] || []).forEach(fn => fn(...args));
    }
}`,
    difficulty: 3
  },
  {
    language: 'javascript',
    content: `async function retry(fn, times = 3) {
    for (let i = 0; i < times; i++) {
        try {
            return await fn();
        } catch (err) {
            if (i === times - 1) throw err;
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
    }
}`,
    difficulty: 4
  },
  // ── Python ────────────────────────────────────────────
  {
    language: 'python',
    content: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr`,
    difficulty: 3
  },
  {
    language: 'python',
    content: `class Stack:
    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)

    def pop(self):
        return self.items.pop()`,
    difficulty: 3
  },
  {
    language: 'python',
    content: `def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True

primes = [x for x in range(2, 50) if is_prime(x)]
print(primes)`,
    difficulty: 3
  },
  {
    language: 'python',
    content: `import json

data = {"name": "Alice", "scores": [95, 82, 91]}

json_str = json.dumps(data, indent=2)
print(json_str)

loaded = json.loads(json_str)
avg = sum(loaded["scores"]) / len(loaded["scores"])
print(f"Average: {avg:.1f}")`,
    difficulty: 2
  },
  {
    language: 'python',
    content: `from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

for i in range(10):
    print(fib(i), end=" ")`,
    difficulty: 3
  },
  {
    language: 'python',
    content: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, val):
        node = Node(val)
        if not self.head:
            self.head = node
            return
        cur = self.head
        while cur.next:
            cur = cur.next
        cur.next = node`,
    difficulty: 4
  },
  // ── HTML ──────────────────────────────────────────────
  {
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>My Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>最初のWebページです。</p>
</body>
</html>`,
    difficulty: 1
  },
  {
    language: 'html',
    content: `<form action="/submit" method="post">
    <label for="name">名前:</label>
    <input type="text" id="name" name="name" required>

    <label for="email">メール:</label>
    <input type="email" id="email" name="email" required>

    <button type="submit">送信</button>
</form>`,
    difficulty: 2
  },
  {
    language: 'html',
    content: `<nav>
    <ul>
        <li><a href="/">ホーム</a></li>
        <li><a href="/about">概要</a></li>
        <li><a href="/contact">お問い合わせ</a></li>
    </ul>
</nav>
<main>
    <article>
        <h2>記事タイトル</h2>
        <p>記事の本文がここに入ります。</p>
    </article>
</main>`,
    difficulty: 2
  },
  {
    language: 'html',
    content: `<table>
    <thead>
        <tr>
            <th>名前</th>
            <th>点数</th>
            <th>評価</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Alice</td>
            <td>95</td>
            <td>A</td>
        </tr>
        <tr>
            <td>Bob</td>
            <td>72</td>
            <td>C</td>
        </tr>
    </tbody>
</table>`,
    difficulty: 2
  },
  {
    language: 'html',
    content: `<div class="card">
    <img src="photo.jpg" alt="プロフィール写真">
    <div class="card-body">
        <h3 class="card-title">田中 太郎</h3>
        <p class="card-text">Webエンジニア</p>
        <a href="#" class="btn btn-primary">詳細を見る</a>
    </div>
</div>`,
    difficulty: 2
  },
  {
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css">
    <script defer src="app.js"></script>
</head>
<body>
    <header id="site-header">
        <h1>サイトタイトル</h1>
    </header>
    <main id="content"></main>
    <footer>Copyright 2025</footer>
</body>
</html>`,
    difficulty: 3
  },
  // ── CSS ───────────────────────────────────────────────
  {
    language: 'css',
    content: `body {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
    background-color: #f0f0f0;
    color: #333;
}

h1 {
    font-size: 2rem;
    text-align: center;
    margin-top: 2rem;
}`,
    difficulty: 1
  },
  {
    language: 'css',
    content: `.container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

.card {
    flex: 1 1 300px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
}`,
    difficulty: 2
  },
  {
    language: 'css',
    content: `.nav {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    background: #333;
}

.nav a {
    display: block;
    padding: 1rem 1.5rem;
    color: #fff;
    text-decoration: none;
    transition: background 0.2s;
}

.nav a:hover {
    background: #555;
}`,
    difficulty: 2
  },
  {
    language: 'css',
    content: `.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.hero {
    grid-column: 1 / -1;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 4rem 2rem;
    text-align: center;
    border-radius: 12px;
}`,
    difficulty: 3
  },
  {
    language: 'css',
    content: `@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
}

.modal {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.5);
    animation: fadeIn 0.3s ease;
}

.modal-box {
    background: #fff;
    border-radius: 12px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
}`,
    difficulty: 3
  },
  {
    language: 'css',
    content: `:root {
    --color-primary: #3b82f6;
    --color-secondary: #10b981;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --radius: 8px;
}

.btn {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    border: none;
    border-radius: var(--radius);
    cursor: pointer;
    font-weight: bold;
}

.btn-primary { background: var(--color-primary); color: #fff; }
.btn-secondary { background: var(--color-secondary); color: #fff; }`,
    difficulty: 3
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ⇒ → => の修正（リガチャ対策で誤入力された全角矢印を ASCII に統一）
    await client.query(`UPDATE topics SET content = REPLACE(content, '⇒', '=>')`);

    // ASCII略語はふりがなにそのまま残す（ローマ字エンジン側で大文字→小文字対応済み）
    // 過去に誤ってカタカナ読みに変換した分を元に戻す
    await client.query(`UPDATE topics SET furigana = REPLACE(furigana, 'エスキューエル', 'SQL') WHERE furigana LIKE '%エスキューエル%'`);
    await client.query(`UPDATE topics SET furigana = REPLACE(furigana, 'ギット', 'Git') WHERE furigana LIKE '%ギット%'`);
    await client.query(`UPDATE topics SET furigana = REPLACE(furigana, 'ウェブ', 'Web') WHERE furigana LIKE '%ウェブ%'`);
    await client.query(`UPDATE topics SET furigana = REPLACE(furigana, 'アイピー', 'IP') WHERE furigana LIKE '%アイピー%'`);
    // ふりがなの余分なスペースを除去
    await client.query(`UPDATE topics SET furigana = REPLACE(furigana, 'をせってい し、', 'をせっていし、') WHERE furigana LIKE '%をせってい し%'`);
    // 誤字修正: 担います = にないます
    await client.query(`UPDATE topics SET furigana = REPLACE(furigana, 'をになます', 'をにないます') WHERE furigana LIKE '%をになます%'`);
    await client.query(`UPDATE topics SET furigana = REPLACE(furigana, 'をになります', 'をにないます') WHERE furigana LIKE '%をになります%'`);

    // 日本語お題（重複しないよう content で確認）
    for (const topic of japaneseTopics) {
      await client.query(
        `INSERT INTO topics (type, content, furigana, romaji, difficulty)
         SELECT 'japanese', $1, $2, $3, $4
         WHERE NOT EXISTS (SELECT 1 FROM topics WHERE content = $1)`,
        [topic.content, topic.furigana, topic.romaji, topic.difficulty]
      );
    }

    // コードお題（重複しないよう content で確認）
    for (const topic of codeTopics) {
      await client.query(
        `INSERT INTO topics (type, language, content, difficulty)
         SELECT 'code', $1, $2, $3
         WHERE NOT EXISTS (SELECT 1 FROM topics WHERE content = $2)`,
        [topic.language, topic.content, topic.difficulty]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Seed completed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
