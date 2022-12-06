# Smart Classification With Extraction of Data Using Optical Character and Image Recognition with Machine Learning

Professional Experience Group PA2111

## Installation
There are 3 components to this program that must be installed in order for it to work.

After downloading this repository, complete the following steps.

### Client Facing Node.JS

Run the following commands:
```bash
cd client
npm install
npm run start
```
This should then open a browser page with the user landing page.

### Server Node.JS
This relies on a PostgreSQL database with tables specified in **server/create_tables.sql**
Change the values in **server/db.js** in order for the database connection on this end to work

Then run the following commands:
```bash
cd server
npm install
npm run server
```
This program runs entirely within a terminal.

### Python
After the PostgreSQL database tables are set up, edit **flask/prepare\_data.py** line 41 with the database information.
On line 36 of **flask/app.py** set demo to false as this will allow training to occur. This was set to true for the purpose
of demonstrating.
Then run the following commands for an Ubuntu machine to install dependencies:
```bash
cd flask

# Create and source virtual environment
virtualenv env
source env/bin/activate

# Install packages
pip install -r requirements.txt
```

### Endpoints and file locations

#### Python
The Python program is configured to save files in **./imgupload** (typically **flask/imgupload** when running the program in the flask subdirectory). Changing this location will change the folder in which the files are saved. This can be done by changing the app.config variable in line 32. Line 107 in **flask/app.py** is where the saving of the file happens. For the purpose of storing this in a bucket, after the converted file is saved, the **new_file** variable would be sent to the bucket.


#### Front-end
Lines 405, 372 and 152 of **client/src/components/dashboard/OCR.js** are the Javascript fetch() calls to the Python program. Changing these values to the address of the machine running the Python back-end should change the location as needed. Currently this is done via the default Flask port 5000.

In the same file, lines 298 and 34 are responsible for communicating with the Javascript back-end and the database. Line 34 is responsible for simply getting the current user information while line 298 will save the scanned invoice to the database. If the Javascript back-end is located on another machine, these lines would need to be changed for the system to the IP addresses that the subsystem is located on.

In **client/src/components/dashboard/admin_stats.js** lines 24 and 45 are responsible for retrieving the total user and scan counts from the Javascript back-end. Line 31 is responsible for setting the username for the current user to appear in the navigation bar

In **client/src/components/dashboard/viewExtrac.js** line 24 will retrieve all records for the current user along with the username of the current user. If the user is an admin, a second fetch call happens on line 40 that will instead retrieve all scanned data to be displayed instead.

In **client/src/components/Login.js** line 27 a fetch call occurs to authenticate the user. A similar process occurs on line 22 in **client/src/components/Register.js** to register a new user.

Alternatively on a Windows machine with Anaconda installed:
```bash
cd flask

# Create and activate conda environment
conda create --name ofb-proj-ocr python=3.8
conda activate ofb-proj-ocr

# Install packages
pip install -r requirements.txt

# Install poppler
conda install -c conda-forge poppler
```

Other dependencies that may need to be installed before running:
- [Tesseract](https://github.com/UB-Mannheim/tesseract/wiki)
- [ImageMagick](https://imagemagick.org/script/download.php#windows)
- [Ghostscript](https://www.ghostscript.com/download/gsdnld.html)


## Add Your Own Fields
To add your own fields to InvoiceNet, open **flask/InvoiceNet/invoicenet/\_\_init\_\_.py**.

There are 4 pre-defined field types:
- **FIELD_TYPES["general"]** : General field like names, address, invoice number, etc.
- **FIELD_TYPES["optional"]** : Optional fields that might not be present in all invoices.
- **FIELD_TYPES["amount"]** : Fields that represent an amount.
- **FIELD_TYPES["date"]** : Fields that represent a date.

Choose the appropriate field type for the field and add the line mentioned below.

```python
# Add the following line at the end of the file

# For example, to add a field total_amount
FIELDS["total_amount"] = FIELD_TYPES["amount"]

# For example, to add a field invoice_date
FIELDS["invoice_date"] = FIELD_TYPES["date"]

# For example, to add a field tax_id (which might be optional)
FIELDS["tax_id"] = FIELD_TYPES["optional"]

# For example, to add a field vendor_name
FIELDS["vendor_name"] = FIELD_TYPES["general"]
```

## Reference
The OCR system is based off the [InvoiceNet](https://github.com/naiveHobo/InvoiceNet) repository on GitHub, which is itself based on the work of R. Palm et al, whose work can be found at:

Palm, Rasmus Berg, Florian Laws, and Ole Winther. **"Attend, Copy, Parse End-to-end information extraction from documents."** 2019 International Conference on Document Analysis and Recognition (ICDAR). IEEE, 2019.
