import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.delax.nomameshi",
  appName: "Nomameshi",
  webDir: "out",
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    backgroundColor: "#FCFBF9",
    scheme: "Nomameshi",
  },
  plugins: {
    Camera: {
      promptLabelHeader: "Menu Photo",
      promptLabelPhoto: "Choose from Gallery",
      promptLabelPicture: "Take Photo",
    },
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#FCFBF9",
      showSpinner: false,
    },
  },
  server: {
    url: "https://menumenu-three.vercel.app",
    iosScheme: "capacitor",
  },
};

export default config;
