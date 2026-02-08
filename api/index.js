const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const { id } = req.query;
    
    // تأكد بلي الـ ID كاين
    if (!id) {
        return res.status(400).send('Error: Please provide a channel ID. Example: ?id=120');
    }

    const targetUrl = `https://dlhd.link/stream/stream-2.php?id=${id}`;

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'Referer': 'https://daddylive.sx/',
                'Origin': 'https://daddylive.sx',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch DaddyLive');

        let html = await response.text();

        // --- التعديلات السحرية ---

        // 1. إضافة الـ Base لمنع مشكلة الـ Domain Not Allowed
        html = html.replace('<head>', '<head><base href="https://dlhd.link/stream/">');

        // 2. تدمير سكريبتات الحماية اللي تفحص الـ Domain (location check)
        html = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/g, (match) => {
            if (match.includes('location.hostname') || match.includes('top.location') || match.includes('window.location')) {
                return '<script>/* Security Check Bypassed by General */</script>';
            }
            return match;
        });

        // 3. قتل الإعلانات (eval و atob هما اللي يفتحو الـ Popups غالباً)
        html = html.replace(/eval\(|atob\(/g, 'console.log(');

        // 4. منع الـ Ads الخارجية من التحميل
        html = html.replace(/src="http/g, 'data-src="http'); 
        html = html.replace(/data-src="https:\/\/dlhd.link/g, 'src="https://dlhd.link');

        // 5. تعديل الستايل باش يجي Full Screen في الـ MyBB
        html = html.replace('</head>', '<style>body, html { margin: 0; padding: 0; overflow: hidden; background: #000; } iframe, video { width: 100vw !important; height: 100vh !important; }</style></head>');

        // إرسال الكود النهائي
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate'); // باش يكون سريع
        res.send(html);

    } catch (error) {
        console.error(error);
        res.status(500).send('<h1>Server Error: General, check if DaddyLive changed their URL structure.</h1>');
    }
};
