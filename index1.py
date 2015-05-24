#!c:/Python27/python

# -*- coding: utf8 -*-

import re
import pymorphy2
from random import uniform
from collections import defaultdict

r_alphabet = re.compile(u'[а-яА-Я0-9ё-]+|[.,:;?!]+')
r_alphabet_text = re.compile(u'[а-яА-Я0-9ё-]+|[.,:;?!*]+')
morph = pymorphy2.MorphAnalyzer()

def gen_lines(corpus):
    data = open(corpus)
    for line in data:
        yield line.decode('cp1251').lower()

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

def gen_trigrams(tokens):
    t0, t1 = '$', '$'
    for t2 in tokens:
        yield t0, t1, t2
        if t2 in '.!?':
            yield t1, t2, '$'
            yield t2, '$','$'
            t0, t1 = '$', '$'
        else:
            t0, t1 = t1, t2

def train(corpus):
    lines = gen_lines(corpus)
    tokens = gen_tokens(lines)
    trigrams = gen_trigrams(tokens)

    bi, tri = defaultdict(lambda: 0.0), defaultdict(lambda: 0.0)

    for t0, t1, t2 in trigrams:
        bi[t0, t1] += 1
        tri[t0, t1, t2] += 1

    model = {}
    for (t0, t1, t2), freq in tri.iteritems():
        if (t0, t1) in model:
            model[t0, t1].append((t2, freq/bi[t0, t1]))
        else:
            model[t0, t1] = [(t2, freq/bi[t0, t1])]
    return model

def generate_sentence(model):
    phrase = ''
    t0, t1 = '$', '$'
    while 1:
        t0, t1 = t1, unirand(model[t0, t1])
        if t1 == '$': break
        if t1 in ('.!?,;:') or t0 == '$':
            phrase += t1
        else:
            phrase += ' ' + t1
    return phrase.capitalize()

def unirand(seq):
    sum_, freq_ = 0, 0
    for item, freq in seq:
        sum_ += freq
    rnd = uniform(0, sum_)
    for token, freq in seq:
        freq_ += freq
        if rnd < freq_:
            return token

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
        p = morph.parse(word.decode('cp1251'))[0]
        terms.append(p.normal_form)
    try:
        third = maxfreq(model[terms[0], terms[1]])
    except Exception:
        third = u"'ничего не найдено'"
    #return terms[0]+" "+terms[1]+" "+third
    return third

def analiz(file_):
    lines = gen_lines(file_)
    tokens = gen_tokens(lines,True,False)
    lines_ = gen_lines(file_)
    text = gen_tokens(lines_,False,False)

    phrase = ""
    search = []
    i = 0
    token_2 = ""
    token_1 = ""
    for token in tokens:
        
        if token == u"*":
            if i < 2:
                search.append(u"'ничего не найдено'")
            else:
                search.append(tree_word(model,token_2.encode('cp1251')+" "+token_1.encode('cp1251')))
        i += 1
        
        if i==0:
            token_2 = token
        elif i==1:
            token_1 = token
        else:
            token_2 = token_1
            token_1 = token
            
        #print token
    j = 0
    for word in text:
        if word == u"*":
            if search[j]==u"$":
                inner = ""
            else:
                inner = "`"+search[j]+"`"
                
            word = inner
            j += 1
        phrase += ' ' + word

    print phrase.encode('utf8')
	
	
def analizToJson(file_):
    lines = gen_lines(file_)
    tokens = gen_tokens(lines,True,False)
    lines_ = gen_lines(file_)
    text = gen_tokens(lines_,False,False)

    massive = '{'
    search = []
    i = 0
    token_2 = ""
    token_1 = ""
    for token in tokens:
        
        if token == u"*":
            if i < 2:
                search.append(u"'ничего не найдено'")
            else:
                search.append(tree_word(model,token_2.encode('cp1251')+" "+token_1.encode('cp1251')))
        i += 1
        
        if i==0:
            token_2 = token
        elif i==1:
            token_1 = token
        else:
            token_2 = token_1
            token_1 = token
            
        #print token
    j = 0
    for word in search:
		if j != 0 :
			massive += ','			
		if word == u'$' :
			word = ''
			
		massive += '"'+str(j)+'" '+ ': "'+word+'"'
		j += 1
		
		if len(search) == j :
			massive += '}'

    print massive.encode('utf8')
               

if __name__ == '__main__':
    model = train('video/corpus.txt')
    #for i in range(10):
    #    print generate_sentence(model)
#    print tree_word(model,line)
#    for elem in model:    
#       print elem[0]+":"+elem[1]+"-"+model[elem][0][0]+"("+str(model[elem][0][1])+")"
        #print model[elem][0][0]+"("+str(model[elem][0][1])+")"
        #print model[elem][0][1]




print "Content-Type: text/html\r\n"
#analiz('texts/text_.txt')
analizToJson('texts/text_.srt')

