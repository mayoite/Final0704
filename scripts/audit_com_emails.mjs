import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const emailPattern = "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.com\\b";

const rgArgs = [
  "-n",
  "-P",
  emailPattern,
  ".",
  "--glob",
  "!**/node_modules/**",
  "--glob",
  "!**/.git/**",
  "--glob",
  "!**/.next/**",
  "--glob",
  "!**/.open-next/**",
  "--glob",
  "!**/.tmp/**",
  "--glob",
  "!**/.vercel/**",
  "--glob",
  "!**/.wrangler/**",
  "--glob",
  "!.07docs/archive/**",
  "--glob",
  "!.07docs/Backupcad/**",
  "--glob",
  "!IMPORTANTFILES/**",
  "--glob",
  "!public/vendors/**",
  "--glob",
  "!public/smartdraw/vendor/**",
  "--glob",
  "!test-results/**",
  "--glob",
  "!**/*.woff",
  "--glob",
  "!**/*.woff2",
  "--glob",
  "!**/*.ttf",
  "--glob",
  "!**/*.otf",
  "--glob",
  "!**/*.svg",
  "--glob",
  "!**/*.png",
  "--glob",
  "!**/*.jpg",
  "--glob",
  "!**/*.jpeg",
  "--glob",
  "!**/*.gif",
  "--glob",
  "!**/*.webp",
];

try {
  const { stdout } = await execFileAsync("rg", rgArgs, {
    cwd: process.cwd(),
    maxBuffer: 10 * 1024 * 1024,
  });

  const output = stdout.trim();
  if (!output) {
    console.log("No .com email IDs found in the live repo scan.");
    process.exit(0);
  }

  console.log(output);
  process.exit(1);
} catch (error) {
  if (error.code === 1) {
    const output = error.stdout?.trim();
    if (output) {
      console.log(output);
      process.exit(1);
    }
    console.log("No .com email IDs found in the live repo scan.");
    process.exit(0);
  }

  console.error(error?.stderr || error?.message || String(error));
  process.exit(1);
}
