from sqlalchemy import create_engine, ForeignKey
from sqlalchemy import Column, Date, Integer, String
from sqlalchemy.ext.declarative import declarative_base
import json


# Contact admin if config files don't exist
CONFIG = 'sql/configs/config.json'


def read_json(data_path):
  with open(data_path, 'r') as fp:
    return json.load(fp)


# Connect to a database
config = read_json(CONFIG)
db = config['database']
db_password = config['db_password']
mysql = 'mysql://root:'+db_password+'@localhost/'+db
engine = create_engine(mysql, echo=True)

Base = declarative_base()


class User(Base):
    """"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(20))
    password = Column(String(20))

    def __init__(self, username, password):
        """"""
        self.username = username
        self.password = password


class Video(Base):
    """"""
    __tablename__ = "videos"

    video_id = Column(String(20), primary_key=True)
    playlist_name = Column(String(100), primary_key=True)
    frame_label = Column(String(1000))
    object_label = Column(String(10000))
    bboxes = Column(String(40000))

    #----------------------------------------------------------------------
    def __init__(self, video_id, playlist_name, frame_label, object_label,
        bboxes):
        """"""
        self.video_id = video_id
        self.playlist_name = playlist_name
        self.frame_label = frame_label
        self.object_label = object_label
        self.bboxes = bboxes


class OptionInfo(Base):
    """"""
    __tablename__ = "options"

    option_name = Column(String(100), primary_key=True)
    options = Column(String(1000))

    #----------------------------------------------------------------------
    def __init__(self, option_name, options):
        """"""
        self.option_name = option_name
        self.options = options


# create tables
Base.metadata.create_all(engine)
