export default function PrivacyPolicy() {
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
        Privacy Policy
      </h1>
      <p style={{ color: "#666", marginBottom: 32 }}>
        Last updated: March 1, 2026
      </p>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Overview
        </h2>
        <p>
          Nomameshi (&quot;the App&quot;) is a menu translation tool that uses AI
          to analyze restaurant menu photos. We are committed to protecting your
          privacy. This policy explains what data we handle and how.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Data We Collect
        </h2>
        <p>
          <strong>We do not collect any personal information.</strong> The App
          does not require an account, login, or registration of any kind.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Menu Photos
        </h2>
        <p>
          When you take or select a photo of a menu, the image is sent directly
          to Google&apos;s Gemini API for analysis. The image is processed in
          real-time and is <strong>not stored</strong> on our servers or any
          third-party server. We do not retain, log, or archive your photos.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Third-Party Services
        </h2>
        <p>
          The App uses Google&apos;s Gemini API to analyze menu images and
          generate food visuals. Please refer to{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#E85A4F" }}
          >
            Google&apos;s Privacy Policy
          </a>{" "}
          for details on how Google processes data sent to their API.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Camera & Photo Library
        </h2>
        <p>
          The App requests access to your camera and photo library solely to
          capture or select menu images for translation. These permissions are
          used only when you actively choose to take a photo or select an image.
          No photos are accessed in the background.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Analytics & Tracking
        </h2>
        <p>
          The App does not include any analytics SDK, tracking pixels, or
          advertising frameworks. We do not track your usage or behavior.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Data Storage
        </h2>
        <p>
          All translation results are stored only in your device&apos;s memory
          during the current session. When you close the App, the data is
          discarded. Nothing is persisted on-device or remotely.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Children&apos;s Privacy
        </h2>
        <p>
          The App does not knowingly collect any information from children under
          13. Since we collect no personal data from any user, the App is safe
          for all ages.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Changes to This Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time. Any changes will
          be posted on this page with an updated revision date.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Contact
        </h2>
        <p>
          If you have questions about this Privacy Policy, please contact us
          via our{" "}
          <a href="/support" style={{ color: "#E85A4F" }}>
            Support page
          </a>{" "}
          or email{" "}
          <a href="mailto:h.kodera@gmail.com" style={{ color: "#E85A4F" }}>
            h.kodera@gmail.com
          </a>
          .
        </p>
      </section>
    </main>
  );
}
