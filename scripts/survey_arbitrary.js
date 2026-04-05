import fs from 'fs/promises';
import path from 'path';

async function walk(dir, fileList = []) {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const stat = await fs.stat(path.join(dir, file));
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        fileList = await walk(path.join(dir, file), fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

async function run() {
  const files = await walk('./src');
  const arbitraryStats = {};
  const rawColorStats = {};

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const matches = content.match(/className=(?:["']|{`|{`)(.*?)(?:["']|`}|`})/g);
    if (!matches) continue;
    
    for (const match of matches) {
      const clsString = match.replace(/className=["'{`]+/, '').replace(/["'`}]+$/, '');
      const clsList = clsString.split(/\s+/);
      for (let cls of clsList) {
        if (cls.includes('-[')) {
          // It's an arbitrary class
          arbitraryStats[cls] = (arbitraryStats[cls] || 0) + 1;
        } else if (/\-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)\-[0-9]+(\/[0-9]+)?/.test(cls)) {
          // Standard raw palette color
          rawColorStats[cls] = (rawColorStats[cls] || 0) + 1;
        }
      }
    }
  }

  console.log("— ARBITRARY CLASSES —");
  const sortedArb = Object.entries(arbitraryStats).sort((a,b) => b[1] - a[1]);
  sortedArb.slice(0, 30).forEach(([k, v]) => console.log(`${v}x: ${k}`));

  console.log("\n— RAW COLORS —");
  const sortedColor = Object.entries(rawColorStats).sort((a,b) => b[1] - a[1]);
  sortedColor.slice(0, 30).forEach(([k, v]) => console.log(`${v}x: ${k}`));
}

run().catch(console.error);
