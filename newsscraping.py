from splinter import Browser
from bs4 import BeautifulSoup as bs
import time
from pprint import pprint
import pandas as pd
import requests
import os


def init_browser():
    # @NOTE: Replace the path with your actual path to the chromedriver
    executable_path = {"executable_path": "chromedriver"}
    return Browser("chrome", **executable_path, headless=True)

def scrape_news(browser):
    NPR_MUSIC_NEWS_URL = "https://www.npr.org/sections/music-news/"
    NPR_MUSIC_BASE_URL = "https://www.npr.org/music/"


    browser.visit(NPR_MUSIC_NEWS_URL)
    time.sleep(2)

    news_html = browser.html
    news_soup = bs(news_html, "html.parser")
    items = news_soup.findAll('article', class_='item')

    news = []
    for index, item in enumerate(items):
        news_text = item.find('p', class_='teaser').find('a').text
        news_title = item.find("h2", class_="title").text
        news_href = item.find("h2", class_="title").find('a')['href']
        news_img = NPR_MUSIC_BASE_URL + item.find("img", class_="respArchListImg")['src']
        news.append({"title": news_title, "href": news_href, "teaser": news_text, "image":news_img})
        if index > 5:
            break
        #print(news_title)
        #print(news_img)
        #print(news_text)
        #print(news_href)

    return news

def scrape_info():
    # Initialize Browser
    browser = init_browser()

    # Scrape News Links
    news = scrape_news(browser)

    #print(news)
    df = pd.DataFrame(news)
    df.to_csv(os.path.join('data', 'news.csv'), index=False)

    # Quit the browser after scraping
    browser.quit()

    #print(df.head())

if __name__ == '__main__':
    scrape_info()