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

        // استخراج رابط الـ m3u8
        const m3u8Match = html.match(/source:\s*["'](https?:\/\/.*\.m3u8.*)["']/);
        const m3u8Url = m3u8Match ? m3u8Match[1] : null;

        if (!m3u8Url) return res.send("Stream not found.");

        res.setHeader('Content-Type', 'text/html');
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <link href="https://vjs.zencdn.net/7.20.3/video-js.css" rel="stylesheet" />
                <style>
                    body, html { margin: 0; padding: 0; background: #000; overflow: hidden; width: 100%; height: 100%; }
                    
                    /* هادي هي اللي تمنع الكليكات البرانية */
                    .video-wrapper { position: relative; width: 100vw; height: 100vh; }
                    
                    /* الطبقة الشفافة تحبس الـ Ads بصح تخلي الـ Controls تاع الفيديو */
                    .video-js { width: 100% !important; height: 100% !important; }
                    
                    /* نـفـورصيو الـ Controls يبانو ديما باش ما تـحتاجش تكليكي وسط الفيديو */
                    .vjs-has-started .vjs-control-bar { display: flex !important; visibility: visible !important; opacity: 1 !important; }
                </style>
            </head>
            <body>
                <div class="video-wrapper">
                    <video id="player" class="video-js vjs-big-play-centered" controls playsinline></video>
                </div>

                <script src="https://vjs.zencdn.net/7.20.3/video.min.js"></script>
                <script>
                    var player = videojs('player', {
                        autoplay: 'muted', // لازم يكون Muted باش الـ Browser يخليه يخدم وحدو
                        preload: 'auto',
                        fluid: true
                    });

                    player.src({ src: '${m3u8Url}', type: 'application/x-mpegURL' });

                    // عفسة باش نحيو الـ Popups تماماً حتى لو السكريبت حاول يفتحهم
                    window.open = function() { return null; };
                    
                    player.ready(function() {
                        var promise = player.play();
                        if (promise !== undefined) {
                            promise.then(_ => {
                                // Autoplay بدأ بنجاح
                            }).catch(error => {
                                // الـ Browser بلوكا الـ Autoplay (لازم العضو يكليكي مرة وحدة)
                                console.log("Autoplay blocked, waiting for user interaction");
                            });
                        }
                    });
                </script>
            </body>
            </html>
        `);
    } catch (e) {
        res.send("Error: " + e.message);
    }
};
