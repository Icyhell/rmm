#!c:/Python27/python

# -*- coding: utf8 -*-

import cgi, cgitb

cgitb.enable()

request = cgi.FieldStorage()

print "Content-Type: text/html;charset=utf-8\n\n"

if request.has_key("string") :
	string = request["string"].value
if request.has_key("string_num") :
	string_num = request["string_num"].value



lines = []
data = open("texts/text_.srt")
for line in data:
	lines.append( line )
data.close()


file = open("texts/text_.srt", 'w')

count = 0
for line in lines :
	if count == 2 :
		file.write(string)
		count = 0
	else :
		file.write(line)
		
	if count == 1 :
		count = 2
		
	if line.strip() == string_num.strip() :
		count = 1	
	
file.close()
	
print "Success!"
	 




#print "Content-Type: text/html\r\n"


