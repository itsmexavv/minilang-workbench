import csv
import io
import sqlite3
import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from pathlib import Path
from core import APIError, csv_text, money
from app import run


class BusinessTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()

    def tearDown(self):
        self.temp.cleanup()

    def call(self, app, method, path, data=None, query=None):
        return app.handle(method, path, data or {}, query or {})

    def test_language_precedence_unary_and_associativity(self):
        result=run('print 2 + 3 * 4; print (2 + 3) * 4; print 8 / 2 / 2; print -2 * 3;')
        self.assertEqual(result['output'],['14','20','2','-6'])
        self.assertEqual(result['ast']['type'],'Program')

    def test_language_repeat_variables_and_comments(self):
        result=run('# hello\nlet x = 0; repeat 3 { let x = x + 2; print x; }')
        self.assertEqual(result['output'],['2','4','6'])
        self.assertEqual(result['variables'],{'x':6})
        self.assertEqual(result['tokens'][0]['line'],2)

    def test_language_errors_have_useful_messages(self):
        cases={'print x;':'Undefined variable', 'print 1/0;':'Division by zero', 'let x = 1':'Expected ;', 'print @;':'line 1, column 7', 'repeat 101 { print 1; }':'Repeat count', 'print 10000000000000;':'supported range'}
        for source,message in cases.items():
            with self.subTest(source=source), self.assertRaisesRegex(APIError,message):
                run(source)

    def test_language_execution_and_depth_bounds(self):
        with self.assertRaises(APIError):
            run('repeat 100 { repeat 100 { let x = 1; } }')
        with self.assertRaises(APIError):
            run('print ' + '('*50+'1'+')'*50+';')
        with self.assertRaises(APIError):
            run('repeat 100 { repeat 100 { print 1; } }')

    def test_language_does_not_execute_python(self):
        with self.assertRaises(APIError):
            run("import os;")
