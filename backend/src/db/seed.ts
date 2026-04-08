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
  },
  // ── 追加：難易度1（初心者向け・短文）──
  {
    content: 'パソコンの電源を入れてください。',
    furigana: 'パソコンのでんげんをいれてください。',
    romaji: 'pasokon no dengen wo irete kudasai.',
    difficulty: 1
  },
  {
    content: 'タイピングは毎日の練習が大切です。',
    furigana: 'タイピングはまいにちのれんしゅうがたいせつです。',
    romaji: 'taipingu wa mainichi no renshuu ga taisetsu desu.',
    difficulty: 1
  },
  {
    content: 'マウスとキーボードを使います。',
    furigana: 'マウスとキーボードをつかいます。',
    romaji: 'mausu to kiiboodo wo tsukai masu.',
    difficulty: 1
  },
  {
    content: 'ファイルを保存してから閉じましょう。',
    furigana: 'ファイルをほぞんしてからとじましょう。',
    romaji: 'fairu wo hozon shite kara toji mashou.',
    difficulty: 1
  },
  {
    content: 'インターネットで情報を調べることができます。',
    furigana: 'インターネットでじょうほうをしらべることができます。',
    romaji: 'intaanetto de jouhou wo shiraberu koto ga deki masu.',
    difficulty: 1
  },
  {
    content: 'メールを送る前に内容を確認しましょう。',
    furigana: 'メールをおくるまえにないようをかくにんしましょう。',
    romaji: 'meeru wo okuru mae ni naiyou wo kakunin shimashou.',
    difficulty: 1
  },
  // ── 追加：難易度2 ──
  {
    content: 'プログラムは上から順番に実行されます。条件分岐を使うと処理の流れを変えられます。',
    furigana: 'プログラムはうえからじゅんばんにじっこうされます。じょうけんぶんきをつかうとしょりのながれをかえられます。',
    romaji: 'puroguramu wa ue kara junban ni jikkou sare masu. jouken bunki wo tsukau to shori no nagare wo kae rare masu.',
    difficulty: 2
  },
  {
    content: '配列は複数のデータをまとめて管理できる便利な仕組みです。インデックスは0から始まります。',
    furigana: 'はいれつはふくすうのデータをまとめてかんりできるべんりなしくみです。インデックスは0からはじまります。',
    romaji: 'hairetsu wa fukusuu no deeta wo matomete kanri dekiru benri na shikumi desu. indekkusu wa 0 kara hajimari masu.',
    difficulty: 2
  },
  {
    content: 'コメントを書くことで、他の人がコードの意味を理解しやすくなります。',
    furigana: 'コメントをかくことで、ほかのひとがコードのいみをりかいしやすくなります。',
    romaji: 'komento wo kaku koto de, hoka no hito ga koodo no imi wo rikai shi yasuku nari masu.',
    difficulty: 2
  },
  {
    content: 'デバッグとは、プログラムのバグを見つけて修正する作業のことです。',
    furigana: 'デバッグとは、プログラムのバグをみつけてしゅうせいするさぎょうのことです。',
    romaji: 'debaggu to wa, puroguramu no bagu wo mitsukete shuusei suru sagyou no koto desu.',
    difficulty: 2
  },
  {
    content: 'ソースコードを書いたらコンパイルして実行ファイルを作ります。',
    furigana: 'ソースコードをかいたらコンパイルしてじっこうファイルをつくります。',
    romaji: 'soosu koodo wo kaita ra konpairu shite jikkou fairu wo tsukuri masu.',
    difficulty: 2
  },
  // ── 追加：難易度3 ──
  {
    content: 'APIとはアプリケーション同士がデータをやり取りするためのインターフェースです。RESTやGraphQLが代表的な設計手法です。',
    furigana: 'APIとはアプリケーションどうしがデータをやりとりするためのインターフェースです。RESTやGraphQLがだいひょうてきなせっけいしゅほうです。',
    romaji: 'API to wa apurikeeshon doushi ga deeta wo yaritori suru tame no intaafeeesu desu. REST ya GraphQL ga daihyouteki na sekkei shuhou desu.',
    difficulty: 3
  },
  {
    content: 'コンテナ技術を使うと開発環境と本番環境の差異をなくすことができます。Dockerはその代表的なツールです。',
    furigana: 'コンテナぎじゅつをつかうとかいはつかんきょうとほんばんかんきょうのさいをなくすことができます。Dockerはそのだいひょうてきなツールです。',
    romaji: 'kontena gijutsu wo tsukau to kaihatsu kankyou to honban kankyou no sai wo nakusu koto ga deki masu. Docker wa sono daihyouteki na tuuru desu.',
    difficulty: 3
  },
  {
    content: 'ソフトウェア開発ではアジャイル手法がよく使われます。スプリントと呼ばれる短い期間で開発とレビューを繰り返します。',
    furigana: 'ソフトウェアかいはつではアジャイルしゅほうがよくつかわれます。スプリントとよばれるみじかいきかんでかいはつとレビューをくりかえします。',
    romaji: 'sofutouea kaihatsu de wa ajairu shuhou ga yoku tsukawa re masu. supurinto to yoba reru mijikai kikan de kaihatsu to rebyuu wo kurikaeshi masu.',
    difficulty: 3
  },
  {
    content: 'データ構造を選ぶときは、挿入・検索・削除の計算量を考慮することが重要です。',
    furigana: 'データこうぞうをえらぶときは、そうにゅう・けんさく・さくじょのけいさんりょうをこうりょすることがじゅうようです。',
    romaji: 'deeta kouzou wo erabu toki wa, sounyuu kensaku sakujo no keisanryou wo kouryo suru koto ga juuyou desu.',
    difficulty: 3
  },
  // ── 追加：難易度4 ──
  {
    content: 'マイクロサービスアーキテクチャでは、各サービスが独立してデプロイ可能であり、サービス間はAPIを通じて通信します。',
    furigana: 'マイクロサービスアーキテクチャでは、かくサービスがどくりつしてデプロイかのうであり、サービスかんはAPIをつうじてつうしんします。',
    romaji: 'maikuro saabisu aakitekucha de wa, kaku saabisu ga dokuritsu shite depuroi kanou de ari, saabisu kan wa API wo tsuujite tsuushin shi masu.',
    difficulty: 4
  },
  {
    content: 'リレーショナルデータベースでは正規化によりデータの冗長性を排除し、整合性を保つことができます。',
    furigana: 'リレーショナルデータベースではせいきかによりデータのじょうちょうせいをはいじょし、せいごうせいをたもつことができます。',
    romaji: 'rireeshonaru deetabeesu de wa seikika ni yori deeta no jouchousei wo haijo shi, seigousei wo tamotsu koto ga deki masu.',
    difficulty: 4
  },
  {
    content: 'デザインパターンは、ソフトウェア設計における典型的な問題に対する再利用可能な解決策のテンプレートです。',
    furigana: 'デザインパターンは、ソフトウェアせっけいにおけるてんけいてきなもんだいにたいするさいりようかのうなかいけつさくのテンプレートです。',
    romaji: 'dezain pataan wa, sofutouea sekkei ni okeru tenkeiteki na mondai ni taisuru sairiyou kanou na kaiketsusaku no tenpureeto desu.',
    difficulty: 4
  },
  // ── 追加：難易度5（上級者向け・長文）──
  {
    content: '分散システムにおけるCAP定理では、一貫性・可用性・分断耐性の三つを同時に満たすことはできないとされています。システム設計では要件に応じたトレードオフが必要です。',
    furigana: 'ぶんさんシステムにおけるCAPていりでは、いっかんせい・かようせい・ぶんだんたいせいのみっつをどうじにみたすことはできないとされています。システムせっけいではようけんにおうじたトレードオフがひつようです。',
    romaji: 'bunsan shisutemu ni okeru CAP teiri de wa, ikkansei kayousei bundan taisei no mittsu wo douji ni mitasu koto wa dekinai to sarete i masu. shisutemu sekkei de wa youken ni oujita toreedoofu ga hitsuyou desu.',
    difficulty: 5
  },
  {
    content: '機械学習モデルの訓練では、過学習を防ぐために正則化やドロップアウトなどの手法を適切に組み合わせることが求められます。交差検証でモデルの汎化性能を評価しましょう。',
    furigana: 'きかいがくしゅうモデルのくんれんでは、かがくしゅうをふせぐためにせいそくかやドロップアウトなどのしゅほうをてきせつにくみあわせることがもとめられます。こうさけんしょうでモデルのはんかせいのうをひょうかしましょう。',
    romaji: 'kikai gakushuu moderu no kunren de wa, kagakushuu wo fusegu tame ni seisokuka ya doroppuauto nado no shuhou wo tekisetsu ni kumiawaseru koto ga motome rare masu. kousa kenshou de moderu no hanka seinou wo hyouka shimashou.',
    difficulty: 5
  },
  // ── 追加：さらにバランス調整 ──
  {
    content: 'プリンターで印刷する方法を教えてください。',
    furigana: 'プリンターでいんさつするほうほうをおしえてください。',
    romaji: 'purintaa de insatsu suru houhou wo oshiete kudasai.',
    difficulty: 1
  },
  {
    content: 'ブラウザのアドレスバーにURLを入力してEnterキーを押します。',
    furigana: 'ブラウザのアドレスバーにURLをにゅうりょくしてEnterキーをおします。',
    romaji: 'burauza no adoresu baa ni URL wo nyuuryoku shite Enter kii wo oshi masu.',
    difficulty: 1
  },
  {
    content: 'フォルダを作成してファイルを整理しましょう。デスクトップを綺麗に保つことが大事です。',
    furigana: 'フォルダをさくせいしてファイルをせいりしましょう。デスクトップをきれいにたもつことがだいじです。',
    romaji: 'foruda wo sakusei shite fairu wo seiri shimashou. desukutoppu wo kirei ni tamotsu koto ga daiji desu.',
    difficulty: 2
  },
  {
    content: 'スマートフォンのアプリ開発には、iOSならSwift、AndroidならKotlinがよく使われます。',
    furigana: 'スマートフォンのアプリかいはつには、iOSならSwift、AndroidならKotlinがよくつかわれます。',
    romaji: 'sumaato fon no apuri kaihatsu ni wa, iOS nara Swift, Android nara Kotlin ga yoku tsukawa re masu.',
    difficulty: 3
  },
  {
    content: 'サーバーレスアーキテクチャでは、サーバーの管理が不要になり、コードの実行にのみ集中できます。AWSのLambdaが代表的です。',
    furigana: 'サーバーレスアーキテクチャでは、サーバーのかんりがふようになり、コードのじっこうにのみしゅうちゅうできます。AWSのLambdaがだいひょうてきです。',
    romaji: 'saabaaresu aakitekucha de wa, saabaa no kanri ga fuyou ni nari, koodo no jikkou ni nomi shuuchuu deki masu. AWS no Lambda ga daihyouteki desu.',
    difficulty: 4
  },
  {
    content: '正規表現を使うと文字列のパターンマッチングが可能になります。メールアドレスや電話番号の検証に便利です。',
    furigana: 'せいきひょうげんをつかうともじれつのパターンマッチングがかのうになります。メールアドレスやでんわばんごうのけんしょうにべんりです。',
    romaji: 'seiki hyougen wo tsukau to mojiretsu no pataan matchingu ga kanou ni nari masu. meeru adoresu ya denwa bangou no kenshou ni benri desu.',
    difficulty: 3
  },
  {
    content: 'ブロックチェーンは分散型台帳技術であり、暗号通貨の基盤として知られています。改ざんが極めて困難な仕組みです。',
    furigana: 'ブロックチェーンはぶんさんがただいちょうぎじゅつであり、あんごうつうかのきばんとしてしられています。かいざんがきわめてこんなんなしくみです。',
    romaji: 'burokku cheen wa bunsangata daichou gijutsu de ari, angou tsuuka no kiban toshite shirate i masu. kaizan ga kiwamete konnan na shikumi desu.',
    difficulty: 4
  },
  {
    content: 'ソートアルゴリズムにはバブルソート、クイックソート、マージソートなどがあります。それぞれ計算量が異なります。',
    furigana: 'ソートアルゴリズムにはバブルソート、クイックソート、マージソートなどがあります。それぞれけいさんりょうがことなります。',
    romaji: 'sooto arugorizumu ni wa baburu sooto, kuikku sooto, maaji sooto nado ga ari masu. sorezore keisanryou ga kotonari masu.',
    difficulty: 3
  },
  {
    content: 'シェルスクリプトを使うと、日常的な作業を自動化できます。bashやzshが一般的に使われるシェルです。',
    furigana: 'シェルスクリプトをつかうと、にちじょうてきなさぎょうをじどうかできます。bashやzshがいっぱんてきにつかわれるシェルです。',
    romaji: 'sheru sukuriputo wo tsukau to, nichijouteki na sagyou wo jidouka deki masu. bash ya zsh ga ippanteki ni tsukawa reru sheru desu.',
    difficulty: 3
  },
  {
    content: 'コードレビューはチーム全体の品質を向上させます。建設的なフィードバックを心がけ、学びの機会として活用しましょう。',
    furigana: 'コードレビューはチームぜんたいのひんしつをこうじょうさせます。けんせつてきなフィードバックをこころがけ、まなびのきかいとしてかつようしましょう。',
    romaji: 'koodo rebyuu wa chiimu zentai no hinshitsu wo koujou sase masu. kensetsuteki na fiido bakku wo kokorogake, manabi no kikai toshite katsuyou shimashou.',
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
  // ── Java 追加 ─────────────────────────────────────────
  {
    language: 'java',
    content: `System.out.println("Hello");
int x = 10;
String name = "Java";`,
    difficulty: 1
  },
  {
    language: 'java',
    content: `for (int i = 0; i < 10; i++) {
    System.out.println(i);
}`,
    difficulty: 1
  },
  {
    language: 'java',
    content: `public String reverse(String s) {
    return new StringBuilder(s).reverse().toString();
}`,
    difficulty: 2
  },
  {
    language: 'java',
    content: `try {
    int result = 10 / 0;
} catch (ArithmeticException e) {
    System.out.println("Error: " + e.getMessage());
} finally {
    System.out.println("Done");
}`,
    difficulty: 2
  },
  {
    language: 'java',
    content: `public class Student {
    private String name;
    private int age;

    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() { return name; }
    public int getAge() { return age; }
}`,
    difficulty: 3
  },
  {
    language: 'java',
    content: `List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
int sum = numbers.stream()
    .filter(n -> n % 2 == 0)
    .mapToInt(Integer::intValue)
    .sum();
System.out.println("Sum of evens: " + sum);`,
    difficulty: 3
  },
  {
    language: 'java',
    content: `public abstract class Animal {
    protected String name;

    public Animal(String name) { this.name = name; }
    public abstract String speak();
}

public class Dog extends Animal {
    public Dog(String name) { super(name); }
    public String speak() { return name + " says Woof!"; }
}`,
    difficulty: 4
  },
  {
    language: 'java',
    content: `public class Singleton {
    private static volatile Singleton instance;
    private Singleton() {}

    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}`,
    difficulty: 5
  },
  {
    language: 'java',
    content: `@FunctionalInterface
public interface Validator<T> {
    boolean validate(T input);
}

Validator<String> notEmpty = s -> s != null && !s.isEmpty();
Validator<Integer> positive = n -> n > 0;`,
    difficulty: 4
  },
  {
    language: 'java',
    content: `String[] fruits = {"apple", "banana", "cherry"};
for (String fruit : fruits) {
    System.out.println(fruit.toUpperCase());
}`,
    difficulty: 1
  },
  {
    language: 'java',
    content: `int[] arr = {5, 3, 8, 1, 9};
Arrays.sort(arr);
System.out.println(Arrays.toString(arr));`,
    difficulty: 2
  },
  {
    language: 'java',
    content: `public Optional<User> findById(int id) {
    return users.stream()
        .filter(u -> u.getId() == id)
        .findFirst();
}`,
    difficulty: 4
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
  // ── JavaScript 追加 ────────────────────────────────────
  {
    language: 'javascript',
    content: `let x = 5;
let y = 10;
console.log(x + y);`,
    difficulty: 1
  },
  {
    language: 'javascript',
    content: `const greet = (name) => {
    return "Hello, " + name + "!";
};
console.log(greet("World"));`,
    difficulty: 1
  },
  {
    language: 'javascript',
    content: `const fruits = ["apple", "banana", "cherry"];
fruits.forEach((fruit, index) => {
    console.log(index + ": " + fruit);
});`,
    difficulty: 1
  },
  {
    language: 'javascript',
    content: `function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
console.log(factorial(5));`,
    difficulty: 2
  },
  {
    language: 'javascript',
    content: `const user = {
    name: "Alice",
    age: 25,
    greet() {
        return "Hi, I'm " + this.name;
    }
};
console.log(user.greet());`,
    difficulty: 2
  },
  {
    language: 'javascript',
    content: `const promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve("Done!"), 1000);
});
promise.then(msg => console.log(msg));`,
    difficulty: 3
  },
  {
    language: 'javascript',
    content: `class Animal {
    constructor(name) {
        this.name = name;
    }
    speak() {
        return this.name + " makes a sound.";
    }
}

class Dog extends Animal {
    speak() {
        return this.name + " barks.";
    }
}`,
    difficulty: 3
  },
  {
    language: 'javascript',
    content: `const groupBy = (arr, key) => {
    return arr.reduce((acc, item) => {
        const group = item[key];
        acc[group] = acc[group] || [];
        acc[group].push(item);
        return acc;
    }, {});
};`,
    difficulty: 4
  },
  {
    language: 'javascript',
    content: `function* range(start, end, step = 1) {
    for (let i = start; i < end; i += step) {
        yield i;
    }
}
for (const n of range(0, 10, 2)) {
    console.log(n);
}`,
    difficulty: 4
  },
  {
    language: 'javascript',
    content: `const deepClone = (obj) => {
    if (obj === null || typeof obj !== "object") return obj;
    const clone = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            clone[key] = deepClone(obj[key]);
        }
    }
    return clone;
};`,
    difficulty: 5
  },
  {
    language: 'javascript',
    content: `const pipe = (...fns) =>
    (x) => fns.reduce((v, f) => f(v), x);

const double = (n) => n * 2;
const add1 = (n) => n + 1;
const square = (n) => n * n;

console.log(pipe(double, add1, square)(3));`,
    difficulty: 5
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
  // ── Python 追加 ────────────────────────────────────────
  {
    language: 'python',
    content: `name = "Alice"
age = 25
print(f"Hello, {name}! You are {age}.")`,
    difficulty: 1
  },
  {
    language: 'python',
    content: `numbers = [1, 2, 3, 4, 5]
total = sum(numbers)
print(f"Sum: {total}")`,
    difficulty: 1
  },
  {
    language: 'python',
    content: `for i in range(1, 11):
    if i % 2 == 0:
        print(f"{i} is even")
    else:
        print(f"{i} is odd")`,
    difficulty: 1
  },
  {
    language: 'python',
    content: `def count_words(text):
    words = text.split()
    return len(words)

sentence = "Hello World from Python"
print(count_words(sentence))`,
    difficulty: 2
  },
  {
    language: 'python',
    content: `with open("data.txt", "r") as f:
    lines = f.readlines()
    for line in lines:
        print(line.strip())`,
    difficulty: 2
  },
  {
    language: 'python',
    content: `from collections import Counter

words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
count = Counter(words)
print(count.most_common(2))`,
    difficulty: 2
  },
  {
    language: 'python',
    content: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
    difficulty: 3
  },
  {
    language: 'python',
    content: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("Insufficient funds")
        self.balance -= amount`,
    difficulty: 3
  },
  {
    language: 'python',
    content: `import re

def validate_email(email):
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return bool(re.match(pattern, email))

emails = ["test@example.com", "invalid@", "user@site.org"]
for e in emails:
    print(f"{e}: {validate_email(e)}")`,
    difficulty: 4
  },
  {
    language: 'python',
    content: `from dataclasses import dataclass
from typing import List

@dataclass
class Student:
    name: str
    scores: List[int]

    @property
    def average(self) -> float:
        return sum(self.scores) / len(self.scores)

    def is_passing(self) -> bool:
        return self.average >= 60`,
    difficulty: 4
  },
  {
    language: 'python',
    content: `def memoize(func):
    cache = {}
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    return wrapper

@memoize
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)`,
    difficulty: 5
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
  // ── HTML 追加 ─────────────────────────────────────────
  {
    language: 'html',
    content: `<h1>Hello</h1>
<p>Welcome to my page.</p>
<a href="https://example.com">Link</a>`,
    difficulty: 1
  },
  {
    language: 'html',
    content: `<ul>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
</ul>`,
    difficulty: 1
  },
  {
    language: 'html',
    content: `<img src="photo.jpg" alt="Photo">
<br>
<input type="text" placeholder="Enter name">
<button>Submit</button>`,
    difficulty: 1
  },
  {
    language: 'html',
    content: `<select name="color" id="color">
    <option value="red">赤</option>
    <option value="blue">青</option>
    <option value="green">緑</option>
</select>`,
    difficulty: 2
  },
  {
    language: 'html',
    content: `<details>
    <summary>クリックして開く</summary>
    <p>ここに詳細な内容が表示されます。</p>
</details>
<progress value="70" max="100">70%</progress>`,
    difficulty: 2
  },
  {
    language: 'html',
    content: `<section>
    <header>
        <h2>Section Title</h2>
    </header>
    <p>Content goes here.</p>
    <footer>
        <small>Last updated: 2025-01-01</small>
    </footer>
</section>`,
    difficulty: 2
  },
  {
    language: 'html',
    content: `<dialog id="myDialog">
    <h3>Dialog Title</h3>
    <p>This is a modal dialog.</p>
    <form method="dialog">
        <button>Close</button>
    </form>
</dialog>
<button onclick="myDialog.showModal()">Open Dialog</button>`,
    difficulty: 3
  },
  {
    language: 'html',
    content: `<template id="card-template">
    <div class="card">
        <h3 class="card-title"></h3>
        <p class="card-body"></p>
    </div>
</template>
<script>
    const template = document.getElementById("card-template");
    const clone = template.content.cloneNode(true);
    document.body.appendChild(clone);
</script>`,
    difficulty: 4
  },
  {
    language: 'html',
    content: `<form action="/api/submit" method="post" enctype="multipart/form-data">
    <fieldset>
        <legend>ユーザー登録</legend>
        <label for="username">ユーザー名:</label>
        <input type="text" id="username" name="username" required minlength="3">
        <label for="avatar">アバター:</label>
        <input type="file" id="avatar" name="avatar" accept="image/*">
        <button type="submit">登録</button>
    </fieldset>
</form>`,
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
  // ── CSS 追加 ──────────────────────────────────────────
  {
    language: 'css',
    content: `p {
    color: blue;
    font-size: 16px;
}
a {
    color: red;
    text-decoration: none;
}`,
    difficulty: 1
  },
  {
    language: 'css',
    content: `.box {
    width: 200px;
    height: 200px;
    background: #3b82f6;
    border: 2px solid #1d4ed8;
    border-radius: 10px;
    margin: 20px auto;
}`,
    difficulty: 1
  },
  {
    language: 'css',
    content: `.center {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}`,
    difficulty: 1
  },
  {
    language: 'css',
    content: `ul {
    list-style: none;
    padding: 0;
}
li {
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #e2e8f0;
}
li:last-child {
    border-bottom: none;
}`,
    difficulty: 2
  },
  {
    language: 'css',
    content: `.tooltip {
    position: relative;
    cursor: pointer;
}

.tooltip::after {
    content: attr(data-tip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #1e293b;
    color: #fff;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.2s;
}

.tooltip:hover::after {
    opacity: 1;
}`,
    difficulty: 3
  },
  {
    language: 'css',
    content: `@media (max-width: 768px) {
    .container {
        flex-direction: column;
        padding: 1rem;
    }
    .sidebar {
        display: none;
    }
    .main {
        width: 100%;
    }
}`,
    difficulty: 3
  },
  {
    language: 'css',
    content: `.card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.card:active {
    transform: translateY(0);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}`,
    difficulty: 2
  },
  {
    language: 'css',
    content: `.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}`,
    difficulty: 3
  },
  {
    language: 'css',
    content: `.grid-layout {
    display: grid;
    grid-template-areas:
        "header header"
        "sidebar main"
        "footer footer";
    grid-template-columns: 250px 1fr;
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
    gap: 1rem;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }`,
    difficulty: 4
  },
  {
    language: 'css',
    content: `.dark-mode {
    --bg: #0f172a;
    --text: #f1f5f9;
    --accent: #38bdf8;
}

.light-mode {
    --bg: #ffffff;
    --text: #1e293b;
    --accent: #2563eb;
}

body {
    background: var(--bg);
    color: var(--text);
    transition: background 0.3s, color 0.3s;
}

a { color: var(--accent); }`,
    difficulty: 4
  },
  // ── 追加：TypeScript ─────────────────────────────────
  {
    language: 'typescript',
    content: `interface User {
    id: number;
    name: string;
    email: string;
}

const user: User = {
    id: 1,
    name: "Alice",
    email: "alice@example.com"
};`,
    difficulty: 2
  },
  {
    language: 'typescript',
    content: `type Result<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: string;
};

function parse(input: string): Result<number> {
    const n = Number(input);
    if (isNaN(n)) return { success: false, error: "Not a number" };
    return { success: true, data: n };
}`,
    difficulty: 3
  },
  {
    language: 'typescript',
    content: `function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
    const result: U[] = [];
    for (const item of arr) {
        result.push(fn(item));
    }
    return result;
}

const nums = map(["1", "2", "3"], Number);`,
    difficulty: 3
  },
  {
    language: 'typescript',
    content: `type EventMap = {
    click: { x: number; y: number };
    keydown: { key: string };
    resize: { width: number; height: number };
};

function on<K extends keyof EventMap>(
    event: K,
    handler: (data: EventMap[K]) => void
): void {
    console.log("Registered handler for", event);
}`,
    difficulty: 4
  },
  {
    language: 'typescript',
    content: `async function fetchJSON<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    return res.json() as Promise<T>;
}`,
    difficulty: 2
  },
  // ── SQL ──────────────────────────────────────────────
  {
    language: 'sql',
    content: `SELECT * FROM users WHERE age >= 18;`,
    difficulty: 1
  },
  {
    language: 'sql',
    content: `SELECT name, COUNT(*) as total
