"use client";

import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";

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
  { code: "Chinese", label: "中文" },
  { code: "Korean", label: "한국어" },
  { code: "Spanish", label: "Español" },
  { code: "French", label: "Français" },
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

const CULTURAL_TIPS: Record<string, Record<string, string[]>> = {
  "JP": {
    "Japanese": [
      "💡 豆知識: 日本ではお通し（席料）がかかる居酒屋が多く、チップの習慣はありません。",
      "💡 豆知識: すすって食べるのは「そば」や「うどん」などの麺類だけで、パスタなどは音を立てないのがマナーです。",
      "💡 豆知識: 箸をご飯に突き刺す「立て箸」や、箸から箸へ料理を渡す「合わせ箸」はマナー違反とされています。"
    ],
    "English": [
      "💡 Tip: Tipping is not customary in Japan and might even be politely refused.",
      "💡 Tip: Slurping noodles like ramen or soba is totally fine and shows you're enjoying the meal!",
      "💡 Tip: Never stick your chopsticks vertically into a bowl of rice; it's considered bad luck."
    ],
    "Chinese": [
      "💡 提示：在日本，居酒屋通常会收取“小菜费”（座席费），而且没有付小费的习惯。",
      "💡 提示：吃拉面或荞麦面时发出声音是可以接受的，这表示食物很好吃！",
      "💡 提示：绝对不要把筷子垂直插在米饭上，这在日本文化中很不吉利。"
    ],
    "Korean": [
      "💡 팁: 일본에서는 팁 문화가 없으며, 정중히 거절당할 수도 있습니다.",
      "💡 팁: 라멘이나 소바 같은 면류를 소리 내어 먹는 것은 맛있다는 표현으로 괜찮습니다!",
      "💡 팁: 밥에 젓가락을 수직으로 꽂는 것은 금기시되니 피해주세요."
    ],
    "Spanish": [
      "💡 Consejo: No se acostumbra dejar propina en Japón.",
      "💡 Consejo: Sorber fideos como el ramen o soba es normal y demuestra que estás disfrutando la comida.",
      "💡 Consejo: Nunca claves los palillos verticalmente en un bol de arroz; se considera de mala suerte."
    ],
    "French": [
      "💡 Astuce: Le pourboire n'est pas coutumier au Japon.",
      "💡 Astuce: Aspirer bruyamment les nouilles (ramen, soba) est courant et montre que vous appréciez le plat !",
      "💡 Astuce: Ne plantez jamais vos baguettes verticalement dans un bol de riz, cela porte malheur."
    ]
  },
  "IT": {
    "Japanese": [
      "💡 豆知識: イタリアではコペルト（席料兼パン代）が必須の店が多く、チップは基本的に自由です。",
      "💡 豆知識: 本場のカルボナーラには生クリームは使わず、グアンチャーレ（豚頬肉）と卵黄、チーズで作られます。",
      "💡 豆知識: 食後のカプチーノは避けられる傾向にあり、エスプレッソをサッと飲むのがイタリア流です。"
    ],
    "English": [
      "💡 Tip: Coperto (cover charge) is mandatory in Italy, tipping is mostly optional.",
      "💡 Tip: Authentic carbonara uses guanciale, pecorino, egg yolk, and pepper—no heavy cream!",
      "💡 Tip: Italians generally only drink cappuccinos at breakfast. After a meal, an espresso is preferred."
    ],
    "Chinese": [
      "💡 提示：在意大利，Coperto（座位费和面包费）通常是强制收取的，小费则随客意。",
      "💡 提示：正宗的培根蛋面（Carbonara）不加奶油，只用猪颊肉、鸡蛋黄和奶酪制作。",
      "💡 提示：意大利人通常只在早餐喝卡布奇诺，餐后更习惯喝浓缩咖啡（Espresso）。"
    ],
    "Korean": [
      "💡 팁: 이탈리아에서는 코페르토(자릿세)가 필수인 곳이 많으며, 팁은 대체로 선택 사항입니다.",
      "💡 팁: 정통 까르보나라에는 생크림이 들어가지 않고 관찰레(돼지 뽈살)와 계란 노른자, 치즈만 사용합니다.",
      "💡 팁: 이탈리아인들은 보통 식후에 카푸치노를 마시지 않고, 에스프레소를 즐겨 마십니다."
    ],
    "Spanish": [
      "💡 Consejo: El Coperto es un cargo de mesa obligatorio en Italia, la propina es opcional.",
      "💡 Consejo: La carbonara auténtica no lleva nata, se hace con guanciale, yema de huevo y queso.",
      "💡 Consejo: Los italianos suelen evitar el capuchino después de comer; prefieren un espresso."
    ],
    "French": [
      "💡 Astuce: Le Coperto est obligatoire en Italie, le pourboire est optionnel.",
      "💡 Astuce: La vraie carbonara se fait avec du guanciale, du jaune d'œuf et du fromage, pas de crème !",
      "💡 Astuce: Les Italiens boivent rarement de cappuccino après les repas, ils préfèrent un espresso."
    ]
  },
  "ES": {
    "Japanese": [
      "💡 豆知識: アンダルシア地方などでは、ドリンクを頼むと無料のタパスが付いてくることがあります！",
      "💡 豆知識: スペインの夕食時間は非常に遅く、夜21時〜22時頃から始まるのが一般的です。",
      "💡 豆知識: お会計はテーブルで行うのが基本で、店員に「La cuenta, por favor（お勘定を）」と声をかけます。"
    ],
    "English": [
      "💡 Tip: Tapas are often free with drinks in parts of Andalusia!",
      "💡 Tip: Dinner time in Spain is very late, typically starting around 9:00 PM or 10:00 PM.",
      "💡 Tip: You generally ask for the bill at your table by saying 'La cuenta, por favor'."
    ],
    "Chinese": [
      "💡 提示：在安达卢西亚等地区，点饮料通常会免费赠送塔帕斯（Tapas）小吃！",
      "💡 提示：西班牙人的晚餐时间非常晚，通常在晚上9点或10点才开始。",
      "💡 提示：通常是在座位上买单，可以对服务员说“La cuenta, por favor”（请结账）。"
    ],
    "Korean": [
      "💡 팁: 안달루시아 등 일부 지역에서는 음료를 주문하면 무료 타파스가 나오는 경우가 있습니다!",
      "💡 팁: 스페인의 저녁 식사 시간은 매우 늦어서, 보통 밤 9시나 10시쯤 시작됩니다.",
      "💡 팁: 계산은 테이블에서 하며, 직원에게 '라 꿴따, 뽀르 파보르(계산서 부탁합니다)'라고 말합니다."
    ],
    "Spanish": [
      "💡 Consejo: ¡Las tapas suelen ser gratis con las bebidas en partes de Andalucía!",
      "💡 Consejo: La cena en España suele ser bastante tarde, alrededor de las 21:00 o 22:00 horas.",
      "💡 Consejo: Se suele pedir la cuenta en la mesa diciendo 'La cuenta, por favor'."
    ],
    "French": [
      "💡 Astuce: Les tapas sont souvent accompagnées de boissons en Andalousie !",
      "💡 Astuce: Le dîner en Espagne est très tardif, généralement vers 21h ou 22h.",
      "💡 Astuce: Vous demandez l'addition à table en disant « La cuenta, por favor »."
    ]
  },
  "FR": {
    "Japanese": [
      "💡 豆知識: フランスはサービス料込み（service compris）ですが、小銭を置いていくのがスマートです。",
      "💡 豆知識: バゲットは手でちぎって食べるのがマナー。ナイフで切ったりかじりつくのは避けましょう。",
      "💡 豆知識: ウェイターを呼ぶ時は大声を出さず、目が合ったタイミングで軽く手や顎を上げるのがスマートです。"
    ],
    "English": [
      "💡 Tip: Service is usually included (service compris), but leaving a few coins is polite.",
      "💡 Tip: Break your baguette with your hands into bite-sized pieces; don't bite directly into it.",
      "💡 Tip: To call a waiter, avoid shouting or waving wildly; a subtle catch of the eye or slight hand raise is best."
    ],
    "Chinese": [
      "💡 提示：法国账单通常已含服务费（service compris），但留下几枚硬币作为小费被认为是礼貌的做法。",
      "💡 提示：吃法棍面包时，礼貌的做法是用手掰成小块吃，而不是直接咬或用刀切。",
      "💡 提示：呼叫服务员时不要大声喧哗，最好在有眼神接触时微微抬手示意。"
    ],
    "Korean": [
      "💡 팁: 프랑스에서는 서비스 요금이 포함되어 있지만(service compris), 잔돈을 남겨두는 것이 예의입니다.",
      "💡 팁: 바게트는 손으로 한 입 크기로 떼어 먹는 것이 매너입니다. 바로 베어물지 마세요.",
      "💡 팁: 직원을 부를 때는 소리치지 말고, 눈이 마주쳤을 때 가볍게 손을 들어 표시하세요."
    ],
    "Spanish": [
      "💡 Consejo: El servicio suele estar incluido en Francia, pero dejar algunas monedas es de buena educación.",
      "💡 Consejo: Rompe la baguette con las manos en trozos pequeños; no la muerdas directamente.",
      "💡 Consejo: Para llamar al camarero, es mejor hacer contacto visual y levantar ligeramente la mano."
    ],
    "French": [
      "💡 Astuce: Le service est compris, mais laisser quelques pièces est poli.",
      "💡 Astuce: Rompez le pain avec vos mains, ne le coupez pas avec un couteau et ne croquez pas dedans.",
      "💡 Astuce: Appelez le serveur d'un simple regard ou d'un léger signe de main, sans l'interpeller à haute voix."
    ]
  },
  "US": {
    "Japanese": [
      "💡 豆知識: アメリカの標準的なチップ相場は現在 18% 〜 25% 程度となっています。",
      "💡 豆知識: 外食のポーション（量）は非常に多いため、食べきれない場合は「To-go box（持ち帰り容器）」をもらうのが普通です。",
      "💡 豆知識: ドリンクの「Refill（おかわり）」が無料のレストランやファストフード店が多くあります。"
    ],
    "English": [
      "💡 Tip: Standard tipping in the US is currently 18% - 25%.",
      "💡 Tip: Portion sizes can be quite large; it's very common to ask for a 'to-go box' for leftovers.",
      "💡 Tip: Soft drink refills are free in many casual restaurants and fast-food chains."
    ],
    "Chinese": [
      "💡 提示：目前美国的标准小费比例大约在 18% 到 25% 之间。",
      "💡 提示：美国餐厅的分量通常很大，如果吃不完，向服务员要一个“To-go box（打包盒）”是非常普遍的。",
      "💡 提示：在许多休闲餐厅和快餐店，软饮是可以免费续杯（Refill）的。"
    ],
    "Korean": [
      "💡 팁: 현재 미국의 일반적인 팁 비율은 18% ~ 25% 정도입니다.",
      "💡 팁: 음식 양이 매우 많은 편이므로, 남은 음식은 'To-go box(포장 용기)'를 요청해 가져가는 것이 일반적입니다.",
      "💡 팁: 많은 일반 식당이나 패스트푸드점에서는 탄산음료 리필이 무료입니다."
    ],
    "Spanish": [
      "💡 Consejo: La propina estándar en EE.UU. actualmente es del 18% al 25%.",
      "💡 Consejo: Las porciones suelen ser grandes; es muy común pedir una caja para llevar ('to-go box') si sobra comida.",
      "💡 Consejo: Muchas veces la bebida (refill) es gratis en restaurantes de comida rápida."
    ],
    "French": [
      "💡 Astuce: Le pourboire standard aux États-Unis est actuellement de 18% à 25%.",
      "💡 Astuce: Les portions sont énormes, n'hésitez pas à demander un « doggy bag » (to-go box) pour les restes.",
      "💡 Astuce: Les boissons non alcoolisées (« soft drinks ») sont souvent à volonté (refill gratuit)."
    ]
  },
  "KR": {
    "Japanese": [
      "💡 豆知識: 韓国のレストランでは「パンチャン（おかず）」は無料でおかわり自由な店がほとんどです！",
      "💡 豆知識: 食事中は金属製の箸とスプーンがよく使われます。食器を持ち上げて食べるのはマナー違反です。",
      "💡 豆知識: 焼肉店などでは、店員さんが肉をハサミで切って焼いてくれることが多いです。"
    ],
    "English": [
      "💡 Tip: Banchan (side dishes) are free and refillable in most Korean restaurants!",
      "💡 Tip: Bowls remain on the table while eating. Lifting your rice bowl to eat is considered improper etiquette.",
      "💡 Tip: At Korean BBQ, servers often help grill and use scissors to cut the meat for you."
    ],
    "Chinese": [
      "💡 提示：在韩国餐厅，Banchan（配菜）通常是免费且可以无限续加的！",
      "💡 提示：吃饭时通常把碗放在桌上，端起饭碗吃在韩国被认为是不礼貌的。",
      "💡 提示：在韩国烤肉店，服务员通常会帮忙用剪刀剪肉并帮你烤熟。"
    ],
    "Korean": [
      "💡 팁: 대부분의 한국 식당에서 반찬은 무료이며 리필이 가능합니다!",
      "💡 팁: 식사 시 그릇은 테이블에 두고 먹으며, 밥그릇을 들고 먹는 것은 예의에 어긋납니다.",
      "💡 팁: 고깃집에서는 직원이 직접 고기를 구워주고 가위로 잘라주는 경우가 많습니다."
    ],
    "Spanish": [
      "💡 Consejo: ¡Los Banchan (guarniciones) son gratis y rellenables en Corea!",
      "💡 Consejo: Los cuencos se dejan en la mesa mientras se come; levantarlos se considera mala educación.",
      "💡 Consejo: En las barbacoas coreanas, los camareros suelen ayudar a asar y cortar la carne con tijeras."
    ],
    "French": [
      "💡 Astuce: Les Banchan (plats d'accompagnement) sont gratuits et à volonté en Corée !",
      "💡 Astuce: Laissez votre bol sur la table pour manger. Le soulever est considéré comme impoli.",
      "💡 Astuce: Au barbecue coréen, les serveurs coupent souvent la viande avec des ciseaux et la font griller pour vous."
    ]
  },
  "TH": {
    "Japanese": [
      "💡 豆知識: タイではスプーンを右手に持ち、フォークはスプーンにご飯を寄せるために使います。",
      "💡 豆知識: 屋台やカジュアルな食堂ではテーブルにある4種の調味料（クルワンプルーン）で自分好みに味付けします。",
      "💡 豆知識: チップの習慣は本来ありませんが、高級店やお釣りの端数を置いていくことはよくあります。"
    ],
    "English": [
      "💡 Tip: In Thailand, you typically eat with a spoon and use the fork only to push food onto the spoon.",
      "💡 Tip: It's customary to season your own food at the table using the four-flavor condiment caddy provided.",
      "💡 Tip: Tipping isn't traditional, but leaving small change or tipping 10% in upscale places is appreciated."
    ],
    "Chinese": [
      "💡 提示：在泰国，通常用右手拿勺子，叉子仅用来将食物推到勺子里。",
      "💡 提示：在餐桌上使用四种调味料架（鱼露、辣椒粉、糖、醋）根据自己的口味给食物调味是很常见的。",
      "💡 提示：传统上没有小费文化，但在高档餐厅留下零钱或 10% 的小费会很受欢迎。"
    ],
    "Korean": [
      "💡 팁: 태국에서는 주로 숟가락으로 식사하며, 포크는 음식을 숟가락으로 모으는 데만 사용합니다.",
      "💡 팁: 테이블에 놓인 4가지 양념통을 이용해 자신의 입맛에 맞게 음식의 간을 맞추는 것이 일반적입니다.",
      "💡 팁: 원래 팁 문화는 없지만, 고급 식당에서는 거스름돈을 남기거나 약간의 팁을 주는 경우가 많습니다."
    ],
    "Spanish": [
      "💡 Consejo: En Tailandia, la cuchara se usa para comer y el tenedor para empujar la comida.",
      "💡 Consejo: Es habitual aliñar la comida en la mesa con los cuatro condimentos disponibles.",
      "💡 Consejo: La propina no es tradicional, pero se agradece el cambio suelto o un 10% en sitios elegantes."
    ],
    "French": [
      "💡 Astuce: En Thaïlande, mangez avec la cuillère, la fourchette sert à pousser la nourriture.",
      "💡 Astuce: Assaisonnez votre plat vous-même avec le set de quatre condiments souvent présent sur la table.",
      "💡 Astuce: Le pourboire n'est pas traditionnel, mais laisser la monnaie est apprécié dans les bons restaurants."
    ]
  },
  "TW": {
    "Japanese": [
      "💡 豆知識: 台湾の屋台や夜市では、食べ歩きよりもその場の小さなテーブルでサッと食べるのが主流です。",
      "💡 豆知識: レストランでお水やお茶はセルフサービスの場合が非常に多いです。",
      "💡 豆知識: お会計は「買単（マイダン）」と伝えてレジで行うか、注文時に前払いするスタイルが一般的です。"
    ],
    "English": [
      "💡 Tip: In Taiwanese night markets, it's common to eat quickly at the small tables provided rather than walking around.",
      "💡 Tip: Water or tea is often self-service inside restaurants.",
      "💡 Tip: You usually pay at the counter ('Mai dan') after eating, or sometimes you pay upfront when ordering."
    ],
    "Chinese": [
      "💡 提示：在台湾夜市，人们通常习惯在摊位旁的小桌子上迅速吃完，而不是边走边吃。",
      "💡 提示：在很多餐厅，水或茶通常是自助的。",
      "💡 提示：结账通常是吃完后拿着单子去柜台“买单”，或者在某些小吃店是点餐时先付款。"
    ],
    "Korean": [
      "💡 팁: 대만 야시장에서는 돌아다니며 먹기보다 제공된 작은 테이블에서 빨리 먹는 것이 일반적입니다.",
      "💡 팁: 식당 내에서 물이나 차는 셀프 서비스인 경우가 매우 흔합니다.",
      "💡 팁: 식사 후 계산대에서 '마이단'이라고 말하며 계산하거나, 주문 시 선불로 내는 경우가 많습니다."
    ],
    "Spanish": [
      "💡 Consejo: En los mercados nocturnos de Taiwán, es común comer rápido en mesas pequeñas.",
      "💡 Consejo: El agua o el té suelen ser de autoservicio en los restaurantes.",
      "💡 Consejo: Normalmente se paga en la caja (Mai dan) después de comer, o a veces por adelantado."
    ],
    "French": [
      "💡 Astuce: Sur les marchés de nuit taïwanais, mangez rapidement aux petites tables prévues à cet effet.",
      "💡 Astuce: L'eau et le thé sont souvent en libre-service dans les restaurants.",
      "💡 Astuce: Généralement, on paie à la caisse (« Mai dan ») en partant, ou parfois à la commande."
    ]
  },
  "default": {
    "Japanese": [
      "💡 豆知識: 現地の食文化を知ることは、旅を何倍も豊かにしてくれます！",
      "💡 豆知識: 現地の言葉で「ありがとう」と言えるだけで、レストランでのサービスが温かいものになります。",
      "💡 豆知識: メニューの「おすすめ（Chef's special）」を思い切って試してみるのが、最高の旅の思い出になるかも？"
    ],
    "English": [
      "💡 Tip: Exploring local flavors is the best way to understand a new culture.",
      "💡 Tip: Learning how to say 'Thank you' in the local language can lead to warmer interactions at restaurants.",
      "💡 Tip: Don't hesitate to ask for the 'Chef's special'—it might become your favorite travel memory!"
    ],
    "Chinese": [
      "💡 提示：探索地道美食是了解新文化最好的方式。",
      "💡 提示：学会用当地语言说“谢谢”，能够拉近你与餐厅服务员的距离。",
      "💡 提示：如果不确定点什么，不妨试试“主厨推荐”，这通常是旅行中最棒的美味回忆。"
    ],
    "Korean": [
      "💡 팁: 현지의 맛을 즐기는 것은 새로운 문화를 이해하는 가장 좋은 방법입니다!",
      "💡 팁: 현지어로 '감사합니다'라고 말하는 것만으로도 식당에서 훨씬 따뜻한 대우를 받을 수 있습니다.",
      "💡 팁: '셰프 추천 요리'를 과감하게 시도해보세요! 최고의 여행 추억이 될지도 모릅니다."
    ],
    "Spanish": [
      "💡 Consejo: Explorar los sabores locales es la mejor forma de entender una nueva cultura.",
      "💡 Consejo: Aprender a decir 'Gracias' en el idioma local siempre se recibe con una sonrisa.",
      "💡 Consejo: No dudes en pedir la especialidad del chef, ¡suele ser un acierto!"
    ],
    "French": [
      "💡 Astuce: Explorer les saveurs locales est la meilleure façon de comprendre une culture.",
      "💡 Astuce: Savoir dire « Merci » dans la langue locale attire souvent la sympathie des serveurs.",
      "💡 Astuce: N'hésitez pas à tenter la suggestion du chef, ce sera peut-être votre meilleur souvenir de voyage !"
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
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [tipIndex, setTipIndex] = useState(0);

  // Rotation logic for tips when analyzing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (analyzing) {
      interval = setInterval(() => {
        setTipIndex((prev) => prev + 1);
      }, 3500); // Rotate every 3.5 seconds
    } else {
      setTipIndex(0); // Reset when not analyzing
    }
    return () => clearInterval(interval);
  }, [analyzing]);

  // Determine the tip language based on the targetLang code
  const getTipText = (countryCode: string | null) => {
    const defaultCountry = "default";
    const tipObj = CULTURAL_TIPS[countryCode || defaultCountry] || CULTURAL_TIPS[defaultCountry];
    const tipsArray = tipObj[targetLang] || tipObj["English"];
    return tipsArray[tipIndex % tipsArray.length];
  };

  const generateTableImage = async (sections: Section[]) => {
    setHeroLoading(true);
    setHeroError(null);
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 15000); // 15s timeout for image

    try {
      const allDishes = sections.flatMap(s => s.dishes.map(d => d.imageQuery));
      const res = await fetch("/api/search-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dishes: allDishes }),
        signal: abortController.signal,
      });
      const data = await res.json();
      if (data.imageUrl) {
        setHeroImage(data.imageUrl);
      } else {
        setHeroError("Failed to generate image.");
      }
    } catch (err: any) {
      console.error("Table image generation failed:", err);
      if (err.name === 'AbortError') {
        setHeroError("Image generation timed out.");
      } else {
        setHeroError("Failed to generate image.");
      }
    } finally {
      clearTimeout(timeoutId);
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

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 45000); // 45s timeout

    let fullText = "";

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, targetLang, selectedRegion }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error:", errorText);
        throw new Error(`Analysis failed: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Stream not supported");

      const decoder = new TextDecoder("utf-8");
      let countryFound = false;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;

          if (!countryFound) {
            const match = fullText.match(/"detected_country_code"\s*:\s*"([A-Z]{2})"/);
            if (match) {
              setDetectedCountry(match[1]);
              countryFound = true;
            }
          }
        }
      } catch (streamError: any) {
        console.warn("Stream interrupted, attempting partial parse. Error:", streamError);
        // If we have no text at all, we must throw. Otherwise, proceed to parse whatever we have.
        if (!fullText.trim()) throw streamError;
      } finally {
        clearTimeout(timeoutId);
      }

      // Final JSON parse after stream finishes
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
          throw parseError; // Throw original error if repair fails
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
      clearTimeout(timeoutId);
      console.error("Failed to analyze", err);

      let msg = "Analysis failed. Please try again.";
      if (err.name === 'AbortError') {
        msg = "Connection timed out. The restaurant's connection might be poor.";
      } else if (err.message && err.message.includes("Failed to fetch")) {
        // Only show offline if we don't have partial text
        if (!fullText) {
          msg = "Internet connection lost. Please check your signal.";
        } else {
          // We shouldn't hit this if fullText has content because of the streamError catch above, but just in case
          msg = "Connection lost, but showing partial results.";
        }
      } else {
        msg = err.message || msg;
      }

      // If we got partial text but not enough to even form 'sections' or 'dishes', show the error
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

  const blobToDataUrl = async (blob: Blob, maxEdge = 1600): Promise<string> => {
    // Explicitly handle EXIF orientation to prevent rotated images from mobile devices
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
    // Use 0.75 JPEG compression to significantly reduce payload size for overseas networks
    return canvas.toDataURL("image/jpeg", 0.75);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await blobToDataUrl(file);
    await analyzeImage(dataUrl);
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
        backgroundColor: "#0A0A0A",
        scale: 2,
        useCORS: true,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const fileName = `menumenu-${menu?.restaurantName?.replace(/\s+/g, "-") || "menu"}.png`;
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
    lines.push("Translated by menumenu\nhttps://menumenu-three.vercel.app");
    const text = lines.join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: "menumenu", text });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };

  return (
    <main className="container" style={{ minHeight: "100vh", padding: "2rem 0" }}>
      {/* Header */}
      <div className="animate-fade-in no-print" style={{ textAlign: "center", marginBottom: "3rem", marginTop: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          <span className="gradient-text">menumenu</span>
        </h1>
        <p style={{ color: "var(--foreground-muted)", fontSize: "1rem" }}>
          Don&apos;t just read the menu. <span style={{ color: "var(--foreground)" }}>See the flavor.</span>
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
        /* SCAN MODE */
        <div className="animate-fade-in glass-panel" style={{ padding: "3rem 2rem", textAlign: "center" }}>
          <div style={{ marginBottom: "2rem", position: "relative", display: "inline-block" }}>
            <div style={{
              position: "absolute", inset: "-15px", borderRadius: "50%",
              border: "2px solid var(--primary)", opacity: analyzing ? 0.5 : 0,
              animation: analyzing ? "pulse 1.5s infinite" : "none"
            }}></div>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={analyzing ? "var(--primary)" : "#555"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>

          <label htmlFor="menu-upload" className="btn-primary" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", opacity: analyzing ? 0.8 : 1,
            pointerEvents: analyzing ? "none" : "auto", gap: "10px"
          }}>
            {analyzing ? (<><div className="loading-spinner"></div>Analyzing Menu...</>) : "Examine Menu"}
          </label>
          <input id="menu-upload" type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} disabled={analyzing} />

          <button onClick={handlePaste} disabled={analyzing} style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", marginTop: "0.75rem", padding: "0.85rem 1.5rem",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "12px", color: "var(--foreground-muted)", fontSize: "1rem",
            cursor: analyzing ? "default" : "pointer", opacity: analyzing ? 0.5 : 1, gap: "8px",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Paste Screenshot
          </button>

          {/* Region selector */}
          <div style={{ marginTop: "2rem" }}>
            <p style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", marginBottom: "0.5rem" }}>Where are you eating?</p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px" }}>
              {REGIONS.map(region => (
                <button key={region.code} onClick={() => setSelectedRegion(region.code)} disabled={analyzing} style={{
                  padding: "6px 14px", borderRadius: "20px", fontSize: "0.8rem", cursor: "pointer",
                  border: selectedRegion === region.code ? "1px solid var(--primary)" : "1px solid rgba(255,255,255,0.12)",
                  background: selectedRegion === region.code ? "rgba(255,75,43,0.15)" : "rgba(255,255,255,0.04)",
                  color: selectedRegion === region.code ? "var(--primary)" : "var(--foreground-muted)",
                  opacity: analyzing ? 0.5 : 1,
                }}>
                  {region.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language selector */}
          <div style={{ marginTop: "1.5rem" }}>
            <p style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", marginBottom: "0.5rem" }}>Translate menu into</p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px" }}>
              {LANGUAGES.map(lang => (
                <button key={lang.code} onClick={() => setTargetLang(lang.code)} disabled={analyzing} style={{
                  padding: "6px 14px", borderRadius: "20px", fontSize: "0.8rem", cursor: "pointer",
                  border: targetLang === lang.code ? "1px solid var(--primary)" : "1px solid rgba(255,255,255,0.12)",
                  background: targetLang === lang.code ? "rgba(255,75,43,0.15)" : "rgba(255,255,255,0.04)",
                  color: targetLang === lang.code ? "var(--primary)" : "var(--foreground-muted)",
                  opacity: analyzing ? 0.5 : 1,
                }}>
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {analyzing ? (
            <div className="animate-fade-in" style={{ marginTop: "1.5rem", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.1)" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                {detectedCountry ? `Detected Region: ${detectedCountry}` : "Detecting Region..."}
              </p>
              {/* key forces a re-render/animation on index change */}
              <p key={tipIndex} className="animate-fade-in" style={{ fontSize: "0.9rem", color: "var(--foreground)", lineHeight: "1.4", fontStyle: "italic", minHeight: "2.8rem" }}>
                {getTipText(detectedCountry)}
              </p>
              <div style={{ marginTop: "1rem", paddingTop: "0.5rem", borderTop: "1px dashed rgba(255,255,255,0.1)", textAlign: "center" }}>
                <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>
                  ※以降表示される料理の説明文はAIによる参考情報（推論）です。
                </p>
              </div>
            </div>
          ) : (
            <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#666" }}>
              Take a photo or paste a screenshot.
            </p>
          )}
        </div>
      ) : (
        /* MENU RESULT MODE */
        <div className="animate-fade-in">
          {/* Toolbar */}
          <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <button onClick={() => { setMenu(null); setHeroImage(null); }} style={{
              background: "none", border: "none", color: "var(--foreground-muted)",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.9rem"
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Scan another
            </button>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleShare} style={{
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px", color: "var(--foreground-muted)", cursor: "pointer",
                padding: "6px 14px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px"
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                Share
              </button>
              <button onClick={handleSaveImage} disabled={saving} style={{
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px", color: "var(--foreground-muted)", cursor: saving ? "default" : "pointer",
                padding: "6px 14px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px",
                opacity: saving ? 0.5 : 1,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* Capture area for Save Image */}
          <div ref={captureRef}>
            {/* Hero Table Image */}
            <div className="menu-hero">
              {heroLoading ? (
                <div className="menu-hero-loading skeleton" style={{ height: "40vh", width: "100%", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "pulse 2s infinite" }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <p style={{ marginTop: "1rem", color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", letterSpacing: "0.05em" }}>
                    Generating table spread...
                  </p>
                </div>
              ) : heroImage ? (
                <div style={{ position: "relative" }} className="animate-fade-in">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroImage} alt="Table spread" className="menu-hero-img" />
                  <div style={{
                    position: "absolute", bottom: "12px", right: "12px",
                    background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.8)",
                    padding: "4px 8px", borderRadius: "4px", fontSize: "0.7rem",
                    backdropFilter: "blur(4px)", display: "flex", alignItems: "center", gap: "4px"
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    ★ AI Generated Image
                  </div>
                </div>
              ) : heroError ? (
                <div className="menu-hero-error" style={{ height: "40vh", width: "100%", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px dashed rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
                  <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>{heroError}</p>
                  <button onClick={() => menu && generateTableImage(menu.sections)} style={{
                    background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
                    color: "var(--foreground)", padding: "8px 16px", borderRadius: "20px",
                    cursor: "pointer", fontSize: "0.85rem"
                  }}>
                    Retry Image Generation
                  </button>
                </div>
              ) : null}
            </div>

            {/* Menu Card */}
            <div className="menu-card">
              {/* Restaurant Header */}
              {menu.restaurantName && (
                <div className="menu-header" style={{ paddingTop: "1rem" }}>
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
                <p>Translated by <span className="gradient-text">menumenu</span></p>
              </div>
            </div>
          </div>{/* /captureRef */}
        </div>
      )}
    </main>
  );
}
