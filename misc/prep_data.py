import re
import os
import argparse
import subprocess as sp
from shutil import copy


def frames_to_mp4(frame_dir, out_dir):
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)


def natural_sort(l):
    convert = lambda text: int(text) if text.isdigit() else text.lower()
    alphanum_key = lambda key: [convert(c) for c in re.split('([0-9]+)', key)]
    return sorted(l, key = alphanum_key)


def parse_frames(sensor, data_dir, fpv):
    out_dir = os.path.join(data_dir, sensor, 'd_parsed')
    print 'Parsing data...Output to:', out_dir
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)

    frame_dir = os.path.join(data_dir, sensor, 'd')
    assert os.path.exists(frame_dir), 'Frames not found: ' + frame_dir
    frames = [f for f in os.listdir(frame_dir) if f.find('jpg') != -1]
    frames = natural_sort(frames)

    frame_count = 0; dir_count = 0;
    dst = os.path.join(out_dir, '0')
    for i in range(len(frames)):
        if i % fpv == 0:
            print 'Prev video # of frames:', count
            print 'End frame', frames[i]
            dst = os.path.join(out_dir, str(i/fpv))
            if not os.path.exists(dst):
                os.makedirs(dst)
            count = 0; dir_count += 1
        src = os.path.join(frame_dir, frames[i])
        copy(src, dst)
        count += 1

    return (out_dir, dir_count)


def main(params):
    sensor_dirs = [d for d in os.listdir(params['data_dir']) if
                   d.find('10') != -1]
    for s in sensor_dirs:
        frames_dir, dir_count = parse_frames(s, params['data_dir'],
            params['frame_per_video'])
        for i in range(dir_count):
            frame_dir = os.path.join(frames_dir, str(i))
            out_dir = os.path.join(params['out_dir'], str(i))
            assert os.path.exists(frame_dir), 'Frames not found: ' + frame_dir
            frames_to_mp4(frame_dir, out_dir)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument('--data_dir', default='/mnt/bigdata/intermountain',
                        help='Root directory where all data resides')
    parser.add_argument('--out_dir', default='/home/www/emma/DeepAnnotator/videos',
                        help='Output directory')
    parser.add_argument('--frame_per_video', default=1000,
                        help='Number of frames per video')

    args = parser.parse_args()
    params = vars(args)
    main(params)
