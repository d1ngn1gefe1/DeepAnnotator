import datetime
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from init_tables import *

# Contact admin if config files don't exist
CONFIG = 'configs/config.json'
USER_CONFIG = 'configs/users.json'


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
    num_rows_deleted = session.query(User).delete()
    session.commit()
except:
    session.rollback()

# Insert users to table
users = read_json(USER_CONFIG)
for username, password in users.iteritems():
    user = User(username, password)
    session.add(user)

# commit the record of the database
session.commit()
