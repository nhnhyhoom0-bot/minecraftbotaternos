import fs from 'fs';
import path from 'path';

export function applyAllPatches() {
  try {
    // 1. Bedrock pure-JS raknet patch
    const createClientPath = path.resolve('node_modules/bedrock-protocol/src/createClient.js');
    if (fs.existsSync(createClientPath)) {
      let code = fs.readFileSync(createClientPath, 'utf8');
      if (code.includes("('raknet-native')")) {
        code = code.replace("('raknet-native')", "('jsp-raknet')");
        fs.writeFileSync(createClientPath, code);
      }
    }

    const optionsPath = path.resolve('node_modules/bedrock-protocol/src/options.js');
    if (fs.existsSync(optionsPath)) {
      let optCode = fs.readFileSync(optionsPath, 'utf8');
      if (optCode.includes("raknetBackend: 'raknet-native'")) {
        optCode = optCode.replace("raknetBackend: 'raknet-native'", "raknetBackend: 'jsp-raknet'");
        fs.writeFileSync(optionsPath, optCode);
      }
    }

    // 2. Minecraft PC 26.2 (protocol 776) support patch
    const mcDataDir = path.resolve('node_modules/minecraft-data');
    if (fs.existsSync(mcDataDir)) {
      const versionsToAdd = [
        { version: '26.2', protocol: 776 },
        { version: '26.2.0', protocol: 776 },
        { version: '1.26.2', protocol: 776 },
      ];

      for (const v of versionsToAdd) {
        const vDir = path.join(mcDataDir, `minecraft-data/data/pc/${v.version}`);
        if (!fs.existsSync(vDir)) {
          fs.mkdirSync(vDir, { recursive: true });
        }
        fs.writeFileSync(
          path.join(vDir, 'version.json'),
          JSON.stringify(
            {
              version: v.protocol,
              minecraftVersion: v.version,
              majorVersion: '26.2',
              releaseType: 'release',
            },
            null,
            2
          )
        );
      }

      // Add to dataPaths.json
      const dataPathsFile = path.join(mcDataDir, 'minecraft-data/data/dataPaths.json');
      if (fs.existsSync(dataPathsFile)) {
        const dataPaths = JSON.parse(fs.readFileSync(dataPathsFile, 'utf8'));
        if (dataPaths.pc && dataPaths.pc['26.1']) {
          for (const v of versionsToAdd) {
            if (!dataPaths.pc[v.version]) {
              dataPaths.pc[v.version] = { ...dataPaths.pc['26.1'], version: `pc/${v.version}` };
            }
          }
          fs.writeFileSync(dataPathsFile, JSON.stringify(dataPaths, null, 2));
        }
      }

      // Add to versions.json
      const versionsFile = path.join(mcDataDir, 'minecraft-data/data/pc/common/versions.json');
      if (fs.existsSync(versionsFile)) {
        const versions = JSON.parse(fs.readFileSync(versionsFile, 'utf8'));
        let changed = false;
        for (const v of versionsToAdd) {
          if (!versions.includes(v.version)) {
            versions.push(v.version);
            changed = true;
          }
        }
        if (changed) {
          fs.writeFileSync(versionsFile, JSON.stringify(versions, null, 2));
        }
      }

      // Update data.js
      const dataJsFile = path.join(mcDataDir, 'data.js');
      if (fs.existsSync(dataJsFile)) {
        let dataJs = fs.readFileSync(dataJsFile, 'utf8');
        if (!dataJs.includes("'26.2': {")) {
          const snippet = `    '26.2': {
      get attributes () { return require("./minecraft-data/data/pc/26.1/attributes.json") },
      get blockCollisionShapes () { return require("./minecraft-data/data/pc/26.1/blockCollisionShapes.json") },
      get blocks () { return require("./minecraft-data/data/pc/26.1/blocks.json") },
      get blockLoot () { return require("./minecraft-data/data/pc/1.20/blockLoot.json") },
      get biomes () { return require("./minecraft-data/data/pc/26.1/biomes.json") },
      get commands () { return require("./minecraft-data/data/pc/1.20.3/commands.json") },
      get effects () { return require("./minecraft-data/data/pc/26.1/effects.json") },
      get enchantments () { return require("./minecraft-data/data/pc/26.1/enchantments.json") },
      get entities () { return require("./minecraft-data/data/pc/26.1/entities.json") },
      get entityLoot () { return require("./minecraft-data/data/pc/1.20/entityLoot.json") },
      get foods () { return require("./minecraft-data/data/pc/26.1/foods.json") },
      get instruments () { return require("./minecraft-data/data/pc/26.1/instruments.json") },
      get items () { return require("./minecraft-data/data/pc/26.1/items.json") },
      get language () { return require("./minecraft-data/data/pc/26.1/language.json") },
      get loginPacket () { return require("./minecraft-data/data/pc/26.1/loginPacket.json") },
      get mapIcons () { return require("./minecraft-data/data/pc/1.20.2/mapIcons.json") },
      get materials () { return require("./minecraft-data/data/pc/26.1/materials.json") },
      get particles () { return require("./minecraft-data/data/pc/26.1/particles.json") },
      get protocol () { return require("./minecraft-data/data/pc/26.1/protocol.json") },
      get recipes () { return require("./minecraft-data/data/pc/26.1/recipes.json") },
      get sounds () { return require("./minecraft-data/data/pc/26.1/sounds.json") },
      get tints () { return require("./minecraft-data/data/pc/26.1/tints.json") },
      get version () { return require("./minecraft-data/data/pc/26.2/version.json") },
      get windows () { return require("./minecraft-data/data/pc/1.16.1/windows.json") },
      proto: __dirname + '/minecraft-data/data/pc/latest/proto.yml'
    },\n`;
          dataJs = dataJs.replace("'26.1': {", snippet + "    '26.1': {");
          fs.writeFileSync(dataJsFile, dataJs);
        }
      }
    }

    // 3. Mineflayer testedVersions
    const mineflayerVersionFile = path.resolve('node_modules/mineflayer/lib/version.js');
    if (fs.existsSync(mineflayerVersionFile)) {
      let code = fs.readFileSync(mineflayerVersionFile, 'utf8');
      if (!code.includes("'26.2'")) {
        code = code.replace("'26.1'", "'26.1', '26.2'");
        fs.writeFileSync(mineflayerVersionFile, code);
      }
    }

    // 4. Prismarine-chunk
    const prismarineChunkFile = path.resolve('node_modules/prismarine-chunk/src/index.js');
    if (fs.existsSync(prismarineChunkFile)) {
      let code = fs.readFileSync(prismarineChunkFile, 'utf8');
      if (!code.includes("'26.2':") && !code.includes("26.2:")) {
        code = code.replace(
          "26.1: require('./pc/1.18/chunk')",
          "26.1: require('./pc/1.18/chunk'),\n    '26.2': require('./pc/1.18/chunk')"
        );
        fs.writeFileSync(prismarineChunkFile, code);
      }
    }

    // 5. Prismarine-physics
    const physicsFeaturesFile = path.resolve('node_modules/prismarine-physics/lib/features.json');
    if (fs.existsSync(physicsFeaturesFile)) {
      let code = fs.readFileSync(physicsFeaturesFile, 'utf8');
      if (!code.includes('"26.2"')) {
        code = code.replace(/"26\.1"/g, '"26.1", "26.2"');
        fs.writeFileSync(physicsFeaturesFile, code);
      }
    }
  } catch (err: any) {
    console.warn('[patches] Warning applying runtime patches:', err?.message);
  }
}

// Automatically apply on import
applyAllPatches();
