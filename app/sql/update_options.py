import datetime
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from init_tables import *

# Contact admin if config files don't exist
CONFIG = 'configs/config.json'
OPTION_CONFIG = 'configs/options.json'


def read_json(data_path):
  with open(data_path, 'r') as fp:
    return json.load(fp)

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
    num_rows_deleted = session.query(OptionInfo).delete()
    session.commit()
except:
    session.rollback()

# Insert users to table
options = read_json(OPTION_CONFIG)
frame_options = OptionInfo('frame_options', json.dumps(options['frame_options']))
object_options = OptionInfo('object_options', json.dumps(options['object_options']))
action_options = OptionInfo('action_options', json.dumps(options['action_options']))
session.add(frame_options)
session.add(object_options)
session.add(action_options)

# commit the record of the database
session.commit()
