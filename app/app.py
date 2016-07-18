# import the Flask class from the flask module
from flask import Flask, render_template, redirect, url_for, request, session, flash
from functools import wraps
from sqlalchemy.orm import sessionmaker
from sql.init_tables import *
import argparse
import os

# create the application object
app = Flask(__name__)


# login required decorator
def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'logged_in' in session:
            return f(*args, **kwargs)
        else:
            flash('You need to login first.')
            return redirect(url_for('login'))
    return wrap

# use decorators to link the function to a url
@app.route('/')
@login_required
def home():
    return render_template('index.html')  # render a template


@app.route("/<sensor_id>/", methods=["GET"])
def get_request(sensor_id):
    """
    Handle GET request to - /<sensor_id>/
    Return a list of labeled video ids
    """
    videos = Video.query.all()

    data = [ video.id for video in videos ]
    response = make_response(json.dumps(data))
    response.content_type = 'application/json'
    return response


# route for handling the login page logic
@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        POST_USERNAME = str(request.form['username'])
        POST_PASSWORD = str(request.form['password'])

        Session = sessionmaker(bind=engine)
        s = Session()
        query = s.query(User).filter(User.username.in_([POST_USERNAME]),
                                     User.password.in_([POST_PASSWORD]))
        result = query.first()
        if result:
            session['logged_in'] = True
            return redirect(url_for('home'))
        else:
            error = 'Invalid Credentials. Please try again.'
    return render_template('login.html', error=error)


@app.route('/logout')
@login_required
def logout():
    session.pop('logged_in', None)
    return render_template('logout.html')


# start the server with the 'run()' method
if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', default=5000, type=int,
                        help='Specify port number for the server')
    args = parser.parse_args()
    params = vars(args)

    app.secret_key = os.urandom(12)
    app.run(host='0.0.0.0', port=int(params['port']), debug=True, threaded=True)
