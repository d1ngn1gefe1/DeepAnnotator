import os
import argparse
import json


def main(params):
    playlist_name = '10.100.100.100'
    input_file = os.path.join(params['data_dir'], params['input_file'])
    obj_dict = {}

    with open(input_file, 'rb') as fin:
        data = fin.readlines()
        for row in data:
            row = row.split('\n')[0].split(' ')
            object_id = row[4]
            x1, y1, x2, y2 = row[:4]
            object_class = int(row[5])
            frame_id = int(row[6]) / params['--frame_offset'] - 1 
	    video_id = frame_id / params['--frame_per_video']
            frame_id = frame_id % params['--frame_per_video']
            if not obj_dict.has_key(object_id):
                obj_dict[object_id] = [x1, y1, x2, y2, object_class, 
                                      frame_id, video_id]
            else:
                obj_dict[object_id].append(
                    [x1, y1, x2, y2, object_class, frame_id, video_id])
    print obj_dict


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument('--data_dir', default='../data',
                        help='Root directory where all data resides')
    parser.add_argument('--input_file', default='detections-17-17.txt',
                        help='Input filename')
    parser.add_argument('--frame_per_video', default=500,
                        help='Number of frames per video')
    parser.add_argument('--frame_offset', default=6, 
			help='Save per 6 frames')
    parser.add_argument('--video_per_playlist', default=10,
                        help='Number of videos per playlist')

    args = parser.parse_args()
    params = vars(args)
    main(params)
