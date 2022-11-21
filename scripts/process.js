const fs = require('fs');

// Helper code
const YOUTUBE = require('../lib/youtube.js');
const BUNNY = require('../lib/bunny.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Resources
const PROGRESS_FILE = require('../resource/progress.json');
const CHANNEL_VIDEO_URLS = require('../resource/channel_video_urls.json');

// Progress Stuff
let PROGRESS;
function saveProgress() {
	fs.writeFileSync(`resource/progress.json`, JSON.stringify(PROGRESS_FILE));
}
function updateProgressItem(VIDEO_ID, ADDITIONAL_INFO) {
	// Adds the new dictionary values & saves
	if (PROGRESS_FILE[VIDEO_ID] === undefined) PROGRESS_FILE[VIDEO_ID] = {};
	PROGRESS_FILE[VIDEO_ID] = {
		...PROGRESS_FILE[VIDEO_ID],
		...ADDITIONAL_INFO
	};
	saveProgress();
	PROGRESS = PROGRESS_FILE[VIDEO_ID];
}

// Initialize a blank progress object for each unrecognized video ID
function initProgressWithChannelLinks(group){
	for (const VIDEO_URL of CHANNEL_VIDEO_URLS[group]) {
		const VIDEO_ID = YOUTUBE.getIdFromUrl(VIDEO_URL);
		if(PROGRESS_FILE[VIDEO_ID] === undefined){
			updateProgressItem(VIDEO_ID, {});
		}
	}
}

async function downloadVideosFromProgress() {
	for (const VIDEO_ID in PROGRESS_FILE) {
		PROGRESS = PROGRESS_FILE[VIDEO_ID];

		console.log(`Processing video with id [ ${VIDEO_ID} ]`);

		// Get the youtube API info
		if (PROGRESS.HAS_DOWNLOADED != true || PROGRESS.HAS_INFO != true) {
			console.log(`Getting info...`);
			const VIDEO_INFO = await YOUTUBE.getInfo(`https://www.youtube.com/watch?v=${VIDEO_ID}`);
			updateProgressItem(VIDEO_ID, {
				...VIDEO_INFO,
				HAS_INFO: true
			});
		}

		// Download the video
		if (PROGRESS.HAS_DOWNLOADED != true) {
			console.log("Downloading...");
			// await sleep(10000);
			const downloadSize = await YOUTUBE.download(PROGRESS.video_url, VIDEO_ID);
			console.log(downloadSize);
			if (downloadSize === false) return; // Handle the error here

			updateProgressItem(VIDEO_ID, {
				video_size: downloadSize,
				HAS_DOWNLOADED: true
			});
		}

		// Upload the video
		if (PROGRESS.HAS_UPLOADED != true) {
			console.log(`Uploading...`);
			const didUpload = await BUNNY.uploadVideo(VIDEO_ID);
			if (!didUpload) return; // Handle the error here

			// Delete the file
			fs.rmSync(`videos/${VIDEO_ID}.mp4`);

			updateProgressItem(VIDEO_ID, {
				HAS_UPLOADED: true
			});
		}

		// Download the thumbnail
		if (PROGRESS.HAS_DOWNLOADED_THUMBNAIL != true) {
			console.log("Downloading thumbnail...");
			// await sleep(10000);
			console.log(PROGRESS.video_thumbnail);
			const downloadSize = await YOUTUBE.downloadThumbnail(PROGRESS.video_thumbnail, VIDEO_ID);
			console.log(downloadSize);
			if (downloadSize === false) return; // Handle the error here

			updateProgressItem(VIDEO_ID, {
				thumbnail_size: downloadSize,
				HAS_DOWNLOADED_THUMBNAIL: true
			});
		}

		// Upload the thumbnail
		if (PROGRESS.HAS_UPLOADED_THUMBNAIL != true) {
			console.log(`Uploading thumbnail...`);
			const didUpload = await BUNNY.uploadThumbnail(VIDEO_ID);
			if (!didUpload) return; // Handle the error here

			// Delete the file
			try {
				fs.rmSync(`videos/${VIDEO_ID}.jpg`);
				fs.rmSync(`videos/${VIDEO_ID}.webp`);
			} catch(err){}

			updateProgressItem(VIDEO_ID, {
				HAS_UPLOADED_THUMBNAIL: true
			});
		}
	}
}

initProgressWithChannelLinks("watch");
downloadVideosFromProgress();