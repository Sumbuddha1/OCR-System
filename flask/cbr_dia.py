import re
import random
import json
import os
import numpy as np
import cv2
import pytesseract
from pytesseract import Output
import math
import pandas as pd
import matplotlib.pyplot as plt

class Word:
    def __init__(self, text, x, y, w, h, nature, keyword, doc_size):
        self.text = text
        self.x = x
        self.y = y
        self.w = w
        self.h = h
        self.nature = nature
        self.keyword = keyword
        self.rel_x = x/doc_size[0]
        self.rel_y = y/doc_size[1]
        self.rel_w = w/doc_size[0]
        self.rel_h = h/doc_size[1]
        self.doc_size = doc_size

class Field:
    def __init__(self, word):
        self.words = [word]
        self.keywords = []
        self.nature = ''
        self.doc_size = word.doc_size
        self.min_w = word.w
        self.max_w = word.w
        self.min_x = word.x
        self.max_x = word.x
        self.min_y = word.y
        self.max_y = word.y
        self.min_h = word.h
        self.max_h = word.h
        self.min_rel_w = word.rel_w
        self.max_rel_w = word.rel_w
        self.min_rel_x = word.rel_x
        self.max_rel_x = word.rel_x
        self.min_rel_y = word.rel_y
        self.max_rel_y = word.rel_y
        self.min_rel_h = word.rel_h
        self.max_rel_h = word.rel_h
        self.w_padding = word.w
        self.h_padding = word.h
        self.cum_width = word.w
    
    def append(self, word):
        self.words.append(word)
        if word.w > self.max_w:
            self.max_w = word.w
        elif word.w < self.min_w:
            self.min_w = word.w
        if word.x < self.min_x:
            self.min_x = word.x
        elif word.x > self.max_x:
            self.max_x = word.x
            self.w_padding = word.w
        if word.y < self.min_y:
            self.min_y = word.y
        elif word.y > self.max_y:
            self.max_y = word.y
            self.h_padding = word.h
        if word.h < self.min_h:
            self.min_h = word.h
        elif word.h > self.max_h:
            self.max_h = word.h
            
        if word.rel_w > self.max_rel_w:
            self.max_rel_w = word.rel_w
        elif word.rel_w < self.min_w:
            self.min_rel_w = word.rel_w
        if word.rel_x < self.min_rel_x:
            self.min_rel_x = word.rel_x
        elif word.rel_x > self.max_rel_x:
            self.max_rel_x = word.rel_x
        if word.rel_y < self.min_y:
            self.min_rel_y = word.rel_y
        elif word.rel_y > self.max_rel_y:
            self.max_rel_y = word.rel_y
        if word.rel_h < self.min_h:
            self.min_rel_h = word.rel_h
        elif word.rel_h > self.max_rel_h:
            self.max_rel_h = word.rel_h
        self.cum_width += word.w

    def get_keywords(self):
        for word in self.words:
            if word.keyword != False:
                self.keywords.append(word.keyword)
            self.nature += word.nature

        if len(self.keywords) == 0:
            self.keywords = [False]


