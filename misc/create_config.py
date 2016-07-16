import json
import argparse


def write_json(data, data_path):
  with open(data_path, 'w') as fp:
    json.dump(data, fp)


def read_json(data_path):
  with open(data_path, 'r') as fp:
    return json.load(fp)


def main(params):
  config = {}
  config['video_root'] = params['video_root']
  config['server'] = params['server']
  config['database'] = params['database']
  write_json(config, 'config.json')


if __name__ == "__main__":
  parser = argparse.ArgumentParser()
  parser.add_argument('-video_root', nargs='?', default='../videos', type=str)
  parser.add_argument('-server', nargs='?', default='128.12.137.178', type=str)
  parser.add_argument('-database', nargs='?', default='deep_annotator', type=str)

  args = parser.parse_args()
  params = vars(args)
  main(params)
