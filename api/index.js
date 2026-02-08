
const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const { id } = req.query; // يرفد الـ ID تاع القناة من الرابط
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

        // السحر هنا: حذف قاع سكريبتات الإعلانات المعروفة
        html = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/g, (match) => {
            if (match.includes('eval') || match.includes('atob') || match.includes('pop')) {
                return '';
            }
            return match;
        });

        // إضافة ستايل باش الفيديو يجي 100% على الشاشة
        html = html + `<style>body,html{margin:0;padding:0;overflow:hidden;} iframe{width:100vw;height:100vh;border:none;}</style>`;

        res.setHeader('Content-Type', 'text/html');
        res.send(html);

    } catch (error) {
        res.status(500).send('Error fetching stream');
    }
};
