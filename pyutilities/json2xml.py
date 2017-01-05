#!/usr/bin/python
# -*- coding: utf-8 -*-

import json
import sys
import xml.dom.minidom
#import urllib

from xml.etree import ElementTree
from xml.etree.ElementTree import Element, tostring
from collections import OrderedDict
from lxml import etree    # lxml is a third-party library: http://lxml.de/


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
    except Exception, e:    # If validation fails, exception is forcefully raised
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
    elif isinstance(obj, basestring):
        root.text = obj


def convert():
    """Convert JSON to XML.
    """

    sample_string = ("""
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
            "VAL": "This collection contains multiparametric MRI images collected for the purposes of detection and/or staging of prostate cancer. The MRI parameters include T1- and T2-weighted sequences as well as Diffusion Weighted and Dynamic Contrast-Enhanced MRI. The images were obtained using endorectal and phased array surface coils at 3.0T (GE Signa HDx 15.0) The value of this collection is to provide clinical image data for the development and evaluation of quantitative methods for prostate cancer characterization using multiparametric MRI. Data was provided by Brigham and Women's Hospital, PI Dr. Fiona Fennessy. MR imaging exam was performed on a GE Signa HDx 3.0 T magnet (GE Healthcare, Waukesha, WI) using a combination of 8-channel abdominal array and endorectal coil (Medrad, Pittsburgh, PA). The MR sequences included T1- and T2-weighted imaging, diffusion weighted (DW) imaging, and DCE MRI. T1-weighted imaging was performed with a spoiled gradient recalled echo (SPGR) sequence with TR/TE/α = 385 ms/6.2 ms/65° over a (16 cm)2 field of view (FOV). T2-weighted imaging was performed with a FRFSE (Fast Recovery Fast Spin Echo) sequence with TR/TE = 3500/102 ms, FOV = (16 cm)2. A DW echo planar imaging sequence with trace diffusion sensitization and b-values of 0 and 500 s/mm2, and TR/TE = 2500/65 ms provided data for an Apparent Diffusion Coefficient (ADC) map. Finally, DCE MRI utilized a 3D SPGR sequence with TR/TE/α = 3.6 ms/1.3 ms/15°, FOV = (26 cm)2, with full gland coverage and reconstructed image voxel size of 1×1×6 mm (interpolated to 256×256 matrix). DCE MRI frames were acquired at approximately 5 s intervals (the number of frames varied between 12 and 16 slices resulting in the time resolution between 4.4 and 5.3 seconds) to achieve a clinically appropriate compromise between spatial and temporal resolutions. Gadopentetate dimeglumine (Magnevist, Berlex Laboratories, Wayne, New Jersey) was injected intravenously using a syringe pump (0.15 mmol/kg) at the rate of 3 ml/s followed by 20 ml saline flush at the same rate. The protocol included ~ 5 baseline scans prior to contrast injection for estimation of baseline tissue properties.",
            "ATTR": {"descriptionType": "Abstract"}
          }
        }
      ]
    }
    """)

    #  Use sample_string as input
    #obj = json.loads(sample_string, object_pairs_hook=OrderedDict)

    # Read JSON data from standard input into dictionary
    obj = json.loads(sys.stdin.read().decode('utf-8'), object_pairs_hook=OrderedDict)

    # Create XML root element. This is constant.
    root = Element("resource", attrib={"xmlns":"http://datacite.org/schema/kernel-3",
                                       "xmlns:xsi":"http://www.w3.org/2001/XMLSchema-instance",
                                       "xsi:schemaLocation":"http://datacite.org/schema/kernel-3" + " " +
                                       "http://schema.datacite.org/meta/kernel-3/metadata.xsd"})

    # Build XML document tree from dictionary
    build(root, obj)
    xml_doc = tostring(root, encoding="utf-8")

    # Validate XML document against XML schema
    #ignore, xml_schema_url = root.attrib.get("xsi:schemaLocation").split()
    xsd_file_name = "include/metadata.xsd"
    validate(xml_doc, xsd_file_name)

    # Write XML document containing XML declaration to standard output
    ElementTree.ElementTree(root).write(sys.stdout, encoding="utf-8", xml_declaration=True)

    # Write XML document not containing XML declaration to standard output
    #sys.stdout.write(xml_doc)

    # Write pretty formatted XML document to standard output
    #parsed = xml.dom.minidom.parseString(xml_doc)
    #sys.stdout.write(parsed.toprettyxml().encode('utf-8'))


if __name__ == '__main__':
    convert()