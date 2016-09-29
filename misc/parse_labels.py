import os
import argparse
import json


def write_json(data, data_path):
    with open(data_path, 'w') as fp:
        json.dump(data, fp)


def read_json(data_path):
    with open(data_path, 'r') as fp:
        return json.load(fp)


# Test function for parsing action labels
def parse_list():
    a = [1, 2, 2, 3, 3, 3, 4, 5, 5, 2, 5]
    index = {}
    start = 0
    for i in range(len(a)-1):
        if a[i+1] != a[i]:
            if a[i] not in index:
                index[a[i]] = [(start, i)]
            else:
                index[a[i]].append((start, i))
            start = i + 1
    if a[-1] == a[-2]:
        index[a[-1]][-1] = (index[a[-1]][0], len(a) - 1)
    else:
        index[a[-1]].append((len(a) - 1, len(a) - 1))
    print index


def get_frame_id_dict(input_file):
    frame_id_dict = {}
    with open(input_file, 'rb') as fin:
        data = fin.readlines()
        for row in data:
            row = row.split('\n')[0].split(' ')
            frame_id = int(row[6])
            if frame_id not in frame_id_dict:
                frame_id_dict[frame_id] = len(frame_id_dict)
    return frame_id_dict


def parse_labels(input_file, frame_id_dict, params):
    obj_dict = {}
    video_ids = set()
    with open(input_file, 'rb') as fin:
        data = fin.readlines()
        for row in data:
            row = row.split('\n')[0].split(' ')
            object_id = int(row[4])
            x1, y1, x2, y2 = [int(x) for x in row[:4]]
            object_class = int(row[5])
            frame_id = frame_id_dict[int(row[6])]
            video_id = frame_id / params['frame_per_video']
            frame_id = frame_id % params['frame_per_video']
            video_ids.add(video_id)
            if object_id not in obj_dict:
                obj_dict[object_id] = [[x1, y1, x2, y2, object_class,
                                      frame_id, video_id]]
            else:
                obj_dict[object_id].append([x1, y1, x2, y2, object_class, frame_id,
                                            video_id])
    return obj_dict, video_ids


def get_action_label(obj):
    index = {}
    start = 0
    for i in range(len(obj)-1):
        if obj[i][4] != obj[i+1][4]:
            if obj[i][4] not in index:
                index[obj[i][4]] = [(start, i)]
            else:
                index[obj[i][4]].append((start, i))
            start = i + 1
    if len(index) > 0:
        if obj[-1][4] == obj[-2][4]:
            start = index[obj[-1][4]][-1][0]
            index[obj[-1][4]][-1] = (start, len(obj) - 1)
        else:
            index[obj[-1][4]].append((len(obj) - 1, len(obj) - 1))

    action_labels = []
    action_selects = []
    for action in index:
        action_selects.append(action)
        action_label = []
        for chunk in index[action]:
            if chunk[0] == chunk[1]:
                action_label.append([obj[chunk[0]][5], obj[chunk[0]+1][5]])
            else:
                action_label.append([obj[chunk[0]][5], obj[chunk[1]][5]])
        action_labels.append(action_label)
    return action_labels, action_selects


def get_playlist_record(obj_dict, playlist_name, video_ids, frame_counts, action_options):
    records = []
    for video_id in video_ids:
        frame_labels = {'label': []}
        object_labels = {'label': []}
        bboxes = {'label': []}
        for object_id in obj_dict.keys()[33:60]:
            object_label = []
            bbox = []
            obj_class = 'Doctor'

            # Get object label
            start = obj_dict[object_id][0][-2]
            end = obj_dict[object_id][-1][-2]
            if start < frame_counts[video_id] - 1:
                object_label.append([0, start-1, 1])
                if end < frame_counts[video_id]:
                    object_label.append([start, end, 0])
                    object_label.append([end+1, frame_counts[video_id]-1, 1])
                else:
                    object_label.append([start, frame_counts[video_id]-1, 0])

            # Get bboxes
            obj = obj_dict[object_id]
            for frame in obj:
                if frame[-1] == video_id:
                    # Images are rescaled to double size
                    bbox.append([2*x for x in frame[:4]] + [frame[5]])

            # Get action labels
            action_label_list, action_selects = get_action_label(obj)
            action_selects = [{
                'value': action_options[key],
                'label': action_options[key]
                } for key in action_selects]

            if len(bbox) is not 0 and len(object_label) is not 0:
                if bbox[0][-1] != 0:
                    bbox = [[100, 100, 200, 200, 0]] + bbox
                object_labels['label'].append({
                    'objectLabels': object_label,
                    'objectSelect': {'label': obj_class, 'value': obj_class},
                    'actionLabelsList': action_label_list,
                    'actionSelects': action_selects
                })
                bboxes['label'].append({'bboxes': bbox})

        record = {
            'video_id': video_id,
            'playlist_name': playlist_name,
            'frame_label': frame_labels,
            'object_label': object_labels,
            'bboxes': bboxes

        }
        records.append(record)
        print len(bboxes['label']), len(object_labels['label'])
    return records


def get_action_class_mapping():
    class_dict = {
        0: 'Alcohol Rub - No Attempt',
        1: 'Alcohol Rub - Insufficient Rub',
        2: 'Alcohol Rub - sufficient Rub',
        3: 'Soup and Water Wash - No Attempt',
        4: 'Soup and Water Wash - Insufficient Rub',
        5: 'Soup and Water Wash - sufficient Rub',
        6: 'Others'
    }
    return class_dict


def main(params):
    playlist_name = '10.100.100.100'
    input_file = os.path.join(params['data_dir'], params['input_file'])
    output_file = os.path.join(params['data_dir'], 'records.json')

    frames_dir = os.path.join(params['data_dir'], playlist_name, 'd_parsed')
    videos = [v for v in os.listdir(frames_dir) if v.find('0') != -1]
    sorted(videos)
    frame_counts = []
    for v in videos:
        v = os.path.join(frames_dir, v)
        frame_counts.append(len([f for f in os.listdir(v) if f.find('.jpg') != -1]))

    # obj_selects = read_json(params['options_config'])['object_options']
    action_options = get_action_class_mapping()
    frame_id_dict = get_frame_id_dict(input_file)
    obj_dict, video_ids = parse_labels(input_file, frame_id_dict, params)
    records = get_playlist_record(obj_dict, playlist_name, video_ids, frame_counts,
                                  action_options)
    records = {'records': records}
    write_json(records, output_file)

    print records


def test():
    parse_list()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument('-data_dir', default='../data',
                        help='Root directory where all data resides')
    parser.add_argument('-input_file', default='detections-17-17.txt',
                        help='Input filename')
    parser.add_argument('-options_config', default='../app/sql/configs/options.json',
                        help='Select options')
    parser.add_argument('-frame_per_video', default=500,
                        help='Number of frames per video')
    parser.add_argument('-frame_offset', default=6, help='Save per 6 frames')
    parser.add_argument('-video_per_playlist', default=10,
                        help='Number of videos per playlist')

    args = vars(parser.parse_args())
    main(args)
    # test()