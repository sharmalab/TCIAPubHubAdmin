#!/usr/bin/python
# -*- coding: utf-8 -*-

import json
import sys
import xml.dom.minidom
from xml.etree import ElementTree
from xml.etree.ElementTree import Element, tostring
from collections import OrderedDict

from lxml import etree    # http://lxml.de/


def validate(xml_doc, xsd_file_name):
    """Validate XML document against XML schema given by url.

    :type xml_doc: str
    :type xml_schema_url: str

    Note that surprisngly, the ordering of XML elements matter.
    For example, <contributorName> must precede <affiliation>.
    """

    with open(xsd_file_name, "r") as xsdf:
        xml_schema_data = xsdf.read()
    xml_schema_doc = etree.XML(xml_schema_data)
    xml_schema = etree.XMLSchema(xml_schema_doc)
    xml_doc = etree.XML(xml_doc)
    try:
        xml_schema.assertValid(xml_doc)
    except Exception, e:    # If validation fails, re-raise exception
        print("Invalid")
        raise e
    else:
        pass


def build(root, obj):
    """Build the XML document tree from a Python dictionary recursively.

    :type root: Element
    :type obj: dict
    """

    if isinstance(obj, dict):
        for k in obj.keys():
            v = obj[k]
            if k == "ATTR":
                for attr_k, attr_v in v.items():
                    # If key is "ATTR", set attributes 
                    # for the current element/tag
                    root.set(attr_k, attr_v)
            else:
                if k == "VAL":
                    # If key is "VAL", then the current 
                    # element's text will be the value
                    build(root, v)
                else:
                    child = Element(k)
                    build(child, v)
                    root.append(child)
    if isinstance(obj, list):
        for item in obj:
            build(root, item)
    elif isinstance(obj, basestring):
        root.text = obj


def convert():
    """Convert JSON to XML.
    """

    #with open("sample.json") as f:
    #   sample_input = f.read()
    #  Use sample.json as input
    #obj = json.loads(sample_input, object_pairs_hook=OrderedDict)

    # Read JSON data from standard input into dictionary
    obj = json.loads(sys.stdin.read().decode('utf-8'), \
                     object_pairs_hook=OrderedDict)

    # Create XML root element. This is constant.
    root = Element("resource", \
                   attrib={
                        "xmlns": "http://datacite.org/schema/kernel-3",
                        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
                        "xsi:schemaLocation": "http://datacite.org/schema/kernel-3"
                         + " http://schema.datacite.org/meta/kernel-3/metadata.xsd"
                   })

    # Build XML document tree from dictionary
    build(root, obj)
    xml_doc = tostring(root, encoding="utf-8")

    # Validate XML document against XML schema
    #_, xml_schema_url = root.attrib.get("xsi:schemaLocation").split()
    xsd_file_name = "include/metadata.xsd"
    validate(xml_doc, xsd_file_name)

    # Write XML document containing XML declaration to standard output
    #ElementTree.ElementTree(root).write(sys.stdout, encoding="utf-8", xml_declaration=True)

    # Write XML document not containing XML declaration to standard output
    sys.stdout.write(xml_doc)

    # Write pretty formatted XML document to standard output
    #parsed = xml.dom.minidom.parseString(xml_doc)
    #sys.stdout.write(parsed.toprettyxml().encode('utf-8'))


if __name__ == '__main__':
    convert()