class Block:
    def __init__(self, field):
        self.fields = [field]
        self.keywords = []
        self.nature = ''
        self.min_w = field.min_w
        self.max_w = field.max_w
        self.min_x = field.min_x
        self.max_x = field.max_x
        self.min_y = field.min_y
        self.max_y = field.max_y
        self.min_h = field.min_h
        self.max_h = field.max_h
        
        self.min_rel_w = field.min_rel_w
        self.max_rel_w = field.max_rel_w
        self.min_rel_x = field.min_rel_x
        self.max_rel_x = field.max_rel_x
        self.min_rel_y = field.min_rel_y
        self.max_rel_y = field.max_rel_y
        self.min_rel_h = field.min_rel_h
        self.max_rel_h = field.max_rel_h
        self.w_padding = field.w_padding
        self.h_padding = field.h_padding
    
    def append(self, field):
        self.fields.append(field)
        if field.max_w > self.max_w:
            self.max_w = field.max_w
        elif field.min_w < self.min_w:
            self.min_w = field.min_w
        if field.min_x < self.min_x:
            self.min_x = field.min_x
        elif field.max_x > self.max_x:
            self.max_x = field.max_x
            self.w_padding = field.w_padding
        if field.min_y < self.min_y:
            self.min_y = field.min_y
        elif field.max_y > self.max_y:
            self.max_y = field.max_y
            self.h_padding = field.h_padding
        if field.min_h < self.min_h:
            self.min_h = field.min_h
        elif field.max_h > self.max_h:
            self.max_h = field.max_h
        
        if field.max_rel_w > self.max_rel_w:
            self.max_rel_w = field.max_rel_w
        elif field.min_rel_w < self.min_rel_w:
            self.min_rel_w = field.min_rel_w
        if field.min_rel_x < self.min_rel_x:
            self.min_rel_x = field.min_rel_x
        elif field.max_rel_x > self.max_rel_x:
            self.max_rel_x = field.max_rel_x
        if field.min_rel_y < self.min_rel_y:
            self.min_rel_y = field.min_rel_y
        elif field.max_rel_y > self.max_rel_y:
            self.max_rel_y = field.max_rel_y
        if field.min_rel_h < self.min_rel_h:
            self.min_rel_h = field.min_rel_h
        elif field.max_rel_h > self.max_rel_h:
            self.max_rel_h = field.max_rel_h
    
    def get_keywords(self):
        for field in self.fields:
            if field.keywords[0] != False:
                for keyword in field.keywords:
                    self.keywords.append(keyword)
            self.nature += field.nature
        if len(self.keywords) == 0:
            self.keywords = [False]
    
    def print(self):
        print('='*10)
        for field in self.fields:
            for word in field.words:
                print(word.text, end=' ')
            print('\n')
        print('='*10)


