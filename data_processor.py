import pandas as pd
from datetime import datetime

def process_historical_data(data):
    """Process historical data for visualization"""
    if not data:
        return pd.DataFrame()
    
    records = []
    for record_id, record in data.items():
        records.append({
            'timestamp': datetime.strptime(record['timestamp'], '%Y-%m-%d %H:%M:%S'),
            'fillLevel': record['fillLevel'],
            'airQuality': record['airQuality']
        })
    
    df = pd.DataFrame(records)
    df = df.sort_values('timestamp')
    return df

def get_fill_level_color(fill_level):
    """Return color based on fill level"""
    if fill_level <= 50:
        return "green"
    elif fill_level <= 80:
        return "orange"
    else:
        return "red"

def should_alert(fill_level):
    """Check if alert should be shown"""
    return fill_level >= 90
