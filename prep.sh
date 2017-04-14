#!/bin/sh
#sudo pip install ffmpeg
#sudo apt-get update
#sudo apt-get install apache2
#sudo pip install Flask-SQLAlchemy
#sudo apt-get install nodejs
#sudo apt-get install npm
python misc/prep_data.py --data_dir "/home/alan/bigdata/thermset" --frame_per_second 2
python misc/create_config.py -server 128.12.137.178 -config_root '/home/www/DeepAnnotator/app/sql/configs/'
