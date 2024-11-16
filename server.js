const express = require('express');
const axios = require('axios');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = 3000;

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const API_VERSION = '5.199';
const POSTS_COUNT = 100;

async function fetchPosts(userId, offset = 0) {
    const url = `https://api.vk.com/method/wall.get`;
    try {
        const {data} = await axios.get(url, {
            params: {
                owner_id: userId,
                count: POSTS_COUNT,
                offset,
                access_token: ACCESS_TOKEN,
                v: API_VERSION,
            },
        });
        return data.response.items || [];
    } catch (error) {
        console.error('Response error is connected with VK API:', error.response?.data || error.message);
        return [];
    }
}

app.get('/export-posts', async (req, res) => {
    const userId = req.query.id;
    try {
        let allPosts = [];
        let offset = 0;

        while (true) {
            const posts = await fetchPosts(userId, offset);
            if (posts.length === 0) break;

            allPosts = allPosts.concat(posts);
            offset += POSTS_COUNT;
        }

        const filePath = 'posts.json';
        fs.writeFileSync(filePath, JSON.stringify(allPosts, null, 2), 'utf8');

        res.json({ message: 'Posts are successfully imported', filePath });
    } catch (error) {
        console.error('Posts import error:', error);
        res.status(500).json({ error: 'Posts import was failed' });
    }
});

app.listen(PORT, () => {
    console.log(`The server is running http://localhost:${PORT}`);
});
