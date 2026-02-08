module.exports = async (req, res) => {
    const { url } = req.query; // هنا تحط رابط القناة M3U8
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <link href="https://vjs.zencdn.net/7.20.3/video-js.css" rel="stylesheet" />
        <style>body,html{margin:0;padding:0;width:100%;height:100%;background:#000;overflow:hidden;}</style>
    </head>
    <body>
        <video id="my-video" class="video-js vjs-big-play-centered" controls preload="auto" width="100vw" height="100vh" data-setup='{}'>
            <source src="${url}" type="application/x-mpegURL">
        </video>
        <script src="https://vjs.zencdn.net/7.20.3/video.min.js"></script>
    </body>
    </html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
};
