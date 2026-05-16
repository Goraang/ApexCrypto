import streamlit as st
import yfinance as yf
import plotly.graph_objects as go
import time

# Set up the web page layout
st.set_page_config(page_title="Live Market Tracker", layout="wide")
st.title("Real-Time Stock Market Dashboard")
st.write("This dashboard refreshes automatically every minute.")

# Create an empty placeholder where our chart will live
chart_placeholder = st.empty()

# Tracking Hindustan Copper on the Indian National Stock Exchange (NSE)
ticker_symbol = "BTC-USD"
# The infinite loop that creates the "Real-Time" effect
while True:
    # 1. Fetch today's data ('1d') at 1-minute intervals ('1m')
    ticker_data = yf.Ticker(ticker_symbol)
    df = ticker_data.history(period="1d", interval="1m")
    
    if not df.empty:
        # 2. Build the Candlestick Chart
        fig = go.Figure(data=[go.Candlestick(
            x=df.index,
            open=df['Open'],
            high=df['High'],
            low=df['Low'],
            close=df['Close'],
            name='Live Price'
        )])
        
        # 3. Format the layout for the web app
        fig.update_layout(
            title=f'Live 1-Minute Chart: {ticker_symbol}',
            yaxis_title='Price (₹)',
            xaxis_title='Time (IST)',
            template='plotly_white',
            height=600,
            xaxis_rangeslider_visible=False # Hides the bottom slider for a cleaner look
        )
        
        # 4. Inject the updated chart into the webpage placeholder
        chart_placeholder.plotly_chart(fig, use_container_width=True)
    
    # 5. Pause the script for 60 seconds before fetching the next minute's data
    time.sleep(60)
