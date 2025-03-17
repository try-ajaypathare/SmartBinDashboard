import streamlit as st
import plotly.express as px
import time
from datetime import datetime
from firebase_config import initialize_firebase, get_current_data, get_historical_data
from data_processor import process_historical_data, get_fill_level_color, should_alert

# Page configuration
st.set_page_config(
    page_title="SmartBin Dashboard",
    page_icon="🗑️",
    layout="wide"
)

# Initialize Firebase
try:
    initialize_firebase()
except Exception as e:
    st.error(f"Failed to initialize Firebase: {str(e)}")
    st.stop()

def create_metrics():
    try:
        current_data = get_current_data()
        
        # Display current metrics
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Fill Level", f"{current_data['fillLevel']}%")
            if should_alert(current_data['fillLevel']):
                st.warning("⚠️ Bin nearly full! Please empty soon.")
        
        with col2:
            st.metric("Air Quality", current_data['airQuality'])
        
        with col3:
            st.metric("Location", current_data['location'])
        
        # Fill level progress bar
        st.progress(current_data['fillLevel'] / 100, 
                   text=f"Fill Level: {current_data['fillLevel']}%")
        
    except Exception as e:
        st.error(f"Error fetching current data: {str(e)}")

def create_historical_charts():
    try:
        historical_data = get_historical_data()
        if not historical_data:
            st.info("No historical data available")
            return
        
        df = process_historical_data(historical_data)
        
        # Fill Level Timeline
        fig_fill = px.line(df, 
                          x='timestamp', 
                          y='fillLevel',
                          title='Fill Level History')
        st.plotly_chart(fig_fill, use_container_width=True)
        
        # Latest Records Table
        st.subheader("Recent Records")
        st.dataframe(
            df.tail(10)[['timestamp', 'fillLevel', 'airQuality']]
            .sort_values('timestamp', ascending=False)
        )
        
    except Exception as e:
        st.error(f"Error creating historical charts: {str(e)}")

def main():
    st.title("🗑️ SmartBin Monitoring Dashboard")
    
    # Add auto-refresh functionality
    with st.empty():
        while True:
            create_metrics()
            create_historical_charts()
            time.sleep(30)  # Refresh every 30 seconds
            st.rerun()

if __name__ == "__main__":
    main()
