const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const { id } = req.query;
    if (!id) return res.send("ID missing");

    const target = `https://dlhd.link/stream/stream-2.php?id=${id}`;

    try {
        const response = await fetch(target, {
            headers: { 'Referer': 'https://daddylive.sx/', 'User-Agent': 'Mozilla/5.0' }
        });
        let html = await response.text();

        // 1. حذف قاع الـ Scripts (باش حتى إعلان ما يقلع)
        html = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '');

        // 2. سحب رابط الـ m3u8 الحقيقي من الكود
        const m3u8Match = html.match(/source:\s*["'](https?:\/\/.*\.m3u8.*)["']/);
        const m3u8Url = m3u8Match ? m3u8Match[1] : null;

        if (!m3u8Url) return res.send("Stream Link not found.");

        // 3. بناء صفحة جديدة 100% نظيفة (ما فيها حتى كود من عندهم)
        res.setHeader('Content-Type', 'text/html');
        res.send(`
            <!DOCTYPE html>
            <html lang="ar">
            <head>
                <link href="https://vjs.zencdn.net/7.20.3/video-js.css" rel="stylesheet" />
                <style>
                    body, html { margin: 0; padding: 0; background: #000; overflow: hidden; }
                    .video-js { width: 100vw !important; height: 100vh !important; }
                </style>
            </head>
            <body>
                <video id="clean-player" class="video-js vjs-big-play-centered" controls autoplay></video>
                <script src="https://vjs.zencdn.net/7.20.3/video.min.js"></script>
                <script>
                    var player = videojs('clean-player');
                    player.src({ src: '${m3u8Url}', type: 'application/x-mpegURL' });
                    // منع أي محاولة لفتح popups من الـ Browser
                    window.open = function() { return null; };
                </script>
            </body>
            </html>
        `);
    } catch (e) {
        res.send("Error: " + e.message);
    }
};
