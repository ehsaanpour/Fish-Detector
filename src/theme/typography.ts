import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import * as RN from 'react-native';

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

export const resolveVazirmatnFont = (style: any) => {
  const flat = StyleSheet.flatten(style) || {};
  const fam = flat.fontFamily ? String(flat.fontFamily) : '';

  // Preserve vector icons and other third-party icon fonts completely untouched
  if (
    fam &&
    !fam.startsWith('Vazirmatn') &&
    (fam.includes('Ionicons') ||
      fam.includes('ionicons') ||
      fam.includes('Material') ||
      fam.includes('FontAwesome') ||
      fam.includes('Feather') ||
      fam.includes('Entypo') ||
      fam.includes('Octicons') ||
      fam.includes('AntDesign'))
  ) {
    return {};
  }

  // If a Vazirmatn family variant is already specified, just ensure Android fontWeight is normalized
  if (fam && fam.startsWith('Vazirmatn')) {
    return Platform.OS === 'android' ? { fontWeight: 'normal' as const } : {};
  }

  // On Web, standard font-family CSS handles weights
  if (Platform.OS === 'web') {
    return { fontFamily: 'Vazirmatn, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' };
  }

  // On Native (Android / iOS), resolve font variant by weight
  const weight = flat.fontWeight ? String(flat.fontWeight) : '400';
  let targetFont = 'Vazirmatn_400Regular';

  if (weight === 'bold' || weight === '700') {
    targetFont = 'Vazirmatn_700Bold';
  } else if (weight === '800' || weight === '900') {
    targetFont = 'Vazirmatn_800ExtraBold';
  } else if (weight === '600') {
    targetFont = 'Vazirmatn_600SemiBold';
  } else if (weight === '500') {
    targetFont = 'Vazirmatn_500Medium';
  } else if (weight === '300' || weight === '100' || weight === '200' || weight === 'light') {
    targetFont = 'Vazirmatn_300Light';
  }

  // On Android, if fontFamily is a specific weight name (like Vazirmatn_700Bold),
  // leaving fontWeight: 'bold' / '700' causes React Native Android to search for Vazirmatn_700Bold_bold
  // which does not exist and leads to fallback. Overriding fontWeight to 'normal' ensures correct rendering.
  return Platform.OS === 'android'
    ? { fontFamily: targetFont, fontWeight: 'normal' as const }
    : { fontFamily: targetFont };
};

const OriginalText = RN.Text;
const OriginalTextInput = RN.TextInput;

// Global Text Interceptor
const PatchedText = React.forwardRef<any, RN.TextProps>((props, ref) => {
  const fontOverrides = resolveVazirmatnFont(props.style);
  if (Object.keys(fontOverrides).length === 0) {
    return React.createElement(OriginalText, { ref, ...props });
  }
  return React.createElement(OriginalText, { ref, ...props, style: [props.style, fontOverrides] });
});
PatchedText.displayName = 'PatchedText';
Object.assign(PatchedText, OriginalText);

// Global TextInput Interceptor
const PatchedTextInput = React.forwardRef<any, RN.TextInputProps>((props, ref) => {
  const fontOverrides = resolveVazirmatnFont(props.style);
  if (Object.keys(fontOverrides).length === 0) {
    return React.createElement(OriginalTextInput, { ref, ...props });
  }
  return React.createElement(OriginalTextInput, { ref, ...props, style: [props.style, fontOverrides] });
});
PatchedTextInput.displayName = 'PatchedTextInput';
Object.assign(PatchedTextInput, OriginalTextInput);

// Monkeypatch react-native export getters so every component gets the patched text
try {
  Object.defineProperty(RN, 'Text', {
    configurable: true,
    enumerable: true,
    get() {
      return PatchedText;
    },
  });
  Object.defineProperty(RN, 'TextInput', {
    configurable: true,
    enumerable: true,
    get() {
      return PatchedTextInput;
    },
  });
} catch {
  (RN as any).Text = PatchedText;
  (RN as any).TextInput = PatchedTextInput;
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

