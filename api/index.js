const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const { id } = req.query;
    if (!id) return res.send("ID missing");

    const targetUrl = `https://dlhd.link/stream/stream-2.php?id=${id}`;

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'Referer': 'https://daddylive.sx/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const body = await response.text();

        // 1. استخراج الـ M3U8 حتى لو كان داخل eval أو مقسم
        // هاد الـ Regex يحوس على أي رابط ينتهي بـ m3u8 وسط الكود
        const m3u8Regex = /(https?:\/\/[^"']+\.m3u8[^"']*)/g;
        const matches = body.match(m3u8Regex);
        let m3u8Url = matches ? matches[0] : null;

        if (!m3u8Url) return res.send("Stream not found. DaddyLive security is high.");

        // 2. بناء الصفحة "المعقمة" (بلا خماج بلا إعلانات)
        res.setHeader('Content-Type', 'text/html');
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <link href="https://vjs.zencdn.net/7.20.3/video-js.css" rel="stylesheet" />
                <style>
                    body, html { margin: 0; padding: 0; background: #000; height: 100%; overflow: hidden; }
                    .video-js { width: 100vw !important; height: 100vh !important; }
                    /* حذف أي زر براني يخرج */
                    .vjs-error-display { display: none !important; }
                </style>
            </head>
            <body>
                <video id="p" class="video-js vjs-big-play-centered" controls playsinline muted></video>
                <script src="https://vjs.zencdn.net/7.20.3/video.min.js"></script>
                <script>
                    var player = videojs('p', {
                        autoplay: true,
                        preload: 'auto',
                        fluid: true,
                        html5: { hls: { overrideNative: true } }
                    });
                    player.src({ src: '${m3u8Url}', type: 'application/x-mpegURL' });
                    
                    // قتل أي محاولة لفتح نافذة إعلانية
                    window.open = function() { return null; };
                    document.onclick = function() { return true; }; 
                </script>
            </body>
            </html>
        `);
    } catch (e) {
        res.status(500).send("Error: " + e.message);
    }
};
