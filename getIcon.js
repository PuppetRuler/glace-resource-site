import fs from 'fs-extra';
import axios from 'axios';
import sharp from 'sharp';
import path from 'path';
import decodeIco from 'decode-ico';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- 配置 ---
const INPUT_TXT = path.join(__dirname, './url.txt'); // 输入的图标url文本文件
const OUTPUT_DIR = path.join(__dirname, './public/img/icons'); // 输出目录

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
};


/**
 * 保存图标为Webp格式
 * @param {Buffer} buffer - 图标 buffer
 * @param {string} targetPath - 输出文件路径
 * @returns {Promise<boolean>} 保存成功返回 true，否则返回 false
 */
async function saveAsWebp(buffer, targetPath) {
  try {
    let transformer;
    try {
      const icoImages = decodeIco(buffer);
      const largest = icoImages.reduce((prev, curr) => (prev.width > curr.width ? prev : curr));
      transformer = sharp(largest.data, { raw: { width: largest.width, height: largest.height, channels: 4 } });
    } catch {
      transformer = sharp(buffer);
    }

    await transformer
      .resize(128, 128, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(targetPath);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 处理单个图标url
 * @param {string} url - 图标url
 * @returns {Promise<void>} - 处理结果
 */
async function processUrl(url) {
  if (!url || !url.startsWith('http')) return;

  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const fileName = `${domain}.webp`;
    const targetPath = path.join(OUTPUT_DIR, fileName);

    console.log(`正在处理: ${domain} ...`);

    // 1. 下载图片
    const res = await axios.get(url, { responseType: 'arraybuffer', headers: HEADERS, timeout: 10000 });
    
    // 2. 转换并保存
    const success = await saveAsWebp(res.data, targetPath);

    if (success) {
      console.log(`✅ 转换成功: ${fileName}`);
    } else {
      // 如果 WebP 转换失败，保存原格式作为保底
      const ext = path.extname(urlObj.pathname) || '.png';
      const fallbackPath = path.join(OUTPUT_DIR, `${domain}${ext}`);
      await fs.writeFile(fallbackPath, res.data);
      console.warn(`⚠️ 转换失败，已保存原始格式: ${domain}${ext}`);
    }
  } catch (err) {
    console.error(`❌ 处理失败 [${url}]: ${err.message}`);
  }
}

async function main() {
  if (!fs.existsSync(INPUT_TXT)) {
    console.error('❌ 请先创建 urls.txt 并填入 URL');
    return;
  }

  await fs.ensureDir(OUTPUT_DIR);

  // 读取文本并过滤掉空行
  const urls = (await fs.readFile(INPUT_TXT, 'utf-8'))
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  console.log(`🚀 开始处理 ${urls.length} 个 URL...\n`);

  for (const url of urls) {
    await processUrl(url);
  }

  console.log('\n✨ 任务完成！图标已存入 public/img/icons');
}

main();