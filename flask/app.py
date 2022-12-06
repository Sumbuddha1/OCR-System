import re
import argparse
import json
import os
import requests
import hashlib
from datetime import datetime
from werkzeug.utils import secure_filename

import cv2
import pytesseract
import numpy as np
import img2pdf
import tensorflow as tf
from pytesseract import Output
from pdf2image import convert_from_path
from flask import Flask, request
from flask_cors import CORS

from predictor import Predictor
from fpdf import FPDF
from PIL import Image


from doc_extract import Extractor
from cbr_dia import CBR
from prepare_data import Preparer
from trainer import Trainer
from InvoiceNet.invoicenet import FIELDS

app = Flask(__name__)
app.config["imageupload"] = "./imgupload"
app.config["allowed_ext"] = ['PNG', 'JPEG', 'JPG', 'PDF']
cors = CORS(app)
today = datetime.today()
demo = False


options = list(FIELDS.keys())

def type_check(file):
    ext = file.split('.')[-1]
    if ext.upper() in app.config['allowed_ext']:
        return True, ext
    return False

def deskew(image):
    coords = np.column_stack(np.where(image>0))
    angle = cv2.minAreaRect(coords)[-1]
    if angle < 45:
        angle = -(90 + angle)
    else:
        angle = -angle
    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(image, M, (w, h),
                            flags=cv2.INTER_CUBIC,
                            borderMode=cv2.BORDER_REPLICATE)
    return rotated

def ocr_image_to_dict(img):
    ocr_data = pytesseract.image_to_data(img, output_type=Output.DICT)
    return ocr_data

def get_values(ocr_data):
    date_pattern = '^((31(?!\-(Feb(ruary)?|Apr(il)?|June?|(Sep(?=\b|t)t?|Nov)(ember)?)))|((30|29)(?!\ Feb(ruary)?))|(29(?=\ Feb(ruary)?\-(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00)))))|(0?[1-9])|1\d|2[0-8])\-(Jan(uary)?|Feb(ruary)?|Ma(r(ch)?|y)|Apr(il)?|Ju((ly?)|(ne?))|Aug(ust)?|Oct(ober)?|(Sep(?=\b|t)t?|Nov|Dec)(ember)?)\-((1[6-9]|[2-9]\d)\d{2})$'
    price_pattern = '[$][0-9]{1,3}[,]*[0-9]{0,3}[,]*[0-9]{0,3}[.]{0,1}[0-9]{2}'

    prices = []
    dates = []

    for i in range(len(ocr_data['text'])):
        if int(ocr_data['conf'][i]) > 10:
            (x, y, w, h) = (ocr_data['left'][i], ocr_data['top'][i],
                            ocr_data['width'][i], ocr_data['height'][i])
            if re.match(date_pattern, ocr_data['text'][i]):
                dates.append([ocr_data['text'][i], x, y, w, h])
            elif re.match(price_pattern, ocr_data['text'][i]):
                prices.append([ocr_data['text'][i], x, y, w, h])
    return prices, dates

def load_image(filepath):
    img_in = cv2.imread(filepath)
    #img_in = deskew(img_in)
    img_rgb = cv2.cvtColor(img_in, cv2.COLOR_BGR2RGB)

    return img_rgb

def convert_to_pdf(filepath):
    file_extension = filepath.split(".")[-1]
    if file_extension == 'png' or file_extension == 'jpg' or file_extension == 'jpeg':
        # OCR image
        # img = load_image(filepath)
        cover = Image.open(filepath)
        width, height = cover.size
        
        pdf_conv = FPDF(unit = 'pt', format = [width, height])
        
        # pdf = img2pdf.convert(filepath)
        filename = filepath.split('/')[-1]
        filename = filename.split('.')[-2]
        filename = filename + '.pdf'
        new_file = os.path.join(app.config['imageupload'], filename) 
        pdf_conv.add_page()
        pdf_conv.image(filepath, 0, 0)
        pdf_conv.output(new_file)
        # with open(new_file) as f:
        #     f.write(pdf)
        pdf = new_file
    elif file_extension == 'pdf':
        # Process PDF
        # img = convert_from_path(filepath)
        # img = cv2.cvtColor(np.asarray(img[0]), cv2.COLOR_RGB2BGR)
        pdf = filepath
    else:
        raise ValueError("Incorrect file format used")
    
    return pdf

