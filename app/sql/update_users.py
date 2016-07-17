import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from init_users import *

engine = create_engine('mysql://root:153399345@localhost/deep_annotator', echo=True)

# create a Session
Session = sessionmaker(bind=engine)
session = Session()

user = User("admin","admin")
session.add(user)

# commit the record of the database
session.commit()
