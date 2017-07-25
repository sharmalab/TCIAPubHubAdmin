import pymongo
import xml.etree.ElementTree as ET
import urllib

dois=[]
collection = pymongo.MongoClient('localhost', 27017).TCIA.doi

urls = ["https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9TCIA.2017.SGW7CAQW",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9TCIA.2017.MURS5CL",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2017.KLXWJJ1Q",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2017.GJQ7R0EF",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2017.BD7SGWCA",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.YXOGLM4Y",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.YXGR4BLU",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.YU3RBCZN",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.XLWAN6NL",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.XHSOKCDC",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.VPTNRGFY",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.V6PBVTDR",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.TYGKKFMQ",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.TNB1KQBU",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.TLPMR1AM",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.SQ4M8YP4",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.RNYFUYE9",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.QHSYHJKY",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.PSJOXM47",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.NQF4GPN2",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.NDO1MDFQ",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.LXKQ47MS",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.L4LTD3TK",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.JQEJZZNG",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.JGNIHEP5",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.IMMQW8UQ",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.HJJHBOXZ",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.HDHPGJLK",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.GKJ0ZWAC",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.GDHL9KIM",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.FXL9SESS",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.FADS26KG",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.F7PPNPNU",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.ELN8YGLE",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.CX6YLSUX",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.AWORZ1FQ",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.ACWOGBEF",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.AB2NAZRP",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.9ZFRVF1B",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.8LNG8XDR",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.7O02S9CY",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.6FC8Z46U",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.6046GUDV",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.5DI84JS8",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2016.21JUEBH0",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.ZPUKHCKB",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.ZF0VLOPV",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.VOSN3HN1",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.UZLSU3FL",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.U1X8A5NR",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.SDNRQXXR",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.QWZMGFZJ",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.QKAQ5EY3",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.QJTV5IL5",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.PNVT2A29",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.PF0M9REI",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.ORBJKMUX",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.OFIP7TVM",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.O7UOJATQ",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.NWTESAY1",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.NPGZYZBZ",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.MI4QDDHU",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.M6VRPNYL",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.LO9QL9SX",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.L4FRET6Z",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.K0F5CGLI",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.ISOQTHKO",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.H1SXNUXL",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.GOJ0ZEJS",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.FTE8BOOJ",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.FOQEUJVT",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.AQIIDCNM",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.A6V7JIWX",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.9P42KSE6",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.8WG2KN4W",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.7GO2GSKS",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.7AKGJUPZ",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.588OZUZB",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.3BPE5WRQ",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.1BUVFJR7",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2015.08A1IXOO",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2014.X7ONY6B1",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2014.WIJJJPLM",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2014.V7CVH1JO",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2014.RJEFTJBU",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2014.K6M61GDW",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2014.IIRMBUNX",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2014.FAB7YRPZ",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2014.A2N1IXOX",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2014.8SIPIY6G",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2014.4HTXYRCN",
"https://ezid.cdlib.org/manage/display_xml/doi:10.7937/K9/TCIA.2014..UA0JGPDG"]


# for each url..
for target_url in urls:
    try:
        # get the xml
        xmltxt = urllib.urlopen(target_url).read()
        # get fields from the xml
        root = ET.fromstring(xmltxt)
        # make dict ready for insert
        doi = {}
        # get fields, with default
        prefix = "http://datacite.org/schema/kernel-3"
        prefix = root.findall(".")[0].tag.split("{")[1].split("}")[0]
        try:
            abstract = root.find("{"+prefix+"}descriptions")[0].text
        except:
            abstract = "NO ABSTRACT FOUND"
        try:
            authors = [author[0].text for author in
                        root.find("{"+prefix+"}creators").findall('{http://datacite.org/schema/kernel-3}creator')]
        except:
            authors = "NO AUTHORS FOUND"
        try:
            publisher = root.find("{"+prefix+"}publisher").text
        except:
            publisher = "NO PUBLISHER FOUND"
        try:
            pubyr = root.find("{"+prefix+"}publicationYear").text
        except:
            pubyr = "NO PUBLICATION YEAR FOUND"
        try:
            resType = root.find("{"+prefix+"}resourceType").text
        except:
            resType = "NO TYPE FOUND"
        try:
            title = root.find("{"+prefix+"}titles")[0].text
        except:
            title = "NO TITLE FOUND"
        doiid = root.find("{"+prefix+"}identifier").text

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
        #collection.insert_one(post).inserted_id
    except BaseException as e:
        print e
        print "[ERRORED]" + target_url