def load_document(filepath):
    # Extract file extension as last group of strings after a period '.'
    file_extension = filepath.split(".")[-1]

    if file_extension == 'png' or file_extension == 'jpg' or file_extension == 'jpeg':
        # OCR image
        img = load_image(filepath)
        pdf = img2pdf.convert(filepath)
        filename = filepath.split('/')[-1]
        filename = filename.split('.')[-2]
        filename = filename + '.pdf'
        new_file = os.path.join(app.config['imgupload'], filename) 
        with open(new_file) as f:
            f.write(pdf)
        pdf = new_file
    elif file_extension == 'pdf':
        # Process PDF
        img = convert_from_path(filepath)
        img = cv2.cvtColor(np.asarray(img[0]), cv2.COLOR_RGB2BGR)
        pdf = filepath
    else:
        raise ValueError("Incorrect file format used")

    ocr_data = ocr_image_to_dict(img)
    val = analyse(img, ocr_data, pdf)
    return val


def analyse(img, ocr_data, pdf):
    prices,dates = get_values(ocr_data)

    cbr_dia = CBR(img, ocr_data)
    address_extr = Extractor(img, prices)
    predictor = Predictor()

    img = cbr_dia.img_rgb

    address_extr.analyse()
    json_val = predictor.predict(pdf)

    img = address_extr.visualise()
    xs, ys = img.shape[0], img.shape[1]
    img = cv2.resize(img, (int(xs/2), int(ys/2)))
    
    # Uncomment these lines to display an image
    cv2.imshow("Img", img)
    cv2.waitKey(0)
    print(cbr_dia.json_value)
    return json_val

def predict(invoice, fields=list(FIELDS.keys())):
    predictor = Predictor(fields)
    json = predictor.predict(invoice)
    return json


@app.route("/api/train", methods=["POST"])
def train():
    print("Preparing data for training")
    preparer = Preparer()
    
    if demo:
        return json.dumps(False)
    print("Training")
    trainer = Trainer()
    return json.dumps(True)
    

@app.route("/api/options", methods=['POST'])
def change_options():
    checkboxes = request.form["options"]
    global options
    print(options)
    options = list(json.loads(checkboxes))
    if len(options) == 0:
        options = FIELDS.keys()
    print(options)
    return json.dumps(True)


@app.route("/api/post", methods=['POST'])
def upload():
    image = request.files["image"]
    # checkboxes = request.form["options"]
    # checkboxes = list(json.loads(checkboxes))
    # print(checkboxes)
    check, ext = type_check(image.filename)
    if not check:
        return False
    DT = datetime.now()
    CT = DT.strftime("%d%m%Y_%H%M%S")
    filename = secure_filename(CT)
    old_name = secure_filename(image.filename)
    encoded = old_name.encode('utf-8')
    hash_name = hashlib.md5(encoded).hexdigest()
    
    new_name = filename+"_"+hash_name+"."+ext
    image.save(os.path.join(app.config['imageupload'], new_name))
    # json = load_document(os.path.join(app.config['imageupload'],new_name))
    file = convert_to_pdf(os.path.join(app.config['imageupload'],new_name))
    # if len(checkboxes) == 0:
        # checkboxes = list(FIELDS.keys())
    json_file = predict(file, options)
    json_file['filename'] = file
    return json.dumps(json_file)

if __name__ == "__main__":
    app.run()

# if __name__ == "__main__":
#     parser = argparse.ArgumentParser(description="Runs OCR and extraction on a document")
#     parser.add_argument('-i', '--input_file', type=str, help="Path to input document")

#     args = parser.parse_args()

#     # args.input_file = './bills/dodo.png'
#     # args.input_file = './bills/budgetdirect.pdf'
#     args.input_file = './bills/optus.pdf'

#     if args.input_file is None or len(args.input_file) == 0:
#         raise ValueError("Input file name needs to be specified")

#     load_document(args.input_file)
