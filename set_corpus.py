#!c:/Python27/python

# -*- coding: utf8 -*-

import re
import pickle
import pymorphy2
from random import uniform
from collections import defaultdict

r_alphabet = re.compile(u'[а-яА-Я0-9ё-]+|[.,:;?!]+')
r_alphabet_text = re.compile(u'[а-яА-Я0-9ё-]+|[.,:;?!*]+')
morph = pymorphy2.MorphAnalyzer()

def get_line_len(corpus):
    data = open(corpus)
    i = 0
    for line in data:
        i += 1
    data.close()
    return i

def gen_lines(corpus):
    data = open(corpus)
    for line in data:
        yield line.decode('cp1251').lower()

def gen_tokens(corpus,tok=True,an=True):
    data = open(corpus)
    length = get_line_len(corpus)
    #turn = True или False если true - делать токенизацию
    #an = True или False если false - мы проверяем анализируемый текст
    i = 0
    for line_input in data:
        line = line_input.decode('cp1251').lower()
    
        if an:
            alphabet = r_alphabet.findall(line)
        else:
            alphabet = r_alphabet_text.findall(line)
        k = 0   
        for token in alphabet:
            if len(re.findall(u'[а-яА-Я0-9ё-]+', token)) == 0 or not(tok):
                yield token
            else:
                p = morph.parse(token)[0]
                yield p.normal_form
            k += 1
            print "Token " + str(i) + " of " + str(length) + " in line"
        i += 1
        print "Token line " + str(i) + " of " + str(length)

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
    #lines = gen_lines(corpus)
    #tokens = gen_tokens(lines)
    tokens = gen_tokens(corpus)
    trigrams = gen_trigrams(tokens)

    bi, tri = defaultdict(lambda: 0.0), defaultdict(lambda: 0.0)

    for t0, t1, t2 in trigrams:
        bi[t0, t1] += 1
        tri[t0, t1, t2] += 1

    model = {}
    i = 0
    for (t0, t1, t2), freq in tri.iteritems():
        if (t0, t1) in model:
            model[t0, t1].append((t2, freq/bi[t0, t1]))
        else:
            model[t0, t1] = [(t2, freq/bi[t0, t1])]
        i += 1
        print "Model line " + str(i) + " line of " + str(len(tri))
    
    jar = open('corpus.txt', 'wb')
    pickle.dump(model, jar)
    jar.close()

    #return model

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
               

if __name__ == '__main__':
    model = train('megatext.txt')
    #for i in range(10):
    #    print generate_sentence(model)
#    print tree_word(model,line)
#    for elem in model:    
#       print elem[0]+":"+elem[1]+"-"+model[elem][0][0]+"("+str(model[elem][0][1])+")"
        #print model[elem][0][0]+"("+str(model[elem][0][1])+")"
        #print model[elem][0][1]




print "Content-Type: text/html\r\n"
print "Corpus upload!"
#analiz('texts/text_.txt')
#analizToJson('texts/text_.srt')

