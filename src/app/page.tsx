"use client";

import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import {
  analyzeMenuImage,
  generateTableImage as generateTableImageService,
} from "@/lib/gemini-service";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Share as CapShare } from "@capacitor/share";
import { StatusBar, Style } from "@capacitor/status-bar";
import { isNative } from "@/lib/platform";

interface Dish {
  originalName: string;
  translatedName: string;
  description: string;
  price?: string | null;
  imageQuery: string;
}

interface Section {
  originalTitle: string;
  translatedTitle: string;
  dishes: Dish[];
}

interface MenuResult {
  restaurantName?: string | null;
  restaurantVibe?: string;
  language?: string;
  sections: Section[];
}

const LANGUAGES = [
  { code: "Japanese", label: "日本語" },
  { code: "English", label: "English" },
];

const REGIONS = [
  { code: "auto", label: "Auto-Detect" },
  { code: "JP", label: "Japan" },
  { code: "IT", label: "Italy" },
  { code: "ES", label: "Spain" },
  { code: "FR", label: "France" },
  { code: "US", label: "USA" },
  { code: "KR", label: "Korea" },
  { code: "TH", label: "Thailand" },
  { code: "TW", label: "Taiwan" }
];

const REGION_FLAGS: Record<string, string> = {
  "JP": "🇯🇵", "IT": "🇮🇹", "ES": "🇪🇸", "FR": "🇫🇷",
  "US": "🇺🇸", "KR": "🇰🇷", "TH": "🇹🇭", "TW": "🇹🇼",
};

