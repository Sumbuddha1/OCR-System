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

import os

from InvoiceNet.invoicenet import FIELDS
from InvoiceNet.invoicenet.common import trainer
from InvoiceNet.invoicenet.acp.acp import AttendCopyParse
from InvoiceNet.invoicenet.acp.data import InvoiceData

class Trainer:
    def __init__(self, fields=list(FIELDS.keys()), batch_size=4, restore=False, data_dir='./processed_data', steps=50000, early_stop_steps=500):
        
        # TODO - Pull data from database
        
        for field in fields:
            train_data = InvoiceData.create_dataset(field=field,
                                                    data_dir=os.path.join(data_dir, 'train/'),
                                                    batch_size=batch_size)
            val_data = InvoiceData.create_dataset(field=field,
                                                data_dir=os.path.join(data_dir, 'val/'),
                                                batch_size=batch_size)

            print("Training for " + field + "...")
            trainer.train(
                model=AttendCopyParse(field=field, restore=restore),
                train_data=train_data,
                val_data=val_data,
                total_steps=steps,
                early_stop_steps=early_stop_steps
            )


if __name__ == '__main__':
    trainer = Trainer()
