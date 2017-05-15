import os
import cv2
import argparse

def findpath(path):
	comp = [path]
	jpgpaths = []
	while(comp):
		jpgs = [os.path.join(comp[0], d) for d in os.listdir(comp[0]) if d.find('.png') != -1 or d.find('.jpg') != -1]
		if(len(jpgs) == 0):
			files = [os.path.join(comp[0], d) for d in os.listdir(comp[0]) if os.path.isdir(os.path.join(comp[0],d)) == True]
			comp += files
			comp.remove(comp[0])
		else:
			jpgpaths += jpgs
			comp.remove(comp[0])
	return jpgpaths	
def main(params):
	inpath = params['input_path']
	outpath = params['output_path']
	allpath = findpath(inpath)
	imgs = sorted(allpath, key=lambda x: ('/'.join(x.split('/')[0:-1]), int(x.split('/')[-1].split('.')[0])))
	cnt = 0
	for path in imgs:
		fold = path.replace(inpath, ' ').split('/')[1]
		os.makedirs(os.path.join(outpath, fold), exist_ok=True)
		outimgs = str(cnt) + '_'.join((path.replace(inpath, ' ')).split('/'))
		cnt += 1
		print(path)
		cv2.imwrite(os.path.join(outpath,fold,outimgs), cv2.imread(os.path.join(path)))

if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    parser.add_argument('--input_path', default='/data/thermset', help='Root directory where all data resides')
    parser.add_argument('--output_path', default='/data/deepannotator', help='Output directory')
    args = parser.parse_args()
    params = vars(args)
    main(params)


