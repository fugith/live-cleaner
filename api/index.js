const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).send('Missing ID');

    const targetUrl = `https://dlhd.link/stream/stream-2.php?id=${id}`;

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'Referer': 'https://daddylive.sx/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        let html = await response.text();

        // 1. الخدعة الكبرى: إضافة <base> لـ DaddyLive باش الـ JS يـتحلـب
        html = html.replace('<head>', '<head><base href="https://dlhd.link/stream/">');

        // 2. تصفية الإعلانات: نحذفوا أي سكريبت يجي من برا (Ads domains)
        html = html.replace(/<script\b[^>]*src="http[^>]*><\/script>/gi, '');
        
        // 3. منع الـ Redirects اللي يـديروهم الإعلانات
        html = html.replace('window.location', 'window.blocked_location');

        res.setHeader('Content-Type', 'text/html');
        res.send(html);

    } catch (error) {
        res.status(500).send('Server Error');
    }
};
