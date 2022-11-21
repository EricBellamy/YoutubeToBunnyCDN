const PROGRESS_FILE = require('../resource/progress.json');

let count = 0;
for(const PROGRESS_KEY in PROGRESS_FILE){
	if(PROGRESS_FILE[PROGRESS_KEY].HAS_DOWNLOADED != true) count++;
}

console.log(`TOTAL PROGRESS KEYS: ${Object.keys(PROGRESS_FILE).length}`);
console.log(`VIDEOS THAT NEED TO BE DOWNLOADED: ${count}`);