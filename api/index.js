const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const { id } = req.query;
    if (!id) return res.send("ID is missing");

    const targetUrl = `https://dlhd.link/stream/stream-2.php?id=${id}`;

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'Referer': 'https://daddylive.sx/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const body = await response.text();

        // محاولة استخراج الرابط بعدة طرق (لأنهم يبدلو الكود دايما)
        const regexPatterns = [
            /source:\s*["'](https?:\/\/.*\.m3u8.*)["']/,
            /file:\s*["'](https?:\/\/.*\.m3u8.*)["']/,
            /["'](https?:\/\/.*\/playlist\.m3u8.*)["']/
        ];

        let m3u8Url = null;
        for (let pattern of regexPatterns) {
            const match = body.match(pattern);
            if (match) {
                m3u8Url = match[1];
                break;
            }
        }

        if (!m3u8Url) {
            // إذا ما لقاش، يقدر يكون الرابط مخفي بـ Base64 (عفسة جديدة يديروها)
            const base64Match = body.match(/atob\(["']([^"']+)["']\)/);
            if (base64Match) {
                m3u8Url = Buffer.from(base64Match[1], 'base64').toString();
            }
        }

        if (!m3u8Url) return res.send("Stream not found. DaddyLive updated their security!");

        // بناء الـ Player النظيف
        res.setHeader('Content-Type', 'text/html');
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <link href="https://vjs.zencdn.net/7.20.3/video-js.css" rel="stylesheet" />
                <style>
                    body, html { margin: 0; padding: 0; background: #000; overflow: hidden; width: 100%; height: 100%; }
                    .vjs-big-play-centered .vjs-big-play-button { top: 50%; left: 50%; margin-left: -1.5em; margin-top: -0.75em; }
                    video { width: 100% !important; height: 100% !important; }
                </style>
            </head>
            <body>
                <video id="p" class="video-js vjs-big-play-centered" controls autoplay playsinline muted></video>
                <script src="https://vjs.zencdn.net/7.20.3/video.min.js"></script>
                <script>
                    var player = videojs('p');
                    player.src({ src: '${m3u8Url}', type: 'application/x-mpegURL' });
                    window.open = function() { return null; };
                </script>
            </body>
            </html>
        `);

    } catch (e) {
        res.status(500).send("Server Error: " + e.message);
    }
};
