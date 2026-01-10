const fs = require('fs');

async function updateStats() {
    const config = JSON.parse(fs.readFileSync('./serverlist.json', 'utf8'));
    const serverList = config.serverlist;

    const results = [];
    let allUser = 0;
    let allUeuse = 0;

    for (const domain of serverList) {
        try {
            const response = await fetch(`https://${domain}/api/serverinfo-api`, { 
                signal: AbortSignal.timeout(10000), 
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 uwuzu-stat-bot'
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                results.push({ domain, data, error: null });
                allUser += data.server_info.usage.users;
                allUeuse += data.server_info.usage.ueuse;
            } else {
                results.push({ domain, data: null, error: `HTTP ${response.status}` });
            }
        } catch (error) {
            results.push({ domain, data: null, error: 'Connection Error' });
        }
    }

    const finalData = {
        all_user: allUser,
        all_ueuse: allUeuse,
        all_server: serverList.length,
        servers: results
    };

    fs.writeFileSync('./stats.json', JSON.stringify(finalData, null, 2));
    console.log('stats.json has been updated!');

    // history.json
    const historyFile = './history.json';
    let history = [];

    if (fs.existsSync(historyFile)) {
        history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    }

    history.push({
        date: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
        users: allUser,
        ueuse: allUeuse
    });

    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
    console.log('history.json has been updated!');
}

updateStats();