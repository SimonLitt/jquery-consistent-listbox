#!/bin/bash
jsdoc "listbox.js" -d "./docs/"

uglifyjs "listbox.js" -o "./upload/listbox.min.js" --compress --mangle
uglifycss "listbox.css" > "./upload/listbox.min.css"
