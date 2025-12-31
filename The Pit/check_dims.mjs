import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";





function getPngDimensions(filePath) {
  try {
    const fd = fs.openSync(filePath, "r");
    const header = Buffer.alloc(24);
    fs.readSync(fd, header, 0, 24, 0);
    fs.closeSync(fd);

    
    
    
    
    
    
    
    
    

    const width = header.readUInt32BE(16);
    const height = header.readUInt32BE(20);
    return { width, height };
  } catch (e) {
    return null;
  }
}

const assetsDir =
  "c:/Users/muham/College/Cedar Codes/5. Campfire Game Jam (Feb-2026)/Pit/public/assets";
const raiders = ["City_men_1"];

raiders.forEach((raider) => {
  console.log(`Checking ${raider}:`);
  const raiderPath = path.join(assetsDir, raider);
  if (fs.existsSync(raiderPath)) {
    const files = fs.readdirSync(raiderPath);
    files.forEach((file) => {
      if (file.endsWith(".png")) {
        const dims = getPngDimensions(path.join(raiderPath, file));
        console.log(`  ${file}: ${dims?.width}x${dims?.height}`);
      }
    });
  }
});
