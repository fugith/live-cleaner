const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const { id } = req.query;
    if (!id) return res.send("<h1>Error: No Channel ID provided.</h1>");

    const gateWay = `https://dlhd.link/stream/stream-2.php?id=${id}`;
    
    try {
        // 1. جلب كود الصفحة بهيدرز قوية
        const response = await fetch(gateWay, {
            headers: { 
                'Referer': 'https://daddylive.sx/', 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
            }
        });
        const body = await response.text();

        // 2. استخراج رابط الـ M3U8 الحقيقي
        // استعملنا Regex مرن باش يحكم الرابط حتى لو تبدلت الفواصل
        const streamUrlMatch = body.match(/source:\s*["'](https?:\/\/.*\.m3u8.*)["']/);
        const streamUrl = streamUrlMatch ? streamUrlMatch[1] : null;

        if (!streamUrl) {
            return res.send("<h1>Stream not found or protected.</h1><p>DaddyLive changed something, General!</p>");
        }

        // 3. عرض الـ Player (Video.js) - نسخة مجهزة 
        res.setHeader('Content-Type', 'text/html');
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>General Live Player</title>
                <link href="https://vjs.zencdn.net/7.20.3/video-js.css" rel="stylesheet" />
                <style>
                    body, html { margin: 0; padding: 0; background: #000; width: 100%; height: 100%; overflow: hidden; }
                    .video-js { width: 100vw !important; height: 100vh !important; }
                </style>
            </head>
            <body>
                <video id="player" class="video-js vjs-big-play-centered" controls autoplay preload="auto">
                    <source src="${streamUrl}" type="application/x-mpegURL">
                </video>
                <script src="https://vjs.zencdn.net/7.20.3/video.min.js"></script>
                <script>
                    var player = videojs('player', {
                        html5: {
                            hls: { overrideNative: true },
                            nativeVideoTracks: false,
                            nativeAudioTracks: false,
                            nativeTextTracks: false
                        }
                    });
                    player.play();
                </script>
            </body>
            </html>
        `);
    } catch (e) {
        res.status(500).send("Error: " + e.message);
    }
};
