# DeepAnnotator
## Dependencies
* React
* Flask
* Bootstrap
* jQuery
* video.js
* less

## Build tools
* npm
* gulp
* babel
* webpack

## To setup the website, please run the following commands:
```bash
python3 changedataset.py --input_path '/data/thermset' --ouput_path '/data/deepannotator' (optional: if your dataset is not datasetname->folder->*.jpg/png format)
npm install
npm start
bash prep.sh
cd public
python app.py --port xxxx (xxxx corresponds to the port number)
```

## To clean up, please run:
```bash
gulp clean
```
