import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";

const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
const oldVersion = pkg.version;

const bump = process.argv[2] || "patch";
const validBumps = ["patch", "minor", "major"];
if (!validBumps.includes(bump)) {
  console.error(`Invalid bump type: ${bump}. Use: patch, minor, or major`);
  process.exit(1);
}

const parts = oldVersion.split(".").map(Number);
if (bump === "patch") parts[2]++;
else if (bump === "minor") { parts[1]++; parts[2] = 0; }
else if (bump === "major") { parts[0]++; parts[1] = 0; parts[2] = 0; }

const newVersion = parts.join(".");
pkg.version = newVersion;
writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");

console.log(`Bumping version: ${oldVersion} -> ${newVersion}`);

try {
  execSync("npx tsup", { stdio: "inherit" });
  execSync(`npm publish`, { stdio: "inherit" });
  execSync(`git add package.json`);
  execSync(`git commit -m "chore: release v${newVersion}"`);
  execSync(`git tag v${newVersion}`);
  console.log(`Released v${newVersion}`);
} catch (err) {
  console.error("Release failed:", err.message);
  pkg.version = oldVersion;
  writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
  process.exit(1);
}
