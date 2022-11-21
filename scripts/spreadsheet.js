const PROGRESS_FILE = require('../resource/progress.json');
const TIPSY_RECIPES = (require('../resource/website_recipes.json')).videos;

// CSV Stuff
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
	path: 'resource/tipsybartender_mrss.csv',
	header: [
		{ id: 'title', title: 'title' },
		{ id: 'keywords', title: 'keywords' },
		{ id: 'description', title: 'Description' },
		{ id: 'published', title: 'Published (Date)' },
		{ id: 'link', title: 'Link' },
		{ id: 'video_url', title: 'videoUrl' },
		{ id: 'thumbnail', title: 'thumbnail' },
	]
});

const VALID_URLS = [
	"youtu.be/",
	"youtube.com/watch?v="
];

function getVideoIdFromUrl(url) {
	for (const VALID_URL of VALID_URLS) {
		if (url.indexOf(VALID_URL) != -1) return url.split(VALID_URL)[1];
	}
	return false;
}

async function run() {
	let count = 0;
	const records = [];
	for (const RECIPE of TIPSY_RECIPES) {
		const VIDEO_ID = getVideoIdFromUrl(RECIPE.video_url);
		const PROGRESS = PROGRESS_FILE[VIDEO_ID];

		if (VIDEO_ID != false && PROGRESS != undefined) {
			records.push({
				title: PROGRESS.video_title,
				keywords: RECIPE.video_keywords,
				description: PROGRESS.video_description,
				published: RECIPE.date.replaceAll('-', '/'),
				link: `https://tipsybartender.com/recipe/${RECIPE.name}`,
				video_url: `https://tipsy-web.b-cdn.net/videos/${VIDEO_ID}.mp4`,
				thumbnail: `https://tipsy-web.b-cdn.net/thumbnails/${VIDEO_ID}.jpg`,
			})
		}
	}
	csvWriter.writeRecords(records)       // returns a promise
	.then(() => {
		console.log('...Done');
	});
}
run();