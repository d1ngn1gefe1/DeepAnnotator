import argparse
import cv2
import glob
import json
import math
import numpy as np
import os
import re
import subprocess as sp
from shutil import copyfile, rmtree
from create_config import read_json, write_json


def inspect_video_data(output_path):
    '''Save video information to json.
      Args:
        output_path: root directory that contains all the videos
      Returns:
        None
    '''
    stat = {}
    playlists = [d for d in os.listdir(output_path) if os.path.isdir(os.path.join(output_path, d))]
    start_index = []
    end_index = [] # exclusive
    for playlist in playlists:
        start_index.append(0)
        end_index.append(len(os.listdir(os.path.join(output_path, playlist))))

    stat['start_index'] = start_index
    stat['end_index'] = end_index
    stat['playlists'] = playlists
    stat['ext'] = '.'+glob.glob(os.path.join(output_path, playlists[0], '0', 'thumbnail*'))[0].split('.')[-1]
    json_path = os.path.join(output_path, 'info.json')
    write_json(stat, json_path)


def frames_to_mp4(frame_paths, output_path, fps, rotate):
    '''Create a mp4 from images in frame_paths and save to output_path.
      Args:
        frame_paths: paths to all the frames
        output_path: directory to save the output mp4 video
        fps: frame rate (frame per second)
      Returns:
        None
    '''
    os.makedirs(output_path, exist_ok=True)
    ext = '.'+frame_paths[0].split('.')[-1]
    for i, frame_path in enumerate(frame_paths):
        frame = cv2.imread(frame_path, cv2.IMREAD_GRAYSCALE)
        frame = np.clip((frame-20)*8, 0, 255)  # hardcoded
        frame = cv2.applyColorMap(frame, cv2.COLORMAP_OCEAN)
        cv2.imwrite(os.path.join(output_path, str(i).zfill(5)+ext), frame)
    frames = '\'' + os.path.join(output_path, '*'+ext) + '\''
    mp4_path = os.path.join(output_path, 'video.mp4')
    if rotate:
        command = ['ffmpeg',
                   '-r', str(fps),
                   '-pattern_type', 'glob',
                   '-i', frames,
                   '-vcodec', 'libx264',
                   '-pix_fmt', 'yuv420p',
                   '-vf', '\'transpose=2,transpose=2\'',
                   '-y',
                   mp4_path]
    else:
        command = ['ffmpeg',
                   '-r', str(fps),
                   '-pattern_type', 'glob',
                   '-i', frames,
                   '-vcodec', 'libx264',
                   '-pix_fmt', 'yuv420p',
                   '-y',
                   mp4_path]
    command = ' '.join(command)
    sp.call(command, shell=True)

    files = [f for f in os.listdir(output_path) if f.endswith(ext)]
    for f in files:
        os.remove(os.path.join(output_path, f))
    
    thumbnail_path = frame_paths[0]
    thumbnail = cv2.imread(thumbnail_path, cv2.IMREAD_GRAYSCALE)
    thumbnail = np.clip((thumbnail-20)*8, 0, 255)  # hardcoded
    thumbnail = cv2.applyColorMap(thumbnail, cv2.COLORMAP_OCEAN)
    cv2.imwrite(os.path.join(output_path, 'thumbnail'+ext), thumbnail)

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

def main(params):
    input_path = params['input_path']
    output_path = params['output_path']
    videos_per_playlist = params['videos_per_playlist']
    clips_per_video = params['clips_per_video']
    framevidc = {}
    #if os.path.exists(output_path): rmtree(output_path)
    if not os.path.exists(output_path):
            os.makedirs(output_path)
    dirs_level1 = [d for d in os.listdir(input_path)]
    videosdone = [d.split('.')[0] for d in os.listdir(output_path)]
    dirs_level1 = list(set(dirs_level1)-set(videosdone))
    for play in dirs_level1:
            print("new playlist: ", play)
            path_level1 = os.path.join(input_path, play)
            allframes = [os.path.join(path_level1, frame) for frame in os.listdir(path_level1) if frame.find('jpg') != -1 or frame.find('png') != -1]
            allframes = sorted(allframes,  key=lambda x: int(x.split('/')[-1].split('-')[0]))
            num_playlists = int(math.ceil(len(allframes)/float(videos_per_playlist*clips_per_video)))
            print(play, num_playlists)
            for i in range(num_playlists):
                playlist_name = play+'.'+ str(i)
                for j in range(videos_per_playlist):
                    start_idx = i*videos_per_playlist*clips_per_video + j*clips_per_video
                    end_idx = min(start_idx+clips_per_video, len(allframes))
                    frame_paths = allframes[start_idx:end_idx]
                    mp4_path = os.path.join(output_path, playlist_name, str(j))
                    frames_to_mp4(frame_paths, mp4_path, params['fps'], params['rotate'])
                    match = {i:v for i,v in enumerate(frame_paths)}
                    framevidc[playlist_name+str(j)] = match
                    if (end_idx == len(allframes)):
                        break
    if os.path.exists(os.path.join(output_path, 'conv.json')):
            val = read_json(os.path.join(output_path, 'conv.json'))
            val.update(framevidc)
            framevidc = val
    write_json(framevidc, os.path.join(output_path, 'conv.json'))
    inspect_video_data(params['output_path'])


if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    parser.add_argument('--input_path', default='/data/new', help='Root directory where all data resides')
    parser.add_argument('--output_path', default='../public/static/video', help='Output directory')
    parser.add_argument('--rotate', default=False, help='Rotate video by 180 degrees if True')
    parser.add_argument('--fps', default=5, help='Number of frames per second (frame rate)')

    # input: dataset/dir_level1/dir_level2/*.png
    # output: video/playlist_name/video_id_in_playlist/video.mp4
    parser.add_argument('--videos_per_playlist', default=10, help='Number of videos per playlist')
    parser.add_argument('--clips_per_video', default=199, help='Number of clips per video')

    args = parser.parse_args()
    params = vars(args)
    main(params)
