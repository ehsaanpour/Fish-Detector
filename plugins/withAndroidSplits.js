const { withAppBuildGradle } = require('@expo/config-plugins');

function withAndroidSplits(config) {
  return withAppBuildGradle(config, (modConfig) => {
    if (modConfig.modResults.language === 'groovy') {
      const splitsBlock = `
    splits {
        abi {
            reset()
            enable true
            universalApk true
            include "armeabi-v7a", "arm64-v8a", "x86_64"
        }
    }
`;
      let content = modConfig.modResults.contents;
      if (!content.includes('universalApk true')) {
        // Insert right after 'android {'
        content = content.replace(/android\s*\{/, `android {${splitsBlock}`);
        modConfig.modResults.contents = content;
      }
    }
    return modConfig;
  });
}

module.exports = withAndroidSplits;
