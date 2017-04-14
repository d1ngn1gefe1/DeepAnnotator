#!/bin/bash
normal=$(tput sgr0)
green=$(tput setaf 2)
#sudo pip install ffmpeg
#sudo apt-get update
#sudo apt-get install apache2
#sudo pip install Flask-SQLAlchemy
#sudo apt-get install nodejs
#sudo apt-get install npm
echo "\n${green}pred_data...${normal}"
cd ./misc
# python prep_data.py --data_dir '/home/alan/bigdata/thermset'
echo "\n${green}create_config...${normal}"
# python create_config.py --server 128.12.137.178 --config_root '../app/sql/configs/'
echo "\n${green}update_users...${normal}"
cd ../app/sql
python update_users.py
echo "\n${green}create_config...${normal}"
python update_options.py
