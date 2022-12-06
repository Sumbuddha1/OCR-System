import numpy as np
import cv2
import pytesseract
import re
from pytesseract import Output
import nltk
import pandas as pd
import math
import matplotlib.pyplot as plt


"""
This functions as a generalised information extractor. The document,
data to extract from (price, date, etc), the company for the document
and the type of document it is.

It loads the points from somewhere and then will return an array of
the data, in descending confidence levels.

Sourced from: 
Xavier Lagorce, Cédric Meyer, Sio-Hoi Ieng, David Filliat, Ryad Benosman. 
Asynchronous Event-Based Multikernel Algorithm for High-Speed Visual Features Tracking. 
IEEE Transactions on Neu-ral Networks and Learning Systems, IEEE, 2014, pp.1-12. 
￿10.1109/TNNLS.2014.2352401￿. ￿hal-01069808￿
"""

class Extractor:

    #def __init__(self, img, data, company, doc_type, d_type):
    def __init__(self, img, data):
        self.data = data
        self.img = img
        
    
    def analyse(self):
        data = self.data
        min = 10000000
        indexes = [0, 0]


        """
        Check if company exists, else make new one
        If company exists, check if doc_type exists, else make new one
        (Do the above using file paths)
        Load mu1 value for data type (d_type)
            - Stored as the percentage in the image which is 
            multiplied by image shape to find the xy coords
            of the data
        Load sigma1 values for data type (d_type)
        """

        # Load the data from somewhere. (These are temp values for the price location in Dodo Combined Phone and Internet)
        self.mu1 = [1102, 476]                       # This is the 'center' in which the
                                                # data is expected to be found

        self.sigma1 = [[100000, 10], [10, 100000]]   # This is the gaussian probability distribution
                                                # in which the data is located
        mu1 = self.mu1
        sigma1 = self.sigma1
        # These don't need to be loaded from anywhere.
        # Learning rate
        alpha1 = 0.99
        alpha2 = 0.99

        K = 2
        e, v = np.linalg.eig(sigma1)

        self.a1 = K * math.sqrt(e[0])
        self.b1 = K * math.sqrt(e[1])

        angle1 = 0.5 * \
            math.atan2((2 * sigma1[0][1]), (sigma1[1][1]
                                            ** 2 - (sigma1[0][0] ** 2) + 2e-16))
        self.angle1 = math.degrees(angle1)

        detSigma = np.ndarray(shape=[2, 2])



        # Data extraction
        min_dist = 1000000000 # Set to big value to find minimum
        max_dist = 0 # Set to big value to find maximum
        min_index = 0
        max_index = 0

        # Calculate euclidean distance from estimated center to 
        # each data point to find the shortest and longest distance
        for i in range(len(data)):
            dist = np.sqrt(
                pow(data[i][1] - mu1[0], 2) + pow(data[i][2] - mu1[1], 2)
            )
            data[i].append(dist)

            if dist < min_dist:
                min_dist = dist
                min_index = i
            if dist > max_dist:
                max_dist = dist
                max_index = i

        # Compute confidence levels. 1-(Distance/Max Distance)
        for i in range(len(data)):
            self.data[i].append(1-(data[i][5]/max_dist))

        # print(self.data)

    def visualise(self):
        img = self.img
        center_x = np.int32(self.mu1[1])
        center_y = np.int32(self.mu1[0])
        center = (center_x, center_y)
        axes = (np.int32(self.a1), np.int32(self.b1))
        angle = np.int32(self.angle1)
        a1 = self.a1
        b1 = self.b1
        if min(np.int32(self.a1), np.int32(self.b1)) < 50:
            e_img = np.zeros_like(self.img)
            cv2.ellipse(e_img, center, axes, angle,
                        startAngle=0, endAngle=360,
                        color=(0, 255, 0), thickness=-1)
            cv2.addWeighted(img, 1, e_img, 0.25, 0.0, img)
        
        # draw horizontal component of crosshair
        start_point = ((center_x - np.int32(axes[1]/2)), center_y)
        end_point = ((center_x + np.int32(axes[1]/2)), center_y)
        cv2.line(img, start_point, end_point,
                 color=(0, 0, 255), thickness=1, lineType=cv2.LINE_4)

        # draw vertical component of crosshair
        start_point = (center_x, (center_y - np.int32(axes[0]/2)))
        end_point = (center_x, (center_y + np.int32(axes[0]/2)))
        cv2.line(img, start_point, end_point,
                 color=(0, 0, 255), thickness=1, lineType=cv2.LINE_4)

        cv2.drawMarker(img, center,
                       markerType=cv2.MARKER_SQUARE,
                       markerSize=max(20, np.int32(
                           (min(np.int32(a1), np.int32(b1)))/3)),
                       thickness=1, color=(0, 128, 255), line_type=cv2.LINE_4)

        return img


    
    def adjust(self, mu1, sigma1, alpha2, true_loc):
        # This is the 'learning' section. It recevies the correct
        # value from the user and steps the estimated point to
        # where that value is, as well as narrowing the range in which
        # it may be contained (sigma)
        # This runs on every pass of the evaluation once user input is
        # received
    
        """
        Data structures
            mu1[] = [x, y] of expected point
            sigma1[[],[]] = gaussian dist. of expected loc.
            alpha2 = float learning rate
            true_loc[] = [x, y] of actual point
        """
    
    
        #for i in range(len(prices)):
        # move towards closest match to correct val    
    
        detSigma[0][0] = (true_loc[0] - mu1[0]) ** 2
        detSigma[0][1] = (true_loc[0] - mu1[0]) * (true_loc[1] - mu1[1])
        detSigma[1][0] = (true_loc[0] - mu1[0]) * (true_loc[1] - mu1[1])
        detSigma[1][1] = (y - mu1[1]) ** 2
    
        sigma1 = np.multiply(alpha2, sigma1) + \
                np.multiply((1 - alpha2), (detSigma))
    
        e, v = np.linalg.eig(sigma1)
    
        a1 = K * math.sqrt(e[0])
        b1 = K * math.sqrt(e[1])
    
        angle1 = 0.5 * \
            math.atan2((2 * sigma1[0][1]), (sigma1[1][1]
                                            ** 2 - (sigma1[0][0] ** 2) + 2e-16))
        angle1 = math.degrees(angle1)
    
        mu1 = np.multiply(alpha1, mu1) + np.multiply((1 - alpha1), ([x, y]))
    
        self.mu1 = mu1
        self.sigma1 = sigma1
        self.a1 = a1
        self.b1 = b1
        self.angle1 = angle1
        return mu1, sigma1, a1, b1, angle1

