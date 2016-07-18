from sqlalchemy import *
from sqlalchemy import create_engine, ForeignKey
from sqlalchemy import Column, Date, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref
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

    id = Column(String(20), primary_key=True)
    is_labeled = Column(Integer)
    frame_label = Column(String(1000))
    object_label = Column(String(1000))

    #----------------------------------------------------------------------
    def __init__(self, id, is_labeled, frame_label, object_label):
        """"""
        self.id = id
        self.is_labeled = is_labeled
        self.frame_label = frame_label
        self.object_label = object_label


# create tables
Base.metadata.create_all(engine)
