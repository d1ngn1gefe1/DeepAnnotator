#!/usr/bin/python
import sys
import logging
logging.basicConfig(stream=sys.stderr)
sys.path.insert(0, "/home/bpeng/DeepAnnotator/public/")

from app import app as application
import os
application.secret_key = os.urandom(12)
