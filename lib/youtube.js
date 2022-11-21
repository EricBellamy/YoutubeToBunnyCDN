const webp = require('webp-converter');
webp.grant_permission();

const youtubedl = require('youtube-dl-exec')
const https = require('https');
const fs = require('fs');

const SPLITS = {
	shorts: "shorts/",
	watch: "watch?v="
};

module.exports.getIdFromUrl = function (url) {
	let SPLIT_TYPE;
	if (url.indexOf("youtube.com/watch?v=") != -1) SPLIT_TYPE = SPLITS.watch;
	else if (url.indexOf("youtube.com/shorts/") != -1) SPLIT_TYPE = SPLITS.shorts;
	else return false;

	return url.split(SPLIT_TYPE)[1];
}

module.exports.getInfo = async function (VIDEO_URL) {
	return await new Promise(resolve => {
		youtubedl(VIDEO_URL, {
			format: 'mp4[protocol^=http]',
			dumpSingleJson: true,
		}).then(retrievedInfo => {
			// console.log(retrievedInfo);
			return resolve({
				video_url: retrievedInfo.url,
				video_title: retrievedInfo.fulltitle,
				video_duration: retrievedInfo.duration,
				video_description: retrievedInfo.description,
				video_thumbnail: retrievedInfo.thumbnail
			});
		});
	});
}

module.exports.download = async function (VIDEO_URL, VIDEO_ID) {
	return await new Promise(async resolve => {
		const request = https.get(VIDEO_URL, function (response) {
			if (response.headers['content-length'] == 0) return resolve(false);

			const file = fs.createWriteStream(`videos/${VIDEO_ID}.mp4`);

			// after download completed close filestream
			file.on("finish", () => {
				file.close(() => {
					fs.stat(`videos/${VIDEO_ID}.mp4`, (err, stats) => {
						if (err || stats.size === 0) return resolve(false);
						else resolve(stats.size);
					});

				});
			});

			response.on('aborted', () => {
				console.log("ABORTED!");
				request.destroy();
				resolve(false);
			});

			response.pipe(file);
		});
	});
}

module.exports.downloadThumbnail = async function (THUMBNAIL_URL, VIDEO_ID) {
	return await new Promise(async resolve => {
		const request = https.get(THUMBNAIL_URL, function (response) {
			if (response.headers['content-length'] == 0) return resolve(false);

			let THUMBNAIL_TYPE = THUMBNAIL_URL.split(".");
			THUMBNAIL_TYPE = THUMBNAIL_TYPE[THUMBNAIL_TYPE.length - 1];

			const file = fs.createWriteStream(`videos/${VIDEO_ID}.${THUMBNAIL_TYPE}`);

			// after download completed close filestream
			file.on("finish", () => {
				file.close(() => {
					fs.stat(`videos/${VIDEO_ID}.${THUMBNAIL_TYPE}`, (err, stats) => {
						if (err || stats.size === 0) return resolve(false);
						else {

							if (THUMBNAIL_TYPE === "webp") {
								const result = webp.dwebp(`videos/${VIDEO_ID}.webp`, `videos/${VIDEO_ID}.jpg`, "-o");
								result.then((response) => {
									console.log("THE RESPONSE LENGTH");
									console.log(response);
									resolve(stats.size);
								});
							} else resolve(stats.size);
						}
					});

				});
			});

			response.on('aborted', () => {
				console.log("ABORTED!");
				request.destroy();
				resolve(false);
			});

			response.pipe(file);
		});
	});
}