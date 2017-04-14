import argparse
import json
import math
import os
import re
import subprocess as sp
from shutil import copyfile, rmtree
from create_config import write_json

def inspect_video_data(video_dir, video_per_playlist):
    '''Save video information to json.
      Args:
        video_dir: root directory that contains all the videos
        video_per_playlist: number of videos per playlist
      Returns:
        None
    '''
    stat = {}
    print(video_dir)
    sensorsup = [s for s in os.listdir(video_dir)]
    print(sensorsup)
    sensors = [os.path.join(sensor, d) for sensor in sensorsup for d in os.listdir(os.path.join(video_dir, sensor)) if d.find('2016') != -1]
    print(sensors)
    start_index = []
    end_index = [] # exclusive
    playlists = []
    for s in sensors:
        s_dir = os.path.join(video_dir, s)
        video_count = len(os.listdir(s_dir))
        print(video_count)
        num_video = int(math.ceil(float(video_count)/video_per_playlist))
        for i in range(num_video):
          start_index.append(i*video_per_playlist)
          end_index.append(min((i+1)*video_per_playlist, video_count))
          playlists.append(s)

    stat['start_index'] = start_index
    stat['end_index'] = end_index
    stat['playlists'] = playlists
    out_path = os.path.join(video_dir, 'info.json')
    print('Output json to:', out_path)
    print(stat)
    write_json(stat, out_path)


def frames_to_mp4(frame_dir, out_dir, fps, rotate):
    '''Create a mp4 from images in frame_dir and save to out_dir.
      Args:
        frame_dir: directory that contains all the frames
        out_dir: directory to save the output mp4 video
        fps: frame rate (frame per second)
      Returns:
        None
    '''
    frames = os.path.join(frame_dir, '*.png')

    frames = '\'' + frames + '\''
    mp4 = os.path.join(out_dir, 'depth.mp4')
    if rotate:
        command = ['ffmpeg',
                   '-r', str(fps),
                   '-pattern_type', 'glob',
                   '-i', frames,
                   '-vcodec', 'libx264',
                   '-pix_fmt', 'yuv420p',
	               '-vf', '\'transpose=2,transpose=2\'',
                   '-y',
                   mp4]
    else:
        command = ['ffmpeg',
                   '-r', str(fps),
                   '-pattern_type', 'glob',
                   '-i', frames,
                   '-vcodec', 'libx264',
                   '-pix_fmt', 'yuv420p',
                   '-y',
                   mp4]
    command = ' '.join(command)
    print(command)
    sp.call(command, shell=True)


def natural_sort(l):
    '''Sort a list of strings base on digits each string contains
      Args:
        l: list of strings. e.g. [input_2.jpg, intput_12.jpg]
      Returns:
        Sorted list of strings
    '''
    convert = lambda text: int(text) if text.isdigit() else text.lower()
    alphanum_key = lambda key: [convert(c) for c in re.split('([0-9]+)', key)]
    return sorted(l, key = alphanum_key)


def parse_frames(sensor, data_dir, fpv):
    '''Parse all frames that belong to sensor into fpv-frame sequences.
      Args:
        sensor: sensor id
        data_dir: root directory for raw data
        fpv: frames per video. Number of frames we want in each video.
      Returns: a tuple of
        out_dir: directory for parsed frames
        dir_count: number of video sequences after parsing
    '''
    out_dir = os.path.join(data_dir, sensor, 'd_parsed')
    print('Parsing data...Output to:', out_dir)
    if os.path.exists(out_dir): rmtree(out_dir)

    frame_dir = os.path.join(data_dir, sensor)
    if os.path.exists(frame_dir):
        frames = [f for f in os.listdir(frame_dir) if f.find('png') != -1]
        print(frames)
	if len(frames) == 0:
            frames = []
            print 'Frames not found: ' + frame_dir
        else:
            frames = natural_sort(frames)
            padding = len(frames[-1].split('.png')[0])
            os.makedirs(out_dir)
    else:
        frames = []
        print 'Frames not found: ' + frame_dir

    frame_count = 0; dir_count = 0;
    dst = os.path.join(out_dir, '0')
    for i in range(len(frames)):
        if i % fpv == 0:
            print 'Prev video # of frames:', frame_count
            print 'End frame', frames[i]
            dst = os.path.join(out_dir, str(i/fpv).zfill(3))
            if not os.path.exists(dst):
                os.makedirs(dst)
            frame_count = 0; dir_count += 1
        src = os.path.join(frame_dir, frames[i])
        num_frame = frames[i].split('.png')[0]
        dst_frame = os.path.join(dst, num_frame.zfill(padding)+'.png')
        copyfile(src, dst_frame)
        frame_count += 1
    print 'Num. videos:', dir_count

    if frame_count > 0:
        command = ' '.join(['chmod', '777', '-R', out_dir])
        sp.call(command, shell=True)
    return (out_dir, dir_count)


def main(params):
    if os.path.exists(params['out_dir']): rmtree(params['out_dir'])
    os.makedirs(params['out_dir'])
    sensor_dirs = ['Fiona_001']#[d for d in os.listdir(params['data_dir'])]
    for s in sensor_dirs:
	joinit = os.path.join(params['data_dir'], s)
	furtherdown = [d for d in os.listdir(joinit) if d.find('2016') != -1]
	for d in furtherdown:
		path = os.path.join(s, d)
        	frames_dir, dir_count = parse_frames(path, params['data_dir'],
            		params['frame_per_video'])
        	for i in range(dir_count):
            		frame_dir = os.path.join(frames_dir, str(i).zfill(3))
            		out_dir = os.path.join(params['out_dir'], path, str(i))
            		assert os.path.exists(frame_dir), 'Frames not found: ' + frame_dir
            		if not os.path.exists(out_dir):
                		os.makedirs(out_dir)
            		# For each video save one thumbnail image
            		frames = [f for f in os.listdir(frame_dir) if f.find('png') != -1]
            		thumbnail = os.path.join(frame_dir, frames[0])
            		copyfile(thumbnail, os.path.join(out_dir, 'thumbnail.jpg'))
            		frames_to_mp4(frame_dir, out_dir, params['frame_per_second'], params['rotate'])
    inspect_video_data(params['out_dir'], params['video_per_playlist'])


if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    parser.add_argument('--data_dir', default='../data',
                        help='Root directory where all data resides')
    parser.add_argument('--out_dir', default='../public/static/video',
                        help='Output directory')
    parser.add_argument('--frame_per_video', default=199,
                        help='Number of frames per video')
    parser.add_argument('--frame_per_second', default=5,
                        help='Number of frames per second (frame rate)')
    parser.add_argument('--video_per_playlist', default=10,
                        help='Number of videos per playlist')
    parser.add_argument('--rotate', default=False,
	                    help='Rotate video by 180 degrees if True')

    args = parser.parse_args()
    params = vars(args)
    main(params)
