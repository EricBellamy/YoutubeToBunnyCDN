// A simple script that scrolls all the way down the page of a youtube channel and scrapes their video links
parsed = {
	shorts: [],
	watch: []
};

sleep = ms => new Promise(r => setTimeout(r, ms));

getPageHeight = function () {
	return document.querySelector("ytd-app").getBoundingClientRect().height;
}

getLoadStatus = function () {
	return document.querySelector("#spinner").getAttribute("active") === '';
}

pushIfNotExists = function(pushable, insertable, thumbnail){
	insertable = insertable.trim();
	if(insertable.length === 0) return;
	if(pushable.indexOf(insertable) === -1) pushable.push(insertable);
}

parseThumbnails = function () {
	const thumbnailBase = document.querySelector("#primary > * > #contents"); // The main channel video container
	const thumbnails = thumbnailBase.querySelectorAll("a#thumbnail")
	for (thumbnail of thumbnails) {
		const href = thumbnail.href.split("&")[0];
		if (href.indexOf("youtube.com/shorts/") != -1) pushIfNotExists(parsed.shorts, href, thumbnail);
		else pushIfNotExists(parsed.watch, href, thumbnail);
	}
}

loadAllVideos = async function () {
	let pageHeight = getPageHeight();
	let newPageHeight;
	while (true) {
		console.log("SCRAPE :: Scrolling...");
		window.scrollTo(0, pageHeight);

		console.log("SCRAPE :: Starting to wait...");
		// Wait until the load indicator disappears
		await sleep(100);
		try {
			while (getLoadStatus()) {
				console.log("SCRAPE :: Waiting for load indicator to disappear...");
				await sleep(100);
			}
			console.log("SCRAPE :: Load indicator disappeared...");
		} catch (err) { }
		await sleep(750);

		// Keep scrolling down until the page height no longer changes
		newPageHeight = getPageHeight();
		if (pageHeight === newPageHeight) {
			console.log("SCRAPE :: No videos left to load.");
			break;
		}
		pageHeight = newPageHeight;
	}

	parseThumbnails();
	console.log(parsed);
}
loadAllVideos();