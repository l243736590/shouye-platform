const fs = require("fs");
const path = require("path");

const settingsPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "@react-native",
  "gradle-plugin",
  "settings.gradle.kts"
);

if (!fs.existsSync(settingsPath)) {
  console.warn("[postinstall] React Native Gradle plugin settings file not found.");
  process.exit(0);
}

const source = fs.readFileSync(settingsPath, "utf8");
const patched = source.replace(
  'id("org.gradle.toolchains.foojay-resolver-convention").version("0.5.0")',
  'id("org.gradle.toolchains.foojay-resolver-convention").version("1.0.0")'
);

if (patched !== source) {
  fs.writeFileSync(settingsPath, patched);
  console.log("[postinstall] Patched React Native Gradle Foojay resolver to 1.0.0.");
} else {
  console.log("[postinstall] React Native Gradle Foojay resolver patch already applied.");
}
