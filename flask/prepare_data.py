# Copyright (c) 2020 Sarthak Mittal
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

import argparse
import glob
import os
import json
import shutil

import pdf2image
import simplejson
import tqdm
import multiprocessing as mp
import psycopg2

from InvoiceNet.invoicenet import FIELDS, FIELD_TYPES
from InvoiceNet.invoicenet.common import util

class Preparer():
    
    def get_data(self):
        # TODO - Pull data from database.
        stmt = 'select row_to_json(row) from (select client_name, address, total_amount, account_number, address_line_2, address_line_3, invoice_number, vendor_name, bpay_code, bpay_ref, eft_account_num, eft_account_name, eft_bsb, postbillpay_code, postbillpay_ref, invoice_date, due_date, filename from extracted_information) row;'
        cur = psycopg2.connect(database='ocr_database', user='andrew', password='andrew', host='localhost').cursor()
        cur.execute(stmt)
        result = cur.fetchall()
        for row in result:
            row = row[0]
            dict = {k:v for (k,v) in row.items() if k != 'filename' and len(v) > 0}
            # for key in dict.keys():
            #     if len(dict[key]) == 0:
            #         dict.pop(key)
            filename = row['filename'].split('/')[-1]
            original_loc = os.path.join('./imgupload/',filename)
            new_loc = os.path.join('./training_data/', filename)
            filename = filename.split('.')[-2]
            filename += '.json'
            with open(os.path.join('./training_data/',filename), 'w') as outfile:
                json.dump(dict, outfile)
            shutil.copyfile(original_loc, new_loc)
        print(result)
        
    
    def process_file(self, filename, out_dir, phase, ocr_engine):
        try:
            page = pdf2image.convert_from_path(filename)[0]
            page.save(os.path.join(out_dir, phase, os.path.basename(filename)[:-3] + 'png'))

            height = page.size[1]
            width = page.size[0]

            ngrams = util.create_ngrams(page, height=height, width=width, ocr_engine=ocr_engine)
            for ngram in ngrams:
                if "amount" in ngram["parses"]:
                    ngram["parses"]["amount"] = util.normalize(ngram["parses"]["amount"], key="amount")
                if "date" in ngram["parses"]:
                    ngram["parses"]["date"] = util.normalize(ngram["parses"]["date"], key="date")

            with open(filename[:-3] + 'json', 'r') as fp:
                labels = simplejson.loads(fp.read())

            fields = {}
            for field in FIELDS:
                if field in labels:
                    if FIELDS[field] == FIELD_TYPES["amount"]:
                        fields[field] = util.normalize(labels[field], key="amount")
                    elif FIELDS[field] == FIELD_TYPES["date"]:
                        fields[field] = util.normalize(labels[field], key="date")
                    else:
                        fields[field] = labels[field]
                else:
                    fields[field] = ''

            data = {
                "fields": fields,
                "nGrams": ngrams,
                "height": height,
                "width": width,
                "filename": os.path.abspath(
                    os.path.join(out_dir, phase, os.path.basename(filename)[:-3] + 'png'))
            }

            with open(os.path.join(out_dir, phase, os.path.basename(filename)[:-3] + 'json'), 'w') as fp:
                fp.write(simplejson.dumps(data, indent=2))
            return True

        except Exception as exp:
            print("Skipping {} : {}".format(filename, exp))
            return False


    def __init__(self):
        # Flags for system
        self.get_data()
        data_dir = './training_data/'
        out_dir = './processed_data/'
        val_size = 0.2
        cores = max(1, (mp.cpu_count() - 2) // 2)
        engine = 'pytesseract'    # Supports 'pytesseract' or 'aws_textract'

        os.makedirs(os.path.join(out_dir, 'train'), exist_ok=True)
        os.makedirs(os.path.join(out_dir, 'val'), exist_ok=True)

        filenames = [os.path.abspath(f) for f in glob.glob(data_dir + "**/*.pdf", recursive=True)]

        idx = int(len(filenames) * val_size)
        train_files = filenames[idx:]
        val_files = filenames[:idx]

        print("Total: {}".format(len(filenames)))
        print("Training: {}".format(len(train_files)))
        print("Validation: {}".format(len(val_files)))

        for phase, filenames in [('train', train_files), ('val', val_files)]:
            print("Preparing {} data...".format(phase))

            with tqdm.tqdm(total=len(filenames)) as pbar:
                pool = mp.Pool(cores)
                for filename in filenames:
                    pool.apply_async(self.process_file, args=(filename, out_dir, phase, engine),
                                    callback=lambda _: pbar.update())

                pool.close()
                pool.join()


if __name__ == '__main__':
    prep = Preparer()
