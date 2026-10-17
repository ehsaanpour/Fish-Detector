import { Platform, Text, TextInput } from 'react-native';

// On Web, inject the Google Fonts link and global font-family rule immediately
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const styleId = 'vazirmatn-global-font';
  if (!document.getElementById(styleId)) {
    // 1. Google Fonts preconnect & stylesheet
    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect1);

    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect2);

    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap';
    document.head.appendChild(fontLink);

    // 2. Global CSS font configuration for crisp Persian typography + Ionicons web support
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap');

      @font-face {
        font-family: 'Ionicons';
        src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.2/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
        font-display: block;
      }

      @font-face {
        font-family: 'ionicons';
        src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.2/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
        font-display: block;
      }

      /* 1. Global typography: All text across the UI uses Vazirmatn */
      *, *::before, *::after {
        font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      html, body, #root, [class*="css-text"], div, span, p, h1, h2, h3, h4, h5, h6, input, textarea, select, button {
        font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* 2. Exception: Vector icon glyphs ALWAYS use Ionicons font */
      [style*="ionicons" i],
      [style*="Ionicons" i],
      [class*="css-text"][style*="ionicons" i],
      [class*="css-text"][style*="Ionicons" i],
      [class*="fontFamily-ionicons" i],
      [class*="fontFamily-Ionicons" i],
      .r-fontFamily-b91m1e {
        font-family: 'Ionicons', 'ionicons' !important;
      }
    `;
    document.head.appendChild(style);
  }
}

// Set default font for React Native Text components across all platforms
const defaultFontFamily = Platform.select({
  web: 'Vazirmatn, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  android: 'Vazirmatn_400Regular',
  ios: 'Vazirmatn_400Regular',
  default: 'Vazirmatn',
});

try {
  const customTextProps = (Text as any).defaultProps || {};
  (Text as any).defaultProps = {
    ...customTextProps,
    style: [{ fontFamily: defaultFontFamily }, customTextProps.style],
  };

  const customTextInputProps = (TextInput as any).defaultProps || {};
  (TextInput as any).defaultProps = {
    ...customTextInputProps,
    style: [{ fontFamily: defaultFontFamily }, customTextInputProps.style],
  };
} catch {
  // Ignore in environments where defaultProps is frozen
}

export const typography = {
  fontFamily: defaultFontFamily,
  regular: Platform.select({
    web: 'Vazirmatn',
    default: 'Vazirmatn_400Regular',
  }),
  medium: Platform.select({
    web: 'Vazirmatn',
    default: 'Vazirmatn_500Medium',
  }),
  semiBold: Platform.select({
    web: 'Vazirmatn',
    default: 'Vazirmatn_600SemiBold',
  }),
  bold: Platform.select({
    web: 'Vazirmatn',
    default: 'Vazirmatn_700Bold',
  }),
  extraBold: Platform.select({
    web: 'Vazirmatn',
    default: 'Vazirmatn_800ExtraBold',
  }),
};

