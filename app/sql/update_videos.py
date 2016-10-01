import os
from sqlalchemy.orm import sessionmaker
from init_tables import *

# Contact admin if config files don't exist
CONFIG = 'configs/config.json'


def read_json(data_path):
    with open(data_path, 'r') as fp:
        return json.load(fp)


def byteify(input):
    if isinstance(input, dict):
        return {byteify(key): byteify(value)
                for key, value in input.iteritems()}
    elif isinstance(input, list):
        return [byteify(element) for element in input]
    elif isinstance(input, unicode):
        return input.encode('utf-8')
    else:
        return input


def trim(str):
    str = str.replace(" ", "")
    str = str.replace("\'", "\"")
    return str


# Connect to a database
config = read_json(CONFIG)
db = config['database']
db_password = config['db_password']
mysql = 'mysql://root:'+db_password+'@localhost/'+db
engine = create_engine(mysql, echo=True)

# Create a Session
Session = sessionmaker(bind=engine)
session = Session()

# Clear table
try:
    num_rows_deleted = session.query(Video).delete()
    session.commit()
except:
    session.rollback()


debug = False

if not debug:
    # Insert videos to table
    data_dir = '/home/cvpr_data/files0928'    
    playlists = [d for d in os.listdir(data_dir) if d.find('10.') != -1] 
    for p in playlists:
        record_path = os.path.join(data_dir, p, 'records.json')
	if os.path.exists(record_path):
            records = read_json(record_path)
            records = byteify(records)
            videos = records['records']

            for v in videos:
                print len(str(v['bboxes']))
                video = Video(
                    str(v['video_id']),
                    v['playlist_name'],
                    trim(str(v['frame_label'])),
                    trim(str(v['object_label'])),
                    trim(str(v['bboxes']))
                )
                session.add(video)
else:
    # test
    frame_labels = {'label': []}
    object_labels = {'label': [
        {"objectLabels": [[0,63,1],[64,72,0],[73,258,1]],
         "objectSelect": {"value":"Doctor","label":"Doctor"},
         "actionSelects": [],
         "actionLabelsList": []}
    ]}
    bboxes = {'label': [
        {"bboxes": [[100, 100, 200, 200, 0], [566, 230, 626, 270, 36],
                    [542, 128, 626, 276, 37], [480, 112, 628, 284, 38],
                    [406, 14, 626, 286, 39], [378, 2, 626, 322, 40],
                    [240, 20, 512, 420, 41], [176, 106, 396, 458, 42],
                    [46, 140, 302, 444, 43], [26, 148, 270, 444, 44],
                    [26, 158, 270, 434, 45], [26, 164, 254, 448, 46],
                    [26, 168, 258, 448, 47], [16, 164, 244, 436, 48],
                    [2, 142, 238, 390, 49], [2, 112, 206, 360, 50],
                    [2, 176, 102, 320, 51], [2, 194, 98, 270, 52]]}
        ]}

    video = Video(
        str(1),
        '10.100.100.100',
        trim(str(frame_labels)),
        trim(str(object_labels)),
        trim(str(bboxes))
    )

    session.add(video)

# commit the record of the database
session.commit()