const CULTURAL_TIPS: Record<string, Record<string, string[]>> = {
  "JP": {
    "Japanese": [
      "💡日本ではお通し（席料）がかかる居酒屋が多く、チップの習慣はありません。",
      "💡すすって食べるのは「そば」や「うどん」などの麺類だけで、パスタなどは音を立てないのがマナーです。",
      "💡箸をご飯に突き刺す「立て箸」や、箸から箸へ料理を渡す「合わせ箸」はマナー違反とされています。"
    ],
    "English": [
      "💡Tipping is not customary in Japan and might even be politely refused.",
      "💡Slurping noodles like ramen or soba is totally fine and shows you're enjoying the meal!",
      "💡Never stick your chopsticks vertically into a bowl of rice; it's considered bad luck."
    ],
    "Chinese": [
      "💡在日本，居酒屋通常会收取\"小菜费\"（座席费），而且没有付小费的习惯。",
      "💡吃拉面或荞麦面时发出声音是可以接受的，这表示食物很好吃！",
      "💡绝对不要把筷子垂直插在米饭上，这在日本文化中很不吉利。"
    ],
    "Korean": [
      "💡일본에서는 팁 문화가 없으며, 정중히 거절당할 수도 있습니다.",
      "💡라멘이나 소바 같은 면류를 소리 내어 먹는 것은 맛있다는 표현으로 괜찮습니다!",
      "💡밥에 젓가락을 수직으로 꽂는 것은 금기시되니 피해주세요."
    ],
    "Spanish": [
      "💡No se acostumbra dejar propina en Japón.",
      "💡Sorber fideos como el ramen o soba es normal y demuestra que estás disfrutando la comida.",
      "💡Nunca claves los palillos verticalmente en un bol de arroz; se considera de mala suerte."
    ],
    "French": [
      "💡Le pourboire n'est pas coutumier au Japon.",
      "💡Aspirer bruyamment les nouilles (ramen, soba) est courant et montre que vous appréciez le plat !",
      "💡Ne plantez jamais vos baguettes verticalement dans un bol de riz, cela porte malheur."
    ]
  },
  "IT": {
    "Japanese": [
      "💡イタリアではコペルト（席料兼パン代）が必須の店が多く、チップは基本的に自由です。",
      "💡本場のカルボナーラには生クリームは使わず、グアンチャーレ（豚頬肉）と卵黄、チーズで作られます。",
      "💡食後のカプチーノは避けられる傾向にあり、エスプレッソをサッと飲むのがイタリア流です。"
    ],
    "English": [
      "💡Coperto (cover charge) is mandatory in Italy, tipping is mostly optional.",
      "💡Authentic carbonara uses guanciale, pecorino, egg yolk, and pepper—no heavy cream!",
      "💡Italians generally only drink cappuccinos at breakfast. After a meal, an espresso is preferred."
    ],
    "Chinese": [
      "💡在意大利，Coperto（座位费和面包费）通常是强制收取的，小费则随客意。",
      "💡正宗的培根蛋面（Carbonara）不加奶油，只用猪颊肉、鸡蛋黄和奶酪制作。",
      "💡意大利人通常只在早餐喝卡布奇诺，餐后更习惯喝浓缩咖啡（Espresso）。"
    ],
    "Korean": [
      "💡이탈리아에서는 코페르토(자릿세)가 필수인 곳이 많으며, 팁은 대체로 선택 사항입니다.",
      "💡정통 까르보나라에는 생크림이 들어가지 않고 관찰레(돼지 뽈살)와 계란 노른자, 치즈만 사용합니다.",
      "💡이탈리아인들은 보통 식후에 카푸치노를 마시지 않고, 에스프레소를 즐겨 마십니다."
    ],
    "Spanish": [
      "💡El Coperto es un cargo de mesa obligatorio en Italia, la propina es opcional.",
      "💡La carbonara auténtica no lleva nata, se hace con guanciale, yema de huevo y queso.",
      "💡Los italianos suelen evitar el capuchino después de comer; prefieren un espresso."
    ],
    "French": [
      "💡Le Coperto est obligatoire en Italie, le pourboire est optionnel.",
      "💡La vraie carbonara se fait avec du guanciale, du jaune d'œuf et du fromage, pas de crème !",
      "💡Les Italiens boivent rarement de cappuccino après les repas, ils préfèrent un espresso."
    ]
  },
  "ES": {
    "Japanese": [
      "💡スペインの朝食は2回。7時にコーヒーだけ、10〜11時にボカディージョで本命の一食。この時間帯がカフェで一番空いてWi-Fiも快適。",
      "💡ランチのピークは14〜15時、ディナーは21時以降。12時半に仕事を片付けて、バルでピンチョスをつまみながら待つのがノマドの流儀。",
      "💡バルは朝のコーヒー1杯で2時間居座っても普通に許容される。ただ昼のピーク時にPC占領はNG。注文ペースに合わせよう。",
      "💡メヌー・デル・ディア（Menú del día）はスペイン最強の節約ランチ。前菜・メイン・デザート・パン・ドリンク付きで€10〜13が相場。",
      "💡夕方18〜20時のメリエンダは仕事の区切りに最適。チュロス・コン・チョコラテでカロリーチャージしつつ夜モードへ切り替えよう。",
      "💡パエリアは地中海沿岸生まれの「昼メシ」。夜メニューにあるのはほぼ観光客向け。ランチ限定の店で食べるのが正解。",
      "💡パン・コン・トマテは自分でトマトをこすらせてくれる店が本物。完成品が出てくる観光地バルより断然うまい。",
      "💡ガンバス・アル・アヒージョを食べ終わったら残ったオイルにパンを浸すのが現地流。「¿Me pone más pan?」と言えばパーフェクト。",
      "💡クロケタスは店の実力が一番わかる一品。冷凍品は衣が厚く油っぽい。最初にこれを頼んで手作りか見極めるのが通の使い方。",
      "💡メニューに「a la madrileña」とあればトマトと玉ねぎベースのシンプル煮込み。見た目より味が深い首都の家庭味。",
      "💡「A la gallega」は茹でてパプリカパウダーとオリーブオイルをかけるだけ。タコが定番で、素材の良さで全部持っていく。",
      "💡「A la vasca」は白ワインとオリーブオイルで乳化させたソース仕立て。魚料理に多く、見た目は地味でも旨味の密度が高い。",
      "💡「A la andaluza」はたいてい揚げ物。魚介や野菜を薄衣でカラッと揚げるのが得意技。ペスカイート・フリートは南スペインの夏の定番。",
      "💡「A la catalana」はニンニク・トマト・オイルのソフレジットソースが基本。酸味と甘みのバランスで他地方より少し洗練された印象。",
      "💡「美味しい！」は ¡Riquísimo!（リキシモ！）で2割増し伝わる。BuenoやDeliciosoより感情が乗って、店のおばちゃんの反応が段違い。",
      "💡注文は ¡Oiga!（オイガ！）か目線で呼ぶ。ウェイターが多い店は目が合った瞬間に軽く顎を引くだけで通じることも。",
      "💡お会計は待っていてもなかなか来ない。「¡La cuenta, por favor!」と自分から言いに行くのが普通。知らずに30分待つ人を何人も見た。",
      "💡最初の一杯は Una caña（ウナ・カーニャ）。小さめの生ビールで€1〜2。カーニャをおかわりしながらバルをはしごするのがローカル流。",
      "💡カジュアルにワインなら Vino de la casa 一択。ボトル€5〜8、グラス€1〜2。リオハ産を置いてる店はワインへの意識が高い。",
      "💡飲まない日の最強選択肢は Mosto（モスト）。発酵させていないブドウ果汁で、バルで普通に頼める。ノンアル感なしで溶け込める。",
      "💡ティント・デ・ベラーノはサングリアより現地感がある。赤ワインをレモネードで割っただけの庶民の夏の定番。サングリアは観光地仕様が多い。",
      "💡食後はコルタード（Cortado）でシメるのが自然な流れ。カフェ・コン・レチェより小さくエスプレッソより柔らかい——大人のコーヒー。",
      "💡食後の「ソブレメサ」はテーブルでだらだらおしゃべりする神聖な時間。平日でも45分、週末は2時間超が当たり前。だからウェイターが勝手に会計を持ってくることは絶対にない。",
      "💡バルにはバラ（カウンター立ち飲み）＜メサ（店内テーブル）＜テラサ（屋外席）の三段階価格がある。テラサはカウンターより最大50%高いことも。座る前にメニューの価格表記をチェックしよう。",
      "💡日曜はスーパーと市場がほぼ閉まるから食材の買い出しは金〜土に済ませて。日曜ランチは家族イベントでレストラン激混み、月曜は多くの飲食店が週休で閉まるから要注意。",
      "💡スペインの伝統的カフェはPC作業に不向き。最近はノートPC禁止の店も増加中。スペシャルティコーヒー店なら平日は許容されるけど、週末はNG。長居するなら「こまめに追加オーダー」が最低限のマナー。",
      "💡トルティージャ・エスパニョーラは中身が半熟トロトロの「jugosa（フゴサ）」で頼むのが通。バスクのピンチョスバーは超トロトロで有名。「con cebolla（玉ねぎ入り）か sin cebolla（なし）か」はスペイン人を二分する永遠の論争ネタ。",
      "💡ハモン・イベリコには法定カラーラベルがある。黒＝100%イベリコ種どんぐり放牧（最高級）、赤＝どんぐり飼育、緑＝放牧＋穀物、白＝穀物のみ。「bellota（どんぐり）」の文字があるかどうかがポイント。",
      "💡グラナダやレオンではドリンク1杯ごとに無料タパがつく。グラナダでは同じ店で飲み続けるほどタパがグレードアップする仕組み。ただしセビージャやバルセロナにはこの文化はないので注意。",
      "💡高品質な缶詰魚介「conservas（コンセルバス）」はスペインでは安物じゃなく贅沢品。缶を開けてそのまま出すのが正式な提供スタイル。カンタブリア産アンチョビやマグロの腹身は絶品。",
      "💡一人旅で大皿ラシオンは頼みにくい……そんな時は「plato combinado」。肉か魚＋ポテト＋目玉焼きがワンプレートの定食スタイルで、メニュー・デル・ディアより安くて早い。",
      "💡「a la extremeña（エストレマドゥーラ風）」はラ・ベラ産スモークパプリカと豚肉が中心。イベリコ豚の各部位（secreto, presa）やミガス（パン粉炒め）が定番だよ。",
      "💡「a la riojana（リオハ風）」は干した甘い赤ピーマンとチョリソが主役。「patatas a la riojana」はじゃがいもとチョリソの煮込みで、辛くなく甘みとスモーキーさが特徴。リオハワインとの相性は最高。",
      "💡「pisto manchego（ラ・マンチャ風）」はズッキーニ・トマト・ピーマンの炒め煮に目玉焼きをのせた定番。注意：「gazpacho manchego」は冷製スープじゃなくて平たいパンと肉の煮込み料理——名前で混乱する代表格。",
      "💡バスクのピンチョスバーではカウンターに並んだピンチョスを自分で取って食べる。会計時は手元の爪楊枝の本数でカウント。ほとんど€2〜3.50均一。温かいピンチョスだけはバーテンダーに口頭注文が必要。",
      "💡スペインのチップは不要。地元民は端数を切り上げるか€1〜2のコインを置く程度。カウンター立ち飲みではチップゼロが普通。大事なのはチップは現金で——カード決済のチップはオーナーに行きがち。",
      "💡スペイン人のグループは誰が何を頼んだかに関係なく合計を人数で割る「pagar a medias」が基本。個別会計を細かく計算するのは「冷たい」と感じられることも。「¡Te invito yo!（おごるよ！）」と言われたら素直に受けて次回お返し。",
      "💡アラカルト注文でパンが出てきたら「¿El pan se paga aparte?」と確認を。€1〜4かかることも。水は「agua del grifo（水道水）」と言えば無料。ただ「agua」とだけ言うとボトル水（有料）が来るから注意。",
      "💡日曜11:30〜13:30の「ベルムーの時間」は食前に樽出しベルムーをオレンジとオリーブと一緒にやるスペインの儀式。「Vermut de grifo, por favor（樽出しベルムーください）」と頼めば通っぽい。",
      "💡アストゥリアスのシードラは炭酸なし。ボトルを頭上に掲げてグラスに高い位置から注ぐ「escanciar」で泡立てる。注がれた少量は一口で飲み干すのがルール——ちびちび飲むのはご法度。",
      "💡ビール＋レモンソーダの「clara」はマドリッドでは「¿con casera o con limón?」と聞かれ、カタルーニャでは「champú」、バスクでは「lejía」と呼ぶ。暑い日のライトなお酒にぴったり。",
      "💡夏の「café con hielo」はホットエスプレッソと氷入りグラスが別々に出てくる。砂糖はホットのうちに溶かしてから氷に注ぐのがコツ。バレンシアではレモンの皮とシナモンを添えた「café del tiempo」もあるよ。",
      "💡「una sin（ウナ・シン）」と言えばノンアルビールが出てくる。スペインは欧州有数のノンアルビール大国で、全主要ブランドに0.0%があり生で出す店も多い。誰もジャッジしないから安心してバル文化を楽しめる。",
      "💡ビールサイズの呼び名は地域でカオス。バスクの極小「zurito」、マドリッドの中ジョッキ「doble」、背の高いグラス「tubo」、大ジョッキ「jarra」。小さいサイズで頼むのがスペイン流——最後まで冷たいまま飲めるからね。"
    ],
    "English": [
      "💡Spaniards eat breakfast twice — a quick coffee at 7am, then a Bocadillo around 10–11am. That second window is when cafés are emptiest and Wi-Fi is usable.",
      "💡Lunch peaks at 2–3pm; dinner doesn't start until 9pm. Wrap up work by 12:30, graze on pintxos at a bar, and wait — that's the nomad way.",
      "💡A café will let you nurse a single coffee for two hours in the morning. But camping out during the lunch rush? That's a one-way ticket to side-eye.",
      "💡Menú del día is the best-value meal in Spain — starter, main, dessert, bread, and a drink for €10–13. Skip the tourist drag and ask a local instead.",
      "💡Merienda (6–8pm snack break) is a natural end-of-workday ritual. Churros con chocolate are flowing — the perfect moment to shift into evening mode.",
      "💡Paella is a lunchtime dish from Valencia. If it's on the dinner menu, it's aimed at tourists. Find a place that only serves it at lunch.",
      "💡Pan con tomate is best when they hand you the tomato and let you do it yourself. The DIY version beats the pre-made tourist bar version every time.",
      "💡After finishing gambas al ajillo, dip your bread into the leftover garlic oil. Say \"¿Me pone más pan?\" and you've earned your honorary local card.",
      "💡Croquetas are the ultimate litmus test for a kitchen. Frozen ones have thick, greasy breading. Order these first to know if the place is worth staying for.",
      "💡See \"a la madrileña\" on the menu? That means a simple tomato-and-onion braise — Madrid's home-cooking style. Humble-looking, but deep in flavor.",
      "💡\"A la gallega\" means boiled and dressed with paprika and olive oil. Most often with octopus (Pulpo). Zero fuss, all flavor.",
      "💡\"A la vasca\" usually means a white wine sauce emulsified with olive oil. Common with fish — understated on the plate, but the umami hits hard.",
      "💡\"A la andaluza\" almost always means fried. Thin, crispy batter on seafood or vegetables. Pescaíto frito is the go-to on a summer afternoon in the south.",
      "💡\"A la catalana\" is built on sofregit — slow-cooked garlic, tomato, and olive oil. Dishes balance acidity and sweetness in a more refined way.",
      "💡Skip \"Bueno\" — say ¡Riquísimo! (ree-KEE-see-mo) when the food is good. It carries real emotion, and the reaction from whoever served it is immediately warmer.",
      "💡To get a waiter's attention, say ¡Oiga! or just make eye contact. A subtle chin-lift when eyes meet is usually enough.",
      "💡The check won't come to you — say ¡La cuenta, por favor! and go find someone if needed. Plenty of visitors have waited 30 minutes for a bill that was never coming.",
      "💡Start with una caña — a small draft beer (~200ml) for €1–2. The classic Spanish night is hopping between bars, one caña at a time.",
      "💡For wine without the fuss, order vino de la casa — a bottle runs €5–8, a glass €1–2. If the house wine is from Rioja, the bar takes its wine seriously.",
      "💡On a no-alcohol day, order Mosto — unfermented grape juice. No one blinks, and you still feel like you belong at the bar.",
      "💡Tinto de verano (red wine + lemon soda) is more local than sangria. Sangria tends to be the tourist-menu version; this is what people actually drink.",
      "💡End a meal with a Cortado — espresso with a splash of hot milk. Smaller than café con leche, smoother than straight espresso. The natural signal the meal is done.",
      "💡Post-meal \"sobremesa\" is sacred — lingering at the table chatting for 45 minutes on weekdays, 2+ hours on weekends. That's why waiters never bring the check unprompted; it would be rude.",
      "💡Most bars have three price tiers: barra (standing at the counter) < mesa (indoor table) < terraza (outdoor seat). Terraza can be up to 50% more expensive. Check the price list before sitting down.",
      "💡Sundays most supermarkets and markets are closed — do your groceries Friday or Saturday. Sunday lunch is a family affair (book ahead), and Monday many restaurants take their weekly rest day.",
      "💡Traditional Spanish cafés aren't laptop-friendly; some now ban them outright. Specialty coffee shops tolerate it on weekdays, but not weekends. If you stay long, keep ordering — that's the minimum courtesy.",
      "💡Order your tortilla española \"jugosa\" (runny inside) for the local experience. Basque pintxo bars are famous for ultra-runny ones. \"Con cebolla or sin cebolla?\" (with or without onion) is Spain's eternal food debate.",
      "💡Jamón ibérico has legal color-coded labels: black = 100% acorn-fed free-range (top-tier), red = acorn-fed, green = pasture + grain, white = grain only. Look for the word \"bellota\" (acorn) — that's the quality marker.",
      "💡In Granada and León, every drink order comes with a free tapa. In Granada, the longer you stay at one bar, the better the tapas get. But Seville and Barcelona don't have this tradition.",
      "💡High-quality tinned seafood \"conservas\" is a delicacy in Spain, not cheap food. Bars serve them straight from the tin — that's the proper style. Cantabrian anchovies and bonito belly are must-tries.",
      "💡Eating solo and big sharing plates feel awkward? Order a \"plato combinado\" — a one-plate combo of meat or fish + fries + fried egg. Cheaper and faster than the menú del día.",
      "💡\"A la extremeña\" means smoked paprika from La Vera + pork. Expect ibérico cuts like secreto and presa, or migas (fried breadcrumbs). Bold, earthy flavors from Spain's western frontier.",
      "💡\"A la riojana\" features dried sweet red peppers (pimiento choricero) and chorizo. \"Patatas a la riojana\" is a potato-chorizo stew — smoky and sweet, never spicy. Perfect with Rioja wine.",
      "💡\"Pisto manchego\" is sautéed zucchini, tomato, and peppers topped with a fried egg. Watch out: \"gazpacho manchego\" isn't cold soup — it's a bread-and-meat stew. A classic menu name trap.",
      "💡At Basque pintxo bars, grab whatever looks good from the counter yourself. They count your toothpicks at checkout — most pintxos are €2–3.50 each. Hot pintxos need to be ordered verbally from the bartender.",
      "💡Tipping isn't expected in Spain — waiters are salaried. Locals just round up or leave €1–2 in coins. At the counter, zero tip is standard. Important: tip in cash, not on card — card tips often go to the owner.",
      "💡Spanish groups split the bill evenly regardless of who ordered what — \"pagar a medias.\" Itemizing feels cold. If someone says \"¡Te invito yo!\" (my treat), accept gracefully and return the favor next time.",
      "💡If bread appears with your order, ask \"¿El pan se paga aparte?\" — it can cost €1–4. For free water, say \"agua del grifo\" (tap water). Just saying \"agua\" gets you a pricey bottle.",
      "💡Sunday mornings 11:30–1:30 is \"la hora del vermut\" — a ritual of draft vermouth with orange slices and olives before lunch. Say \"Vermut de grifo, por favor\" to sound like a local.",
      "💡Asturian sidra (cider) is still — no carbonation. The server pours it from overhead (\"escanciar\") to create fizz. Drink the small pour (culín) in one gulp. Sipping is a faux pas.",
      "💡A \"clara\" (beer + lemon soda) goes by different names everywhere: \"champú\" in Catalonia, \"lejía\" in the Basque Country. In Madrid they'll ask \"¿con casera o con limón?\" — sweet soda or real lemon.",
      "💡Summer \"café con hielo\" arrives as hot espresso plus a separate glass of ice. Dissolve your sugar while it's hot, then pour over ice. In Valencia, \"café del tiempo\" comes with a lemon peel and cinnamon.",
      "💡Say \"una sin\" for a non-alcoholic beer — Spain is one of Europe's biggest NA beer markets. Every major brand has a 0.0% version, many on tap. Nobody judges; you'll fit right in at the bar.",
      "💡Beer size names are chaos across Spain: tiny \"zurito\" in the Basque Country, \"doble\" in Madrid, tall glass \"tubo,\" big mug \"jarra.\" Order small — the Spanish way is to keep it cold till the last sip."
    ]
  },
  "FR": {
    "Japanese": [
      "💡フランスはサービス料込み（service compris）ですが、小銭を置いていくのがスマートです。",
      "💡バゲットは手でちぎって食べるのがマナー。ナイフで切ったりかじりつくのは避けましょう。",
      "💡ウェイターを呼ぶ時は大声を出さず、目が合ったタイミングで軽く手や顎を上げるのがスマートです。"
    ],
    "English": [
      "💡Service is usually included (service compris), but leaving a few coins is polite.",
      "💡Break your baguette with your hands into bite-sized pieces; don't bite directly into it.",
      "💡To call a waiter, avoid shouting or waving wildly; a subtle catch of the eye or slight hand raise is best."
    ],
    "Chinese": [
      "💡法国账单通常已含服务费（service compris），但留下几枚硬币作为小费被认为是礼貌的做法。",
      "💡吃法棍面包时，礼貌的做法是用手掰成小块吃，而不是直接咬或用刀切。",
      "💡呼叫服务员时不要大声喧哗，最好在有眼神接触时微微抬手示意。"
    ],
    "Korean": [
      "💡프랑스에서는 서비스 요금이 포함되어 있지만(service compris), 잔돈을 남겨두는 것이 예의입니다.",
      "💡바게트는 손으로 한 입 크기로 떼어 먹는 것이 매너입니다. 바로 베어물지 마세요.",
      "💡직원을 부를 때는 소리치지 말고, 눈이 마주쳤을 때 가볍게 손을 들어 표시하세요."
    ],
    "Spanish": [
      "💡El servicio suele estar incluido en Francia, pero dejar algunas monedas es de buena educación.",
      "💡Rompe la baguette con las manos en trozos pequeños; no la muerdas directamente.",
      "💡Para llamar al camarero, es mejor hacer contacto visual y levantar ligeramente la mano."
    ],
    "French": [
      "💡Le service est compris, mais laisser quelques pièces est poli.",
      "💡Rompez le pain avec vos mains, ne le coupez pas avec un couteau et ne croquez pas dedans.",
      "💡Appelez le serveur d'un simple regard ou d'un léger signe de main, sans l'interpeller à haute voix."
    ]
  },
  "US": {
    "Japanese": [
      "💡アメリカの標準的なチップ相場は現在 18% 〜 25% 程度となっています。",
      "💡外食のポーション（量）は非常に多いため、食べきれない場合は「To-go box（持ち帰り容器）」をもらうのが普通です。",
      "💡ドリンクの「Refill（おかわり）」が無料のレストランやファストフード店が多くあります。"
    ],
    "English": [
      "💡Standard tipping in the US is currently 18% - 25%.",
      "💡Portion sizes can be quite large; it's very common to ask for a 'to-go box' for leftovers.",
      "💡Soft drink refills are free in many casual restaurants and fast-food chains."
    ],
    "Chinese": [
      "💡目前美国的标准小费比例大约在 18% 到 25% 之间。",
      "💡美国餐厅的分量通常很大，如果吃不完，向服务员要一个\"To-go box（打包盒）\"是非常普遍的。",
      "💡在许多休闲餐厅和快餐店，软饮是可以免费续杯（Refill）的。"
    ],
    "Korean": [
      "💡현재 미국의 일반적인 팁 비율은 18% ~ 25% 정도입니다.",
      "💡음식 양이 매우 많은 편이므로, 남은 음식은 'To-go box(포장 용기)'를 요청해 가져가는 것이 일반적입니다.",
      "💡많은 일반 식당이나 패스트푸드점에서는 탄산음료 리필이 무료입니다."
    ],
    "Spanish": [
      "💡La propina estándar en EE.UU. actualmente es del 18% al 25%.",
      "💡Las porciones suelen ser grandes; es muy común pedir una caja para llevar ('to-go box') si sobra comida.",
      "💡Muchas veces la bebida (refill) es gratis en restaurantes de comida rápida."
    ],
    "French": [
      "💡Le pourboire standard aux États-Unis est actuellement de 18% à 25%.",
      "💡Les portions sont énormes, n'hésitez pas à demander un « doggy bag » (to-go box) pour les restes.",
      "💡Les boissons non alcoolisées (« soft drinks ») sont souvent à volonté (refill gratuit)."
    ]
  },
  "KR": {
    "Japanese": [
      "💡韓国のレストランでは「パンチャン（おかず）」は無料でおかわり自由な店がほとんどです！",
      "💡食事中は金属製の箸とスプーンがよく使われます。食器を持ち上げて食べるのはマナー違反です。",
      "💡焼肉店などでは、店員さんが肉をハサミで切って焼いてくれることが多いです。"
    ],
    "English": [
      "💡Banchan (side dishes) are free and refillable in most Korean restaurants!",
      "💡Bowls remain on the table while eating. Lifting your rice bowl to eat is considered improper etiquette.",
      "💡At Korean BBQ, servers often help grill and use scissors to cut the meat for you."
    ],
    "Chinese": [
      "💡在韩国餐厅，Banchan（配菜）通常是免费且可以无限续加的！",
      "💡吃饭时通常把碗放在桌上，端起饭碗吃在韩国被认为是不礼貌的。",
      "💡在韩国烤肉店，服务员通常会帮忙用剪刀剪肉并帮你烤熟。"
    ],
    "Korean": [
      "💡대부분의 한국 식당에서 반찬은 무료이며 리필이 가능합니다!",
      "💡식사 시 그릇은 테이블에 두고 먹으며, 밥그릇을 들고 먹는 것은 예의에 어긋납니다.",
      "💡고깃집에서는 직원이 직접 고기를 구워주고 가위로 잘라주는 경우가 많습니다."
    ],
    "Spanish": [
      "💡¡Los Banchan (guarniciones) son gratis y rellenables en Corea!",
      "💡Los cuencos se dejan en la mesa mientras se come; levantarlos se considera mala educación.",
      "💡En las barbacoas coreanas, los camareros suelen ayudar a asar y cortar la carne con tijeras."
    ],
    "French": [
      "💡Les Banchan (plats d'accompagnement) sont gratuits et à volonté en Corée !",
      "💡Laissez votre bol sur la table pour manger. Le soulever est considéré comme impoli.",
      "💡Au barbecue coréen, les serveurs coupent souvent la viande avec des ciseaux et la font griller pour vous."
    ]
  },
  "TH": {
    "Japanese": [
      "💡タイではスプーンを右手に持ち、フォークはスプーンにご飯を寄せるために使います。",
      "💡屋台やカジュアルな食堂ではテーブルにある4種の調味料（クルワンプルーン）で自分好みに味付けします。",
      "💡チップの習慣は本来ありませんが、高級店やお釣りの端数を置いていくことはよくあります。"
    ],
    "English": [
      "💡In Thailand, you typically eat with a spoon and use the fork only to push food onto the spoon.",
      "💡It's customary to season your own food at the table using the four-flavor condiment caddy provided.",
      "💡Tipping isn't traditional, but leaving small change or tipping 10% in upscale places is appreciated."
    ],
    "Chinese": [
      "💡在泰国，通常用右手拿勺子，叉子仅用来将食物推到勺子里。",
      "💡在餐桌上使用四种调味料架（鱼露、辣椒粉、糖、醋）根据自己的口味给食物调味是很常见的。",
      "💡传统上没有小费文化，但在高档餐厅留下零钱或 10% 的小费会很受欢迎。"
    ],
    "Korean": [
      "💡태국에서는 주로 숟가락으로 식사하며, 포크는 음식을 숟가락으로 모으는 데만 사용합니다.",
      "💡테이블에 놓인 4가지 양념통을 이용해 자신의 입맛에 맞게 음식의 간을 맞추는 것이 일반적입니다.",
      "💡원래 팁 문화는 없지만, 고급 식당에서는 거스름돈을 남기거나 약간의 팁을 주는 경우가 많습니다."
    ],
    "Spanish": [
      "💡En Tailandia, la cuchara se usa para comer y el tenedor para empujar la comida.",
      "💡Es habitual aliñar la comida en la mesa con los cuatro condimentos disponibles.",
      "💡La propina no es tradicional, pero se agradece el cambio suelto o un 10% en sitios elegantes."
    ],
    "French": [
      "💡En Thaïlande, mangez avec la cuillère, la fourchette sert à pousser la nourriture.",
      "💡Assaisonnez votre plat vous-même avec le set de quatre condiments souvent présent sur la table.",
      "💡Le pourboire n'est pas traditionnel, mais laisser la monnaie est apprécié dans les bons restaurants."
    ]
  },
  "TW": {
    "Japanese": [
      "💡台湾の屋台や夜市では、食べ歩きよりもその場の小さなテーブルでサッと食べるのが主流です。",
      "💡レストランでお水やお茶はセルフサービスの場合が非常に多いです。",
      "💡お会計は「買単（マイダン）」と伝えてレジで行うか、注文時に前払いするスタイルが一般的です。"
    ],
    "English": [
      "💡In Taiwanese night markets, it's common to eat quickly at the small tables provided rather than walking around.",
      "💡Water or tea is often self-service inside restaurants.",
      "💡You usually pay at the counter ('Mai dan') after eating, or sometimes you pay upfront when ordering."
    ],
    "Chinese": [
      "💡在台湾夜市，人们通常习惯在摊位旁的小桌子上迅速吃完，而不是边走边吃。",
      "💡在很多餐厅，水或茶通常是自助的。",
      "💡结账通常是吃完后拿着单子去柜台\"买单\"，或者在某些小吃店是点餐时先付款。"
    ],
    "Korean": [
      "💡대만 야시장에서는 돌아다니며 먹기보다 제공된 작은 테이블에서 빨리 먹는 것이 일반적입니다.",
      "💡식당 내에서 물이나 차는 셀프 서비스인 경우가 매우 흔합니다.",
      "💡식사 후 계산대에서 '마이단'이라고 말하며 계산하거나, 주문 시 선불로 내는 경우가 많습니다."
    ],
    "Spanish": [
      "💡En los mercados nocturnos de Taiwán, es común comer rápido en mesas pequeñas.",
      "💡El agua o el té suelen ser de autoservicio en los restaurantes.",
      "💡Normalmente se paga en la caja (Mai dan) después de comer, o a veces por adelantado."
    ],
    "French": [
      "💡Sur les marchés de nuit taïwanais, mangez rapidement aux petites tables prévues à cet effet.",
      "💡L'eau et le thé sont souvent en libre-service dans les restaurants.",
      "💡Généralement, on paie à la caisse (« Mai dan ») en partant, ou parfois à la commande."
    ]
  },
  "default": {
    "Japanese": [
      "💡現地の食文化を知ることは、旅を何倍も豊かにしてくれます！",
      "💡現地の言葉で「ありがとう」と言えるだけで、レストランでのサービスが温かいものになります。",
      "💡メニューの「おすすめ（Chef's special）」を思い切って試してみるのが、最高の旅の思い出になるかも？"
    ],
    "English": [
      "💡Exploring local flavors is the best way to understand a new culture.",
      "💡Learning how to say 'Thank you' in the local language can lead to warmer interactions at restaurants.",
      "💡Don't hesitate to ask for the 'Chef's special'—it might become your favorite travel memory!"
    ],
    "Chinese": [
      "💡探索地道美食是了解新文化最好的方式。",
      "💡学会用当地语言说\"谢谢\"，能够拉近你与餐厅服务员的距离。",
      "💡如果不确定点什么，不妨试试\"主厨推荐\"，这通常是旅行中最棒的美味回忆。"
    ],
    "Korean": [
      "💡현지의 맛을 즐기는 것은 새로운 문화를 이해하는 가장 좋은 방법입니다!",
      "💡현지어로 '감사합니다'라고 말하는 것만으로도 식당에서 훨씬 따뜻한 대우를 받을 수 있습니다.",
      "💡'셰프 추천 요리'를 과감하게 시도해보세요! 최고의 여행 추억이 될지도 모릅니다."
    ],
    "Spanish": [
      "💡Explorar los sabores locales es la mejor forma de entender una nueva cultura.",
      "💡Aprender a decir 'Gracias' en el idioma local siempre se recibe con una sonrisa.",
      "💡No dudes en pedir la especialidad del chef, ¡suele ser un acierto!"
    ],
    "French": [
      "💡Explorer les saveurs locales est la meilleure façon de comprendre une culture.",
      "💡Savoir dire « Merci » dans la langue locale attire souvent la sympathie des serveurs.",
      "💡N'hésitez pas à tenter la suggestion du chef, ce sera peut-être votre meilleur souvenir de voyage !"
    ]
  }
};

