const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).send("No ID");

    // الرابط السري لي يستعملو السكريبت لي عطيتولي
    const target = `https://dlhd.link/stream/stream-2.php?id=${id}`;

    try {
        const response = await fetch(target, {
            headers: {
                'Referer': 'https://daddylive.sx/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            }
        });

        const html = await response.text();
        
        // استخراج الرابط باستعمال الطريقة لي في الـ Repo
        const m3u8Match = html.match(/source:\s*["'](https?:\/\/.*\.m3u8.*)["']/);
        
        if (!m3u8Match) return res.send("Stream Not Found. Check ID.");

        const streamUrl = m3u8Match[1];

        // هنا السحر: نبعثو Player نظيف ونمررو الـ Referer عبر المتصفح
        res.setHeader('Content-Type', 'text/html');
        res.send(`
            <html>
            <head>
                <link href="https://vjs.zencdn.net/7.20.3/video-js.css" rel="stylesheet" />
                <style>body,html{margin:0;padding:0;background:#000;}</style>
            </head>
            <body>
                <video id="vid" class="video-js vjs-16-9 vjs-big-play-centered" controls autoplay muted></video>
                <script src="https://vjs.zencdn.net/7.20.3/video.min.js"></script>
                <script>
                    var player = videojs('vid');
                    // الخدعة: نطلبوا الفيديو مع تجاوز الـ CORS
                    player.src({
                        src: '${streamUrl}',
                        type: 'application/x-mpegURL',
                        withCredentials: false
                    });
                </script>
            </body>
            </html>
        `);

    } catch (e) {
        res.status(500).send(e.message);
    }
};
