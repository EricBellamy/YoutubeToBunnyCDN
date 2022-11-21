const env = require(`../env.js`);
const fs = require('fs');

// BunnyCDN
const axios = require("axios");
const baseURL = `https://${env.BUNNY_STORAGE_REGION}.storage.bunnycdn.com`;
const client = axios.create({
	baseURL: `${baseURL}/${env.BUNNY_STORAGE_NAME}/`,
	headers: {
		AccessKey: env.BUNNY_API_KEY
	},
	maxContentLength: Infinity,
	maxBodyLength: Infinity
});


module.exports = {
	uploadVideo: async function (VIDEO_ID) {
		try {
			const file = fs.createReadStream(`videos/${VIDEO_ID}.mp4`);
			const response = await client({
                method: 'PUT',
                url: `/videos/${VIDEO_ID}.mp4`,
                data: file
            });
			console.log(response.status === 201);
			if(response.status === 201) return true;
			return false;

		} catch (err) {
			console.log(err);
			return false;
		}
	},
	uploadThumbnail: async function (VIDEO_ID) {
		try {
			const file = fs.createReadStream(`videos/${VIDEO_ID}.jpg`);
			const response = await client({
                method: 'PUT',
                url: `/thumbnails/${VIDEO_ID}.jpg`,
                data: file
            });
			console.log(response.status === 201);
			if(response.status === 201) return true;
			return false;

		} catch (err) {
			console.log(err);
			return false;
		}
	},
}