class CBR:

    def sort_words(self, word):
        return word.x

    def sort_fields(self, field):
        return field.min_y

    def sort_fields_alt(self, field):
        return field.min_x

    def is_price(self, word):
        price_pattern = '[$][0-9]{1,3}[,]*[0-9]{0,3}[,]*[0-9]{0,3}[.]{0,1}[0-9]{2}'
        if re.match(price_pattern, word):
            return True
        else:
            return False
    
    def is_date(self, word):
        date_pattern = '^((31(?!\-(Feb(ruary)?|Apr(il)?|June?|(Sep(?=\b|t)t?|Nov)(ember)?)))|((30|29)(?!\ Feb(ruary)?))|(29(?=\ Feb(ruary)?\-(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00)))))|(0?[1-9])|1\d|2[0-8])\-(Jan(uary)?|Feb(ruary)?|Ma(r(ch)?|y)|Apr(il)?|Ju((ly?)|(ne?))|Aug(ust)?|Oct(ober)?|(Sep(?=\b|t)t?|Nov|Dec)(ember)?)\-((1[6-9]|[2-9]\d)\d{2})$'
        # if re.match(word, date_pattern):
        #     return True
        # else:
        #     return False
        return False

    def distance(self, word1, word2):
        return np.sqrt(
                pow(word1 - word2, 2)
                )
    
    def find_price(self, blocks):
        block_index = -1
        field_index = -1
        response = ""
        for i in range(len(blocks)):
            if 'total' in blocks[i].keywords or 'final' in blocks[i].keywords and 'due' in blocks[i].keywords:
                block_index = i
                break
        if block_index > -1:
            for i in range(len(blocks[block_index].fields)):
                if 'total' in blocks[block_index].fields[i].keywords or 'final' in blocks[block_index].fields[i].keywords and 'due' in blocks[block_index].fields[i].keywords:
                    if 'D' in blocks[block_index].fields[i].nature:
                        field_index = i
                        break
        
        if field_index > -1:
            for word in blocks[block_index].fields[field_index].words:
                if word.nature == 'D':
                    response += word.text
        else:
            response = '-1'
            print("Couldn't find total price")
        return response

    def find_account_no(self, blocks):
        block_index = -1
        field_index = -1
        response = ""
        for i in range(len(blocks)):
            if 'no' in blocks[i].keywords or 'number' in blocks[i].keywords and 'account' in blocks[i].keywords:
                block_index = i
                break
        if block_index > -1:
            for i in range(len(blocks[block_index].fields)):
                if 'no' in blocks[block_index].fields[i].keywords or 'number' in blocks[block_index].fields[i].keywords and 'account' in blocks[block_index].fields[i].keywords:
                    field_index = i
                    break
        
        if field_index > -1:
            for word in blocks[block_index].fields[field_index].words:
                if word.nature == 'A':
                    response += word.text
        else:
            response = '-1'
            print("Couldn't find account number")
        return response
    
    def find_address_and_name(self, blocks):
        block_index = -1
        field_index = -1
        name_response = ""
        address_response = ""
        for i in range(len(blocks)):
            if 'st' in blocks[i].keywords or 'street' in blocks[i].keywords or 'avenue' in blocks[i].keywords or 'ave' in blocks[i].keywords:
                block_index = i
                break
        if block_index > -1:
            for i in range(len(blocks[block_index].fields)):
                if 'st' in blocks[block_index].fields[i].keywords or 'street' in blocks[block_index].fields[i].keywords and 'avenue' in blocks[block_index].fields[i].keywords or 'ave' in blocks[block_index].fields[i].keywords:
                    field_index = i
                    break
        


        if field_index > -1:
            for word in blocks[block_index].fields[field_index-1].words:
                name_response += word.text + " "
            for word in blocks[block_index].fields[field_index].words:
                address_response += word.text + " "
            for word in blocks[block_index].fields[field_index+1].words:
                address_response += word.text + " "
        else:
            name_response = '-1'
            address_response = '-1'
            print("Couldn't find address")
        
        name_response = name_response.strip()
        address_response = address_response.strip()
        return name_response, address_response

    def get_fields(self, fields, width_lev):
        # Flags for loop
        complete = False
        changed = False
        check = True
        i = 0
        j = 1

        # Loop through every field and join together the blocks that are within a certain height distance
        while not complete:
            # dist = self.distance(fields[i].words[0].x, fields[j].words[0].x)
            dist = abs(fields[i].words[0].x - fields[j].words[0].x)
            # y_diff = abs(fields[i].words[0].y - fields[j].words[-1].y)
            y_diff = abs(fields[i].min_y - fields[j].min_y)
            if i < j:
                # if dist < (width_lev*fields[i].words[-1].w) and y_diff <20:
                if dist < (width_lev * fields[i].max_w) and y_diff < 10:
                    for word in fields[j].words:
                        fields[i].append(word)
                    fields.pop(j)
                    changed = True
                    check = True

            if j >= len(fields)-1 and i < len(fields)-2:
                i += 1
                j = i+1
                if not check:
                    complete = True
                continue
            if i >= len(fields)-2:
                check = False
                i = 0
                j = 1
            if changed:
                j = i + 1
                changed = False
            else:
                j += 1
        return fields
    
    def get_blocks(self, blocks, height_lev):
        # Flags for loop
        complete = False
        changed = False
        check = True
        i = 0
        j = 1
        
        # This is old, looking at only horizontal lines
        # Loop through every field and join together the blocks that are within a certain height distance
        while not complete:
            vert_dist = abs(blocks[i].fields[-1].words[0].y - blocks[j].fields[-1].words[0].y)
            # vert_dist = self.distance(blocks[i].fields[-1].words[0].y, blocks[j].fields[-1].words[0].y)
            x_diff = abs(blocks[i].fields[0].words[0].x-blocks[j].fields[0].words[0].x)
            if i < j:
                if vert_dist < (height_lev*blocks[i].fields[0].words[0].h) and x_diff < 35:
                    for field in blocks[j].fields:
                        blocks[i].append(field)
                    blocks.pop(j)
                    changed = True
                    check = True

            if j >= len(blocks)-1 and i < len(blocks)-2:
                i += 1
                j = i+1
                if not check:
                    complete = True
                continue
            if i >= len(blocks)-2:
                check = False
                i = 0
                j = 1
            if changed:
                j = i + 1
                changed = False
            else:
                j += 1
        return blocks


    """
    In reading the CBRDIA paper, I realised the blocks approach, while it worked in a few cases, was not
    what the authors did, instead they matched horizontal lines by groups fields horizontally.
    """
    def get_horizontal_lines(self, lines, width_lev):
        # Flags for loop
        complete = False
        changed = False
        check = True
        i = 0
        j = 1
        
        # Loop through every field and join together the blocks that are within a certain height distance
        while not complete:
            hor_dist = abs(lines[i].fields[-1].words[-1].x- lines[j].fields[0].words[0].x)
            y_diff = abs(lines[i].fields[0].words[0].y-lines[j].fields[0].words[0].y)
            if i < j:
                # if hor_dist < (width_lev*lines[i].fields[-1].words[-1].w) and y_diff < 10:
                if hor_dist < (width_lev*(lines[i].fields[-1].cum_width/max(lines[i].fields[0].max_h, lines[j].fields[0].max_h))) and y_diff < 10:
                    for field in lines[j].fields:
                        lines[i].append(field)
                    lines.pop(j)
                    changed = True
                    check = True

            if j >= len(lines)-1 and i < len(lines)-2:
                i += 1
                j = i+1
                if not check:
                    complete = True
                continue
            if i >= len(lines)-2:
                check = False
                i = 0
                j = 1
            if changed:
                j = i + 1
                changed = False
            else:
                j += 1
        return lines
    
    def analyse(self, ocr_data, width_lev, height_lev, width_thres, doc_size):
        n_boxes = len(ocr_data['text'])

        words = []
        keywords = ['total', 'st', 'ave', 'avenue', 'crescent', 'street', 'bpay', 'debit', 'road', 'account', 'due', 'no', 'number', 'automatic', 'direct']
        address_keywords = []
        price_keywords = []
        detail_keywords = []
        
        addr_file = open('./keywords/address_keywords.txt', 'r')
        price_file = open('./keywords/price_keywords.txt', 'r')
        detail_file = open('./keywords/detail_keywords.txt', 'r')
        for word in addr_file:
            word = word.rstrip("\n")
            address_keywords.append(word)
            
        for word in price_file:
            word = word.rstrip("\n")
            price_keywords.append(word)
            
        for word in detail_file:
            word = word.rstrip("\n")
            detail_keywords.append(word)
        
        
        fields = []

        # Loop through OCR data and store text alongside nature and if it is a keyword
        for i in range(n_boxes):
            if int(ocr_data['conf'][i]) > 60:
                (x, y, w, h) = (ocr_data['left'][i], ocr_data['top'][i], ocr_data['width'][i], ocr_data['height'][i])
                if self.is_price(ocr_data['text'][i]):
                    nature = 'D'
                elif self.is_date(ocr_data['text'][i]):
                    nature = 'E'
                elif ocr_data['text'][i].isnumeric():
                    nature = 'A'
                elif ocr_data['text'][i].isalpha():
                    nature='B'
                elif ocr_data['text'][i] == '':
                    nature = ''
                    continue
                else:
                    nature='C'
                    
                if ocr_data['text'][i].lower() in address_keywords:
                    keyword = 'address'
                elif ocr_data['text'][i].lower() in price_keywords:
                    keyword = price_keywords[price_keywords.index(ocr_data['text'][i].lower())]
                elif ocr_data['text'][i].lower() in detail_keywords:
                    keyword = detail_keywords[detail_keywords.index(ocr_data['text'][i].lower())]
                else:
                    keyword = False
                word = Word(ocr_data['text'][i], x, y, w, h, nature, keyword, doc_size)
                # words.append([ocr_data['text'][i], x, y, w, h, keyword, nature])
                words.append(word)

        # Create horizontal fields from text
        currentField = 0

        words.sort(key=self.sort_words)

        # Make every word a field
        for i in range(len(words)):
            field = Field(words[i])
            fields.append(field)

        fields = self.get_fields(fields, width_lev)

        for field in fields:
            field.get_keywords()
        fields_copy = fields

        fields.sort(key=self.sort_fields)
        fields_copy.sort(key=self.sort_fields_alt)
        # Make every field a 'block' and a 'line'
        blocks = []
        lines = []
        for i in range(len(fields)):
            block = Block(fields[i])
            line = Block(fields_copy[i])
            blocks.append(block)
            lines.append(line)
        currentBlock = 0


        blocks = self.get_blocks(blocks, height_lev)
        lines = self.get_horizontal_lines(lines, 43)

        for line in lines:
            line.print()
            line.get_keywords()

        for block in blocks:
            block.get_keywords()

        return words, fields, blocks, lines

    def get_field_types(self, fields):
        for field in fields:
            for word in field:
                field[-1].append(word[-2])
        return fields


    def get_block_types(self, blocks):
        for block in blocks:
            for field in block:
                block[-1].append(field[-1])
                

    def visualise(self, blocks, img_rgb):
        for block in blocks:
            max_w = 0
            c_width = []
            max_h = block.fields[-1].words[0].y + block.fields[-1].words[0].h
            # max_h = block.h_padding
            # x = block.fields[0].words[0].x
            # y = block.fields[0].words[0].y
            x = block.min_x
            y = block.min_y
            for field in block.fields:
                width = 0
                # c_width.append(field.words[-1].x+field.words[-1].w)
                c_width.append(block.max_x+block.w_padding)
            max_w = max(c_width)
            max_w = block.max_x + block.w_padding
            
            img_rgb = cv2.rectangle(img_rgb, (x, y), (max_w, max_h), (255,0,0), 2)
            
        return img_rgb
    
    def block_euclid_dist(self, p1, p2):
        return np.sqrt(
                pow(p1.min_rel_x - p2.min_rel_x, 2) + pow(p1.min_rel_y - p2.min_rel_y, 2)
                )
    
    def word_euclid_dist(self, p1, p2):
        return np.sqrt(
                pow(p1.rel_x - p2.rel_x, 2) + pow(p1.rel_y - p2.rel_y, 2)
                )
    
    def main_graph(self, blocks):
        max = len(blocks)
        edgelist = []
        i = 0
        j = 0
        while i < max:
            temp = []
            while j < max:
                temp.append([blocks[i], blocks[j], self.block_euclid_dist(blocks[i], blocks[j])])
                j += 1
            edgelist.append(temp)
            i += 1
        return edgelist
                    
    def sub_graph(self, block):
        words = []
        for field in block.fields:
            for word in field.words:
                words.append(word)
        
        edgelist = []
        max = len(words)
        i = 0
        j = 0
        while i < max:
            temp = []
            while j < max:
                temp.append([words[i], words[j], self.word_euclid_dist(words[i], words[j])])
                j += 1
            edgelist.append(temp)
            i += 1
        return words, edgelist
    
    def compare_template(self, template1, graph):
        return 0
    
    def match(self, blocks, graph):
        comparisons = []
        for template in os.listdir('./templates/'):
            
            comparisons.append(self.compare_template(template, graph))
        return False
    
    def get_account_num(self, block, direction):
        field_index = -1
        response = ""
        for i in range(len(block.fields)):
            if 'no' in block.keyword or 'number' in block.keyword or 'account' in block.keywords:
                field_index = i
        if field_index > -1:
            if direction == 'below':
                for word in block.fields[field_index+1].words:
                    if word.nature == 'A':
                        response += word.text
            else:
                for word in block.fields[field_index].words:
                    if word.nature == 'A':
                        response += word.text
        else:
            response = '-1'
        
        return response

    def __init__(self, img, ocr_data):
        self.words, self.fields, self.blocks, self.lines = self.analyse(ocr_data, 5, 5, 100, img.shape)
        # self.price = self.find_price(self.blocks)
        self.price = self.find_price(self.lines)
        self.account_no = self.find_account_no(self.blocks)
        self.name, self.address = self.find_address_and_name(self.blocks)
        
        main_edges = self.main_graph(self.blocks)
        for block in self.blocks:
            block.words, block.edgelist = self.sub_graph(block)
        
        
        
        # The two below lines will determine if blocks or horizontal lines are shown in the result.
        # self.img_rgb = self.visualise(self.blocks, img)
        self.img_rgb = self.visualise(self.lines, img)
        # print(self.name, self.address, self.account_no, self.price)
        self.json_value = json.dumps({
            'name':self.name,
            'address':self.address,
            'account_number':self.account_no,
            "total_amount":self.price
        })
        # for block in self.blocks:
        #     block.print()

        

    

        
        
