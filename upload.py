#!c:/Python27/python

# -*- coding: utf8 -*-

import cgi, cgitb

cgitb.enable()

request = cgi.FieldStorage()

print "Content-Type: text/html;charset=utf-8\n\n"

if request.has_key("file") and request["file"].filename != "":
	file = request["file"]

#filename = file['filename']
data = file.value
	 
fd = open("texts/text_.srt", 'w')

j = 1
to_file = data.split("\n")
for string in to_file:
	if string.strip() == "|0|" :
		fd.write(str(j)+"\n")
		j = j + 1
	else :
		fd.write(string+"\n")
fd.close()
result = data.split("\n\n")

massive = '{'
j = 0
for string in result:
	if j != 0 :
		massive += ','			
	massive += '"'+str(j)+'" '+ ': "'+string.split("\n")[2]+'"'
	j += 1
	
	if len(result) == j :
		massive += '}'
		
print massive
#print "Content-Type: text/html\r\n"


