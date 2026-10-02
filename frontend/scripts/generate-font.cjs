/**
 * Скрипт генерации Base64-шрифта для jsPDF (поддержка кириллицы).
 * Запуск: node scripts/generate-font.cjs
 */
const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

function download(url, onSuccess, onError) {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            return download(res.headers.location, onSuccess, onError);
        }
        if (res.statusCode !== 200) {
            return onError(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => onSuccess(Buffer.concat(chunks)));
        res.on('error', onError);
    }).on('error', onError);
}

// Список источников (первый рабочий — победитель)
const FONT_URLS = [
    // Roboto variable font (поддерживает кириллицу, wght axis)
    'https://github.com/google/fonts/raw/main/ofl/roboto/Roboto%5Bwdth%2Cwght%5D.ttf',
    // fontsource CDN (статические файлы)
    'https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.1.1/files/roboto-cyrillic-400-normal.woff2',
    // Google Fonts Direct (latin-ext, хорошо совместим с jsPDF)
    'https://fonts.gstatic.com/s/roboto/v47/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
];

const OUT_DIR  = path.join(__dirname, '..', 'src', 'fonts');
const OUT_FILE = path.join(OUT_DIR, 'Roboto-Regular.ts');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function trySource(idx) {
    if (idx >= FONT_URLS.length) {
        console.error('❌ All font sources failed. Check your internet connection.');
        process.exit(1);
    }
    const url = FONT_URLS[idx];
    console.log(`⬇  [${idx + 1}/${FONT_URLS.length}] Trying: ${url}`);

    download(url,
        (buffer) => {
            if (buffer.length < 10000) {
                console.warn(`   ⚠ Buffer too small (${buffer.length} bytes), trying next...`);
                return trySource(idx + 1);
            }
            const base64 = buffer.toString('base64');
            const content = [
                '// ─────────────────────────────────────────────────────────',
                '// Auto-generated: Roboto Regular font for jsPDF Cyrillic support',
                `// Source : ${url}`,
                `// Size   : ${buffer.length} bytes (${Math.round(base64.length / 1024)} KB base64)`,
                '// ─────────────────────────────────────────────────────────',
                `export const RobotoRegularBase64 = '${base64}';`,
                '',
            ].join('\n');

            fs.writeFileSync(OUT_FILE, content, 'utf8');
            console.log(`✅ Success! Written ${Math.round(base64.length / 1024)} KB → ${OUT_FILE}`);
        },
        (err) => {
            console.warn(`   ⚠ Failed: ${err.message}, trying next...`);
            trySource(idx + 1);
        }
    );
}

trySource(0);
