import json, sys, xml.dom.minidom
from xml.etree import ElementTree
from xml.etree.ElementTree import Element, tostring
from collections import OrderedDict


def build(root, obj):
    """Build an XML string from a Python dictionary recursively
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
                    build(root, v)     # If key is "VAL", then the current element's text will be the value
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
          "relatedIdentifer": {
            "VAL": "24560287",
            "ATTR": {"relationType": "IsSupplementTo", "relatedIdentifierType": "PMID"}
          }
        },
        {
          "relatedIdentifer": {
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

    """Sample XML output:
    <?xml version="1.0"?>
    <resource xmlns="http://datacite.org/schema/kernel-3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://datacite.org/schema/kernel-3 http://schema.datacite.org/meta/kernel-3/metadata.xsd">
      <identifier identifierType="DOI">10.7937/K9/TCIA.2016.FADS26KG</identifier>
      <creators>
        <creator>
          <creatorName>Fedorov, Andriy</creatorName>
        </creator>
        <creator>
          <creatorName>Tempany, Clare</creatorName>
        </creator>
      </creators>
      <titles>
        <title>Data From QIN PROSTATE</title>
      </titles>
      <publisher>The Cancer Imaging Archive</publisher>
      <publicationYear>2016</publicationYear>
      <contributors>
        <contributor contributorType="DataCurator">
          <contributorName>TCIA Team</contributorName>
          <affiliation>The Cancer Imaging Archive</affiliation>
        </contributor>
      </contributors>
      <resourceType resourceTypeGeneral="Dataset">DICOM</resourceType>
      <relatedIdentifiers>
        <relatedIdentifer relatedIdentifierType="PMID" relationType="IsSupplementTo">24560287</relatedIdentifer>
        <relatedIdentifer relatedIdentifierType="DOI" relationType="IsSupplementTo">10.1016/j.mri.2014.01.004</relatedIdentifer>
      </relatedIdentifiers>
      <descriptions>
        <description descriptionType="Abstract">This collection contains multiparametric MRI images collected for the purposes of detection...</description>
      </descriptions>
    </resource>
    """

    # obj = json.loads(sample_string, object_pairs_hook=OrderedDict) # Use sample_string as input

    obj = json.load(sys.stdin, object_pairs_hook=OrderedDict)     # Read JSON data from standard input into dictionary
    root = Element("resource", attrib={"xmlns":"http://datacite.org/schema/kernel-3", "xmlns:xsi":"http://www.w3.org/2001/XMLSchema-instance", "xsi:schemaLocation":"http://datacite.org/schema/kernel-3 http://schema.datacite.org/meta/kernel-3/metadata.xsd"})     # Create XML root element. This is constant.
    build(root, obj)     # Build XML string from dictionary
    parsed = xml.dom.minidom.parseString(ElementTree.tostring(root))
    print parsed.toprettyxml()     # Write and format XML string to standard output


if __name__ == '__main__':
    convert()


