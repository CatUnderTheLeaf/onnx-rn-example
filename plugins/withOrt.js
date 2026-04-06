const {
  withAppBuildGradle,
  withMainApplication,
  createRunOncePlugin,
} = require("expo/config-plugins");

/**
 * Adds onnxruntime-react-native native dependencies and package registration
 */
const withOrt = (config) => {
  // --- Add Gradle deps ---
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let contents = config.modResults.contents;

      // Add implementation lines if not already present
      if (!contents.includes("onnxruntime-react-native")) {
        contents = contents.replace(
          /dependencies\s*{/,
          `dependencies {
    implementation project(':onnxruntime-react-native')`,
        );
      }

      config.modResults.contents = contents;
    }
    return config;
  });

  // --- Add package import & registration ---
  config = withMainApplication(config, (config) => {
    const { modResults } = config;

    if (modResults.language === "java" || modResults.language === "kt") {
      // Ensure import
      if (
        !modResults.contents.includes(
          "ai.onnxruntime.reactnative.OnnxruntimePackage",
        )
      ) {
        modResults.contents = modResults.contents.replace(
          /import com.facebook.react.PackageList/,
          `import com.facebook.react.PackageList
import ai.onnxruntime.reactnative.OnnxruntimePackage`,
        );
      }

      // Ensure registration
      if (!modResults.contents.includes("OnnxruntimePackage()")) {
        modResults.contents = modResults.contents.replace(
          /(PackageList\(this\)\.packages\.apply\s*{)/,
          `$1\n      add(OnnxruntimePackage())`,
        );
      }
    }

    return config;
  });

  return config;
};

module.exports = createRunOncePlugin(withOrt, "withOrt", "1.0.0");
