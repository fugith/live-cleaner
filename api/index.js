const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).send('Missing ID');

    // الرابط اللي فيه الـ Player
    const targetUrl = `https://dlhd.link/stream/stream-2.php?id=${id}`;

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://daddylive.sx/', // هادي هي اللي تفتح الـ Domain
                'Origin': 'https://daddylive.sx'
            }
        });

        let html = await response.text();

        // تدمير سكريبتات الإعلانات نهائياً
        html = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/g, ''); 
        
        // منع أي نقرة من فتح نافذة جديدة (Sandbox JavaScript)
        html = html.replace('<body>', '<body onclick="return false;">');

        res.setHeader('Content-Type', 'text/html');
        // نبعثو الكود نقي 100%
        res.send(html);

    } catch (error) {
        res.status(500).send('Error');
    }
};
