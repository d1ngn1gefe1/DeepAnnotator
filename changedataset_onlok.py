import os
import cv2
import argparse
import re

INPUTPATH = './'
OUTPUTPATH = './output'

def unzip(path):
    for root, dirs, files in os.walk(path, topdown=False):
        for name in files:
            if re.search('.gz', name):
                # Unzip the .gz file
                print '[INFO]-Unzipping: ', os.path.join(root, name)
                os.system('tar -xf ' + os.path.join(root, name) + ' -C ' + root)
#                Delete the .gz file
#                os.system('rm ' + os.path.join(root, name))
    return 1

def findpaths(path):
    depth_paths = []
    depth_dict = {}
    path = './'
    for root, dirs, files in os.walk(path, topdown=False):
        for name in files:
            if name.find('d-') != -1:
                depth_path = os.path.join(root, name)
                depth_paths.append(depth_path)
                match = re.search(r'(.*)/10.0.1.(?P<cluster>\d+)/(.*)/d-(?P<id>\S+).jpg', depth_path)
                date = re.search(r'.*(?P<date>2017\d+)', match.group(1)).group('date')
                cluster = match.group('cluster')
                image_id = match.group('id')
                depth_dict[depth_path] = (date, cluster, image_id)
    depth_paths_sorted = sorted(depth_paths, key=lambda x: (depth_dict[x][0], depth_dict[x][1], int(depth_dict[x][2])))
    return depth_paths_sorted, depth_dict

def main(params):
    print 'Input path: ', params['input_path']
    print 'Output path: ', params['output_path']
    inpath = params['input_path']
    outpath = params['output_path']
    unzip(inpath)
    print '[INFO]-Finding all images...'
    d_paths, d_dict = findpaths(inpath)
    print '[INFO]-Starting to copy images...'
    # DEPTH IMAGES
    for cnt, d_path in enumerate(d_paths):
        if (1+cnt)%500==0:
            print '[INFO]-Copying depth image # ', 1+cnt
        if not os.path.exists(outpath):
            os.makedirs(outpath)
        cv2.imwrite(os.path.join(outpath, str(cnt)+'-'+d_dict[d_path][0]+'-'+d_dict[d_path][1]+'-'+d_dict[d_path][2]+'.jpg'), cv2.imread(d_path))

if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    parser.add_argument('--input_path', default=INPUTPATH, help='Root directory where all data resides eg: ./')
    parser.add_argument('--output_path', default=OUTPUTPATH, help='Output directory')
    args = parser.parse_args()
    params = vars(args)
    main(params)