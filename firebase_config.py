import firebase_admin
from firebase_admin import credentials, db
import os

def initialize_firebase():
    """Initialize Firebase connection"""
    try:
        # Using environment variable for Firebase credentials
        cred = credentials.Certificate(
            os.getenv('FIREBASE_CREDENTIALS', 'firebase-credentials.json')
        )
        firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://smart-bin-fb214-default-rtdb.asia-southeast1.firebasedatabase.app'
        })
    except Exception as e:
        raise Exception(f"Failed to initialize Firebase: {str(e)}")

def get_current_data():
    """Get current dustbin data"""
    try:
        ref = db.reference('/dustbin')
        return ref.get()
    except Exception as e:
        raise Exception(f"Failed to fetch current data: {str(e)}")

def get_historical_data():
    """Get historical records"""
    try:
        ref = db.reference('/history/records')
        return ref.get()
    except Exception as e:
        raise Exception(f"Failed to fetch historical data: {str(e)}")
