const https = require('https');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = 'aurelienvrn/urgences-app';
  const body = JSON.parse(event.body);

  if (body.type === 'image') {
    const { filename, content } = body;
    const path = `images/${filename}`;

    let sha = null;
    try {
      const existing = await githubGet(`/repos/${repo}/contents/${path}`, token);
      sha = existing.sha;
    } catch(e) {}

    const payload = JSON.stringify({
      message: `Upload image ${filename}`,
      content: content,
      ...(sha && { sha })
    });

    const result = await githubPut(`/repos/${repo}/contents/${path}`, payload, token);
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ path: `images/${filename}` })
    };
  }

  if (body.type === 'data') {
    const { content, sha } = body;
    const payload = JSON.stringify({
      message: 'Mise à jour via admin',
      content: content,
      sha: sha
    });

    const result = await githubPut(`/repos/${repo}/contents/data.json`, payload, token);
    return {
      statusCode: result.ok ? 200 : 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: result.ok ? 'ok' : 'error'
    };
  }

  return { statusCode: 400, body: 'Bad request' };
};

function githubGet(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path,
      method: 'GET',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'urgences-app'
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) resolve(JSON.parse(data));
        else reject(new Error(res.statusCode));
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function githubPut(path, payload, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path,
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': 'urgences-app'
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ ok: res.statusCode < 300, data }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}
