import json, sys, xml.dom.minidom, urllib
from xml.etree import ElementTree
from xml.etree.ElementTree import Element, tostring
from collections import OrderedDict
from lxml import etree


def validate(xml_doc, xml_schema_url):
    """Validate XML document against XML schema given by url
    :type xml_doc: str
    :type xml_schema_url: str
    """

    u = urllib.urlopen(xml_schema_url)
    xml_schema_data = u.read()
    xml_schema_doc = etree.XML(xml_schema_data)
    xml_schema = etree.XMLSchema(xml_schema_doc)
    xml_doc = etree.XML(xml_doc)
    try:
        xml_schema.assertValid(xml_doc)    # If validation fails, exception is raised
    except Exception, e:
        print("Invalid")
        raise e
    else:
        pass


def build(root, obj):
    """Build the XML document tree from a Python dictionary recursively
    :type root: Element
    :type obj: dict
    """

    if isinstance(obj, dict):
        for k in obj.keys():
            v = obj[k]
            if k == "ATTR":
                for attr_k, attr_v in v.items():
                  root.set(attr_k, attr_v)    # if key is "ATTR", set attributes for the current element/tag
            else:
                if k == "VAL":
                    build(root, v)    # If key is "VAL", then the current element's text will be the value
                else:
                    child = Element(k)
                    build(child, v)
                    root.append(child)
    if isinstance(obj, list):
        for item in obj:
            build(root, item)
    elif isinstance(obj, str) or isinstance(obj, basestring):
        root.text = obj
    return


def convert():
    """Convert JSON to XML
    """

    sample_string = """
    {
      "identifier": {
        "VAL": "10.7937\/K9\/TCIA.2016.FADS26KG",
        "ATTR": {"identifierType": "DOI"}
      },
      "creators": [
        {
          "creator": {
            "creatorName": "Fedorov, Andriy"
          }
        },
        {
          "creator": {
            "creatorName": "Tempany, Clare"
          }
        }
      ],
      "titles": [
        {
          "title": "Data From QIN PROSTATE"
        }
      ],
      "publisher": "The Cancer Imaging Archive",
      "publicationYear": "2016",
      "contributors": [
        {
          "contributor": {
            "contributorName": "TCIA Team",
            "affiliation": "The Cancer Imaging Archive",
            "ATTR": {"contributorType": "DataCurator"}
          }
        }
      ],
      "resourceType": {
        "VAL": "DICOM",
        "ATTR": {"resourceTypeGeneral": "Dataset"}
      },
      "relatedIdentifiers": [
        {
          "relatedIdentifier": {
            "VAL": "24560287",
            "ATTR": {"relationType": "IsSupplementTo", "relatedIdentifierType": "PMID"}
          }
        },
        {
          "relatedIdentifier": {
            "VAL": "10.1016/j.mri.2014.01.004",
            "ATTR": {"relationType": "IsSupplementTo", "relatedIdentifierType": "DOI"}
          }
        }
      ],
      "descriptions": [
        {
          "description": {
            "VAL": "This collection contains multiparametric MRI images collected for the purposes of detection...",
            "ATTR": {"descriptionType": "Abstract"}
          }
        }
      ]
    }
    """

    #obj = json.loads(sample_string, object_pairs_hook=OrderedDict)    # Use sample_string as input
    obj = json.load(sys.stdin, object_pairs_hook=OrderedDict)    # Read JSON data from standard input into dictionary
    root = Element("resource", attrib={"xmlns":"http://datacite.org/schema/kernel-3",
                                       "xmlns:xsi":"http://www.w3.org/2001/XMLSchema-instance",
                                       "xsi:schemaLocation":"http://datacite.org/schema/kernel-3" + " " +
                                       "http://schema.datacite.org/meta/kernel-3/metadata.xsd"})    # Create XML root element. This is constant.
    build(root, obj)    # Build XML document tree from dictionary
    xml_doc = ElementTree.tostring(root)
    ignore, xml_schema_url = root.attrib.get("xsi:schemaLocation").split()
    validate(xml_doc, xml_schema_url)    # Validate XML document against XML schema
    parsed = xml.dom.minidom.parseString(xml_doc)
    print parsed.toprettyxml()    # Pretty print XML document to standard output


if __name__ == '__main__':
    convert()
