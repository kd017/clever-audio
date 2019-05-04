from splinter import Browser
from bs4 import BeautifulSoup as bs
import time
from pprint import pprint
import pandas as pd
import requests
from sqlalchemy import create_engine


def init_browser():
    # @NOTE: Replace the path with your actual path to the chromedriver
    executable_path = {"executable_path": "chromedriver"}
    return Browser("chrome", **executable_path, headless=True)

def scrape_news(browser):
    NPR_MUSIC_NEWS_URL = "https://www.npr.org/sections/music-news/"
    NPR_MUSIC_BASE_URL = "https://www.npr.org/music/"
    GRAMMY_NEWS_URL =  "https://www.grammy.com/grammys/news"
    GRAMMY_BASE_URL = "https://www.grammy.com"
   


    browser.visit(NPR_MUSIC_NEWS_URL)
    time.sleep(2)

    news_html = browser.html
    news_soup = bs(news_html, "html.parser")
    item = news_soup.find('article', class_='item')

#     news = []
#     all_news_slide = news_soup.findAll("li", class_="slide")
#     for index, news_slide in enumerate(all_news_slide):
#news_href = NPR_MUSIC_BASE_URL + news_slide.find('a')['href']
    news_title = item.find("h2", class_="title").text
    news_img = NPR_MUSIC_BASE_URL + item.find("img", class_="respArchListImg")['src']
    print(news_title)
    print(news_img)
    #print(item_info_wrap)
#        news_p = https://www.npr.org/sections/music-news/
#        news_img = NPR_MUSIC_BASE_URL + news_slide.find("div", class_="list_image").find('img')['src']
#        news.append({"title": news_title, "href": news_href, "teaser": news_p, "image":news_img})
#        if index > 5:
#            break

#     return news

# browser.visit(GRAMMY_NEWS_URL)
#     time.sleep(2)

#     news_html = browser.html
#     news_soup = bs(news_html, "html.parser")

#     news = []
#     all_news_slide = news_soup.findAll("li", class_="slide")
#     for index, news_slide in enumerate(all_news_slide):
#        news_href = GRAMMY_BASE_URL + news_slide.find('a')['href']
#        news_title = news_slide.find("div", class_="content_title").text
#        news_p = news_slide.find("div", class_="article_teaser_body").text
#        news_img = GRAMMY_BASE_URL + news_slide.find("div", class_="list_image").find('img')['src']
#        news.append({"title": news_title, "href": news_href, "teaser": news_p, "image":news_img})
#        if index > 5:
#            break

    #return news


def scrape_info():
    # Initialize Browser
    browser = init_browser()

    # Scrape News Links
    news = scrape_news(browser)

    # Quit the browser after scraping
    browser.quit()

    # Write to database
    #df = pd.DataFrame(news)
    #engine = create_engine('sqlite:///db/scraped_content.sqlite', echo=False)
    #df.to_sql('NEWS', if_exists='replace', con=engine, index=True)

    #print(df.head())

if __name__ == '__main__':
    scrape_info()