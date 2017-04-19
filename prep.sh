#/bin/bash
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
python3 prep_data.py --input_path '/data/try' --output_path '../public/static/video'
#echo "\n${green}create_config...${normal}"
#python3 create_config.py --server aicare.stanford.edu --config_root '../app/sql/configs/'
#echo "\n${green}update_users...${normal}"
#cd ../app/sql
#python3 update_users.py
#echo "\n${green}update_options...${normal}"
#python3 update_options.py
