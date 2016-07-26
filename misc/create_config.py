import json
import argparse
import os


def write_json(data, data_path):
  with open(data_path, 'w') as fp:
    json.dump(data, fp)


def read_json(data_path):
  with open(data_path, 'r') as fp:
    return json.load(fp)


def update_user_config(users):
    while True:
        try:
            username = raw_input("Username: ")
            password = raw_input("Password: ")
            users[username] = password
        except EOFError:
            break


def main(params):
  if not os.path.exists(params['config_root']):
      os.makedirs(params['config_root'])

  config = {}
  config['video_root'] = params['video_root']
  config['server'] = params['server']
  config['database'] = params['database']
  config['db_password'] = raw_input("Database password: ")
  config_path = os.path.join(params['config_root'], 'config.json')
  write_json(config, config_path)

  user_config_path = os.path.join(params['config_root'], 'users.json')
  if not os.path.exists:
      users = {}
  else:
      users = read_json(user_config_path)
  update_user_config(users)
  write_json(users, user_config_path)


if __name__ == "__main__":
  parser = argparse.ArgumentParser()
  parser.add_argument('-video_root', nargs='?', default='../public/static/video', type=str)
  parser.add_argument('-server', nargs='?', default='128.12.137.178', type=str)
  parser.add_argument('-database', nargs='?', default='deep_annotator', type=str)
  parser.add_argument('-config_root', nargs='?', default='../app/sql/configs/', type=str)

  args = parser.parse_args()
  params = vars(args)
  main(params)
