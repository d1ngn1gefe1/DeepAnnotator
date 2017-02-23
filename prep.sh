#!/bin/sh
pip install ffmpeg
sudo apt-get update
sudo apt-get install apache2
pip install Flask-SQLAlchemy
sudo apt-get install nodejs
sudo apt-get install npm
python misc/prep_data.py --data_dir "~/files0928" --frame_per_second 2
python misc/create_config.py -server aicare.stanford.edu

