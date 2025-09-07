#!/usr/bin/env node
// Deletes S3 keys provided via a file (one per line). Use with care.

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { spawnSync } = require("child_process");

const BUCKET = process.env.MEDIA_BUCKET || "apple-cottage-media-eu";
const PROFILE = process.env.AWS_PROFILE || "smustafa";
const REGION = process.env.AWS_REGION || "eu-west-1";
const LIST_FILE =
  process.argv[2] || path.join(__dirname, "s3_cleanup_suggestions.txt");

if (!fs.existsSync(LIST_FILE)) {
  console.error("List file not found:", LIST_FILE);
  process.exit(2);
}

const keys = fs
  .readFileSync(LIST_FILE, "utf8")
  .split(/\r?\n/)
  .filter((k) => k && !k.startsWith("#"));
console.log(`[delete] ${keys.length} keys to delete from s3://${BUCKET}`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.question("Proceed with deletion? type YES to confirm: ", (ans) => {
  rl.close();
  if (ans !== "YES") {
    console.log("Abort.");
    process.exit(0);
  }
  for (const key of keys) {
    const res = spawnSync(
      "aws",
      [
        "s3api",
        "delete-object",
        "--bucket",
        BUCKET,
        "--key",
        key,
        "--profile",
        PROFILE,
        "--region",
        REGION,
      ],
      { encoding: "utf8" }
    );
    if (res.status !== 0) {
      console.error("[error]", key, (res.stderr || res.stdout || "").trim());
    } else {
      console.log("[deleted]", key);
    }
  }
});
