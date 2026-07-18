#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// Exports animations/mundial.html → animations/mundial-export.mp4
// Requires: Playwright (global), FFmpeg
// Usage:    node capture-mundial.js
// ─────────────────────────────────────────────────────────────

const { chromium } = require('/opt/homebrew/lib/node_modules/playwright');
const { spawnSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

const PROJECT  = path.resolve(__dirname);
const HTML     = path.join(PROJECT, 'animations', 'mundial.html');
const FRAMES   = '/tmp/mundial-frames';
const OUTPUT   = path.join(PROJECT, 'animations', 'mundial-export.mp4');

const FPS      = 30;
const DURATION = 15;                  // seconds
const N_FRAMES = FPS * DURATION;      // 450
const W = 1080, H = 1920;

async function main() {
    // ── 1. Prepare temp frames dir ──────────────────────────
    if (fs.existsSync(FRAMES)) fs.rmSync(FRAMES, { recursive: true });
    fs.mkdirSync(FRAMES, { recursive: true });

    // ── 2. Launch Chromium ──────────────────────────────────
    console.log('Launching Chromium…');
    const browser = await chromium.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--autoplay-policy=no-user-gesture-required',
            '--disable-web-security',       // allow file:// local font loading
            '--allow-file-access-from-files',
        ],
    });

    const context = await browser.newContext({
        viewport: { width: W, height: H },
    });
    const page = await context.newPage();

    // Silence failed resource loads (missing .mov, etc.)
    page.on('pageerror', () => {});
    page.on('requestfailed', () => {});

    // ── 3. Load the template ────────────────────────────────
    console.log('Loading template…');
    await page.goto(`file://${HTML}`, { waitUntil: 'domcontentloaded' });

    // Wait for fonts + SVGs to finish loading
    await page.waitForTimeout(1200);

    // ── 4. Disable viewport scaling, fill exactly 1080×1920 ─
    await page.evaluate(({ w, h }) => {
        // Kill the resize-based scaling script
        window.removeEventListener('resize', window.scaleCard);

        const card    = document.querySelector('.card');
        const wrapper = document.querySelector('.card-wrapper');

        card.style.transform = 'none';
        card.style.transformOrigin = 'unset';
        wrapper.style.width  = `${w}px`;
        wrapper.style.height = `${h}px`;

        // Body should have no padding so card sits flush
        document.body.style.padding = '0';
        document.body.style.margin  = '0';
        document.body.style.overflow = 'hidden';
    }, { w: W, h: H });

    // ── 5. Pause every CSS animation ────────────────────────
    await page.evaluate(() => {
        document.getAnimations().forEach(a => a.pause());
    });

    await page.waitForTimeout(100);

    // ── 6. Capture frames ───────────────────────────────────
    console.log(`Rendering ${N_FRAMES} frames at ${FPS} fps (${DURATION}s)…\n`);

    for (let i = 0; i < N_FRAMES; i++) {
        const tMs = (i / FPS) * 1000;

        // Seek all animations to this exact timestamp
        await page.evaluate(t => {
            document.getAnimations().forEach(a => { a.currentTime = t; });
        }, tMs);

        await page.screenshot({
            path: path.join(FRAMES, `f${String(i).padStart(5, '0')}.png`),
        });

        if (i % FPS === 0) {
            const pct = Math.round((i / N_FRAMES) * 100);
            process.stdout.write(`  ${String(i / FPS).padStart(2)}s / ${DURATION}s  [${pct}%]\r`);
        }
    }

    process.stdout.write(`  ${DURATION}s / ${DURATION}s  [100%]\n\n`);
    await browser.close();

    // ── 7. Encode MP4 with FFmpeg ────────────────────────────
    console.log('Encoding MP4…');
    const ff = spawnSync('ffmpeg', [
        '-y',
        '-framerate', String(FPS),
        '-i',         `${FRAMES}/f%05d.png`,
        '-c:v',       'libx264',
        '-preset',    'slow',
        '-crf',       '18',
        '-pix_fmt',   'yuv420p',
        '-vf',        `scale=${W}:${H}`,
        OUTPUT,
    ], { stdio: 'inherit' });

    if (ff.status !== 0) throw new Error('FFmpeg exited with code ' + ff.status);

    // ── 8. Cleanup ───────────────────────────────────────────
    fs.rmSync(FRAMES, { recursive: true });

    const sizeMB = (fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(1);
    console.log(`\n✓  ${OUTPUT}  (${sizeMB} MB)`);
}

main().catch(err => {
    console.error('\n✗  Error:', err.message);
    process.exit(1);
});
