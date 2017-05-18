import pymongo
import xml.etree.ElementTree as ET
import urllib

dois=[]
collection = pymongo.MongoClient('localhost', 27017).db.collection
urls = ["https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9TCIA.2017.MURS5CL"]
# for each url..
for target_url in urls:
    # get the xml
    xmltxt = urllib.urlopen(target_url).read()
    # get fields from the xml
    root = ET.fromstring(xmltxt)
    # make dict ready for insert
    doi = {}
    # get fields
    abstract = root.find("{http://datacite.org/schema/kernel-3}descriptions")[0].text
    authors = [author[0].text for author in
                root.find("{http://datacite.org/schema/kernel-3}creators").findall('{http://datacite.org/schema/kernel-3}creator')]
    publisher = root.find("{http://datacite.org/schema/kernel-3}publisher").text
    pubyr = root.find("{http://datacite.org/schema/kernel-3}publicationYear").text
    resType = root.find("{http://datacite.org/schema/kernel-3}resourceType").text
    title = root.find("{http://datacite.org/schema/kernel-3}titles")[0].text
    doiid = root.find("{http://datacite.org/schema/kernel-3}identifier").text
    doiurl = "https://doi.org/" + doiid
    # set fields
    post = {"title":title,
            "authors":authors,
            "url":doiurl,
            "description":abstract,
            "year":pubyr,
            "doi":doiurl,
            "publisher":publisher
            }
    collection.insert_one(post).inserted_id

    # TODO consider using curl to bindas instead of mongo directly