FROM orders
GROUP BY name
ORDER BY total DESC
LIMIT 10;`,
    difficulty: 2
  },
  {
    language: 'sql',
    content: `SELECT u.name, s.score
FROM users u
INNER JOIN scores s ON u.id = s.user_id
WHERE s.score > 80
ORDER BY s.score DESC;`,
    difficulty: 2
  },
  {
    language: 'sql',
    content: `CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    grade INTEGER CHECK (grade BETWEEN 1 AND 6),
    created_at TIMESTAMP DEFAULT NOW()
);`,
    difficulty: 2
  },
  {
    language: 'sql',
    content: `SELECT department,
    AVG(salary) as avg_salary,
    MAX(salary) as max_salary,
    MIN(salary) as min_salary
FROM employees
GROUP BY department
HAVING AVG(salary) > 50000
ORDER BY avg_salary DESC;`,
    difficulty: 3
  },
  {
    language: 'sql',
    content: `WITH monthly_sales AS (
    SELECT
        DATE_TRUNC('month', sold_at) as month,
        SUM(amount) as total
    FROM sales
    GROUP BY month
)
SELECT month, total,
    LAG(total) OVER (ORDER BY month) as prev_month
FROM monthly_sales;`,
    difficulty: 4
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // マイグレーション: typed_chars / duration_ms カラム追加（既存DBに対応）
    await client.query(`ALTER TABLE scores ADD COLUMN IF NOT EXISTS typed_chars INTEGER NOT NULL DEFAULT 0`);
    await client.query(`ALTER TABLE scores ADD COLUMN IF NOT EXISTS duration_ms INTEGER NOT NULL DEFAULT 0`);
    await client.query(`ALTER TABLE battle_participants ADD COLUMN IF NOT EXISTS typed_chars INTEGER DEFAULT 0`);

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
