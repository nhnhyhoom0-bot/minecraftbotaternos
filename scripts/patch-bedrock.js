import fs from 'fs';
import path from 'path';

try {
  const createClientPath = path.resolve('node_modules/bedrock-protocol/src/createClient.js');
  if (fs.existsSync(createClientPath)) {
    let code = fs.readFileSync(createClientPath, 'utf8');
    if (code.includes("('raknet-native')")) {
      code = code.replace("('raknet-native')", "('jsp-raknet')");
      fs.writeFileSync(createClientPath, code);
      console.log('[patch-bedrock] Updated createClient.js to use jsp-raknet (pure JavaScript)');
    }
  }

  const optionsPath = path.resolve('node_modules/bedrock-protocol/src/options.js');
  if (fs.existsSync(optionsPath)) {
    let optCode = fs.readFileSync(optionsPath, 'utf8');
    if (optCode.includes("raknetBackend: 'raknet-native'")) {
      optCode = optCode.replace("raknetBackend: 'raknet-native'", "raknetBackend: 'jsp-raknet'");
      fs.writeFileSync(optionsPath, optCode);
      console.log('[patch-bedrock] Updated options.js default backend to jsp-raknet');
    }
  }
} catch (e) {
  console.warn('[patch-bedrock] Notice:', e.message);
}
