#!c:/Python27/python

# -*- coding: utf8 -*-

import re
import pickle
import pymorphy2
from random import uniform
from collections import defaultdict

r_alphabet = re.compile(u'[а-яА-Яё-]+|[.]+')
r_alphabet_text = re.compile(u'[а-яА-Яё-]+|[.*]+')
morph = pymorphy2.MorphAnalyzer()

def gen_lines(corpus):
    data = open(corpus)
    for line in data:
        yield line.decode('utf8').lower()

def gen_tokens(lines,tok=True,an=True):
    #turn = True или False если true - делать токенизацию
    #an = True или False если false - мы проверяем анализируемый текст
    for line in lines:
        if an:
            alphabet = r_alphabet.findall(line)
        else:
            alphabet = r_alphabet_text.findall(line)
        for token in alphabet:
            if len(re.findall(u'[а-яА-Я0-9ё-]+', token)) == 0 or not(tok):
                yield token
            else:
                p = morph.parse(token)[0]
                yield p.normal_form


def maxfreq(seq):
    max_ = 0
    for token, freq in seq:
        if max_ < freq:
            max_ = freq
            return token
        
def tree_word(model,line):
    text = line.split()
    terms = []
    
    for word in text:
        p = morph.parse(word.decode('utf8'))[0]
        terms.append(p.normal_form)
    try:
        third = model[terms[0], terms[1]]
        #"( " + terms[0] + " )( " + terms[1] + " ) - " + model[terms[0], terms[1]]
    except Exception:
        third = [(u"ничего не найдено" , 1.0)]
    #return terms[0]+" "+terms[1]+" "+third

    return third
    
    
def analizToJson(file_):
    lines = gen_lines(file_)
    tokens = gen_tokens(lines,False,False)
    lines_ = gen_lines(file_)
    text = gen_tokens(lines_,False,False)

    massive = '{'
    search = {}
    i = 0
    token_2 = ""
    token_1 = ""
    for token in tokens:
        if token.encode('utf8') == "*".encode('utf8'):
            if i < 2:
                search[str(i)+u"/"+token] = ([("ничего не найдено" , 1.0)])
            else:
                search[str(i)+u"/"+token] = tree_word(model,token_2.encode('utf8')+" "+token_1.encode('utf8'))
        i += 1

        # print str(i) + " - " +token.encode('utf8') + " 1: " + token_2.encode('utf8') + " 2: " + token_1.encode('utf8')
        # print search
        # print len(search)        
        if i==0:
            token_2 = token
        elif i==1:
            token_1 = token
        else:
            token_2 = token_1
            token_1 = token
            
    for_sort = search.keys()
    #функция сортировки
    def sorted (input) :
        return float(input.split('/')[0])
    for_sort.sort(key = sorted)
    #print for_sort
    
        
    j = 0
    #for words in search :
    for words in for_sort :    
        if j != 0 :
            massive += ','          
        #if word == u'$' :
            #   word = ''
            
        massive += '"'+str(j)+'" '+ ': {'
        
        i = 0
        for word in search[words] :
            if i != 0 :
                massive += ','
            massive += '"' + word[0] + '" : "' + str(word[1]) + '"'
                
            i += 1
            if len(search[words]) == i :
                massive += '}'
                    
            if len(search[words]) == 0 :
                massive += '}'
            
        j += 1
            
        if len(search) == j :
            massive += '}'

    print massive.encode('utf8')
               

if __name__ == '__main__':
    #model = train('video/text.txt')
    pkl_file = open('corpus.txt', 'rb') # открываем
    model = pickle.load(pkl_file) # сохраняем в переменную
    pkl_file.close()


print "Content-Type: text/html\r\n"
#analiz('texts/text_.txt')
analizToJson('texts/text_.srt')

