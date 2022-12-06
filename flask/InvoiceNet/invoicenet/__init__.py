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

FIELD_TYPES = {
    "general": 0,
    "optional": 1,
    "amount": 2,
    "date": 3
}

FIELDS = dict()

FIELDS["invoice_number"] = FIELD_TYPES["general"]
FIELDS["vendor_name"] = FIELD_TYPES["general"]
FIELDS["client_name"] = FIELD_TYPES["general"]
FIELDS["address"] = FIELD_TYPES["general"]
FIELDS["account_number"] = FIELD_TYPES["general"]

FIELDS["address_line_2"] = FIELD_TYPES["optional"]
FIELDS["address_line_3"] = FIELD_TYPES["optional"]
FIELDS["bpay_code"] = FIELD_TYPES["optional"]
FIELDS["bpay_ref"] = FIELD_TYPES["optional"]
FIELDS["eft_account_num"] = FIELD_TYPES["optional"]
FIELDS["eft_bsb"] = FIELD_TYPES["optional"]
FIELDS["eft_account_name"] = FIELD_TYPES["optional"]
FIELDS["postbillpay_code"] = FIELD_TYPES["optional"]
FIELDS["postbillpay_ref"] = FIELD_TYPES["optional"]

FIELDS["invoice_date"] = FIELD_TYPES["date"]
FIELDS["due_date"] = FIELD_TYPES["date"]

FIELDS["total_amount"] = FIELD_TYPES["amount"]