export default function Home() {
  const [analyzing, setAnalyzing] = useState(false);
  const [menu, setMenu] = useState<MenuResult | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroLoading, setHeroLoading] = useState(false);
  const [heroError, setHeroError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState("Japanese");
  const [selectedRegion, setSelectedRegion] = useState("auto");

  // Restore saved region & language from localStorage
  useEffect(() => {
    try {
      const savedRegion = localStorage.getItem("nomameshi_region");
      const savedLang = localStorage.getItem("nomameshi_lang");
      if (savedRegion && REGIONS.some(r => r.code === savedRegion)) setSelectedRegion(savedRegion);
      if (savedLang && LANGUAGES.some(l => l.code === savedLang)) setTargetLang(savedLang);
    } catch {}
    if (isNative()) {
      StatusBar.setStyle({ style: Style.Light }).catch(() => {});
    }
  }, []);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [tipIndex, setTipIndex] = useState(0);
  const [shuffledTipIndices, setShuffledTipIndices] = useState<number[]>([]);

  // Shuffle tip indices when region or language changes
  const getResolvedCountry = () => {
    if (analyzing && detectedCountry) return detectedCountry;
    return selectedRegion === "auto" ? null : selectedRegion;
  };

  useEffect(() => {
    const country = getResolvedCountry();
    const defaultCountry = "default";
    const tipObj = CULTURAL_TIPS[country || defaultCountry] || CULTURAL_TIPS[defaultCountry];
    const tipsArray = tipObj[targetLang] || tipObj["English"];
    // Fisher-Yates shuffle
    const indices = Array.from({ length: tipsArray.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledTipIndices(indices);
    setTipIndex(0);
  }, [selectedRegion, targetLang, detectedCountry]);

  // Rotation logic for tips — rotate when analyzing OR when a specific region is selected
  const shouldRotateTips = analyzing || selectedRegion !== "auto";
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (shouldRotateTips) {
      interval = setInterval(() => {
        setTipIndex((prev) => prev + 1);
      }, 4500);
    }
    return () => clearInterval(interval);
  }, [shouldRotateTips]);

  const getTipText = (countryCode: string | null) => {
    const defaultCountry = "default";
    const tipObj = CULTURAL_TIPS[countryCode || defaultCountry] || CULTURAL_TIPS[defaultCountry];
    const tipsArray = tipObj[targetLang] || tipObj["English"];
    if (shuffledTipIndices.length === 0) return tipsArray[0];
    const idx = shuffledTipIndices[tipIndex % shuffledTipIndices.length];
    return tipsArray[idx];
  };

  const generateTableImage = async (sections: Section[]) => {
    setHeroLoading(true);
    setHeroError(null);

    try {
      const allDishes = sections.flatMap(s => s.dishes.map(d => d.imageQuery));
      const imageUrl = await generateTableImageService(allDishes);
      if (imageUrl) {
        setHeroImage(imageUrl);
      } else {
        setHeroError("Failed to generate image.");
      }
    } catch (err: any) {
      console.error("Table image generation failed:", err);
      setHeroError("Failed to generate image.");
    } finally {
      setHeroLoading(false);
    }
  };

  const analyzeImage = async (dataUrl: string) => {
    setAnalyzing(true);
    setMenu(null);
    setHeroImage(null);
    setHeroError(null);
    setError(null);
    setDetectedCountry(selectedRegion === "auto" ? null : selectedRegion);

    if (!navigator.onLine) {
      setError("Internet connection lost. Please check your signal.");
      setAnalyzing(false);
      return;
    }

    let fullText = "";

    try {
      let countryFound = false;

      for await (const chunk of analyzeMenuImage(dataUrl, targetLang, selectedRegion)) {
        fullText += chunk;

        if (!countryFound) {
          const match = fullText.match(/"detected_country_code"\s*:\s*"([A-Z]{2})"/);
          if (match) {
            setDetectedCountry(match[1]);
            countryFound = true;
          }
        }
      }

      const cleanedText = fullText.replace(/```json/g, "").replace(/```/g, "").trim();
      let data;
      try {
        data = JSON.parse(cleanedText);
      } catch (parseError) {
        console.warn("JSON Parse Error. Attempting to repair truncated JSON...");
        try {
          let fixedText = cleanedText;
          if (fixedText.endsWith(",")) fixedText = fixedText.slice(0, -1);
          if (fixedText.endsWith(":")) fixedText += '""';

          let inString = false;
          let escapeNext = false;
          const stack: string[] = [];

          for (let i = 0; i < fixedText.length; i++) {
            const char = fixedText[i];
            if (escapeNext) { escapeNext = false; continue; }
            if (char === '\\') { escapeNext = true; continue; }
            if (char === '"') { inString = !inString; continue; }
            if (!inString) {
              if (char === '{') stack.push('}');
              else if (char === '[') stack.push(']');
              else if (char === '}' || char === ']') stack.pop();
            }
          }

          if (inString) fixedText += '"';
          while (stack.length > 0) {
            fixedText += stack.pop();
          }

          data = JSON.parse(fixedText);
          console.log("Successfully repaired truncated JSON.");
        } catch (repairError) {
          throw parseError;
        }
      }

      let menuData: MenuResult;

      if (data.sections) {
        menuData = data;
      } else if (data.dishes) {
        menuData = {
          restaurantName: data.restaurantName || null,
          restaurantVibe: data.restaurant_vibe || "",
          sections: [{ originalTitle: "MENU", translatedTitle: "メニュー", dishes: data.dishes }],
        };
      } else {
        throw new Error("No menu data found");
      }

      setMenu(menuData);
      generateTableImage(menuData.sections);
    } catch (err: any) {
      console.error("Failed to analyze", err);

      let msg = "Analysis failed. Please try again.";
      if (err.message && err.message.includes("Failed to fetch")) {
        if (!fullText) {
          msg = "Internet connection lost. Please check your signal.";
        } else {
          msg = "Connection lost, but showing partial results.";
        }
      } else {
        msg = err.message || msg;
      }

      if (!fullText && !menu) {
        setError(msg);
      } else if (!menu) {
        setError(`Could not generate menu structure. ${msg}`);
      }
    } finally {
      setAnalyzing(false);
      setDetectedCountry(null);
    }
  };

  const blobToDataUrl = async (blob: Blob, maxEdge = 1280): Promise<string> => {
    const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });
    const longestEdge = Math.max(bitmap.width, bitmap.height);
    const scale = longestEdge > maxEdge ? maxEdge / longestEdge : 1;
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    return canvas.toDataURL("image/jpeg", 0.70);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await blobToDataUrl(file);
    await analyzeImage(dataUrl);
  };

  const handleScan = async () => {
    if (analyzing) return;
    if (isNative()) {
      try {
        const photo = await Camera.getPhoto({
          quality: 80,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Prompt,
          width: 1280,
          height: 1280,
        });
        if (photo.dataUrl) {
          await analyzeImage(photo.dataUrl);
        }
      } catch {
        // user cancelled
      }
    } else {
      document.getElementById("menu-upload")?.click();
    }
  };

  const handlePaste = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const dataUrl = await blobToDataUrl(blob);
          await analyzeImage(dataUrl);
          return;
        }
      }
      setError("No image found in clipboard.");
    } catch {
      setError("Clipboard access denied. Please use the upload button.");
    }
  };

  const captureRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const handleSaveImage = async () => {
    if (!captureRef.current) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: "#1E2432",
        scale: 2,
        useCORS: true,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const fileName = `Nomameshi-${menu?.restaurantName?.replace(/\s+/g, "-") || "menu"}.png`;
        const file = new File([blob], fileName, { type: "image/png" });

        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({ files: [file] });
          } catch { /* user cancelled */ }
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          a.click();
          URL.revokeObjectURL(url);
        }
        setSaving(false);
      }, "image/png");
    } catch (err) {
      console.error("Save image failed:", err);
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!menu) return;
    const lines: string[] = [];
    if (menu.restaurantName) lines.push(menu.restaurantName);
    if (menu.restaurantVibe) lines.push(menu.restaurantVibe);
    lines.push("");
    for (const section of menu.sections) {
      lines.push(`── ${section.translatedTitle} (${section.originalTitle}) ──`);
      for (const dish of section.dishes) {
        const price = dish.price ? `  ${dish.price}` : "";
        lines.push(`${dish.translatedName} / ${dish.originalName}${price}`);
        if (dish.description) lines.push(`  ${dish.description}`);
      }
      lines.push("");
    }
    lines.push("Translated by Nomameshi\nhttps://nomameshi.vercel.app");
    const text = lines.join("\n");

    if (isNative()) {
      try {
        await CapShare.share({ title: "Nomameshi", text });
      } catch { /* user cancelled */ }
    } else if (navigator.share) {
      try {
        await navigator.share({ title: "Nomameshi", text });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };

  /* ===== Shared inline style objects ===== */

  const selectorBtn = (active: boolean) => ({
    display: "flex" as const, alignItems: "center" as const, gap: "10px",
    flex: 1, padding: "12px 16px", borderRadius: "12px",
    border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
    background: active ? "rgba(232,90,79,0.06)" : "var(--surface)",
    color: "var(--foreground)", fontSize: "0.9rem", fontFamily: "var(--font-heading)",
    fontWeight: 500 as const, cursor: "pointer" as const,
  });

  const regionLabel = REGIONS.find(r => r.code === selectedRegion)?.label || "Auto-Detect";

  const [showRegionPicker, setShowRegionPicker] = useState(false);

  return (
    <main className="container" style={{ minHeight: "100vh", padding: "2rem 0" }}>
      {/* Header */}
      <div className="animate-fade-in no-print" style={{ marginBottom: "2rem", marginTop: "1.5rem" }}>
        <h1 className="nomameshi-logo" style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>
          noma<span className="accent">meshi</span>
        </h1>
        <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem" }}>
          Your local meal companion
        </p>
      </div>

      {error && (
        <div className="error-message animate-fade-in no-print">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      {!menu ? (
        /* ===== SCAN MODE ===== */
        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Region & Language selectors */}
          <div style={{ display: "flex", gap: "10px" }}>
            {/* Region selector */}
            <div style={{ position: "relative", flex: 1 }}>
              <button
                onClick={() => { setShowRegionPicker(!showRegionPicker); }}
                disabled={analyzing}
                style={selectorBtn(showRegionPicker)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                <span style={{ flex: 1, textAlign: "left" }}>{regionLabel}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ABABAB" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              {showRegionPicker && (
                <div style={{
                  position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 50,
                  background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)", overflow: "hidden",
                }}>
                  {REGIONS.map(region => (
                    <button key={region.code} onClick={() => { setSelectedRegion(region.code); setShowRegionPicker(false); try { localStorage.setItem("nomameshi_region", region.code); } catch {} }} style={{
                      display: "block", width: "100%", padding: "10px 16px", border: "none",
                      background: selectedRegion === region.code ? "var(--surface-highlight)" : "transparent",
                      color: "var(--foreground)", fontSize: "0.9rem", fontFamily: "var(--font-heading)",
                      cursor: "pointer", textAlign: "left",
                    }}>
                      {REGION_FLAGS[region.code] ? `${REGION_FLAGS[region.code]} ` : ""}{region.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language toggle */}
            <div style={{ display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
              {LANGUAGES.map(lang => (
                <button key={lang.code} onClick={() => { setTargetLang(lang.code); try { localStorage.setItem("nomameshi_lang", lang.code); } catch {} }} disabled={analyzing} style={{
                  padding: "10px 14px", border: "none", fontSize: "0.9rem", fontFamily: "var(--font-heading)",
                  fontWeight: targetLang === lang.code ? 600 : 400, cursor: "pointer",
                  background: targetLang === lang.code ? "var(--surface-highlight)" : "transparent",
                  color: targetLang === lang.code ? "var(--primary)" : "var(--foreground-muted)",
                  transition: "all 0.2s ease",
                }}>
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Area */}
          <div style={{
            background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "20px",
            padding: "40px 32px", display: "flex", flexDirection: "column", alignItems: "center",
            gap: "20px", minHeight: "280px", justifyContent: "center",
          }}>
            {/* Camera icon circle */}
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%", background: "var(--surface-highlight)",
              display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
            }}>
              {analyzing ? (
                <div style={{ width: "32px", height: "32px", border: "3px solid rgba(232,90,79,0.2)", borderRadius: "50%", borderTopColor: "var(--primary)", animation: "spin 1s ease-in-out infinite" }} />
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              )}
            </div>

            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "6px", color: "var(--foreground)" }}>
                {analyzing ? "Analyzing menu..." : "Scan a menu"}
              </h2>
              <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem" }}>
                {analyzing ? "Detecting dishes and translating" : "Take a photo or upload from gallery"}
              </p>
            </div>

            {/* Buttons row */}
            <div style={{ display: "flex", gap: "12px", width: "100%" }}>
              <button onClick={handleScan} disabled={analyzing} style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                padding: "14px 20px", borderRadius: "12px", background: "var(--primary)", color: "#FFFFFF",
                fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.95rem",
                cursor: analyzing ? "default" : "pointer", opacity: analyzing ? 0.6 : 1,
                border: "none",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                Scan
              </button>
              <input id="menu-upload" type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} disabled={analyzing} />

              <button onClick={handlePaste} disabled={analyzing} style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                padding: "14px 20px", borderRadius: "12px", background: "var(--surface)",
                border: "1px solid var(--border)", color: "var(--foreground)",
                fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.95rem",
                cursor: analyzing ? "default" : "pointer", opacity: analyzing ? 0.6 : 1,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                </svg>
                Upload
              </button>
            </div>
          </div>

          {/* Tips Section */}
          {analyzing ? (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* LOCAL TIP header */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "24px", height: "1px", background: "var(--accent)" }} />
                <span style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "2px", color: "var(--accent)", fontFamily: "var(--font-heading)" }}>
                  LOCAL TIP
                </span>
              </div>

              {/* Tip card */}
              <div onClick={() => setTipIndex((prev) => prev + 1)} style={{
                background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px",
                padding: "20px", cursor: "pointer",
              }}>
                <p key={tipIndex} className="animate-fade-in" style={{
                  fontSize: "0.9rem", color: "var(--foreground)", lineHeight: 1.5,
                  minHeight: "3rem", marginBottom: "12px",
                }}>
                  {getTipText(detectedCountry)}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {detectedCountry && REGION_FLAGS[detectedCountry] && (
                    <span style={{ fontSize: "0.9rem" }}>{REGION_FLAGS[detectedCountry]}</span>
                  )}
                  <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", fontWeight: 500 }}>
                    {detectedCountry ? REGIONS.find(r => r.code === detectedCountry)?.label || detectedCountry : "Detecting..."}
                  </span>
                </div>
              </div>

              {/* AI disclaimer */}
              <p style={{ fontSize: "0.65rem", color: "var(--foreground-muted)", textAlign: "center" }}>
                ※以降表示される料理の説明文はAIによる参考情報（推論）です。
              </p>
            </div>
          ) : (
            /* Tip section when idle */
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "24px", height: "1px", background: "var(--accent)" }} />
                <span style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "2px", color: "var(--accent)", fontFamily: "var(--font-heading)" }}>
                  LOCAL TIP
                </span>
              </div>
              <div onClick={() => setTipIndex((prev) => prev + 1)} style={{
                background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px",
                padding: "20px", cursor: "pointer",
              }}>
                <p key={tipIndex} className="animate-fade-in" style={{ fontSize: "0.9rem", color: "var(--foreground)", lineHeight: 1.5, marginBottom: "12px" }}>
                  {getTipText(selectedRegion === "auto" ? null : selectedRegion)}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {selectedRegion !== "auto" && REGION_FLAGS[selectedRegion] && (
                    <span style={{ fontSize: "0.9rem" }}>{REGION_FLAGS[selectedRegion]}</span>
                  )}
                  <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", fontWeight: 500 }}>
                    {selectedRegion === "auto" ? "Select a region for tips" : REGIONS.find(r => r.code === selectedRegion)?.label}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ===== MENU RESULT MODE ===== */
        <div className="animate-fade-in">
          {/* Toolbar */}
          <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <button onClick={() => { setMenu(null); setHeroImage(null); }} style={{
              background: "none", border: "none", color: "var(--foreground-muted)",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.9rem",
              fontFamily: "var(--font-heading)",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Back
            </button>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleShare} style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "10px", color: "var(--foreground-muted)", cursor: "pointer",
                padding: "8px 14px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px",
                fontFamily: "var(--font-heading)",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                Share
              </button>
              <button onClick={handleSaveImage} disabled={saving} style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "10px", color: "var(--foreground-muted)", cursor: saving ? "default" : "pointer",
                padding: "8px 14px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px",
                opacity: saving ? 0.5 : 1, fontFamily: "var(--font-heading)",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* Capture area for Save Image */}
          <div ref={captureRef} className="menu-result-container">
            {/* Background Image Layer */}
            {(heroLoading || heroImage || heroError) && (
              <div className="menu-bg-layer no-print">
                {heroLoading ? (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(30,36,50,0.6)" }}>
                    <div className="loading-spinner" style={{ borderColor: "rgba(255,255,255,0.2)", borderTopColor: "#FFFFFF" }}></div>
                  </div>
                ) : heroImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={heroImage} alt="Table spread background" className="menu-bg-image animate-fade-in" />
                    <div style={{
                      position: "absolute", bottom: "12px", right: "12px", zIndex: 5,
                      background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.75)",
                      padding: "4px 8px", borderRadius: "4px", fontSize: "0.65rem",
                      backdropFilter: "blur(4px)", display: "flex", alignItems: "center", gap: "4px"
                    }}>
                      AI Generated
                    </div>
                  </>
                ) : heroError ? (
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(30,36,50,0.7)" }}>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginBottom: "1rem" }}>{heroError}</p>
                    <button onClick={() => menu && generateTableImage(menu.sections)} style={{
                      background: "transparent", border: "1px solid rgba(255,255,255,0.25)",
                      color: "#FFFFFF", padding: "8px 16px", borderRadius: "10px",
                      cursor: "pointer", fontSize: "0.85rem", fontFamily: "var(--font-heading)",
                    }}>
                      Retry
                    </button>
                  </div>
                ) : null}
              </div>
            )}

            {/* Menu Card */}
            <div className="menu-card">
              {/* Restaurant Header */}
              {menu.restaurantName && (
                <div className="menu-header">
                  <h2 className="menu-restaurant-name">{menu.restaurantName}</h2>
                  {menu.restaurantVibe && (
                    <p className="menu-vibe">{menu.restaurantVibe}</p>
                  )}
                </div>
              )}

              {/* Sections */}
              {menu.sections.map((section, sIdx) => (
                <div key={sIdx} className="menu-section">
                  <div className="menu-section-header">
                    <h3 className="menu-section-title">{section.translatedTitle}</h3>
                    <span className="menu-section-original">{section.originalTitle}</span>
                  </div>

                  <div className="menu-items">
                    {section.dishes.map((dish, dIdx) => (
                      <div key={dIdx} className="menu-item">
                        <div className="menu-item-content">
                          <div className="menu-item-header">
                            <div className="menu-item-names">
                              <span className="menu-item-translated">{dish.translatedName}</span>
                              <span className="menu-item-original">{dish.originalName}</span>
                            </div>
                            {dish.price && <span className="menu-item-price">{dish.price}</span>}
                          </div>
                          {dish.description && (
                            <p className="menu-item-description">{dish.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Footer */}
              <div className="menu-footer">
                <p>Translated by <span className="nomameshi-logo-reversed" style={{ fontSize: "inherit" }}>noma<span className="accent">meshi</span></span></p>
              </div>
            </div>
          </div>{/* /captureRef */}
        </div>
      )}
    </main>
  );
}
