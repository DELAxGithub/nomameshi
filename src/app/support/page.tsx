import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support | Nomameshi",
  description:
    "Get help with Nomameshi - FAQ, contact information, and feedback.",
};

export default function Support() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "48px 24px",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        color: "#1E2432",
        lineHeight: 1.7,
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        Support / サポート
      </h1>
      <p style={{ color: "#666", marginBottom: 32 }}>Nomameshi</p>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          About / アプリについて
        </h2>
        <p>
          Nomameshi is an AI-powered menu translation app. Take a photo of a
          restaurant menu in any language, and get instant translations with
          beautiful food visuals.
        </p>
        <p style={{ marginTop: 8 }}>
          Nomameshiは、AIを活用したメニュー翻訳アプリです。外国語のレストランメニューを撮影するだけで、翻訳と料理のビジュアルを即座に表示します。
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
          FAQ / よくある質問
        </h2>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            What does Nomameshi do? / Nomameshiは何ができますか？
          </h3>
          <p>
            Take a photo of a foreign-language restaurant menu, and Nomameshi
            will translate it using AI. It also generates a visual image of the
            dishes to help you imagine what you&apos;re ordering.
          </p>
          <p style={{ marginTop: 4 }}>
            外国語のレストランメニューを撮影すると、AIが翻訳します。さらに料理のビジュアル画像を生成し、どんな料理か想像しやすくなります。
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            What languages are supported? / 対応言語は？
          </h3>
          <p>
            Nomameshi can translate menus from any language into Japanese or
            English. It is especially optimized for menus from Japan, Spain,
            Italy, France, the US, Korea, Thailand, and Taiwan.
          </p>
          <p style={{ marginTop: 4 }}>
            あらゆる言語のメニューを日本語・英語に翻訳できます。日本、スペイン、イタリア、フランス、アメリカ、韓国、タイ、台湾のメニューに特に最適化されています。
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            What kind of photos work best? / どんな写真が最適ですか？
          </h3>
          <p>
            Clear, well-lit photos of printed menus work best. Make sure the
            entire menu section is visible in the frame. Avoid blurry, dark, or
            handwritten menus.
          </p>
          <p style={{ marginTop: 4 }}>
            印刷されたメニューの鮮明で明るい写真が最適です。メニュー全体がフレームに収まるようにしてください。ぼやけた写真、暗い写真、手書きメニューは精度が下がる場合があります。
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            Is my data stored? / データは保存されますか？
          </h3>
          <p>
            No. Menu images are sent to Google&apos;s Gemini API for real-time
            analysis and are not stored on any server. No personal data is
            collected. See our{" "}
            <a href="/privacy" style={{ color: "#E85A4F" }}>
              Privacy Policy
            </a>{" "}
            for details.
          </p>
          <p style={{ marginTop: 4 }}>
            いいえ。メニュー画像はGoogle Gemini
            APIに送信されリアルタイムで分析されますが、サーバーには保存されません。個人情報の収集もありません。詳しくは
            <a href="/privacy" style={{ color: "#E85A4F" }}>
              プライバシーポリシー
            </a>
            をご覧ください。
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            Do I need an account? / アカウントは必要ですか？
          </h3>
          <p>No account, login, or registration is required.</p>
          <p style={{ marginTop: 4 }}>
            アカウント登録やログインは不要です。すぐにご利用いただけます。
          </p>
        </div>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Contact / お問い合わせ
        </h2>
        <p>
          If you have questions, issues, or feedback, please contact us at:
        </p>
        <p style={{ marginTop: 4 }}>
          ご質問、不具合のご報告、ご要望は以下までお問い合わせください：
        </p>
        <p style={{ marginTop: 8 }}>
          <a href="mailto:h.kodera@gmail.com" style={{ color: "#E85A4F" }}>
            h.kodera@gmail.com
          </a>
        </p>
        <p style={{ color: "#666", marginTop: 8, fontSize: 14 }}>
          We typically respond within a few business days. /
          通常、数営業日以内にご返信いたします。
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Feedback / フィードバック
        </h2>
        <p>
          We appreciate your feedback! You can reach us via email above, or
          leave a review on the App Store. Your input helps us improve
          Nomameshi.
        </p>
        <p style={{ marginTop: 4 }}>
          フィードバックをお待ちしています！上記メールまたはApp
          Storeのレビューからお声をお聞かせください。
        </p>
      </section>
    </main>
  );
}
