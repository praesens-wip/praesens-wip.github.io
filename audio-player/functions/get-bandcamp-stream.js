const https = require('https');

exports.handler = async function(event, context) {
    const { url } = event.queryStringParameters || {};

    if (!url) {
        return { 
            statusCode: 400, 
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Missing url parameter" })
        };
    }

    try {
        const html = await new Promise((resolve, reject) => {
            https.get(url, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    // Handle redirects
                    https.get(res.headers.location, (res2) => {
                        let data = '';
                        res2.on('data', (chunk) => data += chunk);
                        res2.on('end', () => resolve(data));
                    }).on('error', reject);
                    return;
                }
                
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(data));
            }).on('error', (err) => reject(err));
        });

        // Extract TralbumData
        // Strategy 1: Look for data-tralbum="..." (Current Bandcamp format)
        let dataStr = '';
        const matchAttr = html.match(/data-tralbum="([^"]+)"/);
        
        if (matchAttr) {
            dataStr = matchAttr[1]
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');
        } else {
            // Strategy 2: Look for var TralbumData = ... (Legacy format)
            const matchVar = html.match(/var TralbumData = (\{[\s\S]*?\});/);
            if (matchVar) {
                dataStr = matchVar[1];
            }
        }

        if (!dataStr) {
            return { 
                statusCode: 404, 
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Metadata not found" })
            };
        }

        let trackId = null;
        let albumId = null;
        let streamUrl = null;
        let duration = 0;

        // Try parsing JSON (Best Method)
        try {
            const jsonData = JSON.parse(dataStr);
            
            // 1. Track ID
            // Usually in trackinfo[0].id or current.id
            if (jsonData.trackinfo && jsonData.trackinfo.length > 0) {
                trackId = jsonData.trackinfo[0].id;
                
                // Stream URL
                if (jsonData.trackinfo[0].file) {
                    streamUrl = jsonData.trackinfo[0].file["mp3-128"];
                }
                
                // Duration
                if (jsonData.trackinfo[0].duration) {
                    duration = jsonData.trackinfo[0].duration;
                }
            }
            
            if (!trackId && jsonData.id) {
                trackId = jsonData.id;
            }

            // 2. Album ID
            // Check album_embed_data or album_id
            if (jsonData.album_embed_data && jsonData.album_embed_data.tralbum_param && jsonData.album_embed_data.tralbum_param.name === 'album') {
                albumId = jsonData.album_embed_data.tralbum_param.value;
            } else if (jsonData.album_id) {
                albumId = jsonData.album_id;
            }

        } catch (e) {
            console.log("JSON Parse Failed, falling back to Regex", e);
            
            // Fallback: Regex
            const streamMatch = dataStr.match(/"mp3-128"\s*:\s*"([^"]+)"/);
            streamUrl = streamMatch ? streamMatch[1] : null;
            
            const durationMatch = dataStr.match(/duration\s*:\s*([\d\.]+)/);
            duration = durationMatch ? parseFloat(durationMatch[1]) : 0;

            const trackIdMatch = dataStr.match(/"id"\s*:\s*(\d+)/);
            trackId = trackIdMatch ? trackIdMatch[1] : null;

            const albumIdMatch = dataStr.match(/"album_id"\s*:\s*(\d+)/);
            albumId = albumIdMatch ? albumIdMatch[1] : null;
        }

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ streamUrl, duration, trackId, albumId })
        };

    } catch (error) {
        return { 
            statusCode: 500, 
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: error.toString() })
        };
    }
};
